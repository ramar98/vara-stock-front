import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
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
import SearchIcon from "@mui/icons-material/Search";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import api from "../../../services/api";

/*
 * ======================================
 * CONFIGURACIÓN
 * ======================================
 */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001/api"
).replace(/\/api\/?$/, "");

const METODOS_PAGO = [
  {
    value: "EFECTIVO",
    label: "Efectivo",
  },
  {
    value: "TRANSFERENCIA",
    label: "Transferencia",
  },
  {
    value: "TARJETA",
    label: "Tarjeta",
  },
  {
    value: "OTRO",
    label: "Otro",
  },
];

const estadoInicial = {
  cliente_id: "",
  metodo_pago: "EFECTIVO",
  descuento: "0",
};

/*
 * ======================================
 * HELPERS
 * ======================================
 */

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

    producto_id: "",

    variante_id: "",

    cantidad: "1",

    precio_unitario: "",

    stock_disponible: 0,

    variantes: [],

    cargandoVariantes:
      false,

    usa_variantes:
      true,

    error_variante:
      "",
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
    Array.isArray(respuesta)
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

function normalizarTexto(valor) {
  return String(
    valor ?? "",
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim();
}

function productoUsaVariantes(
  producto,
) {
  return (
    Number(
      producto?.usa_variantes ??
        1,
    ) === 1
  );
}

/*
 * ======================================
 * COMPONENTE
 * ======================================
 */

export default function VentaFormDialog({
  open,
  clientes = [],
  productos = [],
  usuarioId = 1,
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
   * SELECTOR VISUAL PRODUCTOS
   * ==================================
   */

  const [
    selectorProductoAbierto,
    setSelectorProductoAbierto,
  ] = useState(false);

  const [
    itemSelectorId,
    setItemSelectorId,
  ] = useState(null);

  const [
    busquedaProducto,
    setBusquedaProducto,
  ] = useState("");

  const [
    categoriaFiltro,
    setCategoriaFiltro,
  ] = useState("");

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
    });

    setItems([
      crearItemVacio(),
    ]);

    setErroresFormulario(
      {},
    );

    setSelectorProductoAbierto(
      false,
    );

    setItemSelectorId(null);

    setBusquedaProducto("");

    setCategoriaFiltro("");
  }, [open]);

  /*
   * ==================================
   * CATEGORÍAS
   * ==================================
   */

  const categoriasDisponibles =
    useMemo(() => {
      const mapa =
        new Map();

      productos.forEach(
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
                  String(
                    producto.categoria_id,
                  ),

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
          String(
            a.nombre,
          ).localeCompare(
            String(
              b.nombre,
            ),
            "es",
          ),
      );
    }, [productos]);

  /*
   * ==================================
   * PRODUCTOS FILTRADOS
   * ==================================
   */

  const productosFiltrados =
    useMemo(() => {
      const texto =
        normalizarTexto(
          busquedaProducto,
        );

      return productos
        .filter(
          (producto) => {
            if (
              categoriaFiltro &&
              String(
                producto.categoria_id,
              ) !==
                String(
                  categoriaFiltro,
                )
            ) {
              return false;
            }

            if (!texto) {
              return true;
            }

            const nombre =
              normalizarTexto(
                producto.nombre,
              );

            const codigo =
              normalizarTexto(
                producto.codigo,
              );

            const categoria =
              normalizarTexto(
                producto.categoria,
              );

            return (
              nombre.includes(
                texto,
              ) ||
              codigo.includes(
                texto,
              ) ||
              categoria.includes(
                texto,
              )
            );
          },
        )
        .sort(
          (a, b) => {
            /*
             * Primero mostramos
             * productos con stock.
             */

            const stockA =
              Number(
                a.stock ?? 0,
              );

            const stockB =
              Number(
                b.stock ?? 0,
              );

            if (
              stockA > 0 &&
              stockB <= 0
            ) {
              return -1;
            }

            if (
              stockA <= 0 &&
              stockB > 0
            ) {
              return 1;
            }

            return String(
              a.nombre ?? "",
            ).localeCompare(
              String(
                b.nombre ?? "",
              ),
              "es",
            );
          },
        );
    }, [
      productos,
      busquedaProducto,
      categoriaFiltro,
    ]);

  /*
   * ==================================
   * TOTALES
   * ==================================
   */

  const subtotal =
    useMemo(() => {
      return items.reduce(
        (
          totalActual,
          item,
        ) => {
          const cantidad =
            Number(
              item.cantidad,
            );

          const precio =
            Number(
              item.precio_unitario,
            );

          if (
            Number.isNaN(
              cantidad,
            ) ||
            Number.isNaN(
              precio,
            )
          ) {
            return totalActual;
          }

          return (
            totalActual +
            cantidad *
              precio
          );
        },
        0,
      );
    }, [items]);

  const descuento =
    useMemo(() => {
      const valor =
        Number(
          formulario.descuento,
        );

      if (
        Number.isNaN(valor) ||
        valor < 0
      ) {
        return 0;
      }

      return valor;
    }, [
      formulario.descuento,
    ]);

  const total =
    Math.max(
      subtotal -
        descuento,
      0,
    );

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
    } = event.target;

    let {
      value,
    } = event.target;

    if (
      name ===
      "cliente_id"
    ) {
      value =
        String(
          value ?? "",
        );
    }

    setFormulario(
      (actual) => ({
        ...actual,

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
        (actual) => ({
          ...actual,

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
      (actuales) =>
        actuales.map(
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
        productos.find(
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
   * ABRIR SELECTOR PRODUCTO
   * ==================================
   */

  const abrirSelectorProducto =
    (item) => {
      setItemSelectorId(
        item.idTemporal,
      );

      setBusquedaProducto("");

      setCategoriaFiltro("");

      setSelectorProductoAbierto(
        true,
      );
    };

  const cerrarSelectorProducto =
    () => {
      setSelectorProductoAbierto(
        false,
      );

      setItemSelectorId(null);

      setBusquedaProducto("");

      setCategoriaFiltro("");
    };

  const limpiarFiltrosProducto =
    () => {
      setBusquedaProducto("");

      setCategoriaFiltro("");
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
      if (!productoId) {
        modificarItem(
          item.idTemporal,
          {
            producto_id:
              "",

            variante_id:
              "",

            precio_unitario:
              "",

            stock_disponible:
              0,

            variantes:
              [],

            cargandoVariantes:
              false,

            usa_variantes:
              true,

            error_variante:
              "",
          },
        );

        return;
      }

      const productoSeleccionado =
        productos.find(
          (producto) =>
            String(
              producto.id,
            ) ===
            String(
              productoId,
            ),
        );

      const usaVariantes =
        productoUsaVariantes(
          productoSeleccionado,
        );

      modificarItem(
        item.idTemporal,
        {
          producto_id:
            productoId,

          variante_id:
            "",

          precio_unitario:
            "",

          stock_disponible:
            0,

          variantes:
            [],

          cargandoVariantes:
            true,

          usa_variantes:
            usaVariantes,

          error_variante:
            "",
        },
      );

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

        if (!usaVariantes) {
          const varianteInterna =
            variantes[0];

          if (
            !varianteInterna
          ) {
            modificarItem(
              item.idTemporal,
              {
                variantes:
                  [],

                variante_id:
                  "",

                precio_unitario:
                  "",

                stock_disponible:
                  0,

                cargandoVariantes:
                  false,

                usa_variantes:
                  false,

                error_variante:
                  "No se encontró la variante interna del producto.",
              },
            );

            return;
          }

          modificarItem(
            item.idTemporal,
            {
              variantes,

              variante_id:
                String(
                  varianteInterna.id,
                ),

              precio_unitario:
                varianteInterna
                  .precio_venta ??
                productoSeleccionado
                  ?.precio_venta_default ??
                "",

              stock_disponible:
                Number(
                  varianteInterna
                    .stock_actual ??
                    0,
                ),

              cargandoVariantes:
                false,

              usa_variantes:
                false,

              error_variante:
                "",
            },
          );

          return;
        }

        modificarItem(
          item.idTemporal,
          {
            variantes,

            variante_id:
              "",

            precio_unitario:
              "",

            stock_disponible:
              0,

            cargandoVariantes:
              false,

            usa_variantes:
              true,

            error_variante:
              "",
          },
        );
      } catch (
      errorPeticion
      ) {
        modificarItem(
          item.idTemporal,
          {
            variantes:
              [],

            variante_id:
              "",

            precio_unitario:
              "",

            stock_disponible:
              0,

            cargandoVariantes:
              false,

            usa_variantes:
              usaVariantes,

            error_variante:
              errorPeticion
                ?.response
                ?.data
                ?.message ||
              "No se pudo cargar la información de stock del producto.",
          },
        );
      }
    };

  /*
   * ==================================
   * SELECCIONAR DESDE MODAL
   * ==================================
   */

  const seleccionarProductoDesdeModal =
    async (
      producto,
    ) => {
      if (
        Number(
          producto.stock ?? 0,
        ) <= 0
      ) {
        return;
      }

      const item =
        items.find(
          (elemento) =>
            elemento.idTemporal ===
            itemSelectorId,
        );

      if (!item) {
        return;
      }

      cerrarSelectorProducto();

      await seleccionarProducto(
        item,
        String(
          producto.id,
        ),
      );
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

          precio_unitario:
            variante
              ?.precio_venta ??
            "",

          stock_disponible:
            Number(
              variante
                ?.stock_actual ??
                0,
            ),
        },
      );
    };

  /*
   * ==================================
   * AGREGAR PRODUCTO
   * ==================================
   */

  const agregarItem =
    () => {
      setItems(
        (actuales) => [
          ...actuales,

          crearItemVacio(),
        ],
      );
    };

  /*
   * ==================================
   * ELIMINAR PRODUCTO
   * ==================================
   */

  const eliminarItem = (
    idTemporal,
  ) => {
    setItems(
      (actuales) => {
        if (
          actuales.length ===
          1
        ) {
          return [
            crearItemVacio(),
          ];
        }

        return actuales.filter(
          (item) =>
            item.idTemporal !==
            idTemporal,
        );
      },
    );
  };

  /*
   * ==================================
   * VALIDACIÓN
   * ==================================
   */

  const validar = () => {
    const nuevosErrores =
      {};

    if (
      !formulario.metodo_pago
    ) {
      nuevosErrores.metodo_pago =
        "Seleccioná un método de pago.";
    }

    const descuentoNumero =
      Number(
        formulario.descuento,
      );

    if (
      formulario.descuento ===
        "" ||
      Number.isNaN(
        descuentoNumero,
      ) ||
      descuentoNumero < 0
    ) {
      nuevosErrores.descuento =
        "Ingresá un descuento válido.";
    }

    if (
      descuentoNumero >
      subtotal
    ) {
      nuevosErrores.descuento =
        "El descuento no puede superar el subtotal.";
    }

    const itemsValidos =
      items.filter(
        (item) =>
          item.producto_id ||
          item.variante_id ||
          item.precio_unitario,
      );

    if (
      itemsValidos.length ===
      0
    ) {
      nuevosErrores.productos =
        "Agregá al menos un producto.";
    }

    const variantesUsadas =
      new Set();

    itemsValidos.forEach(
      (
        item,
        indice,
      ) => {
        const numeroItem =
          indice + 1;

        const varianteId =
          Number(
            item.variante_id,
          );

        const cantidad =
          Number(
            item.cantidad,
          );

        const precioUnitario =
          Number(
            item.precio_unitario,
          );

        const stockDisponible =
          Number(
            item.stock_disponible ??
              0,
          );

        if (
          !item.producto_id
        ) {
          nuevosErrores.productos =
            `Seleccioná el producto del ítem ${numeroItem}.`;
        } else if (
          item.cargandoVariantes
        ) {
          nuevosErrores.productos =
            `Esperá a que termine de cargarse el producto del ítem ${numeroItem}.`;
        } else if (
          item.error_variante
        ) {
          nuevosErrores.productos =
            `No se pudo preparar el producto del ítem ${numeroItem}.`;
        } else if (
          !varianteId
        ) {
          nuevosErrores.productos =
            item.usa_variantes
              ? `Seleccioná la variante del ítem ${numeroItem}.`
              : `No se encontró la variante interna del producto del ítem ${numeroItem}.`;
        } else if (
          !Number.isFinite(
            cantidad,
          ) ||
          cantidad <= 0
        ) {
          nuevosErrores.productos =
            `La cantidad del ítem ${numeroItem} debe ser mayor que cero.`;
        } else if (
          cantidad >
          stockDisponible
        ) {
          nuevosErrores.productos =
            `El ítem ${numeroItem} solo tiene ${stockDisponible} disponibles.`;
        } else if (
          item.precio_unitario ===
            "" ||
          Number.isNaN(
            precioUnitario,
          ) ||
          precioUnitario < 0
        ) {
          nuevosErrores.productos =
            `El precio del ítem ${numeroItem} no es válido.`;
        } else if (
          variantesUsadas.has(
            varianteId,
          )
        ) {
          nuevosErrores.productos =
            `El producto o variante del ítem ${numeroItem} está repetido.`;
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
   * GUARDAR VENTA
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
        cliente_id:
          formulario.cliente_id
            ? Number(
                formulario.cliente_id,
              )
            : null,

        metodo_pago:
          formulario.metodo_pago,

        descuento:
          Number(
            formulario.descuento ??
              0,
          ),

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

              precio_unitario:
                Number(
                  item.precio_unitario,
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
    if (!loading) {
      onClose();
    }
  };

  /*
   * ==================================
   * RENDER
   * ==================================
   */

  return (
    <>
      {/* ================================= */}
      {/* VENTA */}
      {/* ================================= */}

      <Dialog
        open={open}
        onClose={cerrar}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            width: "95vw",

            maxWidth: 1500,

            maxHeight:
              "94vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight:
              700,

            px: 3,

            py: 2.25,
          }}
        >
          Registrar nueva venta
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            px: {
              xs: 2,
              md: 3,
            },

            py: 2.5,

            overflowX:
              "hidden",
          }}
        >
          {/* ERROR */}

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

          {/* ================================= */}
          {/* DATOS GENERALES */}
          {/* ================================= */}

          <Grid
            container
            spacing={2}
          >
            {/* CLIENTE */}

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                select
                fullWidth
                label="Cliente"
                name="cliente_id"
                value={String(
                  formulario.cliente_id ??
                    "",
                )}
                onChange={
                  cambiarCampo
                }
                disabled={
                  loading
                }
                slotProps={{
                  inputLabel: {
                    shrink:
                      true,
                  },

                  select: {
                    displayEmpty:
                      true,

                    renderValue:
                      (
                        selected,
                      ) => {
                        const valor =
                          String(
                            selected ??
                              "",
                          );

                        if (
                          valor ===
                          ""
                        ) {
                          return "Consumidor final";
                        }

                        const clienteSeleccionado =
                          clientes.find(
                            (
                              cliente,
                            ) =>
                              String(
                                cliente.id,
                              ) ===
                              valor,
                          );

                        return (
                          clienteSeleccionado
                            ?.nombre ||
                          "Consumidor final"
                        );
                      },
                  },
                }}
              >
                <MenuItem value="">
                  Consumidor final
                </MenuItem>

                {clientes.map(
                  (
                    cliente,
                  ) => (
                    <MenuItem
                      key={
                        cliente.id
                      }
                      value={String(
                        cliente.id,
                      )}
                    >
                      {
                        cliente.nombre
                      }
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Grid>

            {/* MÉTODO DE PAGO */}

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
                label="Método de pago"
                name="metodo_pago"
                value={
                  formulario.metodo_pago
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  erroresFormulario.metodo_pago,
                )}
                helperText={
                  erroresFormulario.metodo_pago
                }
                disabled={
                  loading
                }
              >
                {METODOS_PAGO.map(
                  (
                    metodo,
                  ) => (
                    <MenuItem
                      key={
                        metodo.value
                      }
                      value={
                        metodo.value
                      }
                    >
                      {
                        metodo.label
                      }
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Grid>

            {/* DESCUENTO */}

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                fullWidth
                type="number"
                label="Descuento"
                name="descuento"
                value={
                  formulario.descuento
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  erroresFormulario.descuento,
                )}
                helperText={
                  erroresFormulario.descuento
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

          <Divider
            sx={{
              my: 3,
            }}
          />

          {/* ================================= */}
          {/* PRODUCTOS */}
          {/* ================================= */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
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
                Seleccioná los productos, variantes cuando correspondan y cantidades.
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

          {/* ================================= */}
          {/* ITEMS */}
          {/* ================================= */}

          <Stack spacing={2}>
            {items.map(
              (
                item,
                indice,
              ) => {
                const productoSeleccionado =
                  obtenerProductoSeleccionado(
                    item,
                  );

                const usaVariantes =
                  productoUsaVariantes(
                    productoSeleccionado,
                  );

                return (
                  <Paper
                    key={
                      item.idTemporal
                    }
                    variant="outlined"
                    sx={{
                      p: {
                        xs: 1.5,
                        md: 2,
                      },

                      borderRadius:
                        2.5,
                    }}
                  >
                    <Grid
                      container
                      spacing={2}
                      sx={{
                        alignItems:
                          "flex-start",
                      }}
                    >
                      {/* ==================== */}
                      {/* PRODUCTO */}
                      {/* ==================== */}

                      <Grid
                        size={{
                          xs: 12,
                          md: 4,
                        }}
                      >
                        {!productoSeleccionado ? (
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={
                              <SearchIcon />
                            }
                            onClick={() =>
                              abrirSelectorProducto(
                                item,
                              )
                            }
                            disabled={
                              loading
                            }
                            sx={{
                              minHeight:
                                56,

                              justifyContent:
                                "flex-start",
                            }}
                          >
                            Buscar producto
                          </Button>
                        ) : (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1,

                              borderRadius:
                                2,

                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                1.25,

                              position:
                                "relative",
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
                                  72,

                                height:
                                  72,

                                objectFit:
                                  "cover",

                                borderRadius:
                                  1.5,

                                border:
                                  "1px solid",

                                borderColor:
                                  "divider",

                                flexShrink:
                                  0,
                              }}
                            />

                            <Box
                              sx={{
                                minWidth:
                                  0,

                                flex: 1,
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

                              {productoSeleccionado.categoria && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display:
                                      "block",
                                  }}
                                >
                                  {
                                    productoSeleccionado.categoria
                                  }
                                </Typography>
                              )}

                              {!usaVariantes && (
                                <Chip
                                  label="Sin variantes"
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    mt: 0.5,
                                  }}
                                />
                              )}

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display:
                                    "block",

                                  mt:
                                    0.25,
                                }}
                              >
                                Stock total:{" "}
                                {Number(
                                  productoSeleccionado.stock ??
                                    0,
                                )}
                              </Typography>

                              <Button
                                size="small"
                                onClick={() =>
                                  abrirSelectorProducto(
                                    item,
                                  )
                                }
                                sx={{
                                  mt: 0.5,
                                  p: 0,
                                  minWidth: 0,
                                }}
                              >
                                Cambiar producto
                              </Button>
                            </Box>
                          </Paper>
                        )}
                      </Grid>

                      {/* ==================== */}
                      {/* VARIANTE */}
                      {/* ==================== */}

                      <Grid
                        size={{
                          xs: 12,
                          md: 2.5,
                        }}
                      >
                        {!productoSeleccionado ||
                        usaVariantes ? (
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
                                  disabled={
                                    Number(
                                      variante.stock_actual ??
                                        0,
                                    ) <=
                                    0
                                  }
                                >
                                  {variante.color ||
                                    "Sin color"}{" "}
                                  /{" "}
                                  {variante.talle ||
                                    "Sin talle"}{" "}
                                  — Stock:{" "}
                                  {Number(
                                    variante.stock_actual ??
                                      0,
                                  )}
                                </MenuItem>
                              ),
                            )}
                          </TextField>
                        ) : (
                          <Paper
                            variant="outlined"
                            sx={{
                              minHeight:
                                56,

                              px: 1.5,

                              py: 1,

                              borderRadius:
                                2,

                              display:
                                "flex",

                              flexDirection:
                                "column",

                              justifyContent:
                                "center",
                            }}
                          >
                            {item.cargandoVariantes ? (
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <CircularProgress
                                  size={18}
                                />

                                <Typography
                                  variant="body2"
                                >
                                  Cargando producto...
                                </Typography>
                              </Stack>
                            ) : (
                              <>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  Sin variantes
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Stock disponible:{" "}
                                  {Number(
                                    item.stock_disponible ??
                                      0,
                                  )}
                                </Typography>
                              </>
                            )}
                          </Paper>
                        )}

                        {item.error_variante && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{
                              display:
                                "block",

                              mt: 0.75,
                            }}
                          >
                            {
                              item.error_variante
                            }
                          </Typography>
                        )}
                      </Grid>

                      {/* ==================== */}
                      {/* CANTIDAD */}
                      {/* ==================== */}

                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 1.5,
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
                          helperText={`Disponible: ${Number(
                            item.stock_disponible ??
                              0,
                          )}`}
                          disabled={
                            loading ||
                            !item.variante_id
                          }
                          slotProps={{
                            htmlInput:
                              {
                                min:
                                  0.001,

                                max:
                                  Number(
                                    item.stock_disponible ??
                                      0,
                                  ),

                                step:
                                  "0.001",
                              },
                          }}
                        />
                      </Grid>

                      {/* ==================== */}
                      {/* PRECIO */}
                      {/* ==================== */}

                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 2,
                        }}
                      >
                        <TextField
                          fullWidth
                          type="number"
                          label="Precio unitario"
                          value={
                            item.precio_unitario
                          }
                          onChange={(
                            event,
                          ) =>
                            modificarItem(
                              item.idTemporal,
                              {
                                precio_unitario:
                                  event
                                    .target
                                    .value,
                              },
                            )
                          }
                          disabled={
                            loading ||
                            !item.variante_id
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

                      {/* ==================== */}
                      {/* SUBTOTAL */}
                      {/* ==================== */}

                      <Grid
                        size={{
                          xs: 10,
                          md: 1,
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
                                  item.precio_unitario ||
                                    0,
                                ),
                            )}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* ==================== */}
                      {/* ELIMINAR */}
                      {/* ==================== */}

                      <Grid
                        size={{
                          xs: 2,
                          md: 1,
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
                            aria-label={`Eliminar ítem ${
                              indice +
                              1
                            }`}
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

          {/* ================================= */}
          {/* TOTALES */}
          {/* ================================= */}

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

                width: {
                  xs: "100%",
                  sm: "auto",
                },

                minWidth: {
                  sm: 300,
                },

                borderRadius:
                  2.5,
              }}
            >
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  spacing={3}
                  sx={{
                    justifyContent:
                      "space-between",
                  }}
                >
                  <Typography color="text.secondary">
                    Subtotal
                  </Typography>

                  <Typography>
                    {formatearMoneda(
                      subtotal,
                    )}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={3}
                  sx={{
                    justifyContent:
                      "space-between",
                  }}
                >
                  <Typography color="text.secondary">
                    Descuento
                  </Typography>

                  <Typography>
                    -{" "}
                    {formatearMoneda(
                      descuento,
                    )}
                  </Typography>
                </Stack>

                <Divider />

                <Stack
                  direction="row"
                  spacing={3}
                  sx={{
                    justifyContent:
                      "space-between",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight:
                        700,
                    }}
                  >
                    Total
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight:
                        700,
                    }}
                  >
                    {formatearMoneda(
                      total,
                    )}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        {/* ================================= */}
        {/* ACCIONES */}
        {/* ================================= */}

        <DialogActions
          sx={{
            px: 3,

            py: 2,
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
              : "Registrar venta"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================================= */}
      {/* SELECTOR VISUAL DE PRODUCTOS */}
      {/* ================================= */}

      <Dialog
        open={
          selectorProductoAbierto
        }
        onClose={
          cerrarSelectorProducto
        }
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius:
              3,

            maxHeight:
              "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight:
              700,

            fontSize:
              24,
          }}
        >
          Seleccionar producto
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >
          {/* ======================= */}
          {/* FILTROS */}
          {/* ======================= */}

          <Grid
            container
            spacing={2}
            sx={{
              mb: 3,
            }}
          >
            <Grid
              size={{
                xs: 12,
                md: 7,
              }}
            >
              <TextField
                fullWidth
                autoFocus
                label="Buscar producto"
                placeholder="Nombre, código o categoría..."
                value={
                  busquedaProducto
                }
                onChange={(
                  event,
                ) =>
                  setBusquedaProducto(
                    event
                      .target
                      .value,
                  )
                }
                slotProps={{
                  input: {
                    startAdornment:
                      (
                        <SearchIcon
                          sx={{
                            mr: 1,
                            color:
                              "text.secondary",
                          }}
                        />
                      ),
                  },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 5,
              }}
            >
              <TextField
                select
                fullWidth
                label="Categoría"
                value={
                  categoriaFiltro
                }
                onChange={(
                  event,
                ) =>
                  setCategoriaFiltro(
                    event
                      .target
                      .value,
                  )
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
          </Grid>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
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
              variant="body2"
              color="text.secondary"
            >
              {productosFiltrados.length} producto
              {productosFiltrados.length ===
              1
                ? ""
                : "s"}{" "}
              encontrado
              {productosFiltrados.length ===
              1
                ? ""
                : "s"}
            </Typography>

            {(busquedaProducto ||
              categoriaFiltro) && (
              <Button
                size="small"
                onClick={
                  limpiarFiltrosProducto
                }
              >
                Limpiar filtros
              </Button>
            )}
          </Stack>

          {/* ======================= */}
          {/* RESULTADOS */}
          {/* ======================= */}

          {productosFiltrados.length ===
            0 && (
            <Alert severity="info">
              No encontramos productos con esos filtros.
            </Alert>
          )}

          <Stack spacing={1.25}>
            {productosFiltrados.map(
              (
                producto,
              ) => {
                const stock =
                  Number(
                    producto.stock ??
                      0,
                  );

                const sinStock =
                  stock <= 0;

                return (
                  <Paper
                    key={
                      producto.id
                    }
                    variant="outlined"
                    onClick={() => {
                      if (
                        !sinStock
                      ) {
                        seleccionarProductoDesdeModal(
                          producto,
                        );
                      }
                    }}
                    sx={{
                      p: 1.5,

                      borderRadius:
                        2,

                      cursor:
                        sinStock
                          ? "not-allowed"
                          : "pointer",

                      opacity:
                        sinStock
                          ? 0.55
                          : 1,

                      transition:
                        "0.15s",

                      "&:hover":
                        sinStock
                          ? {}
                          : {
                              borderColor:
                                "primary.main",

                              boxShadow:
                                1,

                              transform:
                                "translateY(-1px)",
                            },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                    >
                      {/* IMAGEN */}

                      <Box
                        component="img"
                        src={obtenerUrlImagen(
                          producto.imagen,
                        )}
                        alt={
                          producto.nombre
                        }
                        onError={(
                          event,
                        ) => {
                          event.currentTarget.src =
                            "/no-image.png";
                        }}
                        sx={{
                          width: {
                            xs:
                              70,

                            sm:
                              90,
                          },

                          height: {
                            xs:
                              70,

                            sm:
                              90,
                          },

                          objectFit:
                            "cover",

                          borderRadius:
                            2,

                          border:
                            "1px solid",

                          borderColor:
                            "divider",

                          flexShrink:
                            0,
                        }}
                      />

                      {/* INFORMACIÓN */}

                      <Box
                        sx={{
                          minWidth:
                            0,

                          flex: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight:
                              700,

                            fontSize:
                              16,
                          }}
                        >
                          {
                            producto.nombre
                          }
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Código:{" "}
                          {producto.codigo ||
                            "-"}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {producto.categoria ||
                            "Sin categoría"}
                        </Typography>

                        {Number(
                          producto.usa_variantes ??
                            1,
                        ) === 0 && (
                          <Chip
                            label="Sin variantes"
                            size="small"
                            variant="outlined"
                            sx={{
                              mt: 0.75,
                            }}
                          />
                        )}
                      </Box>

                      {/* STOCK */}

                      <Stack
                        spacing={0.75}
                        alignItems="flex-end"
                        sx={{
                          flexShrink:
                            0,
                        }}
                      >
                        {sinStock ? (
                          <Chip
                            label="Sin stock"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            icon={
                              <Inventory2OutlinedIcon />
                            }
                            label={`Stock ${stock}`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}

                        {!sinStock && (
                          <Typography
                            variant="caption"
                            color="primary"
                            sx={{
                              fontWeight:
                                600,
                            }}
                          >
                            Seleccionar
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                );
              },
            )}
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
            onClick={
              cerrarSelectorProducto
            }
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}