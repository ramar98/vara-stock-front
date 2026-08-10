import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const estadoInicial = {
  password: "",
  repetirPassword: "",
};

export default function PasswordDialog({
  open,
  usuario = null,
  loading = false,
  error = "",
  onClose,
  onGuardar,
}) {
  const [formulario, setFormulario] =
    useState(estadoInicial);

  const [
    erroresFormulario,
    setErroresFormulario,
  ] = useState({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormulario(estadoInicial);
    setErroresFormulario({});
  }, [open]);

  const cambiarCampo = (event) => {
    const { name, value } =
      event.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));

    setErroresFormulario(
      (actual) => ({
        ...actual,
        [name]: "",
      }),
    );
  };

  const validar = () => {
    const errores = {};

    if (
      formulario.password.length < 8
    ) {
      errores.password =
        "La contraseña debe tener al menos 8 caracteres.";
    }

    if (
      formulario.password.length > 72
    ) {
      errores.password =
        "La contraseña no puede superar los 72 caracteres.";
    }

    if (
      !formulario.repetirPassword
    ) {
      errores.repetirPassword =
        "Repetí la contraseña.";
    } else if (
      formulario.password !==
      formulario.repetirPassword
    ) {
      errores.repetirPassword =
        "Las contraseñas no coinciden.";
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

    await onGuardar(
      formulario.password,
    );
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
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
        }}
      >
        Cambiar contraseña
      </DialogTitle>

      <DialogContent dividers>
        {usuario && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Nueva contraseña para{" "}
            <strong>
              {usuario.nombre}{" "}
              {usuario.apellido}
            </strong>
            .
          </Typography>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            fullWidth
            autoFocus
            type="password"
            label="Nueva contraseña"
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

          <TextField
            fullWidth
            type="password"
            label="Repetir contraseña"
            name="repetirPassword"
            value={
              formulario.repetirPassword
            }
            onChange={
              cambiarCampo
            }
            error={Boolean(
              erroresFormulario.repetirPassword,
            )}
            helperText={
              erroresFormulario.repetirPassword
            }
            disabled={loading}
          />
        </Stack>
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
            : "Cambiar contraseña"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}