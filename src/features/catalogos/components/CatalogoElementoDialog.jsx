import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

const estadoInicial = {
  nombre: "",
};

export default function CatalogoElementoDialog({
  open,
  elemento = null,
  tipoEtiqueta = "elemento",
  loading = false,
  error = "",
  errors = [],
  onClose,
  onGuardar,
}) {
  const [formulario, setFormulario] =
    useState(estadoInicial);

  const [errorNombre, setErrorNombre] =
    useState("");

  const editando = Boolean(elemento?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormulario({
      nombre: elemento?.nombre ?? "",
    });

    setErrorNombre("");
  }, [open, elemento]);

  const cambiarNombre = (event) => {
    setFormulario({
      nombre: event.target.value,
    });

    if (errorNombre) {
      setErrorNombre("");
    }
  };

  const validar = () => {
    const nombre = formulario.nombre.trim();

    if (!nombre) {
      setErrorNombre(
        "El nombre es obligatorio.",
      );

      return false;
    }

    if (nombre.length > 100) {
      setErrorNombre(
        "El nombre no puede superar los 100 caracteres.",
      );

      return false;
    }

    setErrorNombre("");

    return true;
  };

  const guardar = async () => {
    if (!validar()) {
      return;
    }

    await onGuardar({
      nombre: formulario.nombre.trim(),
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
      maxWidth="xs"
    >
      <DialogTitle>
        {editando
          ? `Editar ${tipoEtiqueta}`
          : `Nueva ${tipoEtiqueta}`}
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

        <TextField
          autoFocus
          fullWidth
          required
          label="Nombre"
          value={formulario.nombre}
          onChange={cambiarNombre}
          error={Boolean(errorNombre)}
          helperText={
            errorNombre ||
            `${formulario.nombre.length}/100`
          }
          disabled={loading}
          inputProps={{
            maxLength: 100,
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{ px: 3, py: 2 }}
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
              : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}