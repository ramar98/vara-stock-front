import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

const estadoInicial = {
  nombre: "",
  telefono: "",
  email: "",
  direccion: "",
};

export default function ClienteDialog({
  open,
  cliente,
  loading = false,
  error = "",
  errors = [],
  onClose,
  onGuardar,
}) {
  const [formulario, setFormulario] =
    useState(estadoInicial);

  const [erroresFormulario, setErroresFormulario] =
    useState({});

  const editando = Boolean(cliente?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (cliente) {
      setFormulario({
        nombre: cliente.nombre ?? "",
        telefono: cliente.telefono ?? "",
        email: cliente.email ?? "",
        direccion: cliente.direccion ?? "",
      });
    } else {
      setFormulario(estadoInicial);
    }

    setErroresFormulario({});
  }, [open, cliente]);

  const cambiarCampo = (event) => {
    const { name, value } = event.target;

    setFormulario((estadoActual) => ({
      ...estadoActual,
      [name]: value,
    }));

    if (erroresFormulario[name]) {
      setErroresFormulario((estadoActual) => ({
        ...estadoActual,
        [name]: "",
      }));
    }
  };

  const validarEmail = (email) => {
    if (!email) {
      return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    );
  };

  const validar = () => {
    const nuevosErrores = {};

    const nombre = formulario.nombre.trim();
    const telefono = formulario.telefono.trim();
    const email = formulario.email.trim();
    const direccion = formulario.direccion.trim();

    if (!nombre) {
      nuevosErrores.nombre =
        "El nombre es obligatorio.";
    }

    if (nombre.length > 150) {
      nuevosErrores.nombre =
        "El nombre no puede superar los 150 caracteres.";
    }

    if (telefono.length > 50) {
      nuevosErrores.telefono =
        "El teléfono no puede superar los 50 caracteres.";
    }

    if (!validarEmail(email)) {
      nuevosErrores.email =
        "Ingresá un correo electrónico válido.";
    }

    if (email.length > 150) {
      nuevosErrores.email =
        "El correo no puede superar los 150 caracteres.";
    }

    if (direccion.length > 250) {
      nuevosErrores.direccion =
        "La dirección no puede superar los 250 caracteres.";
    }

    setErroresFormulario(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const guardar = async () => {
    if (!validar()) {
      return;
    }

    await onGuardar({
      nombre: formulario.nombre.trim(),
      telefono:
        formulario.telefono.trim() || null,
      email:
        formulario.email.trim() || null,
      direccion:
        formulario.direccion.trim() || null,
    });
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
      <DialogTitle>
        {editando
          ? "Editar cliente"
          : "Nuevo cliente"}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((mensaje, indice) => (
              <Typography
                key={`${mensaje}-${indice}`}
                variant="body2"
              >
                • {mensaje}
              </Typography>
            ))}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={cambiarCampo}
              error={Boolean(
                erroresFormulario.nombre,
              )}
              helperText={
                erroresFormulario.nombre
              }
              disabled={loading}
              inputProps={{
                maxLength: 150,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={formulario.telefono}
              onChange={cambiarCampo}
              error={Boolean(
                erroresFormulario.telefono,
              )}
              helperText={
                erroresFormulario.telefono
              }
              disabled={loading}
              inputProps={{
                maxLength: 50,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="email"
              label="Correo electrónico"
              name="email"
              value={formulario.email}
              onChange={cambiarCampo}
              error={Boolean(
                erroresFormulario.email,
              )}
              helperText={
                erroresFormulario.email
              }
              disabled={loading}
              inputProps={{
                maxLength: 150,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Dirección"
              name="direccion"
              value={formulario.direccion}
              onChange={cambiarCampo}
              error={Boolean(
                erroresFormulario.direccion,
              )}
              helperText={
                erroresFormulario.direccion
              }
              disabled={loading}
              inputProps={{
                maxLength: 250,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
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
            ) : null
          }
        >
          {loading
            ? "Guardando..."
            : editando
              ? "Guardar cambios"
              : "Crear cliente"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}