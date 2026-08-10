import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";

import { DataGrid } from "@mui/x-data-grid";

import { useAuth } from "../../auth/context/AuthContext";
import useProductos from "../../productos/hooks/useProductos";

import AjusteStockDialog from "../components/AjusteStockDialog";
import useAjustesStock from "../hooks/useAjustesStock";

const ETIQUETAS_MOTIVOS = {
  CONTEO_FISICO: "Conteo físico",
  ROTURA: "Rotura",
  PERDIDA: "Pérdida",
  ERROR_CARGA: "Error de carga",
  DEVOLUCION: "Devolución",
  OTRO: "Otro",
};

function obtenerProductos(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (Array.isArray(respuesta?.data)) {
    return respuesta.data;
  }

  return [];
}

function formatearFecha(valor) {
  if (!valor) {
    return "-";
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(fecha);
}

function obtenerVariante(ajuste) {
  const partes = [
    ajuste?.color,
    ajuste?.talle,
  ].filter(Boolean);

  if (partes.length > 0) {
    return partes.join(" / ");
  }

  return ajuste?.codigo_barras || "-";
}

function obtenerUsuario(ajuste) {
  const nombreCompleto = [
    ajuste?.usuario_nombre,
    ajuste?.usuario_apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return nombreCompleto || "Sistema";
}

function obtenerMotivoDesdeReferencia(referencia) {
  if (!referencia) {
    return "OTRO";
  }

  const texto = String(referencia);
  const prefijo = "Ajuste de stock:";

  if (!texto.startsWith(prefijo)) {
    return "OTRO";
  }

  return texto
    .slice(prefijo.length)
    .trim()
    .toUpperCase();
}

function obtenerColorDiferencia(diferencia) {
  if (diferencia > 0) {
    return "success";
  }

  if (diferencia < 0) {
    return "error";
  }

  return "default";
}

export default function AjustesStockPage() {
  const { usuario } = useAuth();

  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    productoId: "",
  });

  const {
    ajustes,
    cargandoAjustes,
    actualizandoAjustes,
    errorAjustes,
    recargarAjustes,
    registrarAjuste,
    registrandoAjuste,
  } = useAjustesStock(filtros);

  const {
    data: productosRespuesta,
    isLoading: cargandoProductos,
    isError: errorProductos,
  } = useProductos();

  const productos = useMemo(
    () => obtenerProductos(productosRespuesta),
    [productosRespuesta],
  );

  const [dialogAbierto, setDialogAbierto] =
    useState(false);

  const [errorFormulario, setErrorFormulario] =
    useState("");

  const [erroresFormulario, setErroresFormulario] =
    useState([]);

  const [notificacion, setNotificacion] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const mostrarNotificacion = (
    message,
    severity = "success",
  ) => {
    setNotificacion({
      open: true,
      message,
      severity,
    });
  };

  const cerrarNotificacion = () => {
    setNotificacion((estadoActual) => ({
      ...estadoActual,
      open: false,
    }));
  };

  const cambiarFiltro = (event) => {
    const { name, value } = event.target;

    setFiltros((estadoActual) => ({
      ...estadoActual,
      [name]: value,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: "",
      fechaHasta: "",
      productoId: "",
    });
  };

  const abrirNuevoAjuste = () => {
    if (!usuario?.id) {
      mostrarNotificacion(
        "No se pudo identificar al usuario de la sesión.",
        "error",
      );

      return;
    }

    setErrorFormulario("");
    setErroresFormulario([]);
    setDialogAbierto(true);
  };

  const cerrarDialog = () => {
    if (registrandoAjuste) {
      return;
    }

    setDialogAbierto(false);
    setErrorFormulario("");
    setErroresFormulario([]);
  };

  const guardarAjuste = async (datos) => {
    setErrorFormulario("");
    setErroresFormulario([]);

    if (!usuario?.id) {
      setErrorFormulario(
        "No se pudo identificar al usuario de la sesión.",
      );

      return;
    }

    const resultado = await registrarAjuste({
      ...datos,
      usuario_id: usuario.id,
    });

    if (!resultado.success) {
      setErrorFormulario(resultado.message);

      setErroresFormulario(
        resultado.errors ?? [],
      );

      return;
    }

    setDialogAbierto(false);

    mostrarNotificacion(
      resultado.message,
      "success",
    );
  };

  const columnas = [
    {
      field: "id",
      headerName: "N.º",
      width: 80,
    },
    {
      field: "created_at",
      headerName: "Fecha",
      width: 175,
      valueFormatter: (value) =>
        formatearFecha(value),
    },
    {
      field: "producto_codigo",
      headerName: "Código",
      width: 120,
      valueGetter: (value) =>
        value || "-",
    },
    {
      field: "producto_nombre",
      headerName: "Producto",
      minWidth: 210,
      flex: 1,
      valueGetter: (value) =>
        value || "-",
    },
    {
      field: "variante",
      headerName: "Variante",
      width: 160,
      valueGetter: (_, row) =>
        obtenerVariante(row),
    },
    {
      field: "stock_anterior",
      headerName: "Stock anterior",
      width: 125,
      align: "center",
      headerAlign: "center",
      valueGetter: (value) =>
        Number(value ?? 0),
    },
    {
      field: "stock_nuevo",
      headerName: "Stock nuevo",
      width: 120,
      align: "center",
      headerAlign: "center",
      valueGetter: (value) =>
        Number(value ?? 0),
    },
    {
      field: "cantidad",
      headerName: "Diferencia",
      width: 115,
      align: "center",
      headerAlign: "center",

      renderCell: (params) => {
        const diferencia = Number(
          params.value ?? 0,
        );

        const texto =
          diferencia > 0
            ? `+${diferencia}`
            : String(diferencia);

        return (
          <Chip
            size="small"
            label={texto}
            color={obtenerColorDiferencia(
              diferencia,
            )}
          />
        );
      },
    },
    {
      field: "motivo",
      headerName: "Motivo",
      width: 150,

      valueGetter: (_, row) => {
        const motivo =
          obtenerMotivoDesdeReferencia(
            row.referencia,
          );

        return (
          ETIQUETAS_MOTIVOS[motivo] ||
          motivo ||
          "-"
        );
      },
    },
    {
      field: "observacion",
      headerName: "Observación",
      minWidth: 220,
      flex: 1,
      valueGetter: (value) =>
        value || "-",
    },
    {
      field: "usuario",
      headerName: "Usuario",
      width: 170,
      valueGetter: (_, row) =>
        obtenerUsuario(row),
    },
  ];

  return (
    <Box>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Ajustes de stock
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Corregí diferencias de inventario y conservá el historial.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirNuevoAjuste}
          disabled={
            cargandoProductos ||
            !usuario?.id
          }
        >
          Nuevo ajuste
        </Button>
      </Stack>

      {errorProductos && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
        >
          No se pudo cargar el catálogo de productos necesario para
          registrar ajustes.
        </Alert>
      )}

      {!usuario?.id && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          No se pudo identificar al usuario de la sesión.
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid
            container
            spacing={2}
            alignItems="center"
          >
            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <TextField
                fullWidth
                type="date"
                label="Desde"
                name="fechaDesde"
                value={filtros.fechaDesde}
                onChange={cambiarFiltro}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <TextField
                fullWidth
                type="date"
                label="Hasta"
                name="fechaHasta"
                value={filtros.fechaHasta}
                onChange={cambiarFiltro}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                select
                fullWidth
                label="Producto"
                name="productoId"
                value={filtros.productoId}
                onChange={cambiarFiltro}
              >
                <MenuItem value="">
                  Todos los productos
                </MenuItem>

                {productos.map((producto) => (
                  <MenuItem
                    key={producto.id}
                    value={producto.id}
                  >
                    {producto.codigo} -{" "}
                    {producto.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 2,
              }}
            >
              <Stack spacing={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={limpiarFiltros}
                >
                  Limpiar
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={
                    actualizandoAjustes ? (
                      <CircularProgress
                        size={17}
                      />
                    ) : (
                      <RefreshIcon />
                    )
                  }
                  onClick={() =>
                    recargarAjustes()
                  }
                  disabled={
                    actualizandoAjustes
                  }
                >
                  Actualizar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {cargandoAjustes && (
            <Box
              sx={{
                minHeight: 280,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {!cargandoAjustes &&
            errorAjustes && (
              <Alert severity="error">
                {errorAjustes?.response?.data
                  ?.message ||
                  errorAjustes?.response?.data
                    ?.error ||
                  errorAjustes?.message ||
                  "No se pudieron cargar los ajustes de stock."}
              </Alert>
            )}

          {!cargandoAjustes &&
            !errorAjustes &&
            ajustes.length === 0 && (
              <Alert severity="info">
                No hay ajustes registrados para los filtros
                seleccionados.
              </Alert>
            )}

          {!cargandoAjustes &&
            !errorAjustes &&
            ajustes.length > 0 && (
              <DataGrid
                rows={ajustes}
                columns={columnas}
                getRowId={(row) => row.id}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[
                  10,
                  25,
                  50,
                ]}
                initialState={{
                  pagination: {
                    paginationModel: {
                      page: 0,
                      pageSize: 10,
                    },
                  },
                }}
                sx={{
                  border: 0,
                }}
              />
            )}
        </CardContent>
      </Card>

      <AjusteStockDialog
        open={dialogAbierto}
        productos={productos}
        usuarioId={usuario?.id}
        loading={registrandoAjuste}
        error={errorFormulario}
        errors={erroresFormulario}
        onClose={cerrarDialog}
        onGuardar={guardarAjuste}
      />

      <Snackbar
        open={notificacion.open}
        autoHideDuration={4000}
        onClose={cerrarNotificacion}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={notificacion.severity}
          variant="filled"
          onClose={cerrarNotificacion}
        >
          {notificacion.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}