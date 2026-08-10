import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
  DataGrid,
  GridActionsCellItem,
} from "@mui/x-data-grid";

import ProveedorDialog from "../components/ProveedorDialog";
import useProveedores from "../hooks/useProveedores";

function formatearFecha(valor) {
  if (!valor) {
    return "-";
  }

  const fecha = new Date(valor);

  if (
    Number.isNaN(fecha.getTime())
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      dateStyle: "short",
    },
  ).format(fecha);
}

export default function ProveedoresPage() {
  const [busqueda, setBusqueda] =
    useState("");

  const {
    proveedores,
    cargandoProveedores,
    actualizandoProveedores,
    errorProveedores,
    recargarProveedores,
    guardarProveedor,
    borrarProveedor,
    guardandoProveedor,
    eliminandoProveedor,
  } = useProveedores(busqueda);

  const [
    dialogProveedorAbierto,
    setDialogProveedorAbierto,
  ] = useState(false);

  const [
    proveedorSeleccionado,
    setProveedorSeleccionado,
  ] = useState(null);

  const [
    proveedorAEliminar,
    setProveedorAEliminar,
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

  const abrirNuevoProveedor = () => {
    setProveedorSeleccionado(
      null,
    );

    setErrorFormulario("");
    setErroresFormulario([]);

    setDialogProveedorAbierto(
      true,
    );
  };

  const abrirEditarProveedor = (
    proveedor,
  ) => {
    setProveedorSeleccionado(
      proveedor,
    );

    setErrorFormulario("");
    setErroresFormulario([]);

    setDialogProveedorAbierto(
      true,
    );
  };

  const cerrarProveedorDialog =
    () => {
      if (guardandoProveedor) {
        return;
      }

      setDialogProveedorAbierto(
        false,
      );

      setProveedorSeleccionado(
        null,
      );

      setErrorFormulario("");
      setErroresFormulario([]);
    };

  const guardar = async (datos) => {
    setErrorFormulario("");
    setErroresFormulario([]);

    const resultado =
      await guardarProveedor({
        proveedorSeleccionado,
        datos,
      });

    if (!resultado.success) {
      setErrorFormulario(
        resultado.message,
      );

      setErroresFormulario(
        resultado.errors ?? [],
      );

      return;
    }

    setDialogProveedorAbierto(
      false,
    );

    setProveedorSeleccionado(
      null,
    );

    mostrarNotificacion(
      resultado.message,
      "success",
    );
  };

  const confirmarEliminacion =
    async () => {
      if (!proveedorAEliminar) {
        return;
      }

      const resultado =
        await borrarProveedor(
          proveedorAEliminar,
        );

      if (!resultado.success) {
        mostrarNotificacion(
          resultado.message,
          "error",
        );

        return;
      }

      setProveedorAEliminar(
        null,
      );

      mostrarNotificacion(
        resultado.message,
        "success",
      );
    };

  const columnas = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
    },

    {
      field: "nombre",
      headerName: "Proveedor",
      minWidth: 220,
      flex: 1,
    },

    {
      field: "telefono",
      headerName: "Teléfono",
      width: 160,

      valueGetter: (value) =>
        value || "-",
    },

    {
      field: "email",
      headerName: "Correo",
      minWidth: 220,
      flex: 1,

      valueGetter: (value) =>
        value || "-",
    },

    {
      field: "direccion",
      headerName: "Dirección",
      minWidth: 230,
      flex: 1,

      valueGetter: (value) =>
        value || "-",
    },

    {
      field: "observaciones",
      headerName: "Observaciones",
      minWidth: 240,
      flex: 1,

      valueGetter: (value) =>
        value || "-",
    },

    {
      field: "created_at",
      headerName: "Alta",
      width: 130,

      valueFormatter: (value) =>
        formatearFecha(value),
    },

    {
      field: "acciones",
      type: "actions",
      headerName: "Acciones",
      width: 120,
      align: "center",
      headerAlign: "center",

      getActions: (params) => [
        <GridActionsCellItem
          key="editar"
          icon={<EditIcon />}
          label="Editar"
          color="primary"
          onClick={() =>
            abrirEditarProveedor(
              params.row,
            )
          }
          showInMenu={false}
        />,

        <GridActionsCellItem
          key="eliminar"
          icon={<DeleteIcon />}
          label="Eliminar"
          color="error"
          onClick={() =>
            setProveedorAEliminar(
              params.row,
            )
          }
          showInMenu={false}
        />,
      ],
    },
  ];

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
            Proveedores
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Administrá los proveedores de tus prendas y compras.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={
            abrirNuevoProveedor
          }
        >
          Nuevo proveedor
        </Button>
      </Stack>

      {/* CONTENIDO */}
      <Card>
        <CardContent>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            sx={{
              mb: 3,
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
            }}
          >
            <TextField
              fullWidth
              label="Buscar proveedores"
              placeholder="Nombre, teléfono, correo o dirección"
              value={busqueda}
              onChange={(event) =>
                setBusqueda(
                  event.target.value,
                )
              }
            />

            <Button
              variant="outlined"
              startIcon={
                actualizandoProveedores ? (
                  <CircularProgress
                    size={17}
                  />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={() =>
                recargarProveedores()
              }
              disabled={
                actualizandoProveedores
              }
              sx={{
                minWidth: 140,
                flexShrink: 0,
              }}
            >
              Actualizar
            </Button>
          </Stack>

          {/* CARGANDO */}
          {cargandoProveedores && (
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

          {/* ERROR */}
          {!cargandoProveedores &&
            errorProveedores && (
              <Alert severity="error">
                {errorProveedores
                  ?.response?.data
                  ?.message ||
                  errorProveedores
                    ?.response?.data
                    ?.error ||
                  errorProveedores
                    ?.message ||
                  "No se pudieron cargar los proveedores."}
              </Alert>
            )}

          {/* SIN RESULTADOS */}
          {!cargandoProveedores &&
            !errorProveedores &&
            proveedores.length ===
              0 && (
              <Alert severity="info">
                {busqueda.trim()
                  ? "No se encontraron proveedores."
                  : "Todavía no hay proveedores registrados."}
              </Alert>
            )}

          {/* TABLA */}
          {!cargandoProveedores &&
            !errorProveedores &&
            proveedores.length >
              0 && (
              <DataGrid
                rows={proveedores}
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
                  abrirEditarProveedor(
                    params.row,
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

      {/* CREAR / EDITAR */}
      <ProveedorDialog
        open={
          dialogProveedorAbierto
        }
        proveedor={
          proveedorSeleccionado
        }
        loading={
          guardandoProveedor
        }
        error={errorFormulario}
        errors={
          erroresFormulario
        }
        onClose={
          cerrarProveedorDialog
        }
        onGuardar={guardar}
      />

      {/* ELIMINAR */}
      <Dialog
        open={Boolean(
          proveedorAEliminar,
        )}
        onClose={() => {
          if (
            !eliminandoProveedor
          ) {
            setProveedorAEliminar(
              null,
            );
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Eliminar proveedor
        </DialogTitle>

        <DialogContent>
          <Typography>
            ¿Seguro que querés
            eliminar a{" "}
            <strong>
              {
                proveedorAEliminar?.nombre
              }
            </strong>
            ?
          </Typography>

          <Alert
            severity="warning"
            sx={{ mt: 2 }}
          >
            No podrá eliminarse si tiene productos o ingresos asociados.
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={() =>
              setProveedorAEliminar(
                null,
              )
            }
            disabled={
              eliminandoProveedor
            }
          >
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              confirmarEliminacion
            }
            disabled={
              eliminandoProveedor
            }
            startIcon={
              eliminandoProveedor ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {eliminandoProveedor
              ? "Eliminando..."
              : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

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