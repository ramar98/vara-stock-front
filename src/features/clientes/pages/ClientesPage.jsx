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

import useClientes from "../hooks/useClientes";
import ClienteDialog from "../components/ClienteDialog";

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
  }).format(fecha);
}

export default function ClientesPage() {
  const [busqueda, setBusqueda] = useState("");

  const {
    clientes,
    cargandoClientes,
    actualizandoClientes,
    errorClientes,
    recargarClientes,
    guardarCliente,
    borrarCliente,
    guardandoCliente,
    eliminandoCliente,
  } = useClientes(busqueda);

  const [
    dialogClienteAbierto,
    setDialogClienteAbierto,
  ] = useState(false);

  const [
    clienteSeleccionado,
    setClienteSeleccionado,
  ] = useState(null);

  const [
    clienteAEliminar,
    setClienteAEliminar,
  ] = useState(null);

  const [
    errorFormulario,
    setErrorFormulario,
  ] = useState("");

  const [
    erroresFormulario,
    setErroresFormulario,
  ] = useState([]);

  const [notificacion, setNotificacion] =
    useState({
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
    setNotificacion((actual) => ({
      ...actual,
      open: false,
    }));
  };

  const abrirNuevoCliente = () => {
    setClienteSeleccionado(null);
    setErrorFormulario("");
    setErroresFormulario([]);
    setDialogClienteAbierto(true);
  };

  const abrirEditarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setErrorFormulario("");
    setErroresFormulario([]);
    setDialogClienteAbierto(true);
  };

  const cerrarClienteDialog = () => {
    if (guardandoCliente) {
      return;
    }

    setDialogClienteAbierto(false);
    setClienteSeleccionado(null);
    setErrorFormulario("");
    setErroresFormulario([]);
  };

  const guardar = async (datos) => {
    setErrorFormulario("");
    setErroresFormulario([]);

    const resultado = await guardarCliente({
      clienteSeleccionado,
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

    setDialogClienteAbierto(false);
    setClienteSeleccionado(null);

    mostrarNotificacion(
      resultado.message,
      "success",
    );
  };

  const confirmarEliminacion = async () => {
    if (!clienteAEliminar) {
      return;
    }

    const resultado = await borrarCliente(
      clienteAEliminar,
    );

    if (!resultado.success) {
      mostrarNotificacion(
        resultado.message,
        "error",
      );

      return;
    }

    setClienteAEliminar(null);

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
      headerName: "Nombre",
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
      getActions: (params) => [
        <GridActionsCellItem
          key="editar"
          icon={<EditIcon />}
          label="Editar"
          color="primary"
          onClick={() =>
            abrirEditarCliente(params.row)
          }
        />,

        <GridActionsCellItem
          key="eliminar"
          icon={<DeleteIcon />}
          label="Eliminar"
          color="error"
          onClick={() =>
            setClienteAEliminar(params.row)
          }
        />,
      ],
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
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
          >
            Clientes
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
          >
            Administrá los datos de tus
            compradores.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirNuevoCliente}
        >
          Nuevo cliente
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            mb={3}
          >
            <TextField
              fullWidth
              label="Buscar clientes"
              placeholder="Nombre, teléfono o correo"
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
                actualizandoClientes ? (
                  <CircularProgress
                    size={17}
                  />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={() =>
                recargarClientes()
              }
              disabled={
                actualizandoClientes
              }
              sx={{
                minWidth: 140,
              }}
            >
              Actualizar
            </Button>
          </Stack>

          {cargandoClientes && (
            <Box
              minHeight={280}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <CircularProgress />
            </Box>
          )}

          {!cargandoClientes &&
            errorClientes && (
              <Alert severity="error">
                {errorClientes?.response
                  ?.data?.message ||
                  errorClientes?.response
                    ?.data?.error ||
                  errorClientes?.message ||
                  "No se pudieron cargar los clientes."}
              </Alert>
            )}

          {!cargandoClientes &&
            !errorClientes &&
            clientes.length === 0 && (
              <Alert severity="info">
                {busqueda.trim()
                  ? "No se encontraron clientes."
                  : "Todavía no hay clientes registrados."}
              </Alert>
            )}

          {!cargandoClientes &&
            !errorClientes &&
            clientes.length > 0 && (
              <DataGrid
                rows={clientes}
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
                onRowDoubleClick={(
                  params,
                ) =>
                  abrirEditarCliente(
                    params.row,
                  )
                }
                sx={{
                  border: 0,

                  "& .MuiDataGrid-row": {
                    cursor: "pointer",
                  },
                }}
              />
            )}
        </CardContent>
      </Card>

      <ClienteDialog
        open={dialogClienteAbierto}
        cliente={clienteSeleccionado}
        loading={guardandoCliente}
        error={errorFormulario}
        errors={erroresFormulario}
        onClose={cerrarClienteDialog}
        onGuardar={guardar}
      />

      <Dialog
        open={Boolean(
          clienteAEliminar,
        )}
        onClose={() => {
          if (!eliminandoCliente) {
            setClienteAEliminar(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Eliminar cliente
        </DialogTitle>

        <DialogContent>
          <Typography>
            ¿Seguro que querés eliminar a{" "}
            <strong>
              {clienteAEliminar?.nombre}
            </strong>
            ?
          </Typography>

          <Alert
            severity="warning"
            sx={{ mt: 2 }}
          >
            No podrá eliminarse si tiene
            ventas asociadas.
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={() =>
              setClienteAEliminar(null)
            }
            disabled={
              eliminandoCliente
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
              eliminandoCliente
            }
            startIcon={
              eliminandoCliente ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {eliminandoCliente
              ? "Eliminando..."
              : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

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