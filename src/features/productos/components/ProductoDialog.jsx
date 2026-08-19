import {
  useEffect,
  useState,
} from "react";

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
  Typography,
} from "@mui/material";

const estadoInicial = {
  codigo: "",
  nombre: "",
  descripcion: "",
  categoria_id: "",
  marca_id: "",
  proveedor_id: "",

  precio_costo_default: "",
  precio_venta_default: "",

  /*
   * 1 = producto con variantes
   * 0 = producto simple
   */
  usa_variantes: "1",
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

  /*
   * =====================================
   * CARGAR PRODUCTO / LIMPIAR FORMULARIO
   * =====================================
   */

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

        precio_costo_default:
          producto.precio_costo_default ??
          "",

        precio_venta_default:
          producto.precio_venta_default ??
          "",

        /*
         * Si es un producto viejo que todavía
         * no tiene usa_variantes, asumimos
         * que usa variantes.
         */

        usa_variantes:
          producto.usa_variantes != null
            ? String(
                Number(
                  producto.usa_variantes,
                ),
              )
            : "1",
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

  /*
   * =====================================
   * CAMBIAR CAMPO
   * =====================================
   */

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

        [name]:
          value,
      }),
    );

    if (
      errores[name]
    ) {
      setErrores(
        (estadoActual) => ({
          ...estadoActual,

          [name]:
            "",
        }),
      );
    }
  };

  /*
   * =====================================
   * VALIDACIÓN
   * =====================================
   */

  const validar = () => {
    const nuevosErrores =
      {};

    /*
     * Código
     *
     * Solo se valida al editar.
     * Al crear lo genera el backend.
     */

    if (
      editando &&
      !formulario.codigo.trim()
    ) {
      nuevosErrores.codigo =
        "El código es obligatorio.";
    }

    /*
     * Nombre
     */

    if (
      !formulario.nombre.trim()
    ) {
      nuevosErrores.nombre =
        "El nombre es obligatorio.";
    }

    /*
     * Categoría
     *
     * Obligatoria para crear
     * el código automático.
     */

    if (
      !formulario.categoria_id
    ) {
      nuevosErrores.categoria_id =
        "Seleccioná una categoría.";
    }

    /*
     * Tipo de producto
     */

    if (
      formulario.usa_variantes !==
        "1" &&
      formulario.usa_variantes !==
        "0"
    ) {
      nuevosErrores.usa_variantes =
        "Seleccioná el tipo de producto.";
    }

    /*
     * Precio costo
     */

    const precioCosto =
      Number(
        formulario.precio_costo_default,
      );

    if (
      formulario.precio_costo_default ===
        "" ||
      Number.isNaN(
        precioCosto,
      ) ||
      precioCosto < 0
    ) {
      nuevosErrores.precio_costo_default =
        "Ingresá un precio de costo válido.";
    }

    /*
     * Precio venta
     */

    const precioVenta =
      Number(
        formulario.precio_venta_default,
      );

    if (
      formulario.precio_venta_default ===
        "" ||
      Number.isNaN(
        precioVenta,
      ) ||
      precioVenta < 0
    ) {
      nuevosErrores.precio_venta_default =
        "Ingresá un precio de venta válido.";
    }

    /*
     * Precio de venta menor al costo
     */

    if (
      formulario.precio_costo_default !==
        "" &&
      formulario.precio_venta_default !==
        "" &&
      !Number.isNaN(
        precioCosto,
      ) &&
      !Number.isNaN(
        precioVenta,
      ) &&
      precioVenta <
        precioCosto
    ) {
      nuevosErrores.precio_venta_default =
        "El precio de venta no puede ser menor al precio de costo.";
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

  /*
   * =====================================
   * GUARDAR
   * =====================================
   */

  const guardar =
    async () => {
      if (!validar()) {
        return;
      }

      const datos = {
        nombre:
          formulario.nombre.trim(),

        descripcion:
          formulario.descripcion
            .trim() ||
          null,

        categoria_id:
          Number(
            formulario.categoria_id,
          ),

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

        /*
         * PRECIOS BASE
         */

        precio_costo_default:
          Number(
            formulario.precio_costo_default,
          ),

        precio_venta_default:
          Number(
            formulario.precio_venta_default,
          ),

        /*
         * TIPO DE PRODUCTO
         */

        usa_variantes:
          formulario.usa_variantes ===
          "1",
      };

      /*
       * El código solamente se envía
       * cuando estamos editando.
       *
       * Al crear, el backend lo genera.
       */

      if (editando) {
        datos.codigo =
          formulario.codigo.trim();
      }

      await onGuardar(
        datos,
      );
    };

  /*
   * =====================================
   * CERRAR
   * =====================================
   */

  const cerrar = () => {
    if (!loading) {
      onClose();
    }
  };

  /*
   * =====================================
   * RENDER
   * =====================================
   */

  return (
    <Dialog
      open={open}
      onClose={cerrar}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,

          overflow:
            "hidden",
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

          overflowX:
            "hidden",
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

            {editando && (
              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <TextField
                  fullWidth
                  label="Código"
                  name="codigo"
                  value={
                    formulario.codigo
                  }
                  error={Boolean(
                    errores.codigo,
                  )}
                  helperText={
                    errores.codigo ||
                    "Código generado automáticamente al crear el producto."
                  }
                  disabled
                />
              </Grid>
            )}

            {!editando && (
              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <TextField
                  fullWidth
                  label="Código"
                  value="Automático"
                  disabled
                  helperText="Se generará según la categoría. Ej.: PAN-007"
                />
              </Grid>
            )}

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
                required
                label="Categoría"
                name="categoria_id"
                value={
                  formulario.categoria_id
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  errores.categoria_id,
                )}
                helperText={
                  errores.categoria_id ||
                  (
                    editando
                      ? "Categoría del producto."
                      : "El código se generará usando las primeras 3 letras de esta categoría."
                  )
                }
                disabled={
                  loading
                }
              >
                <MenuItem value="">
                  Seleccionar categoría
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

            {/* ======================= */}
            {/* TIPO DE PRODUCTO */}
            {/* ======================= */}

            <Grid
              size={{
                xs: 12,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                Tipo de producto
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  mb: 1.5,
                }}
              >
                Indicá si el producto necesita variantes como color y talle.
              </Typography>

              <TextField
                select
                fullWidth
                required
                label="Tipo de producto"
                name="usa_variantes"
                value={
                  formulario.usa_variantes
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  errores.usa_variantes,
                )}
                helperText={
                  errores.usa_variantes ||
                  (
                    formulario.usa_variantes ===
                    "1"
                      ? "Podrás crear variantes con diferentes colores, talles y precios."
                      : "El producto se manejará directamente, sin seleccionar color ni talle."
                  )
                }
                disabled={
                  loading
                }
              >
                <MenuItem value="1">
                  Con variantes
                </MenuItem>

                <MenuItem value="0">
                  Sin variantes
                </MenuItem>
              </TextField>
            </Grid>

            {/* ======================= */}
            {/* PRECIOS BASE */}
            {/* ======================= */}

            <Grid
              size={{
                xs: 12,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {formulario.usa_variantes ===
                "1"
                  ? "Precios predeterminados"
                  : "Precios del producto"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                {formulario.usa_variantes ===
                "1"
                  ? "Estos valores se utilizarán automáticamente al crear nuevas variantes del producto."
                  : "Estos serán los precios de costo y venta del producto."}
              </Typography>
            </Grid>

            {/* ======================= */}
            {/* PRECIO COSTO */}
            {/* ======================= */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                required
                type="number"
                label="Precio de costo"
                name="precio_costo_default"
                value={
                  formulario.precio_costo_default
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  errores.precio_costo_default,
                )}
                helperText={
                  errores.precio_costo_default ||
                  (
                    formulario.usa_variantes ===
                    "1"
                      ? "Precio de costo predeterminado para nuevas variantes."
                      : "Precio de costo del producto."
                  )
                }
                disabled={
                  loading
                }
                slotProps={{
                  htmlInput: {
                    min: 0,

                    step:
                      "0.01",
                  },
                }}
              />
            </Grid>

            {/* ======================= */}
            {/* PRECIO VENTA */}
            {/* ======================= */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                required
                type="number"
                label="Precio de venta"
                name="precio_venta_default"
                value={
                  formulario.precio_venta_default
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  errores.precio_venta_default,
                )}
                helperText={
                  errores.precio_venta_default ||
                  (
                    formulario.usa_variantes ===
                    "1"
                      ? "Precio de venta predeterminado para nuevas variantes."
                      : "Precio de venta del producto."
                  )
                }
                disabled={
                  loading
                }
                slotProps={{
                  htmlInput: {
                    min: 0,

                    step:
                      "0.01",
                  },
                }}
              />
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