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
  observaciones: "",
};

function validarEmail(email) {
  if (!email) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ProveedorDialog({
  open,
  proveedor = null,
  loading = false,
  error = "",
  errors = [],
  onClose,
  onGuardar,
}) {
  const [formulario, setFormulario] =
    useState(estadoInicial);

  const [
    erroresFormulario,
    setErroresFormulario,
  ] = useState({});

  const editando = Boolean(proveedor?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (proveedor) {
      setFormulario({
        nombre: proveedor.nombre ?? "",
        telefono: proveedor.telefono ?? "",
        email: proveedor.email ?? "",
        direccion: proveedor.direccion ?? "",
        observaciones:
          proveedor.observaciones ?? "",
      });
    } else {
      setFormulario({
        ...estadoInicial,
      });
    }

    setErroresFormulario({});
  }, [open, proveedor]);

  const cambiarCampo = (event) => {
    const { name, value } = event.target;

    setFormulario((estadoActual) => ({
      ...estadoActual,
      [name]: value,
    }));

    setErroresFormulario((estadoActual) => ({
      ...estadoActual,
      [name]: "",
    }));
  };

  const validar = () => {
    const nuevosErrores = {};

    const nombre = formulario.nombre.trim();
    const telefono =
      formulario.telefono.trim();
    const email = formulario.email.trim();
    const direccion =
      formulario.direccion.trim();
    const observaciones =
      formulario.observaciones.trim();

    if (!nombre) {
      nuevosErrores.nombre =
        "El nombre del proveedor es obligatorio.";
    } else if (nombre.length > 150) {
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
    } else if (email.length > 150) {
      nuevosErrores.email =
        "El correo no puede superar los 150 caracteres.";
    }

    if (direccion.length > 250) {
      nuevosErrores.direccion =
        "La dirección no puede superar los 250 caracteres.";
    }

    if (observaciones.length > 1000) {
      nuevosErrores.observaciones =
        "Las observaciones no pueden superar los 1000 caracteres.";
    }

    setErroresFormulario(nuevosErrores);

    return (
      Object.keys(nuevosErrores).length === 0
    );
  };

  const guardar = async () => {
    if (!validar()) {
      return;
    }

    const datos = {
      nombre: formulario.nombre.trim(),

      telefono:
        formulario.telefono.trim() || null,

      email:
        formulario.email.trim() || null,

      direccion:
        formulario.direccion.trim() || null,

      observaciones:
        formulario.observaciones.trim() ||
        null,
    };

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
          ? "Editar proveedor"
          : "Nuevo proveedor"}
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

        {Array.isArray(errors) &&
          errors.length > 0 && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {errors.map(
                (mensaje, indice) => (
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
          <Grid size={12}>
            <TextField
              fullWidth
              required
              label="Nombre del proveedor"
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
              slotProps={{
                htmlInput: {
                  maxLength: 150,
                },
              }}
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
              slotProps={{
                htmlInput: {
                  maxLength: 50,
                },
              }}
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
              slotProps={{
                htmlInput: {
                  maxLength: 150,
                },
              }}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
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
              slotProps={{
                htmlInput: {
                  maxLength: 250,
                },
              }}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Observaciones"
              name="observaciones"
              value={
                formulario.observaciones
              }
              onChange={cambiarCampo}
              error={Boolean(
                erroresFormulario.observaciones,
              )}
              helperText={
                erroresFormulario.observaciones ||
                `${formulario.observaciones.length}/1000`
              }
              disabled={loading}
              slotProps={{
                htmlInput: {
                  maxLength: 1000,
                },
              }}
            />
          </Grid>
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
              : "Crear proveedor"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}