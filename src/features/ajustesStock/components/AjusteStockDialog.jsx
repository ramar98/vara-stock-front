import {
  useEffect,
  useMemo,
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
  Typography,
} from "@mui/material";

import api from "../../../services/api";

const MOTIVOS = [
  {
    value: "CONTEO_FISICO",
    label: "Conteo físico",
  },
  {
    value: "ROTURA",
    label: "Rotura",
  },
  {
    value: "PERDIDA",
    label: "Pérdida",
  },
  {
    value: "ERROR_CARGA",
    label: "Error de carga",
  },
  {
    value: "DEVOLUCION",
    label: "Devolución",
  },
  {
    value: "OTRO",
    label: "Otro",
  },
];

const estadoInicial = {
  producto_id: "",
  variante_id: "",
  nuevo_stock: "",
  motivo: "CONTEO_FISICO",
  observacion: "",
};

function extraerDatos(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (Array.isArray(respuesta?.data)) {
    return respuesta.data;
  }

  return [];
}

function obtenerDescripcionVariante(
  variante,
) {
  const partes = [
    variante.color,
    variante.talle,
  ].filter(Boolean);

  const descripcion =
    partes.length > 0
      ? partes.join(" / ")
      : variante.codigo_barras ||
        "Sin variante";

  return `${descripcion} — Stock: ${Number(
    variante.stock_actual ?? 0,
  )}`;
}

export default function AjusteStockDialog({
  open,
  productos = [],
  loading = false,
  error = "",
  errors = [],
  onClose,
  onGuardar,
}) {
  const [formulario, setFormulario] =
    useState(estadoInicial);

  const [variantes, setVariantes] =
    useState([]);

  const [
    cargandoVariantes,
    setCargandoVariantes,
  ] = useState(false);

  const [
    errorCargaVariantes,
    setErrorCargaVariantes,
  ] = useState("");

  const [
    erroresFormulario,
    setErroresFormulario,
  ] = useState({});

  const varianteSeleccionada =
    useMemo(
      () =>
        variantes.find(
          (variante) =>
            Number(variante.id) ===
            Number(
              formulario.variante_id,
            ),
        ) ?? null,
      [
        variantes,
        formulario.variante_id,
      ],
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormulario({
      ...estadoInicial,
    });

    setVariantes([]);
    setCargandoVariantes(false);
    setErrorCargaVariantes("");
    setErroresFormulario({});
  }, [open]);

  const cambiarCampo = (event) => {
    const { name, value } =
      event.target;

    setFormulario((estadoActual) => ({
      ...estadoActual,
      [name]: value,
    }));

    if (erroresFormulario[name]) {
      setErroresFormulario(
        (estadoActual) => ({
          ...estadoActual,
          [name]: "",
        }),
      );
    }
  };

  const seleccionarProducto = async (
    event,
  ) => {
    const productoId =
      event.target.value;

    setFormulario(
      (estadoActual) => ({
        ...estadoActual,
        producto_id: productoId,
        variante_id: "",
        nuevo_stock: "",
      }),
    );

    setVariantes([]);
    setErrorCargaVariantes("");

    setErroresFormulario(
      (estadoActual) => ({
        ...estadoActual,
        producto_id: "",
        variante_id: "",
        nuevo_stock: "",
      }),
    );

    if (!productoId) {
      return;
    }

    setCargandoVariantes(true);

    try {
      const { data } = await api.get(
        `/variantes/producto/${productoId}`,
      );

      setVariantes(
        extraerDatos(data),
      );
    } catch (errorPeticion) {
      setVariantes([]);

      setErrorCargaVariantes(
        errorPeticion?.response?.data
          ?.message ||
          errorPeticion?.response?.data
            ?.error ||
          errorPeticion?.message ||
          "No se pudieron cargar las variantes del producto.",
      );
    } finally {
      setCargandoVariantes(false);
    }
  };

  const seleccionarVariante = (
    event,
  ) => {
    const varianteId =
      event.target.value;

    const variante = variantes.find(
      (elemento) =>
        Number(elemento.id) ===
        Number(varianteId),
    );

    setFormulario(
      (estadoActual) => ({
        ...estadoActual,
        variante_id: varianteId,

        nuevo_stock:
          variante?.stock_actual ?? "",
      }),
    );

    setErroresFormulario(
      (estadoActual) => ({
        ...estadoActual,
        variante_id: "",
        nuevo_stock: "",
      }),
    );
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!formulario.producto_id) {
      nuevosErrores.producto_id =
        "Seleccioná un producto.";
    }

    if (!formulario.variante_id) {
      nuevosErrores.variante_id =
        "Seleccioná una variante.";
    }

    const nuevoStock = Number(
      formulario.nuevo_stock,
    );

    if (
      formulario.nuevo_stock === "" ||
      !Number.isInteger(nuevoStock) ||
      nuevoStock < 0
    ) {
      nuevosErrores.nuevo_stock =
        "Ingresá un stock entero mayor o igual a cero.";
    }

    if (
      varianteSeleccionada &&
      formulario.nuevo_stock !== "" &&
      nuevoStock ===
        Number(
          varianteSeleccionada.stock_actual ??
            0,
        )
    ) {
      nuevosErrores.nuevo_stock =
        "El nuevo stock debe ser diferente al stock actual.";
    }

    if (!formulario.motivo) {
      nuevosErrores.motivo =
        "Seleccioná un motivo.";
    }

    if (
      formulario.observacion.length >
      1000
    ) {
      nuevosErrores.observacion =
        "La observación no puede superar los 1000 caracteres.";
    }

    setErroresFormulario(
      nuevosErrores,
    );

    return (
      Object.keys(nuevosErrores)
        .length === 0
    );
  };

  const guardar = async () => {
    if (!validar()) {
      return;
    }

    await onGuardar({
      variante_id: Number(
        formulario.variante_id,
      ),

      nuevo_stock: Number(
        formulario.nuevo_stock,
      ),

      motivo:
        formulario.motivo,

      observacion:
        formulario.observacion.trim() ||
        null,
    });
  };

  const cerrar = () => {
    if (!loading) {
      onClose();
    }
  };

  const diferencia =
    varianteSeleccionada &&
    formulario.nuevo_stock !== ""
      ? Number(
          formulario.nuevo_stock,
        ) -
        Number(
          varianteSeleccionada.stock_actual ??
            0,
        )
      : "";

  return (
    <Dialog
      open={open}
      onClose={cerrar}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Nuevo ajuste de stock
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

        {errorCargaVariantes && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {errorCargaVariantes}
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
              label="Producto"
              name="producto_id"
              value={
                formulario.producto_id
              }
              onChange={
                seleccionarProducto
              }
              error={Boolean(
                erroresFormulario.producto_id,
              )}
              helperText={
                erroresFormulario.producto_id
              }
              disabled={loading}
            >
              <MenuItem value="">
                Seleccionar producto
              </MenuItem>

              {productos.map(
                (producto) => (
                  <MenuItem
                    key={producto.id}
                    value={producto.id}
                  >
                    {producto.codigo} -{" "}
                    {producto.nombre}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>

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
              label="Variante"
              name="variante_id"
              value={
                formulario.variante_id
              }
              onChange={
                seleccionarVariante
              }
              error={Boolean(
                erroresFormulario.variante_id,
              )}
              helperText={
                erroresFormulario.variante_id
              }
              disabled={
                loading ||
                !formulario.producto_id ||
                cargandoVariantes
              }
            >
              <MenuItem value="">
                {cargandoVariantes
                  ? "Cargando variantes..."
                  : "Seleccionar variante"}
              </MenuItem>

              {variantes.map(
                (variante) => (
                  <MenuItem
                    key={variante.id}
                    value={variante.id}
                  >
                    {obtenerDescripcionVariante(
                      variante,
                    )}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              disabled
              label="Stock actual"
              value={
                varianteSeleccionada
                  ? Number(
                      varianteSeleccionada.stock_actual ??
                        0,
                    )
                  : ""
              }
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
              type="number"
              label="Nuevo stock"
              name="nuevo_stock"
              value={
                formulario.nuevo_stock
              }
              onChange={cambiarCampo}
              error={Boolean(
                erroresFormulario.nuevo_stock,
              )}
              helperText={
                erroresFormulario.nuevo_stock ||
                "Ingresá la cantidad total que debería quedar."
              }
              disabled={
                loading ||
                !formulario.variante_id
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 1,
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
              select
              fullWidth
              required
              label="Motivo"
              name="motivo"
              value={
                formulario.motivo
              }
              onChange={cambiarCampo}
              error={Boolean(
                erroresFormulario.motivo,
              )}
              helperText={
                erroresFormulario.motivo
              }
              disabled={loading}
            >
              {MOTIVOS.map(
                (motivo) => (
                  <MenuItem
                    key={motivo.value}
                    value={motivo.value}
                  >
                    {motivo.label}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              disabled
              label="Diferencia"
              value={diferencia}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Observación"
              name="observacion"
              value={
                formulario.observacion
              }
              onChange={cambiarCampo}
              error={Boolean(
                erroresFormulario.observacion,
              )}
              helperText={
                erroresFormulario.observacion ||
                `${formulario.observacion.length}/1000`
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
          disabled={
            loading ||
            cargandoVariantes
          }
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
            ? "Registrando..."
            : "Registrar ajuste"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}