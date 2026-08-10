import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

const estadoInicial = {
  nombre: "",
  apellido: "",
  usuario: "",
  email: "",
  password: "",
  rol_id: "",
  activo: true,
};

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

export default function UsuarioDialog({
  open,
  usuarioSeleccionado = null,
  roles = [],
  loading = false,
  error = "",
  errors = [],
  onClose,
  onGuardar,
}) {
  const [
    formulario,
    setFormulario,
  ] = useState(
    estadoInicial,
  );

  const [
    erroresFormulario,
    setErroresFormulario,
  ] = useState({});

  const editando = Boolean(
    usuarioSeleccionado?.id,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (
      usuarioSeleccionado
    ) {
      setFormulario({
        nombre:
          usuarioSeleccionado.nombre ??
          "",

        apellido:
          usuarioSeleccionado.apellido ??
          "",

        usuario:
          usuarioSeleccionado.usuario ??
          "",

        email:
          usuarioSeleccionado.email ??
          "",

        password: "",

        rol_id:
          usuarioSeleccionado.rol_id ??
          "",

        activo:
          Boolean(
            usuarioSeleccionado.activo,
          ),
      });
    } else {
      setFormulario({
        ...estadoInicial,

        rol_id:
          roles[0]?.id ?? "",
      });
    }

    setErroresFormulario({});
  }, [
    open,
    usuarioSeleccionado,
    roles,
  ]);

  const cambiarCampo = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormulario(
      (actual) => ({
        ...actual,
        [name]: value,
      }),
    );

    setErroresFormulario(
      (actual) => ({
        ...actual,
        [name]: "",
      }),
    );
  };

  const cambiarActivo = (
    event,
  ) => {
    setFormulario(
      (actual) => ({
        ...actual,
        activo:
          event.target.checked,
      }),
    );
  };

  const validar = () => {
    const errores = {};

    const nombre =
      formulario.nombre.trim();

    const apellido =
      formulario.apellido.trim();

    const usuario =
      formulario.usuario.trim();

    const email =
      formulario.email.trim();

    if (!nombre) {
      errores.nombre =
        "Ingresá el nombre.";
    }

    if (!apellido) {
      errores.apellido =
        "Ingresá el apellido.";
    }

    if (!usuario) {
      errores.usuario =
        "Ingresá el nombre de usuario.";
    }

    if (!email) {
      errores.email =
        "Ingresá el correo electrónico.";
    } else if (
      !validarEmail(email)
    ) {
      errores.email =
        "Ingresá un correo válido.";
    }

    if (
      !formulario.rol_id
    ) {
      errores.rol_id =
        "Seleccioná un rol.";
    }

    if (
      !editando &&
      formulario.password.length <
        8
    ) {
      errores.password =
        "La contraseña debe tener al menos 8 caracteres.";
    }

    setErroresFormulario(
      errores,
    );

    return (
      Object.keys(errores)
        .length === 0
    );
  };

  const guardar = async () => {
    if (!validar()) {
      return;
    }

    const datos = {
      nombre:
        formulario.nombre.trim(),

      apellido:
        formulario.apellido.trim(),

      usuario:
        formulario.usuario.trim(),

      email:
        formulario.email
          .trim()
          .toLowerCase(),

      rol_id: Number(
        formulario.rol_id,
      ),

      activo:
        formulario.activo,
    };

    if (!editando) {
      datos.password =
        formulario.password;
    }

    await onGuardar(datos);
  };

  const cerrar = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={cerrar}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
        }}
      >
        {editando
          ? "Editar usuario"
          : "Nuevo usuario"}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {errors.map(
              (
                mensaje,
                indice,
              ) => (
                <Typography
                  key={`${mensaje}-${indice}`}
                  variant="body2"
                >
                  • {mensaje}
                </Typography>
              ),
            )}
          </Alert>
        )}

        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              required
              label="Nombre"
              name="nombre"
              value={
                formulario.nombre
              }
              onChange={
                cambiarCampo
              }
              error={Boolean(
                erroresFormulario.nombre,
              )}
              helperText={
                erroresFormulario.nombre
              }
              disabled={loading}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              required
              label="Apellido"
              name="apellido"
              value={
                formulario.apellido
              }
              onChange={
                cambiarCampo
              }
              error={Boolean(
                erroresFormulario.apellido,
              )}
              helperText={
                erroresFormulario.apellido
              }
              disabled={loading}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              required
              label="Usuario"
              name="usuario"
              value={
                formulario.usuario
              }
              onChange={
                cambiarCampo
              }
              error={Boolean(
                erroresFormulario.usuario,
              )}
              helperText={
                erroresFormulario.usuario
              }
              disabled={loading}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              required
              type="email"
              label="Correo electrónico"
              name="email"
              value={
                formulario.email
              }
              onChange={
                cambiarCampo
              }
              error={Boolean(
                erroresFormulario.email,
              )}
              helperText={
                erroresFormulario.email
              }
              disabled={loading}
            />
          </Grid>

          {!editando && (
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                required
                type="password"
                label="Contraseña"
                name="password"
                value={
                  formulario.password
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  erroresFormulario.password,
                )}
                helperText={
                  erroresFormulario.password ||
                  "Mínimo 8 caracteres"
                }
                disabled={loading}
              />
            </Grid>
          )}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              select
              fullWidth
              required
              label="Rol"
              name="rol_id"
              value={
                formulario.rol_id
              }
              onChange={
                cambiarCampo
              }
              error={Boolean(
                erroresFormulario.rol_id,
              )}
              helperText={
                erroresFormulario.rol_id
              }
              disabled={loading}
            >
              {roles.map(
                (rol) => (
                  <MenuItem
                    key={rol.id}
                    value={rol.id}
                  >
                    {rol.nombre}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>

          {editando && (
            <Grid size={12}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                }}
              >
                Usuario activo
              </Typography>

              <Switch
                checked={
                  formulario.activo
                }
                onChange={
                  cambiarActivo
                }
                disabled={loading}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={cerrar}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={guardar}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : undefined
          }
        >
          {loading
            ? "Guardando..."
            : editando
              ? "Guardar cambios"
              : "Crear usuario"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}