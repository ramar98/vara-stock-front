import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";

const estadoInicial = {
  codigo: "",
  nombre: "",
  descripcion: "",
  categoria_id: "",
  marca_id: "",
  proveedor_id: "",
};

export default function ProductoDialog({
  open,
  producto,
  categorias = [],
  marcas = [],
  proveedores = [],
  loading = false,
  error = "",
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
    errores,
    setErrores,
  ] = useState({});

  const editando =
    Boolean(
      producto?.id,
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (producto) {
      setFormulario({
        codigo:
          producto.codigo ??
          "",

        nombre:
          producto.nombre ??
          "",

        descripcion:
          producto.descripcion ??
          "",

        categoria_id:
          producto.categoria_id ??
          "",

        marca_id:
          producto.marca_id ??
          "",

        proveedor_id:
          producto.proveedor_id ??
          "",
      });
    } else {
      setFormulario({
        ...estadoInicial,
      });
    }

    setErrores({});
  }, [
    open,
    producto,
  ]);

  const cambiarCampo = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormulario(
      (estadoActual) => ({
        ...estadoActual,
        [name]: value,
      }),
    );

    if (errores[name]) {
      setErrores(
        (estadoActual) => ({
          ...estadoActual,
          [name]: "",
        }),
      );
    }
  };

  const validar = () => {
    const nuevosErrores =
      {};

    if (
      !formulario.codigo.trim()
    ) {
      nuevosErrores.codigo =
        "El código es obligatorio.";
    }

    if (
      !formulario.nombre.trim()
    ) {
      nuevosErrores.nombre =
        "El nombre es obligatorio.";
    }

    setErrores(
      nuevosErrores,
    );

    return (
      Object.keys(
        nuevosErrores,
      ).length === 0
    );
  };

  const guardar =
    async () => {
      if (!validar()) {
        return;
      }

      const datos = {
        codigo:
          formulario.codigo.trim(),

        nombre:
          formulario.nombre.trim(),

        descripcion:
          formulario.descripcion
            .trim() ||
          null,

        categoria_id:
          formulario.categoria_id
            ? Number(
                formulario.categoria_id,
              )
            : null,

        marca_id:
          formulario.marca_id
            ? Number(
                formulario.marca_id,
              )
            : null,

        proveedor_id:
          formulario.proveedor_id
            ? Number(
                formulario.proveedor_id,
              )
            : null,
      };

      await onGuardar(
        datos,
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
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          fontWeight: 700,
          fontSize: 26,
        }}
      >
        {editando
          ? "Editar producto"
          : "Nuevo producto"}
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          px: {
            xs: 2,
            sm: 3,
          },

          py: 3,

          overflowX: "hidden",
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
            }}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          noValidate
        >
          <Grid
            container
            spacing={2.5}
          >
            {/* ======================= */}
            {/* CÓDIGO */}
            {/* ======================= */}

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                fullWidth
                required
                label="Código"
                name="codigo"
                value={
                  formulario.codigo
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  errores.codigo,
                )}
                helperText={
                  errores.codigo
                }
                disabled={
                  loading
                }
              />
            </Grid>

            {/* ======================= */}
            {/* NOMBRE */}
            {/* ======================= */}

            <Grid
              size={{
                xs: 12,
                md: 8,
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
                  errores.nombre,
                )}
                helperText={
                  errores.nombre
                }
                disabled={
                  loading
                }
              />
            </Grid>

            {/* ======================= */}
            {/* DESCRIPCIÓN */}
            {/* ======================= */}

            <Grid
              size={{
                xs: 12,
              }}
            >
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Descripción"
                name="descripcion"
                value={
                  formulario.descripcion
                }
                onChange={
                  cambiarCampo
                }
                disabled={
                  loading
                }
              />
            </Grid>

            {/* ======================= */}
            {/* CATEGORÍA */}
            {/* ======================= */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                select
                fullWidth
                label="Categoría"
                name="categoria_id"
                value={
                  formulario.categoria_id
                }
                onChange={
                  cambiarCampo
                }
                disabled={
                  loading
                }
              >
                <MenuItem value="">
                  Sin categoría
                </MenuItem>

                {categorias.map(
                  (
                    categoria,
                  ) => (
                    <MenuItem
                      key={
                        categoria.id
                      }
                      value={
                        categoria.id
                      }
                    >
                      {
                        categoria.nombre
                      }
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Grid>

            {/* ======================= */}
            {/* MARCA */}
            {/* ======================= */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                select
                fullWidth
                label="Marca"
                name="marca_id"
                value={
                  formulario.marca_id
                }
                onChange={
                  cambiarCampo
                }
                disabled={
                  loading
                }
              >
                <MenuItem value="">
                  Sin marca
                </MenuItem>

                {marcas.map(
                  (marca) => (
                    <MenuItem
                      key={
                        marca.id
                      }
                      value={
                        marca.id
                      }
                    >
                      {
                        marca.nombre
                      }
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Grid>

            {/* ======================= */}
            {/* PROVEEDOR */}
            {/* ======================= */}

            <Grid
              size={{
                xs: 12,
              }}
            >
              <TextField
                select
                fullWidth
                label="Proveedor"
                name="proveedor_id"
                value={
                  formulario.proveedor_id
                }
                onChange={
                  cambiarCampo
                }
                disabled={
                  loading
                }
              >
                <MenuItem value="">
                  Sin proveedor
                </MenuItem>

                {proveedores.map(
                  (
                    proveedor,
                  ) => (
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
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          onClick={
            cerrar
          }
          disabled={
            loading
          }
          sx={{
            minWidth: 120,
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={
            guardar
          }
          disabled={
            loading
          }
          startIcon={
            loading ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : null
          }
          sx={{
            minWidth: 160,
          }}
        >
          {loading
            ? "Guardando..."
            : editando
              ? "Guardar cambios"
              : "Crear producto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}