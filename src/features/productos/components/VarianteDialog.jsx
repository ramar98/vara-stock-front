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
  TextField,
} from "@mui/material";

const estadoInicial = {
  color_id: "",
  talle_id: "",
  codigo_barras: "",
  precio_costo: "",
  precio_venta: "",
  stock_actual: "0",
  stock_minimo: "1",
};

function convertirPrecioInicial(
  valor,
) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return "";
  }

  return String(valor);
}

export default function VarianteDialog({
  open,
  variante,

  /*
   * Precios predeterminados
   * provenientes del producto.
   */
  precioCostoDefault = "",
  precioVentaDefault = "",

  colores = [],
  talles = [],
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
    Boolean(variante?.id);

  /*
   * =====================================
   * CARGAR FORMULARIO
   * =====================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    /*
     * =================================
     * EDITAR VARIANTE
     * =================================
     *
     * Conservamos los precios propios
     * de la variante.
     */

    if (variante) {
      setFormulario({
        color_id:
          variante.color_id != null
            ? String(
                variante.color_id,
              )
            : "",

        talle_id:
          variante.talle_id != null
            ? String(
                variante.talle_id,
              )
            : "",

        codigo_barras:
          variante.codigo_barras ??
          "",

        precio_costo:
          variante.precio_costo ??
          "",

        precio_venta:
          variante.precio_venta ??
          "",

        stock_actual:
          variante.stock_actual ??
          "0",

        stock_minimo:
          variante.stock_minimo ??
          "1",
      });
    } else {
      /*
       * =================================
       * NUEVA VARIANTE
       * =================================
       *
       * Los precios arrancan con
       * los valores predeterminados
       * del producto.
       */

      setFormulario({
        ...estadoInicial,

        precio_costo:
          convertirPrecioInicial(
            precioCostoDefault,
          ),

        precio_venta:
          convertirPrecioInicial(
            precioVentaDefault,
          ),
      });
    }

    setErrores({});
  }, [
    open,
    variante,
    precioCostoDefault,
    precioVentaDefault,
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

    if (errores[name]) {
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
   * VALIDAR
   * =====================================
   */

  const validar = () => {
    const nuevosErrores =
      {};

    if (
      !formulario.color_id
    ) {
      nuevosErrores.color_id =
        "El color es obligatorio.";
    }

    if (
      !formulario.talle_id
    ) {
      nuevosErrores.talle_id =
        "El talle es obligatorio.";
    }

    const precioCosto =
      Number(
        formulario.precio_costo,
      );

    const precioVenta =
      Number(
        formulario.precio_venta,
      );

    const stockActual =
      Number(
        formulario.stock_actual,
      );

    const stockMinimo =
      Number(
        formulario.stock_minimo,
      );

    /*
     * Precio costo
     */

    if (
      formulario.precio_costo ===
        "" ||
      Number.isNaN(
        precioCosto,
      ) ||
      precioCosto < 0
    ) {
      nuevosErrores.precio_costo =
        "Ingresá un precio de costo válido.";
    }

    /*
     * Precio venta
     */

    if (
      formulario.precio_venta ===
        "" ||
      Number.isNaN(
        precioVenta,
      ) ||
      precioVenta < 0
    ) {
      nuevosErrores.precio_venta =
        "Ingresá un precio de venta válido.";
    }

    /*
     * Evitamos precio de venta
     * menor al costo.
     */

    if (
      formulario.precio_costo !==
        "" &&
      formulario.precio_venta !==
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
      nuevosErrores.precio_venta =
        "El precio de venta no puede ser menor al precio de costo.";
    }

    /*
     * Stock actual solamente
     * se valida al crear.
     *
     * Al editar está bloqueado,
     * porque los cambios de stock
     * deben hacerse mediante
     * ingresos / ajustes.
     */

    if (
      !editando &&
      (
        formulario.stock_actual ===
          "" ||
        !Number.isInteger(
          stockActual,
        ) ||
        stockActual < 0
      )
    ) {
      nuevosErrores.stock_actual =
        "Ingresá un stock válido.";
    }

    /*
     * Stock mínimo
     */

    if (
      formulario.stock_minimo ===
        "" ||
      !Number.isInteger(
        stockMinimo,
      ) ||
      stockMinimo < 0
    ) {
      nuevosErrores.stock_minimo =
        "Ingresá un stock mínimo válido.";
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
        color_id:
          Number(
            formulario.color_id,
          ),

        talle_id:
          Number(
            formulario.talle_id,
          ),

        codigo_barras:
          formulario.codigo_barras
            .trim() ||
          null,

        precio_costo:
          Number(
            formulario.precio_costo,
          ),

        precio_venta:
          Number(
            formulario.precio_venta,
          ),

        stock_actual:
          Number(
            formulario.stock_actual ||
              0,
          ),

        stock_minimo:
          Number(
            formulario.stock_minimo,
          ),
      };

      await onGuardar?.(
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
      onClose?.();
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

          /*
           * Evita que el modal
           * salga de la pantalla.
           */

          maxHeight:
            "90vh",

          display:
            "flex",

          flexDirection:
            "column",

          overflow:
            "hidden",
        },
      }}
    >
      {/* ===================== */}
      {/* TITULO */}
      {/* ===================== */}

      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,

          fontWeight:
            700,

          fontSize:
            24,

          flexShrink:
            0,
        }}
      >
        {editando
          ? "Editar variante"
          : "Nueva variante"}
      </DialogTitle>

      {/* ===================== */}
      {/* CONTENIDO */}
      {/* ===================== */}

      <DialogContent
        dividers
        sx={{
          px: {
            xs: 2,
            sm: 3,
          },

          py: 3,

          /*
           * Solamente esta zona
           * hace scroll.
           */

          overflowY:
            "auto",

          overflowX:
            "hidden",

          flex:
            "1 1 auto",
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

        <Grid
          container
          spacing={2.5}
        >
          {/* ================= */}
          {/* COLOR */}
          {/* ================= */}

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
              label="Color"
              name="color_id"
              value={
                formulario.color_id
              }
              onChange={
                cambiarCampo
              }
              error={Boolean(
                errores.color_id,
              )}
              helperText={
                errores.color_id
              }
              disabled={
                loading
              }
            >
              <MenuItem value="">
                Seleccionar color
              </MenuItem>

              {colores.map(
                (color) => (
                  <MenuItem
                    key={
                      color.id
                    }
                    value={String(
                      color.id,
                    )}
                  >
                    {
                      color.nombre
                    }
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>

          {/* ================= */}
          {/* TALLE */}
          {/* ================= */}

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
              label="Talle"
              name="talle_id"
              value={
                formulario.talle_id
              }
              onChange={
                cambiarCampo
              }
              error={Boolean(
                errores.talle_id,
              )}
              helperText={
                errores.talle_id
              }
              disabled={
                loading
              }
            >
              <MenuItem value="">
                Seleccionar talle
              </MenuItem>

              {talles.map(
                (talle) => (
                  <MenuItem
                    key={
                      talle.id
                    }
                    value={String(
                      talle.id,
                    )}
                  >
                    {
                      talle.nombre
                    }
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>

          {/* ================= */}
          {/* CODIGO BARRAS */}
          {/* ================= */}

          <Grid
            size={{
              xs: 12,
            }}
          >
            <TextField
              fullWidth
              label="Código de barras"
              name="codigo_barras"
              value={
                formulario.codigo_barras
              }
              onChange={
                cambiarCampo
              }
              disabled={
                loading
              }
              slotProps={{
                htmlInput: {
                  maxLength:
                    100,
                },
              }}
            />
          </Grid>

          {/* ================= */}
          {/* COSTO */}
          {/* ================= */}

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
              name="precio_costo"
              value={
                formulario.precio_costo
              }
              onChange={
                cambiarCampo
              }
              error={Boolean(
                errores.precio_costo,
              )}
              helperText={
                errores.precio_costo ||
                (
                  !editando
                    ? "Valor predeterminado del producto. Podés modificarlo para esta variante."
                    : ""
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

          {/* ================= */}
          {/* VENTA */}
          {/* ================= */}

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
              name="precio_venta"
              value={
                formulario.precio_venta
              }
              onChange={
                cambiarCampo
              }
              error={Boolean(
                errores.precio_venta,
              )}
              helperText={
                errores.precio_venta ||
                (
                  !editando
                    ? "Valor predeterminado del producto. Podés modificarlo para esta variante."
                    : ""
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

          {/* ================= */}
          {/* STOCK ACTUAL */}
          {/* ================= */}

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
              label="Stock inicial"
              name="stock_actual"
              value={
                formulario.stock_actual
              }
              onChange={
                cambiarCampo
              }
              error={Boolean(
                errores.stock_actual,
              )}
              helperText={
                errores.stock_actual ||
                (
                  editando
                    ? "Para modificar stock utilizá Ajustes de stock."
                    : "Cantidad inicial disponible."
                )
              }
              disabled={
                loading ||
                editando
              }
              slotProps={{
                htmlInput: {
                  min: 0,

                  step: 1,
                },
              }}
            />
          </Grid>

          {/* ================= */}
          {/* STOCK MINIMO */}
          {/* ================= */}

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
              label="Stock mínimo"
              name="stock_minimo"
              value={
                formulario.stock_minimo
              }
              onChange={
                cambiarCampo
              }
              error={Boolean(
                errores.stock_minimo,
              )}
              helperText={
                errores.stock_minimo ||
                "Se utilizará para las alertas de stock bajo."
              }
              disabled={
                loading
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 1,
                },
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* ===================== */}
      {/* BOTONES SIEMPRE */}
      {/* VISIBLES */}
      {/* ===================== */}

      <DialogActions
        sx={{
          px: 3,
          py: 2,

          flexShrink: 0,

          gap: 1,

          borderTop:
            "1px solid",

          borderColor:
            "divider",

          backgroundColor:
            "background.paper",

          justifyContent:
            "flex-end",
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
            minWidth:
              110,
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
            minWidth:
              160,
          }}
        >
          {loading
            ? "Guardando..."
            : editando
              ? "Guardar cambios"
              : "Crear variante"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}