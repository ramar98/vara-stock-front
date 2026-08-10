import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
  DataGrid,
  GridActionsCellItem,
} from "@mui/x-data-grid";

import { useAuth } from "../../auth/context/AuthContext";

import PasswordDialog from "../components/PasswordDialog";
import UsuarioDialog from "../components/UsuarioDialog";
import useUsuarios from "../hooks/useUsuarios";

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

export default function UsuariosPage() {
  const { usuario: usuarioSesion } =
    useAuth();

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const {
    usuarios,
    roles,
    cargandoUsuarios,
    actualizandoUsuarios,
    guardandoUsuario,
    cambiandoEstado,
    cambiandoPassword,
    errorUsuarios,
    recargarUsuarios,
    guardarUsuario,
    cambiarEstado,
    cambiarPassword,
  } = useUsuarios(busqueda);

  const [
    usuarioDialogAbierto,
    setUsuarioDialogAbierto,
  ] = useState(false);

  const [
    usuarioSeleccionado,
    setUsuarioSeleccionado,
  ] = useState(null);

  const [
    passwordDialogAbierto,
    setPasswordDialogAbierto,
  ] = useState(false);

  const [
    usuarioPassword,
    setUsuarioPassword,
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
    errorPassword,
    setErrorPassword,
  ] = useState("");

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
      (actual) => ({
        ...actual,
        open: false,
      }),
    );
  };

  const abrirNuevoUsuario = () => {
    setUsuarioSeleccionado(null);
    setErrorFormulario("");
    setErroresFormulario([]);
    setUsuarioDialogAbierto(true);
  };

  const abrirEditarUsuario = (
    usuario,
  ) => {
    setUsuarioSeleccionado(
      usuario,
    );

    setErrorFormulario("");
    setErroresFormulario([]);
    setUsuarioDialogAbierto(true);
  };

  const cerrarUsuarioDialog = () => {
    if (guardandoUsuario) {
      return;
    }

    setUsuarioDialogAbierto(false);
    setUsuarioSeleccionado(null);
    setErrorFormulario("");
    setErroresFormulario([]);
  };

  const guardar = async (datos) => {
    setErrorFormulario("");
    setErroresFormulario([]);

    const resultado =
      await guardarUsuario({
        usuarioSeleccionado,
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

    setUsuarioDialogAbierto(false);
    setUsuarioSeleccionado(null);

    mostrarNotificacion(
      resultado.message,
      "success",
    );
  };

  const abrirPassword = (
    usuario,
  ) => {
    setUsuarioPassword(usuario);
    setErrorPassword("");
    setPasswordDialogAbierto(true);
  };

  const cerrarPassword = () => {
    if (cambiandoPassword) {
      return;
    }

    setPasswordDialogAbierto(false);
    setUsuarioPassword(null);
    setErrorPassword("");
  };

  const guardarPassword =
    async (password) => {
      if (!usuarioPassword) {
        return;
      }

      setErrorPassword("");

      const resultado =
        await cambiarPassword(
          usuarioPassword,
          password,
        );

      if (!resultado.success) {
        setErrorPassword(
          resultado.message,
        );

        return;
      }

      setPasswordDialogAbierto(false);
      setUsuarioPassword(null);

      mostrarNotificacion(
        resultado.message,
        "success",
      );
    };

  const alternarEstado =
    async (usuario) => {
      const nuevoEstado =
        !usuario.activo;

      const resultado =
        await cambiarEstado(
          usuario,
          nuevoEstado,
        );

      if (!resultado.success) {
        mostrarNotificacion(
          resultado.message,
          "error",
        );

        return;
      }

      mostrarNotificacion(
        resultado.message,
        "success",
      );
    };

  const columnas = [
    {
      field: "id",
      headerName: "ID",
      width: 75,
    },
    {
      field: "nombreCompleto",
      headerName: "Nombre",
      minWidth: 210,
      flex: 1,

      valueGetter: (
        value,
        row,
      ) => {
        const usuario =
          row ?? value ?? {};

        return [
          usuario.nombre,
          usuario.apellido,
        ]
          .filter(Boolean)
          .join(" ");
      },
    },
    {
      field: "usuario",
      headerName: "Usuario",
      minWidth: 150,
      flex: 0.7,
    },
    {
      field: "email",
      headerName: "Correo",
      minWidth: 220,
      flex: 1,
    },
    {
      field: "rol",
      headerName: "Rol",
      width: 160,

      renderCell: (params) => (
        <Chip
          size="small"
          label={
            params.value || "-"
          }
          variant="outlined"
          color={
            String(
              params.value,
            ).toLowerCase() ===
            "administrador"
              ? "primary"
              : "default"
          }
        />
      ),
    },
    {
      field: "activo",
      headerName: "Estado",
      width: 130,
      align: "center",
      headerAlign: "center",

      renderCell: (params) => (
        <Chip
          size="small"
          label={
            params.value
              ? "Activo"
              : "Inactivo"
          }
          color={
            params.value
              ? "success"
              : "default"
          }
          variant={
            params.value
              ? "filled"
              : "outlined"
          }
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Alta",
      width: 125,

      valueFormatter: (value) =>
        formatearFecha(value),
    },
    {
      field: "acciones",
      type: "actions",
      headerName: "Acciones",
      width: 150,
      align: "center",
      headerAlign: "center",

      getActions: (params) => {
        const esUsuarioActual =
          Number(
            params.row.id,
          ) ===
          Number(
            usuarioSesion?.id,
          );

        const acciones = [
          <GridActionsCellItem
            key="editar"
            icon={
              <Tooltip title="Editar">
                <EditIcon />
              </Tooltip>
            }
            label="Editar"
            onClick={() =>
              abrirEditarUsuario(
                params.row,
              )
            }
            showInMenu={false}
          />,

          <GridActionsCellItem
            key="password"
            icon={
              <Tooltip title="Cambiar contraseña">
                <KeyIcon />
              </Tooltip>
            }
            label="Cambiar contraseña"
            onClick={() =>
              abrirPassword(
                params.row,
              )
            }
            showInMenu={false}
          />,
        ];

        if (!esUsuarioActual) {
          acciones.push(
            <GridActionsCellItem
              key="estado"
              icon={
                params.row.activo ? (
                  <Tooltip title="Desactivar">
                    <BlockIcon />
                  </Tooltip>
                ) : (
                  <Tooltip title="Activar">
                    <CheckCircleIcon />
                  </Tooltip>
                )
              }
              label={
                params.row.activo
                  ? "Desactivar"
                  : "Activar"
              }
              onClick={() =>
                alternarEstado(
                  params.row,
                )
              }
              disabled={
                cambiandoEstado
              }
              showInMenu={false}
            />,
          );
        }

        return acciones;
      },
    },
  ];

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
            Usuarios
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Administrá accesos, roles y estado de los usuarios.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={
            abrirNuevoUsuario
          }
        >
          Nuevo usuario
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
              label="Buscar usuarios"
              placeholder="Nombre, usuario, correo o rol"
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
                actualizandoUsuarios ? (
                  <CircularProgress
                    size={17}
                  />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={() =>
                recargarUsuarios()
              }
              disabled={
                actualizandoUsuarios
              }
              sx={{
                minWidth: 140,
                flexShrink: 0,
              }}
            >
              Actualizar
            </Button>
          </Stack>

          {cargandoUsuarios && (
            <Box
              sx={{
                minHeight: 280,
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {!cargandoUsuarios &&
            errorUsuarios && (
              <Alert severity="error">
                {errorUsuarios
                  ?.response?.data
                  ?.message ||
                  errorUsuarios
                    ?.message ||
                  "No se pudieron cargar los usuarios."}
              </Alert>
            )}

          {!cargandoUsuarios &&
            !errorUsuarios &&
            usuarios.length === 0 && (
              <Alert severity="info">
                {busqueda.trim()
                  ? "No se encontraron usuarios."
                  : "No hay usuarios registrados."}
              </Alert>
            )}

          {!cargandoUsuarios &&
            !errorUsuarios &&
            usuarios.length > 0 && (
              <DataGrid
                rows={usuarios}
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
                  abrirEditarUsuario(
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

      <UsuarioDialog
        open={
          usuarioDialogAbierto
        }
        usuarioSeleccionado={
          usuarioSeleccionado
        }
        roles={roles}
        loading={
          guardandoUsuario
        }
        error={
          errorFormulario
        }
        errors={
          erroresFormulario
        }
        onClose={
          cerrarUsuarioDialog
        }
        onGuardar={guardar}
      />

      <PasswordDialog
        open={
          passwordDialogAbierto
        }
        usuario={
          usuarioPassword
        }
        loading={
          cambiandoPassword
        }
        error={
          errorPassword
        }
        onClose={
          cerrarPassword
        }
        onGuardar={
          guardarPassword
        }
      />

      <Snackbar
        open={
          notificacion.open
        }
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
          {
            notificacion.message
          }
        </Alert>
      </Snackbar>
    </Box>
  );
}