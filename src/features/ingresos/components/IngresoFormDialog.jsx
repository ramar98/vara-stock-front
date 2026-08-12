import {
  useEffect,
  useMemo,
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
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import api from "../../../services/api";

import ProductoDialog from "../../productos/components/ProductoDialog";
import VarianteDialog from "../../productos/components/VarianteDialog";

import useProductoMutations from "../../productos/hooks/useProductoMutations";
import useVariantesProducto from "../../productos/hooks/useVariantesProducto";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001/api"
).replace(/\/api\/?$/, "");

function obtenerFechaActual() {
  const fecha = new Date();

  const offset =
    fecha.getTimezoneOffset();

  return new Date(
    fecha.getTime() -
      offset * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
}

const estadoInicial = {
  proveedor_id: "",
  numero_comprobante: "",
  fecha: obtenerFechaActual(),
  observaciones: "",
};

function generarIdTemporal() {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function crearItemVacio() {
  return {
    idTemporal:
      generarIdTemporal(),

    categoria_id: "",

    producto_id: "",

    variante_id: "",

    cantidad: "1",

    precio_costo: "",

    variantes: [],

    cargandoVariantes:
      false,
  };
}

function formatearMoneda(valor) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    },
  ).format(
    Number(valor ?? 0),
  );
}

function extraerDatos(respuesta) {
  if (
    Array.isArray(
      respuesta,
    )
  ) {
    return respuesta;
  }

  if (
    Array.isArray(
      respuesta?.data,
    )
  ) {
    return respuesta.data;
  }

  return [];
}

function obtenerUrlImagen(ruta) {
  if (!ruta) {
    return "/no-image.png";
  }

  const rutaNormalizada =
    String(ruta).replaceAll(
      "\\",
      "/",
    );

  if (
    rutaNormalizada.startsWith(
      "http://",
    ) ||
    rutaNormalizada.startsWith(
      "https://",
    )
  ) {
    return rutaNormalizada;
  }

  return `${API_URL}/${rutaNormalizada.replace(
    /^\/+/,
    "",
  )}`;
}

export default function IngresoFormDialog({
  open,
  proveedores = [],
  productos = [],
  categorias = [],
  marcas = [],
  colores = [],
  talles = [],
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
    items,
    setItems,
  ] = useState([
    crearItemVacio(),
  ]);

  const [
    erroresFormulario,
    setErroresFormulario,
  ] = useState({});

  /*
   * ==================================
   * PRODUCTOS CREADOS EN LA COMPRA
   * ==================================
   */

  const [
    productosCreados,
    setProductosCreados,
  ] = useState([]);

  /*
   * ==================================
   * MODALES
   * ==================================
   */

  const [
    dialogProductoAbierto,
    setDialogProductoAbierto,
  ] = useState(false);

  const [
    dialogVarianteAbierto,
    setDialogVarianteAbierto,
  ] = useState(false);

  /*
   * ==================================
   * PRODUCTO NUEVO
   * ==================================
   */

  const [
    itemCreacionId,
    setItemCreacionId,
  ] = useState(null);

  const [
    productoNuevo,
    setProductoNuevo,
  ] = useState(null);

  /*
   * ==================================
   * NUEVA VARIANTE DE PRODUCTO EXISTENTE
   * ==================================
   */

  const [
    productoVarianteNueva,
    setProductoVarianteNueva,
  ] = useState(null);

  const [
    itemVarianteNuevaId,
    setItemVarianteNuevaId,
  ] = useState(null);

  /*
   * ==================================
   * ERRORES MODALES
   * ==================================
   */

  const [
    errorProductoNuevo,
    setErrorProductoNuevo,
  ] = useState("");

  const [
    errorVarianteNueva,
    setErrorVarianteNueva,
  ] = useState("");

  /*
   * ==================================
   * MUTACIÓN PRODUCTO
   * ==================================
   */

  const {
    guardarProducto,
    guardando:
      guardandoProducto,
  } = useProductoMutations();

  /*
   * Puede ser:
   *
   * - producto recién creado
   * - producto existente
   */

  const productoIdParaVariante =
    productoNuevo?.id ??
    productoVarianteNueva?.id ??
    null;

  const {
    guardarVariante,
    guardandoVariante,
  } = useVariantesProducto(
    productoIdParaVariante,
  );

  /*
   * ==================================
   * PRODUCTOS DISPONIBLES
   * ==================================
   */

  const productosDisponibles =
    useMemo(() => {
      const mapa =
        new Map();

      productos.forEach(
        (producto) => {
          mapa.set(
            String(
              producto.id,
            ),
            producto,
          );
        },
      );

      productosCreados.forEach(
        (producto) => {
          mapa.set(
            String(
              producto.id,
            ),
            producto,
          );
        },
      );

      return Array.from(
        mapa.values(),
      ).sort(
        (a, b) =>
          String(
            a.nombre ?? "",
          ).localeCompare(
            String(
              b.nombre ?? "",
            ),
            "es",
          ),
      );
    }, [
      productos,
      productosCreados,
    ]);

  /*
   * ==================================
   * REINICIAR FORMULARIO
   * ==================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormulario({
      ...estadoInicial,

      fecha:
        obtenerFechaActual(),
    });

    setItems([
      crearItemVacio(),
    ]);

    setProductosCreados([]);

    setErroresFormulario(
      {},
    );

    setDialogProductoAbierto(
      false,
    );

    setDialogVarianteAbierto(
      false,
    );

    setItemCreacionId(null);

    setProductoNuevo(null);

    setProductoVarianteNueva(
      null,
    );

    setItemVarianteNuevaId(
      null,
    );

    setErrorProductoNuevo("");

    setErrorVarianteNueva("");
  }, [open]);

  /*
   * ==================================
   * CATEGORÍAS
   * ==================================
   */

  const categoriasDisponibles =
    useMemo(() => {
      if (
        categorias.length >
        0
      ) {
        return [...categorias].sort(
          (a, b) =>
            String(
              a.nombre ?? "",
            ).localeCompare(
              String(
                b.nombre ?? "",
              ),
              "es",
            ),
        );
      }

      const mapa =
        new Map();

      productosDisponibles.forEach(
        (producto) => {
          if (
            producto.categoria_id &&
            producto.categoria
          ) {
            mapa.set(
              String(
                producto.categoria_id,
              ),
              {
                id:
                  producto.categoria_id,

                nombre:
                  producto.categoria,
              },
            );
          }
        },
      );

      return Array.from(
        mapa.values(),
      ).sort(
        (a, b) =>
          a.nombre.localeCompare(
            b.nombre,
            "es",
          ),
      );
    }, [
      categorias,
      productosDisponibles,
    ]);

  /*
   * ==================================
   * TOTAL
   * ==================================
   */

  const total =
    useMemo(() => {
      return items.reduce(
        (
          acumulado,
          item,
        ) => {
          const cantidad =
            Number(
              item.cantidad,
            );

          const precioCosto =
            Number(
              item.precio_costo,
            );

          if (
            Number.isNaN(
              cantidad,
            ) ||
            Number.isNaN(
              precioCosto,
            )
          ) {
            return acumulado;
          }

          return (
            acumulado +
            cantidad *
              precioCosto
          );
        },
        0,
      );
    }, [items]);

  /*
   * ==================================
   * CAMPOS GENERALES
   * ==================================
   */

  const cambiarCampo = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormulario(
      (
        estadoActual,
      ) => ({
        ...estadoActual,

        [name]:
          value,
      }),
    );

    if (
      erroresFormulario[
        name
      ]
    ) {
      setErroresFormulario(
        (
          estadoActual,
        ) => ({
          ...estadoActual,

          [name]:
            "",
        }),
      );
    }
  };

  /*
   * ==================================
   * MODIFICAR ITEM
   * ==================================
   */

  const modificarItem = (
    idTemporal,
    cambios,
  ) => {
    setItems(
      (
        estadoActual,
      ) =>
        estadoActual.map(
          (item) =>
            item.idTemporal ===
            idTemporal
              ? {
                  ...item,

                  ...cambios,
                }
              : item,
        ),
    );
  };

  /*
   * ==================================
   * FILTRAR PRODUCTOS
   * ==================================
   */

  const obtenerProductosFiltrados =
    (item) => {
      if (
        !item.categoria_id
      ) {
        return productosDisponibles;
      }

      return productosDisponibles.filter(
        (producto) =>
          String(
            producto.categoria_id,
          ) ===
          String(
            item.categoria_id,
          ),
      );
    };

  /*
   * ==================================
   * PRODUCTO SELECCIONADO
   * ==================================
   */

  const obtenerProductoSeleccionado =
    (item) => {
      if (
        !item.producto_id
      ) {
        return null;
      }

      return (
        productosDisponibles.find(
          (producto) =>
            String(
              producto.id,
            ) ===
            String(
              item.producto_id,
            ),
        ) ?? null
      );
    };

  /*
   * ==================================
   * CAMBIAR CATEGORÍA
   * ==================================
   */

  const seleccionarCategoria =
    (
      item,
      categoriaId,
    ) => {
      modificarItem(
        item.idTemporal,
        {
          categoria_id:
            categoriaId,

          producto_id:
            "",

          variante_id:
            "",

          precio_costo:
            "",

          variantes:
            [],

          cargandoVariantes:
            false,
        },
      );
    };

  /*
   * ==================================
   * SELECCIONAR PRODUCTO
   * ==================================
   */

  const seleccionarProducto =
    async (
      item,
      productoId,
    ) => {
      const productoSeleccionado =
        productosDisponibles.find(
          (producto) =>
            String(
              producto.id,
            ) ===
            String(
              productoId,
            ),
        );

      modificarItem(
        item.idTemporal,
        {
          categoria_id:
            productoSeleccionado
              ?.categoria_id
              ? String(
                  productoSeleccionado.categoria_id,
                )
              : item.categoria_id,

          producto_id:
            productoId,

          variante_id:
            "",

          precio_costo:
            "",

          variantes:
            [],

          cargandoVariantes:
            Boolean(
              productoId,
            ),
        },
      );

      if (!productoId) {
        return;
      }

      try {
        const {
          data,
        } =
          await api.get(
            `/variantes/producto/${productoId}`,
          );

        const variantes =
          extraerDatos(
            data,
          );

        modificarItem(
          item.idTemporal,
          {
            variantes,

            cargandoVariantes:
              false,
          },
        );
      } catch {
        modificarItem(
          item.idTemporal,
          {
            variantes:
              [],

            cargandoVariantes:
              false,
          },
        );
      }
    };

  /*
   * ==================================
   * SELECCIONAR VARIANTE
   * ==================================
   */

  const seleccionarVariante =
    (
      item,
      varianteId,
    ) => {
      const variante =
        item.variantes.find(
          (elemento) =>
            Number(
              elemento.id,
            ) ===
            Number(
              varianteId,
            ),
        );

      modificarItem(
        item.idTemporal,
        {
          variante_id:
            varianteId,

          precio_costo:
            variante
              ?.precio_costo ??
            "",
        },
      );
    };

  /*
   * ==================================
   * AGREGAR ITEM
   * ==================================
   */

  const agregarItem = () => {
    setItems(
      (
        estadoActual,
      ) => [
        ...estadoActual,

        crearItemVacio(),
      ],
    );
  };

  /*
   * ==================================
   * ELIMINAR ITEM
   * ==================================
   */

  const eliminarItem = (
    idTemporal,
  ) => {
    setItems(
      (
        estadoActual,
      ) => {
        if (
          estadoActual.length ===
          1
        ) {
          return [
            crearItemVacio(),
          ];
        }

        return estadoActual.filter(
          (item) =>
            item.idTemporal !==
            idTemporal,
        );
      },
    );
  };

  /*
   * ==================================
   * CREAR PRODUCTO NUEVO
   * ==================================
   */

  const abrirCrearProducto =
    (item) => {
      setItemCreacionId(
        item.idTemporal,
      );

      setProductoNuevo(null);

      setProductoVarianteNueva(
        null,
      );

      setItemVarianteNuevaId(
        null,
      );

      setErrorProductoNuevo("");

      setErrorVarianteNueva("");

      setDialogProductoAbierto(
        true,
      );
    };

  const cerrarCrearProducto =
    () => {
      if (
        guardandoProducto
      ) {
        return;
      }

      setDialogProductoAbierto(
        false,
      );

      setItemCreacionId(null);

      setProductoNuevo(null);

      setErrorProductoNuevo("");
    };

  const guardarProductoNuevo =
    async (datos) => {
      setErrorProductoNuevo(
        "",
      );

      const resultado =
        await guardarProducto({
          productoSeleccionado:
            null,

          datos,
        });

      if (
        !resultado.success
      ) {
        setErrorProductoNuevo(
          resultado.message,
        );

        return;
      }

      const productoCreado =
        resultado.data?.data ??
        resultado.data;

      if (
        !productoCreado?.id
      ) {
        setErrorProductoNuevo(
          "El producto fue creado pero no se pudo obtener su ID.",
        );

        return;
      }

      setProductosCreados(
        (
          estadoActual,
        ) => [
          ...estadoActual.filter(
            (producto) =>
              String(
                producto.id,
              ) !==
              String(
                productoCreado.id,
              ),
          ),

          productoCreado,
        ],
      );

      setProductoNuevo(
        productoCreado,
      );

      setDialogProductoAbierto(
        false,
      );

      /*
       * Abrimos inmediatamente
       * la creación de variante.
       */

      setDialogVarianteAbierto(
        true,
      );
    };

  /*
   * ==================================
   * NUEVA VARIANTE PRODUCTO EXISTENTE
   * ==================================
   */

  const abrirCrearVarianteExistente =
    (item) => {
      const productoSeleccionado =
        obtenerProductoSeleccionado(
          item,
        );

      if (
        !productoSeleccionado?.id
      ) {
        setErroresFormulario(
          (estadoActual) => ({
            ...estadoActual,

            productos:
              "Primero seleccioná un producto.",
          }),
        );

        return;
      }

      setProductoNuevo(null);

      setItemCreacionId(null);

      setProductoVarianteNueva(
        productoSeleccionado,
      );

      setItemVarianteNuevaId(
        item.idTemporal,
      );

      setErrorVarianteNueva("");

      setDialogVarianteAbierto(
        true,
      );
    };

  /*
   * ==================================
   * CERRAR VARIANTE
   * ==================================
   */

  const cerrarCrearVariante =
    () => {
      if (
        guardandoVariante
      ) {
        return;
      }

      setDialogVarianteAbierto(
        false,
      );

      setProductoNuevo(null);

      setProductoVarianteNueva(
        null,
      );

      setItemCreacionId(null);

      setItemVarianteNuevaId(
        null,
      );

      setErrorVarianteNueva("");
    };

  /*
   * ==================================
   * GUARDAR VARIANTE
   * ==================================
   */

  const guardarVarianteNueva =
    async (datos) => {
      setErrorVarianteNueva(
        "",
      );

      /*
       * Puede ser un producto nuevo
       * o uno existente.
       */

      const productoDestino =
        productoNuevo ??
        productoVarianteNueva;

      const itemDestinoId =
        itemCreacionId ??
        itemVarianteNuevaId;

      if (
        !productoDestino?.id
      ) {
        setErrorVarianteNueva(
          "No se pudo identificar el producto.",
        );

        return;
      }

      /*
       * El stock SIEMPRE nace en 0.
       *
       * El ingreso será quien sume
       * la mercadería.
       */

      const resultado =
        await guardarVariante({
          varianteSeleccionada:
            null,

          datos: {
            ...datos,

            stock_actual: 0,
          },
        });

      if (
        !resultado.success
      ) {
        setErrorVarianteNueva(
          resultado.message,
        );

        return;
      }

      const varianteCreada =
        resultado.data?.data ??
        resultado.data;

      if (
        !varianteCreada?.id
      ) {
        setErrorVarianteNueva(
          "La variante fue creada pero no se pudo obtener su ID.",
        );

        return;
      }

      /*
       * Recargamos variantes del
       * producto para mantener el
       * selector completo.
       */

      let variantesActualizadas =
        [
          varianteCreada,
        ];

      try {
        const {
          data,
        } =
          await api.get(
            `/variantes/producto/${productoDestino.id}`,
          );

        const lista =
          extraerDatos(
            data,
          );

        if (
          Array.isArray(
            lista,
          ) &&
          lista.length >
            0
        ) {
          variantesActualizadas =
            lista;
        }
      } catch {
        /*
         * Si falla la recarga,
         * igualmente dejamos disponible
         * la variante nueva.
         */
      }

      /*
       * Si era un producto nuevo,
       * completamos la categoría
       * visual.
       */

      const categoria =
        categoriasDisponibles.find(
          (elemento) =>
            String(
              elemento.id,
            ) ===
            String(
              productoDestino.categoria_id,
            ),
        );

      const productoCompleto = {
        ...productoDestino,

        categoria:
          productoDestino.categoria ??
          categoria?.nombre ??
          null,
      };

      if (
        productoNuevo
      ) {
        setProductosCreados(
          (
            estadoActual,
          ) => [
            ...estadoActual.filter(
              (producto) =>
                String(
                  producto.id,
                ) !==
                String(
                  productoCompleto.id,
                ),
            ),

            productoCompleto,
          ],
        );
      }

      /*
       * Selección automática de
       * producto + variante.
       */

      setItems(
        (
          estadoActual,
        ) =>
          estadoActual.map(
            (item) => {
              if (
                item.idTemporal !==
                itemDestinoId
              ) {
                return item;
              }

              return {
                ...item,

                categoria_id:
                  productoCompleto.categoria_id
                    ? String(
                        productoCompleto.categoria_id,
                      )
                    : "",

                producto_id:
                  String(
                    productoCompleto.id,
                  ),

                variante_id:
                  String(
                    varianteCreada.id,
                  ),

                precio_costo:
                  String(
                    varianteCreada.precio_costo ??
                      datos.precio_costo ??
                      "",
                  ),

                variantes:
                  variantesActualizadas,

                cargandoVariantes:
                  false,
              };
            },
          ),
      );

      setDialogVarianteAbierto(
        false,
      );

      setProductoNuevo(null);

      setProductoVarianteNueva(
        null,
      );

      setItemCreacionId(null);

      setItemVarianteNuevaId(
        null,
      );

      setErrorVarianteNueva("");
    };

  /*
   * ==================================
   * VALIDAR
   * ==================================
   */

  const validar = () => {
    const nuevosErrores =
      {};

    if (
      !formulario.proveedor_id
    ) {
      nuevosErrores.proveedor_id =
        "Seleccioná un proveedor.";
    }

    if (
      !formulario.fecha
    ) {
      nuevosErrores.fecha =
        "Ingresá la fecha.";
    }

    const variantesUsadas =
      new Set();

    const itemsValidos =
      items.filter(
        (item) =>
          item.producto_id ||
          item.variante_id ||
          item.precio_costo,
      );

    if (
      itemsValidos.length ===
      0
    ) {
      nuevosErrores.productos =
        "Agregá al menos una variante.";
    }

    itemsValidos.forEach(
      (
        item,
        indice,
      ) => {
        const numero =
          indice + 1;

        const varianteId =
          Number(
            item.variante_id,
          );

        const cantidad =
          Number(
            item.cantidad,
          );

        const costo =
          Number(
            item.precio_costo,
          );

        if (
          !item.producto_id
        ) {
          nuevosErrores.productos =
            `Seleccioná el producto del ítem ${numero}.`;
        } else if (
          !varianteId
        ) {
          nuevosErrores.productos =
            `Seleccioná la variante del ítem ${numero}.`;
        } else if (
          !Number.isInteger(
            cantidad,
          ) ||
          cantidad <= 0
        ) {
          nuevosErrores.productos =
            `La cantidad del ítem ${numero} debe ser mayor que cero.`;
        } else if (
          item.precio_costo ===
            "" ||
          Number.isNaN(
            costo,
          ) ||
          costo < 0
        ) {
          nuevosErrores.productos =
            `El costo del ítem ${numero} no es válido.`;
        } else if (
          variantesUsadas.has(
            varianteId,
          )
        ) {
          nuevosErrores.productos =
            `La variante del ítem ${numero} está repetida.`;
        }

        if (
          varianteId
        ) {
          variantesUsadas.add(
            varianteId,
          );
        }
      },
    );

    setErroresFormulario(
      nuevosErrores,
    );

    return {
      valido:
        Object.keys(
          nuevosErrores,
        ).length === 0,

      itemsValidos,
    };
  };

  /*
   * ==================================
   * GUARDAR INGRESO
   * ==================================
   */

  const guardar =
    async () => {
      const validacion =
        validar();

      if (
        !validacion.valido
      ) {
        return;
      }

      const datos = {
        proveedor_id:
          Number(
            formulario.proveedor_id,
          ),

        numero_comprobante:
          formulario.numero_comprobante
            .trim() ||
          null,

        fecha:
          formulario.fecha,

        observaciones:
          formulario.observaciones
            .trim() ||
          null,

        productos:
          validacion.itemsValidos.map(
            (item) => ({
              variante_id:
                Number(
                  item.variante_id,
                ),

              cantidad:
                Number(
                  item.cantidad,
                ),

              precio_costo:
                Number(
                  item.precio_costo,
                ),
            }),
          ),
      };

      await onGuardar(
        datos,
      );
    };

  /*
   * ==================================
   * CERRAR
   * ==================================
   */

  const cerrar = () => {
    if (
      loading ||
      guardandoProducto ||
      guardandoVariante
    ) {
      return;
    }

    onClose();
  };

  return (
    <>
      {/* ======================= */}
      {/* INGRESO */}
      {/* ======================= */}

      <Dialog
        open={open}
        onClose={cerrar}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            width:
              "96vw",

            maxWidth:
              1550,

            maxHeight:
              "94vh",

            borderRadius:
              3,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight:
              700,
          }}
        >
          Nuevo ingreso de mercadería
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            overflowX:
              "hidden",

            overflowY:
              "auto",
          }}
        >
          {/* ======================= */}
          {/* ERRORES */}
          {/* ======================= */}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
              }}
            >
              {error}
            </Alert>
          )}

          {errors.length >
            0 && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
              }}
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

          {/* ======================= */}
          {/* DATOS INGRESO */}
          {/* ======================= */}

          <Grid
            container
            spacing={2}
          >
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                select
                fullWidth
                required
                label="Proveedor"
                name="proveedor_id"
                value={
                  formulario.proveedor_id
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  erroresFormulario.proveedor_id,
                )}
                helperText={
                  erroresFormulario.proveedor_id
                }
                disabled={
                  loading
                }
              >
                <MenuItem value="">
                  Seleccionar proveedor
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

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                fullWidth
                required
                type="date"
                label="Fecha"
                name="fecha"
                value={
                  formulario.fecha
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  erroresFormulario.fecha,
                )}
                helperText={
                  erroresFormulario.fecha
                }
                disabled={
                  loading
                }
                slotProps={{
                  inputLabel: {
                    shrink:
                      true,
                  },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                fullWidth
                label="Número de comprobante"
                name="numero_comprobante"
                value={
                  formulario.numero_comprobante
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
                      50,
                  },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
              }}
            >
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Observaciones"
                name="observaciones"
                value={
                  formulario.observaciones
                }
                onChange={
                  cambiarCampo
                }
                disabled={
                  loading
                }
              />
            </Grid>
          </Grid>

          <Divider
            sx={{
              my: 3,
            }}
          />

          {/* ======================= */}
          {/* PRODUCTOS */}
          {/* ======================= */}

          <Stack
            direction={{
              xs:
                "column",

              sm:
                "row",
            }}
            spacing={2}
            sx={{
              mb: 2,

              justifyContent:
                "space-between",

              alignItems: {
                xs:
                  "stretch",

                sm:
                  "center",
              },
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight:
                    700,
                }}
              >
                Productos
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Seleccioná productos y variantes existentes o crealos durante la compra.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={
                <AddIcon />
              }
              onClick={
                agregarItem
              }
              disabled={
                loading
              }
            >
              Agregar producto
            </Button>
          </Stack>

          {erroresFormulario.productos && (
            <Alert
              severity="warning"
              sx={{
                mb: 2,
              }}
            >
              {
                erroresFormulario.productos
              }
            </Alert>
          )}

          {/* ======================= */}
          {/* ITEMS */}
          {/* ======================= */}

          <Stack spacing={2}>
            {items.map(
              (
                item,
                indice,
              ) => {
                const productosFiltrados =
                  obtenerProductosFiltrados(
                    item,
                  );

                const productoSeleccionado =
                  obtenerProductoSeleccionado(
                    item,
                  );

                return (
                  <Paper
                    key={
                      item.idTemporal
                    }
                    variant="outlined"
                    sx={{
                      p: {
                        xs:
                          1.5,

                        md:
                          2,
                      },

                      borderRadius:
                        2.5,
                    }}
                  >
                    {/* ================= */}
                    {/* ENCABEZADO */}
                    {/* ================= */}

                    <Stack
                      direction={{
                        xs:
                          "column",

                        sm:
                          "row",
                      }}
                      spacing={1.5}
                      sx={{
                        mb: 2,

                        justifyContent:
                          "space-between",

                        alignItems: {
                          xs:
                            "stretch",

                          sm:
                            "center",
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                          fontWeight:
                            700,
                        }}
                      >
                        Producto{" "}
                        {indice +
                          1}
                      </Typography>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                          <AddIcon />
                        }
                        onClick={() =>
                          abrirCrearProducto(
                            item,
                          )
                        }
                        disabled={
                          loading
                        }
                      >
                        Nuevo producto
                      </Button>
                    </Stack>

                    {/* ================= */}
                    {/* PRODUCTO */}
                    {/* ================= */}

                    <Grid
                      container
                      spacing={2}
                      sx={{
                        alignItems:
                          "flex-start",
                      }}
                    >
                      <Grid
                        size={{
                          xs:
                            12,

                          md:
                            3,
                        }}
                      >
                        <TextField
                          select
                          fullWidth
                          label="Categoría"
                          value={
                            item.categoria_id
                          }
                          onChange={(
                            event,
                          ) =>
                            seleccionarCategoria(
                              item,
                              event
                                .target
                                .value,
                            )
                          }
                          disabled={
                            loading
                          }
                        >
                          <MenuItem value="">
                            Todas las categorías
                          </MenuItem>

                          {categoriasDisponibles.map(
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

                      <Grid
                        size={{
                          xs:
                            12,

                          md:
                            5,
                        }}
                      >
                        <TextField
                          select
                          fullWidth
                          label="Producto"
                          value={
                            item.producto_id
                          }
                          onChange={(
                            event,
                          ) =>
                            seleccionarProducto(
                              item,
                              event
                                .target
                                .value,
                            )
                          }
                          disabled={
                            loading
                          }
                        >
                          <MenuItem value="">
                            Seleccionar producto
                          </MenuItem>

                          {productosFiltrados.map(
                            (
                              producto,
                            ) => (
                              <MenuItem
                                key={
                                  producto.id
                                }
                                value={
                                  producto.id
                                }
                              >
                                {
                                  producto.codigo
                                }{" "}
                                -{" "}
                                {
                                  producto.nombre
                                }
                              </MenuItem>
                            ),
                          )}
                        </TextField>
                      </Grid>

                      {/* IMAGEN */}

                      <Grid
                        size={{
                          xs:
                            12,

                          md:
                            4,
                        }}
                      >
                        {productoSeleccionado ? (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.25,

                              minHeight:
                                92,

                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                1.5,

                              borderRadius:
                                2,
                            }}
                          >
                            <Box
                              component="img"
                              src={obtenerUrlImagen(
                                productoSeleccionado.imagen,
                              )}
                              alt={
                                productoSeleccionado.nombre
                              }
                              onError={(
                                event,
                              ) => {
                                event.currentTarget.src =
                                  "/no-image.png";
                              }}
                              sx={{
                                width:
                                  78,

                                height:
                                  78,

                                borderRadius:
                                  2,

                                objectFit:
                                  "cover",

                                flexShrink:
                                  0,

                                border:
                                  "1px solid",

                                borderColor:
                                  "divider",
                              }}
                            />

                            <Box
                              sx={{
                                minWidth:
                                  0,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    700,
                                }}
                              >
                                {
                                  productoSeleccionado.nombre
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display:
                                    "block",
                                }}
                              >
                                Código:{" "}
                                {productoSeleccionado.codigo ||
                                  "-"}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display:
                                    "block",
                                }}
                              >
                                Categoría:{" "}
                                {productoSeleccionado.categoria ||
                                  "Sin categoría"}
                              </Typography>
                            </Box>
                          </Paper>
                        ) : (
                          <Box
                            sx={{
                              minHeight:
                                92,

                              border:
                                "1px dashed",

                              borderColor:
                                "divider",

                              borderRadius:
                                2,

                              display:
                                "flex",

                              alignItems:
                                "center",

                              justifyContent:
                                "center",

                              color:
                                "text.secondary",

                              fontSize:
                                13,
                            }}
                          >
                            Seleccioná un producto
                          </Box>
                        )}
                      </Grid>
                    </Grid>

                    <Divider
                      sx={{
                        my: 2,
                      }}
                    />

                    {/* ================= */}
                    {/* VARIANTE */}
                    {/* ================= */}

                    <Grid
                      container
                      spacing={2}
                      sx={{
                        alignItems:
                          "flex-start",
                      }}
                    >
                      <Grid
                        size={{
                          xs:
                            12,

                          md:
                            4,
                        }}
                      >
                        <Stack
                          spacing={0.75}
                        >
                          <TextField
                            select
                            fullWidth
                            label="Variante"
                            value={
                              item.variante_id
                            }
                            onChange={(
                              event,
                            ) =>
                              seleccionarVariante(
                                item,
                                event
                                  .target
                                  .value,
                              )
                            }
                            disabled={
                              loading ||
                              !item.producto_id ||
                              item.cargandoVariantes
                            }
                          >
                            <MenuItem value="">
                              {item.cargandoVariantes
                                ? "Cargando..."
                                : "Seleccionar variante"}
                            </MenuItem>

                            {item.variantes.map(
                              (
                                variante,
                              ) => (
                                <MenuItem
                                  key={
                                    variante.id
                                  }
                                  value={
                                    variante.id
                                  }
                                >
                                  {variante.color ||
                                    "Sin color"}{" "}
                                  /{" "}
                                  {variante.talle ||
                                    "Sin talle"}
                                </MenuItem>
                              ),
                            )}
                          </TextField>

                          <Button
                            size="small"
                            variant="text"
                            startIcon={
                              <AddIcon />
                            }
                            onClick={() =>
                              abrirCrearVarianteExistente(
                                item,
                              )
                            }
                            disabled={
                              loading ||
                              !item.producto_id
                            }
                            sx={{
                              alignSelf:
                                "flex-start",

                              px: 0.5,
                            }}
                          >
                            Nueva variante
                          </Button>
                        </Stack>
                      </Grid>

                      {/* CANTIDAD */}

                      <Grid
                        size={{
                          xs:
                            12,

                          sm:
                            6,

                          md:
                            2,
                        }}
                      >
                        <TextField
                          fullWidth
                          type="number"
                          label="Cantidad"
                          value={
                            item.cantidad
                          }
                          onChange={(
                            event,
                          ) =>
                            modificarItem(
                              item.idTemporal,
                              {
                                cantidad:
                                  event
                                    .target
                                    .value,
                              },
                            )
                          }
                          disabled={
                            loading
                          }
                          slotProps={{
                            htmlInput:
                              {
                                min:
                                  1,

                                step:
                                  1,
                              },
                          }}
                        />
                      </Grid>

                      {/* COSTO */}

                      <Grid
                        size={{
                          xs:
                            12,

                          sm:
                            6,

                          md:
                            3,
                        }}
                      >
                        <TextField
                          fullWidth
                          type="number"
                          label="Costo unitario"
                          value={
                            item.precio_costo
                          }
                          onChange={(
                            event,
                          ) =>
                            modificarItem(
                              item.idTemporal,
                              {
                                precio_costo:
                                  event
                                    .target
                                    .value,
                              },
                            )
                          }
                          disabled={
                            loading
                          }
                          slotProps={{
                            htmlInput:
                              {
                                min:
                                  0,

                                step:
                                  "0.01",
                              },
                          }}
                        />
                      </Grid>

                      {/* SUBTOTAL */}

                      <Grid
                        size={{
                          xs:
                            10,

                          md:
                            2,
                        }}
                      >
                        <Box
                          sx={{
                            minHeight:
                              56,

                            display:
                              "flex",

                            flexDirection:
                              "column",

                            justifyContent:
                              "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Subtotal
                          </Typography>

                          <Typography
                            sx={{
                              fontWeight:
                                700,
                            }}
                          >
                            {formatearMoneda(
                              Number(
                                item.cantidad ||
                                  0,
                              ) *
                                Number(
                                  item.precio_costo ||
                                    0,
                                ),
                            )}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* ELIMINAR */}

                      <Grid
                        size={{
                          xs:
                            2,

                          md:
                            1,
                        }}
                      >
                        <Box
                          sx={{
                            minHeight:
                              56,

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",
                          }}
                        >
                          <IconButton
                            color="error"
                            onClick={() =>
                              eliminarItem(
                                item.idTemporal,
                              )
                            }
                            disabled={
                              loading
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              },
            )}
          </Stack>

          {/* ======================= */}
          {/* TOTAL */}
          {/* ======================= */}

          <Stack
            direction="row"
            sx={{
              mt: 3,

              justifyContent:
                "flex-end",
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                px: 3,

                py: 2,

                minWidth: {
                  xs:
                    "100%",

                  sm:
                    280,
                },

                borderRadius:
                  2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total del ingreso
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight:
                    700,

                  mt:
                    0.5,
                }}
              >
                {formatearMoneda(
                  total,
                )}
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>

        {/* ======================= */}
        {/* BOTONES */}
        {/* ======================= */}

        <DialogActions
          sx={{
            px: 3,
            py: 2,
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
          >
            {loading
              ? "Registrando..."
              : "Registrar ingreso"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================= */}
      {/* NUEVO PRODUCTO */}
      {/* ======================= */}

      <ProductoDialog
        open={
          dialogProductoAbierto
        }
        producto={{
          proveedor_id:
            formulario.proveedor_id ||
            "",
        }}
        categorias={
          categorias
        }
        marcas={
          marcas
        }
        proveedores={
          proveedores
        }
        loading={
          guardandoProducto
        }
        error={
          errorProductoNuevo
        }
        onClose={
          cerrarCrearProducto
        }
        onGuardar={
          guardarProductoNuevo
        }
      />

      {/* ======================= */}
      {/* NUEVA VARIANTE */}
      {/* ======================= */}

      <VarianteDialog
        open={
          dialogVarianteAbierto
        }
        variante={null}
        colores={
          colores
        }
        talles={
          talles
        }
        loading={
          guardandoVariante
        }
        error={
          errorVarianteNueva
        }
        onClose={
          cerrarCrearVariante
        }
        onGuardar={
          guardarVarianteNueva
        }
      />
    </>
  );
}