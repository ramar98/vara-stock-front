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
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  DataGrid,
  GridActionsCellItem,
} from "@mui/x-data-grid";

import useCatalogosProductos from "../../productos/hooks/useCatalogosProductos";
import useProductos from "../../productos/hooks/useProductos";
import useIngresos from "../hooks/useIngresos";

import IngresoDetalleDialog from "../components/IngresoDetalleDialog";
import IngresoFormDialog from "../components/IngresoFormDialog";

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

function formatearFecha(valor) {
  if (!valor) {
    return "-";
  }

  const fechaTexto = String(valor).slice(0, 10);

  const [anio, mes, dia] =
    fechaTexto.split("-");

  if (!anio || !mes || !dia) {
    return "-";
  }

  return `${dia}/${mes}/${anio}`;
}

function obtenerDatosProductos(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (Array.isArray(respuesta?.data)) {
    return respuesta.data;
  }

  return [];
}

export default function IngresosPage() {
  const [filtros, setFiltros] =
    useState({
      fechaDesde: "",
      fechaHasta: "",
      proveedorId: "",
    });

  const {
    ingresos,
    cargandoIngresos,
    actualizandoIngresos,
    errorIngresos,
    recargarIngresos,
    registrarIngreso,
    registrandoIngreso,
  } = useIngresos(filtros);

  const {
    data: catalogos,
    isLoading: cargandoCatalogos,
    isError: errorCatalogos,
  } = useCatalogosProductos();

  const {
    data: productosRespuesta,
    isLoading: cargandoProductos,
    isError: errorProductos,
  } = useProductos();

  const proveedores =
    catalogos?.proveedores ?? [];

  const productos = useMemo(
    () =>
      obtenerDatosProductos(
        productosRespuesta,
      ),
    [productosRespuesta],
  );

  const [
    dialogIngresoAbierto,
    setDialogIngresoAbierto,
  ] = useState(false);

  const [
    ingresoDetalleId,
    setIngresoDetalleId,
  ] = useState(null);

  const [
    errorFormulario,
    setErrorFormulario,
  ] = useState("");

  const [
    erroresFormulario,
    setErroresFormulario,
  ] = useState([]);

  const [
    notificacion,
    setNotificacion,
  ] = useState({
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
    setNotificacion(
      (estadoActual) => ({
        ...estadoActual,
        open: false,
      }),
    );
  };

  const cambiarFiltro = (event) => {
    const { name, value } =
      event.target;

    setFiltros((estadoActual) => ({
      ...estadoActual,
      [name]: value,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: "",
      fechaHasta: "",
      proveedorId: "",
    });
  };

  const abrirNuevoIngreso = () => {
    setErrorFormulario("");
    setErroresFormulario([]);
    setDialogIngresoAbierto(true);
  };

  const cerrarNuevoIngreso = () => {
    if (registrandoIngreso) {
      return;
    }

    setDialogIngresoAbierto(false);
    setErrorFormulario("");
    setErroresFormulario([]);
  };

  const guardarIngreso = async (
    datos,
  ) => {
    setErrorFormulario("");
    setErroresFormulario([]);

    const resultado =
      await registrarIngreso(datos);

    if (!resultado.success) {
      setErrorFormulario(
        resultado.message,
      );

      setErroresFormulario(
        resultado.errors ?? [],
      );

      return;
    }

    setDialogIngresoAbierto(false);

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
      field: "fecha",
      headerName: "Fecha",
      width: 130,

      valueFormatter: (value) =>
        formatearFecha(value),
    },

    {
      field: "proveedor",
      headerName: "Proveedor",
      minWidth: 200,
      flex: 1,

      valueGetter: (value) =>
        value || "-",
    },

    {
      field: "numero_comprobante",
      headerName: "Comprobante",
      width: 170,

      valueGetter: (value) =>
        value || "-",
    },

    {
      field: "cantidad_items",
      headerName: "Ítems",
      width: 100,
      align: "center",
      headerAlign: "center",

      valueGetter: (value) =>
        Number(value ?? 0),
    },

    {
      field: "cantidad_unidades",
      headerName: "Unidades",
      width: 110,
      align: "center",
      headerAlign: "center",

      renderCell: (params) => (
        <Chip
          label={Number(
            params.value ?? 0,
          )}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },

    {
      field: "total",
      headerName: "Total",
      width: 150,
      align: "right",
      headerAlign: "right",

      valueFormatter: (value) =>
        formatearMoneda(value),
    },

    {
      field: "acciones",
      type: "actions",
      headerName: "Acciones",
      width: 100,
      align: "center",
      headerAlign: "center",

      getActions: (params) => [
        <GridActionsCellItem
          key="detalle"
          icon={<VisibilityIcon />}
          label="Ver detalle"
          onClick={() =>
            setIngresoDetalleId(
              params.row.id,
            )
          }
          showInMenu={false}
        />,
      ],
    },
  ];

  const cargandoDatosIniciales =
    cargandoCatalogos ||
    cargandoProductos;

  return (
    <Box>
      {/* ENCABEZADO */}
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          mb: 3,

          justifyContent:
            "space-between",

          alignItems: {
            xs: "stretch",
            sm: "center",
          },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Ingresos
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Registrá compras a proveedores y actualizá el stock.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={
            abrirNuevoIngreso
          }
          disabled={
            cargandoDatosIniciales
          }
        >
          Nuevo ingreso
        </Button>
      </Stack>

      {(errorCatalogos ||
        errorProductos) && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
          >
            No se pudieron cargar todos los datos necesarios para
            registrar ingresos.
          </Alert>
        )}

      {/* FILTROS */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid
            container
            spacing={2}
            sx={{
              alignItems: "center",
            }}
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
                value={
                  filtros.fechaDesde
                }
                onChange={
                  cambiarFiltro
                }
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
                value={
                  filtros.fechaHasta
                }
                onChange={
                  cambiarFiltro
                }
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
                label="Proveedor"
                name="proveedorId"
                value={
                  filtros.proveedorId
                }
                onChange={
                  cambiarFiltro
                }
              >
                <MenuItem value="">
                  Todos los proveedores
                </MenuItem>

                {proveedores.map(
                  (proveedor) => (
                    <MenuItem
                      key={
                        proveedor.id
                      }
                      value={
                        proveedor.id
                      }
                    >
                      {
                        proveedor.nombre
                      }
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Grid>

            <Grid size={12}>
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.5}
                sx={{
                  width: "100%",
                  justifyContent: "flex-end",
                  alignItems: {
                    xs: "stretch",
                    sm: "center",
                  },
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={limpiarFiltros}
                  sx={{
                    minWidth: 120,
                    height: 42,
                    flexShrink: 0,
                  }}
                >
                  Limpiar
                </Button>

                <Button
                  variant="outlined"
                  startIcon={
                    actualizandoIngresos ? (
                      <CircularProgress
                        size={17}
                        color="inherit"
                      />
                    ) : (
                      <RefreshIcon />
                    )
                  }
                  onClick={() =>
                    recargarIngresos()
                  }
                  disabled={
                    actualizandoIngresos
                  }
                  sx={{
                    minWidth: 145,
                    height: 42,
                    flexShrink: 0,
                  }}
                >
                  {actualizandoIngresos
                    ? "Actualizando..."
                    : "Actualizar"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* TABLA */}
      <Card>
        <CardContent>
          {cargandoIngresos && (
            <Box
              sx={{
                minHeight: 280,
                display: "flex",
                justifyContent:
                  "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {!cargandoIngresos &&
            errorIngresos && (
              <Alert severity="error">
                {errorIngresos
                  ?.response?.data
                  ?.message ||
                  errorIngresos
                    ?.response?.data
                    ?.error ||
                  errorIngresos
                    ?.message ||
                  "No se pudieron cargar los ingresos."}
              </Alert>
            )}

          {!cargandoIngresos &&
            !errorIngresos &&
            ingresos.length ===
            0 && (
              <Alert severity="info">
                No hay ingresos registrados para los filtros
                seleccionados.
              </Alert>
            )}

          {!cargandoIngresos &&
            !errorIngresos &&
            ingresos.length >
            0 && (
              <DataGrid
                rows={ingresos}
                columns={columnas}
                getRowId={(row) =>
                  row.id
                }
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
                onRowDoubleClick={(
                  params,
                ) =>
                  setIngresoDetalleId(
                    params.row.id,
                  )
                }
                sx={{
                  border: 0,

                  "& .MuiDataGrid-row":
                  {
                    cursor:
                      "pointer",
                  },
                }}
              />
            )}
        </CardContent>
      </Card>

      {/* NUEVO INGRESO */}
      <IngresoFormDialog
        open={dialogIngresoAbierto}
        proveedores={proveedores}
        productos={productos}
        loading={registrandoIngreso}
        error={errorFormulario}
        errors={erroresFormulario}
        onClose={
          cerrarNuevoIngreso
        }
        onGuardar={
          guardarIngreso
        }
      />

      {/* DETALLE */}
      <IngresoDetalleDialog
        open={Boolean(
          ingresoDetalleId,
        )}
        ingresoId={
          ingresoDetalleId
        }
        onClose={() =>
          setIngresoDetalleId(
            null,
          )
        }
      />

      {/* NOTIFICACIÓN */}
      <Snackbar
        open={notificacion.open}
        autoHideDuration={4000}
        onClose={
          cerrarNotificacion
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={
            notificacion.severity
          }
          variant="filled"
          onClose={
            cerrarNotificacion
          }
        >
          {notificacion.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}