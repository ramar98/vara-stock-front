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

import useClientes from "../../clientes/hooks/useClientes";
import useProductos from "../../productos/hooks/useProductos";

import VentaDetalleDialog from "../components/VentaDetalleDialog";
import VentaFormDialog from "../components/VentaFormDialog";
import useVentas from "../hooks/useVentas";

const METODOS_PAGO = [
  {
    value: "",
    label: "Todos los métodos",
  },
  {
    value: "EFECTIVO",
    label: "Efectivo",
  },
  {
    value: "TRANSFERENCIA",
    label: "Transferencia",
  },
  {
    value: "TARJETA",
    label: "Tarjeta",
  },
  {
    value: "OTRO",
    label: "Otro",
  },
];

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

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(fecha);
}

function obtenerProductos(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (Array.isArray(respuesta?.data)) {
    return respuesta.data;
  }

  return [];
}

function obtenerEtiquetaMetodoPago(valor) {
  const metodo = METODOS_PAGO.find(
    (item) => item.value === valor,
  );

  return metodo?.label || valor || "-";
}

function obtenerColorMetodoPago(valor) {
  const colores = {
    EFECTIVO: "success",
    TRANSFERENCIA: "info",
    TARJETA: "primary",
    OTRO: "default",
  };

  return colores[valor] || "default";
}

export default function VentasPage() {
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    clienteId: "",
    metodoPago: "",
  });

  const {
    ventas,
    cargandoVentas,
    actualizandoVentas,
    errorVentas,
    recargarVentas,
    registrarVenta,
    registrandoVenta,
  } = useVentas(filtros);

  const {
    data: productosRespuesta,
    isLoading: cargandoProductos,
    isError: errorProductos,
  } = useProductos();

  const {
    clientes,
    cargandoClientes,
    errorClientes,
  } = useClientes();

  const productos = useMemo(
    () =>
      obtenerProductos(
        productosRespuesta,
      ),
    [productosRespuesta],
  );

  const [
    ventaDialogAbierto,
    setVentaDialogAbierto,
  ] = useState(false);

  const [
    ventaDetalleId,
    setVentaDetalleId,
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
      clienteId: "",
      metodoPago: "",
    });
  };

  const abrirNuevaVenta = () => {
    setErrorFormulario("");
    setErroresFormulario([]);
    setVentaDialogAbierto(true);
  };

  const cerrarNuevaVenta = () => {
    if (registrandoVenta) {
      return;
    }

    setVentaDialogAbierto(false);
    setErrorFormulario("");
    setErroresFormulario([]);
  };

  const guardarVenta = async (datos) => {
    setErrorFormulario("");
    setErroresFormulario([]);

    const resultado =
      await registrarVenta(datos);

    if (!resultado.success) {
      setErrorFormulario(
        resultado.message,
      );

      setErroresFormulario(
        resultado.errors ?? [],
      );

      return;
    }

    setVentaDialogAbierto(false);

    /*
     * La API devuelve la venta completa
     * recién creada.
     */
    const ventaCreada =
      resultado.data;

    /*
     * Abrimos automáticamente el detalle
     * para poder imprimir el ticket.
     */
    if (ventaCreada?.id) {
      setVentaDetalleId(
        ventaCreada.id,
      );
    }

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
      width: 175,

      valueFormatter: (value) =>
        formatearFecha(value),
    },
    {
      field: "cliente",
      headerName: "Cliente",
      minWidth: 190,
      flex: 1,

      valueGetter: (value) =>
        value || "Consumidor final",
    },
    {
      field: "metodo_pago",
      headerName: "Método",
      width: 160,

      renderCell: (params) => (
        <Chip
          size="small"
          label={obtenerEtiquetaMetodoPago(
            params.value,
          )}
          variant="outlined"
          color={obtenerColorMetodoPago(
            params.value,
          )}
        />
      ),
    },
    {
      field: "cantidad_items",
      headerName: "Ítems",
      width: 90,
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

      valueGetter: (value) =>
        Number(value ?? 0),
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      width: 140,
      align: "right",
      headerAlign: "right",

      valueFormatter: (value) =>
        formatearMoneda(value),
    },
    {
      field: "descuento",
      headerName: "Descuento",
      width: 130,
      align: "right",
      headerAlign: "right",

      valueFormatter: (value) =>
        formatearMoneda(value),
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
            setVentaDetalleId(
              params.row.id,
            )
          }
          showInMenu={false}
        />,
      ],
    },
  ];

  const cargandoDatosIniciales =
    cargandoProductos ||
    cargandoClientes;

  const ventaDeshabilitada =
    cargandoDatosIniciales ||
    errorProductos ||
    Boolean(errorClientes);

  return (
    <Box>
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
            Ventas
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Registrá ventas y descontá automáticamente el stock.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirNuevaVenta}
          disabled={ventaDeshabilitada}
        >
          Nueva venta
        </Button>
      </Stack>

      {(errorProductos ||
        errorClientes) && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
          >
            No se pudieron cargar todos los datos necesarios para
            registrar ventas.
          </Alert>
        )}

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
                md: 3,
              }}
            >
              <TextField
                select
                fullWidth
                label="Cliente"
                name="clienteId"
                value={
                  filtros.clienteId
                }
                onChange={
                  cambiarFiltro
                }
                disabled={
                  cargandoClientes
                }
              >
                <MenuItem value="">
                  Todos los clientes
                </MenuItem>

                {clientes.map(
                  (cliente) => (
                    <MenuItem
                      key={
                        cliente.id
                      }
                      value={
                        cliente.id
                      }
                    >
                      {cliente.nombre}
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <TextField
                select
                fullWidth
                label="Método de pago"
                name="metodoPago"
                value={
                  filtros.metodoPago
                }
                onChange={
                  cambiarFiltro
                }
              >
                {METODOS_PAGO.map(
                  (metodo) => (
                    <MenuItem
                      key={
                        metodo.value ||
                        "todos"
                      }
                      value={
                        metodo.value
                      }
                    >
                      {metodo.label}
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
                spacing={1}
                sx={{
                  justifyContent:
                    "flex-end",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={
                    limpiarFiltros
                  }
                >
                  Limpiar
                </Button>

                <Button
                  variant="outlined"
                  startIcon={
                    actualizandoVentas ? (
                      <CircularProgress
                        size={17}
                      />
                    ) : (
                      <RefreshIcon />
                    )
                  }
                  onClick={() =>
                    recargarVentas()
                  }
                  disabled={
                    actualizandoVentas
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
          {cargandoVentas && (
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

          {!cargandoVentas &&
            errorVentas && (
              <Alert severity="error">
                {errorVentas
                  ?.response?.data
                  ?.message ||
                  errorVentas
                    ?.response?.data
                    ?.error ||
                  errorVentas
                    ?.message ||
                  "No se pudieron cargar las ventas."}
              </Alert>
            )}

          {!cargandoVentas &&
            !errorVentas &&
            ventas.length ===
            0 && (
              <Alert severity="info">
                No hay ventas registradas para los filtros
                seleccionados.
              </Alert>
            )}

          {!cargandoVentas &&
            !errorVentas &&
            ventas.length >
            0 && (
              <DataGrid
                rows={ventas}
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
                  setVentaDetalleId(
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

      <VentaFormDialog
        open={ventaDialogAbierto}
        clientes={clientes}
        productos={productos}
        loading={registrandoVenta}
        error={errorFormulario}
        errors={erroresFormulario}
        onClose={
          cerrarNuevaVenta
        }
        onGuardar={
          guardarVenta
        }
      />

      <VentaDetalleDialog
        open={Boolean(
          ventaDetalleId,
        )}
        ventaId={
          ventaDetalleId
        }
        onClose={() =>
          setVentaDetalleId(
            null,
          )
        }
      />

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