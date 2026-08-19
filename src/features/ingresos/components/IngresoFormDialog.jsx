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

    variantes: [],

    cargandoVariantes: false,

    usa_variantes: true,

    error_variante: "",
  };
}

function prepararVariantes(
  variantes = [],
  variantesAnteriores = [],
) {
  const mapaAnterior =
    new Map(
      variantesAnteriores.map(
        (variante) => [
          String(variante.id),
          variante,
        ],
      ),
    );

  return variantes.map(
    (variante) => {
      const anterior =
        mapaAnterior.get(
          String(variante.id),
        );

      return {
        ...variante,

        cantidad:
          anterior?.cantidad ??
          "0",

        precio_costo:
          anterior?.precio_costo ??
          String(
            variante.precio_costo ??
              "",
          ),
      };
    },
  );
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
   * PRODUCTOS CREADOS EN EL INGRESO
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
   * NUEVA VARIANTE PRODUCTO EXISTENTE
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
   * ERRORES
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
   * MUTACIONES
   * ==================================
   */

  const {
    guardarProducto,
    guardando:
      guardandoProducto,
  } = useProductoMutations();

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
            String(producto.id),
            producto,
          );
        },
      );

      productosCreados.forEach(
        (producto) => {
          mapa.set(
            String(producto.id),
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
   * REINICIAR
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

    setErroresFormulario({});

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
      categorias,
      productosDisponibles,
    ]);

  /*
   * ==================================
   * TOTAL GENERAL
   * ==================================
   */

  const total =
    useMemo(() => {
      return items.reduce(
        (
          totalProductos,
          item,
        ) => {
          const subtotalProducto =
            item.variantes.reduce(
              (
                acumulado,
                variante,
              ) => {
                const cantidad =
                  Number(
                    variante.cantidad ??
                      0,
                  );

                const costo =
                  Number(
                    variante.precio_costo ??
                      0,
                  );

                if (
                  Number.isNaN(
                    cantidad,
                  ) ||
                  Number.isNaN(
                    costo,
                  )
                ) {
                  return acumulado;
                }

                return (
                  acumulado +
                  cantidad *
                    costo
                );
              },
              0,
            );

          return (
            totalProductos +
            subtotalProducto
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
   * MODIFICAR VARIANTE
   * ==================================
   */

  const modificarVariante =
    (
      itemId,
      varianteId,
      cambios,
    ) => {
      setItems(
        (
          estadoActual,
        ) =>
          estadoActual.map(
            (item) => {
              if (
                item.idTemporal !==
                itemId
              ) {
                return item;
              }

              return {
                ...item,

                variantes:
                  item.variantes.map(
                    (
                      variante,
                    ) =>
                      String(
                        variante.id,
                      ) ===
                      String(
                        varianteId,
                      )
                        ? {
                            ...variante,
                            ...cambios,
                          }
                        : variante,
                  ),
              };
            },
          ),
      );
    };

  /*
   * ==================================
   * PRODUCTOS FILTRADOS
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
   * SUBTOTAL PRODUCTO
   * ==================================
   */

  const obtenerSubtotalProducto =
    (item) => {
      return item.variantes.reduce(
        (
          acumulado,
          variante,
        ) => {
          const cantidad =
            Number(
              variante.cantidad ??
                0,
            );

          const costo =
            Number(
              variante.precio_costo ??
                0,
            );

          if (
            Number.isNaN(
              cantidad,
            ) ||
            Number.isNaN(
              costo,
            )
          ) {
            return acumulado;
          }

          return (
            acumulado +
            cantidad *
              costo
          );
        },
        0,
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
    };

  /*
   * ==================================
   * CARGAR VARIANTES PRODUCTO
   * ==================================
   */

  const cargarVariantesProducto =
    async (
      productoId,
      variantesAnteriores = [],
    ) => {
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

      return prepararVariantes(
        variantes,
        variantesAnteriores,
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

      const usaVariantes =
        productoUsaVariantes(
          productoSeleccionado,
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

          variantes: [],

          cargandoVariantes:
            Boolean(
              productoId,
            ),

          usa_variantes:
            usaVariantes,

          error_variante:
            "",
        },
      );

      if (!productoId) {
        return;
      }

      try {
        const variantes =
          await cargarVariantesProducto(
            productoId,
          );

        /*
         * Producto simple:
         *
         * El backend ya creó una única
         * variante interna. La mantenemos
         * dentro de item.variantes para que
         * el ingreso siga enviando
         * variante_id al backend.
         */
        if (!usaVariantes) {
          const varianteInterna =
            variantes[0];

          if (!varianteInterna) {
            modificarItem(
              item.idTemporal,
              {
                variantes: [],

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
              variantes: [
                {
                  ...varianteInterna,

                  cantidad:
                    varianteInterna.cantidad ??
                    "0",

                  precio_costo:
                    String(
                      varianteInterna.precio_costo ??
                        productoSeleccionado
                          ?.precio_costo_default ??
                        "",
                    ),
                },
              ],

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

            cargandoVariantes:
              false,

            usa_variantes:
              true,

            error_variante:
              "",
          },
        );
      } catch {
        modificarItem(
          item.idTemporal,
          {
            variantes: [],

            cargandoVariantes:
              false,

            usa_variantes:
              usaVariantes,

            error_variante:
              "No se pudo cargar la información de stock del producto.",
          },
        );
      }
    };

  /*
   * ==================================
   * AGREGAR PRODUCTO
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
   * ELIMINAR PRODUCTO
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

      const categoria =
        categoriasDisponibles.find(
          (elemento) =>
            String(
              elemento.id,
            ) ===
            String(
              productoCreado.categoria_id,
            ),
        );

      const productoCompleto = {
        ...productoCreado,

        categoria:
          productoCreado.categoria ??
          categoria?.nombre ??
          null,
      };

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

      setDialogProductoAbierto(
        false,
      );

      /*
       * PRODUCTO SIN VARIANTES
       *
       * El backend ya creó su variante
       * interna. No abrimos VarianteDialog.
       */
      if (
        !productoUsaVariantes(
          productoCompleto,
        )
      ) {
        try {
          const variantes =
            await cargarVariantesProducto(
              productoCompleto.id,
            );

          const varianteInterna =
            variantes[0];

          if (!varianteInterna) {
            setItems(
              (
                estadoActual,
              ) =>
                estadoActual.map(
                  (item) =>
                    item.idTemporal ===
                    itemCreacionId
                      ? {
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

                          variantes:
                            [],

                          cargandoVariantes:
                            false,

                          usa_variantes:
                            false,

                          error_variante:
                            "No se encontró la variante interna del producto.",
                        }
                      : item,
                ),
            );
          } else {
            setItems(
              (
                estadoActual,
              ) =>
                estadoActual.map(
                  (item) =>
                    item.idTemporal ===
                    itemCreacionId
                      ? {
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

                          variantes: [
                            {
                              ...varianteInterna,

                              cantidad:
                                "0",

                              precio_costo:
                                String(
                                  varianteInterna.precio_costo ??
                                    productoCompleto.precio_costo_default ??
                                    "",
                                ),
                            },
                          ],

                          cargandoVariantes:
                            false,

                          usa_variantes:
                            false,

                          error_variante:
                            "",
                        }
                      : item,
                ),
            );
          }
        } catch {
          setItems(
            (
              estadoActual,
            ) =>
              estadoActual.map(
                (item) =>
                  item.idTemporal ===
                  itemCreacionId
                    ? {
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

                        variantes:
                          [],

                        cargandoVariantes:
                          false,

                        usa_variantes:
                          false,

                        error_variante:
                          "No se pudo cargar la información del producto simple.",
                      }
                    : item,
              ),
          );
        }

        setProductoNuevo(
          null,
        );

        setItemCreacionId(
          null,
        );

        setDialogVarianteAbierto(
          false,
        );

        return;
      }

      /*
       * PRODUCTO CON VARIANTES
       *
       * Conservamos el flujo actual:
       * después de crear el producto
       * pedimos crear su primera variante.
       */

      setProductoNuevo(
        productoCompleto,
      );

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
        productoSeleccionado &&
        !productoUsaVariantes(
          productoSeleccionado,
        )
      ) {
        setErroresFormulario(
          (
            estadoActual,
          ) => ({
            ...estadoActual,

            productos:
              "Este producto no utiliza variantes.",
          }),
        );

        return;
      }

      if (
        !productoSeleccionado?.id
      ) {
        setErroresFormulario(
          (
            estadoActual,
          ) => ({
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
       * Stock inicial siempre 0.
       * El stock entra con la compra.
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
       * Recuperamos las cantidades
       * que ya había escrito el usuario.
       */

      const itemActual =
        items.find(
          (item) =>
            item.idTemporal ===
            itemDestinoId,
        );

      let variantesActualizadas =
        prepararVariantes(
          [
            varianteCreada,
          ],
          itemActual?.variantes ??
            [],
        );

      try {
        variantesActualizadas =
          await cargarVariantesProducto(
            productoDestino.id,
            itemActual?.variantes ??
              [],
          );
      } catch {
        // Mantenemos al menos
        // la variante creada.
      }

      /*
       * La nueva variante conserva
       * cantidad 0 y su costo inicial.
       */

      variantesActualizadas =
        variantesActualizadas.map(
          (variante) => {
            if (
              String(
                variante.id,
              ) !==
              String(
                varianteCreada.id,
              )
            ) {
              return variante;
            }

            return {
              ...variante,

              cantidad:
                "0",

              precio_costo:
                String(
                  varianteCreada.precio_costo ??
                    datos.precio_costo ??
                    "",
                ),
            };
          },
        );

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

    const productosIngreso =
      [];

    const variantesUsadas =
      new Set();

    items.forEach(
      (
        item,
        indiceProducto,
      ) => {
        if (
          !item.producto_id
        ) {
          return;
        }

        item.variantes.forEach(
          (
            variante,
          ) => {
            const cantidad =
              Number(
                variante.cantidad ??
                  0,
              );

            const costo =
              Number(
                variante.precio_costo,
              );

            /*
             * Cantidad 0 significa
             * "esta variante no llegó".
             */

            if (
              Number.isNaN(
                cantidad,
              ) ||
              !Number.isInteger(
                cantidad,
              ) ||
              cantidad < 0
            ) {
              nuevosErrores.productos =
                `La cantidad de una variante del producto ${
                  indiceProducto +
                  1
                } no es válida.`;

              return;
            }

            if (
              cantidad === 0
            ) {
              return;
            }

            if (
              variante.precio_costo ===
                "" ||
              Number.isNaN(
                costo,
              ) ||
              costo < 0
            ) {
              nuevosErrores.productos =
                `El costo de una variante del producto ${
                  indiceProducto +
                  1
                } no es válido.`;

              return;
            }

            const varianteId =
              Number(
                variante.id,
              );

            if (
              variantesUsadas.has(
                varianteId,
              )
            ) {
              nuevosErrores.productos =
                "Una misma variante fue ingresada más de una vez.";

              return;
            }

            variantesUsadas.add(
              varianteId,
            );

            productosIngreso.push({
              variante_id:
                varianteId,

              cantidad,

              precio_costo:
                costo,
            });
          },
        );
      },
    );

    if (
      productosIngreso.length ===
      0
    ) {
      nuevosErrores.productos =
        "Ingresá una cantidad mayor que cero en al menos un producto o variante.";
    }

    setErroresFormulario(
      nuevosErrores,
    );

    return {
      valido:
        Object.keys(
          nuevosErrores,
        ).length === 0,

      productosIngreso,
    };
  };

  /*
   * ==================================
   * GUARDAR
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
          validacion.productosIngreso,
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
          {/* DATOS DEL INGRESO */}
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
                Seleccioná el producto e ingresá la cantidad recibida de cada variante.
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

                const usaVariantes =
                  productoUsaVariantes(
                    productoSeleccionado,
                  );

                const subtotalProducto =
                  obtenerSubtotalProducto(
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
                        xs: 1.5,
                        md: 2,
                      },

                      borderRadius:
                        2.5,
                    }}
                  >
                    {/* ENCABEZADO */}

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

                      <Stack
                        direction="row"
                        spacing={1}
                      >
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
                          aria-label="Eliminar producto"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* PRODUCTO */}

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
                          xs: 12,
                          md: 3,
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
                          xs: 12,
                          md: 5,
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
                          xs: 12,
                          md: 4,
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

                              {!usaVariantes && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display:
                                      "block",

                                    mt: 0.25,

                                    fontWeight:
                                      600,
                                  }}
                                >
                                  Producto sin variantes
                                </Typography>
                              )}
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

                    {/* VARIANTES / PRODUCTO SIMPLE */}

                    {item.producto_id && (
                      <>
                        <Divider
                          sx={{
                            my: 2,
                          }}
                        />

                        <Stack
                          direction={{
                            xs:
                              "column",

                            sm:
                              "row",
                          }}
                          spacing={1}
                          sx={{
                            mb: 1.5,

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
                              variant="subtitle1"
                              sx={{
                                fontWeight:
                                  700,
                              }}
                            >
                              {usaVariantes
                                ? "Variantes"
                                : "Producto sin variantes"}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {usaVariantes
                                ? "Colocá 0 en las variantes que no llegaron."
                                : "Ingresá la cantidad recibida y el costo unitario del producto."}
                            </Typography>
                          </Box>

                          {usaVariantes && (
                            <Button
                              size="small"
                              variant="outlined"
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
                                item.cargandoVariantes
                              }
                            >
                              Nueva variante
                            </Button>
                          )}
                        </Stack>

                        {item.error_variante && (
                          <Alert
                            severity="error"
                            sx={{
                              mb: 1.5,
                            }}
                          >
                            {
                              item.error_variante
                            }
                          </Alert>
                        )}

                        {item.cargandoVariantes && (
                          <Box
                            sx={{
                              py: 3,

                              display:
                                "flex",

                              justifyContent:
                                "center",
                            }}
                          >
                            <CircularProgress
                              size={24}
                            />
                          </Box>
                        )}

                        {!item.cargandoVariantes &&
                          !item.error_variante &&
                          item.variantes.length ===
                            0 && (
                            <Alert
                              severity="info"
                            >
                              {usaVariantes
                                ? 'Este producto todavía no tiene variantes. Creá una con el botón "Nueva variante".'
                                : "No se encontró la información interna del producto simple."}
                            </Alert>
                          )}

                        {!item.cargandoVariantes &&
                          item.variantes.length >
                            0 && (
                            <Stack
                              spacing={1}
                            >
                              {/* ENCABEZADO */}

                              <Grid
                                container
                                spacing={1.5}
                                sx={{
                                  display: {
                                    xs:
                                      "none",

                                    md:
                                      "flex",
                                  },

                                  px: 1,

                                  color:
                                    "text.secondary",
                                }}
                              >
                                <Grid
                                  size={{
                                    md: 4,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    {usaVariantes
                                      ? "Variante"
                                      : "Producto"}
                                  </Typography>
                                </Grid>

                                <Grid
                                  size={{
                                    md: 2,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    Stock actual
                                  </Typography>
                                </Grid>

                                <Grid
                                  size={{
                                    md: 2,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    Cantidad
                                  </Typography>
                                </Grid>

                                <Grid
                                  size={{
                                    md: 2,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    Costo unitario
                                  </Typography>
                                </Grid>

                                <Grid
                                  size={{
                                    md: 2,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    Subtotal
                                  </Typography>
                                </Grid>
                              </Grid>

                              {/* FILAS */}

                              {item.variantes.map(
                                (
                                  variante,
                                ) => {
                                  const cantidad =
                                    Number(
                                      variante.cantidad ??
                                        0,
                                    );

                                  const costo =
                                    Number(
                                      variante.precio_costo ??
                                        0,
                                    );

                                  return (
                                    <Paper
                                      key={
                                        variante.id
                                      }
                                      variant="outlined"
                                      sx={{
                                        p: 1.25,

                                        borderRadius:
                                          2,
                                      }}
                                    >
                                      <Grid
                                        container
                                        spacing={1.5}
                                        sx={{
                                          alignItems:
                                            "center",
                                        }}
                                      >
                                        {/* PRODUCTO / VARIANTE */}

                                        <Grid
                                          size={{
                                            xs:
                                              12,

                                            md:
                                              4,
                                          }}
                                        >
                                          <Typography
                                            sx={{
                                              fontWeight:
                                                600,
                                            }}
                                          >
                                            {usaVariantes
                                              ? (
                                                <>
                                                  {variante.color ||
                                                    "Sin color"}{" "}
                                                  /{" "}
                                                  {variante.talle ||
                                                    "Sin talle"}
                                                </>
                                              )
                                              : (
                                                productoSeleccionado
                                                  ?.nombre ||
                                                "Producto"
                                              )}
                                          </Typography>

                                          {usaVariantes &&
                                            variante.codigo_barras && (
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Código:{" "}
                                              {
                                                variante.codigo_barras
                                              }
                                            </Typography>
                                          )}

                                          {!usaVariantes && (
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Sin variantes
                                            </Typography>
                                          )}
                                        </Grid>

                                        {/* STOCK */}

                                        <Grid
                                          size={{
                                            xs:
                                              12,

                                            sm:
                                              4,

                                            md:
                                              2,
                                          }}
                                        >
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Stock actual
                                          </Typography>

                                          <Typography
                                            sx={{
                                              fontWeight:
                                                700,
                                            }}
                                          >
                                            {Number(
                                              variante.stock_actual ??
                                                0,
                                            )}
                                          </Typography>
                                        </Grid>

                                        {/* CANTIDAD */}

                                        <Grid
                                          size={{
                                            xs:
                                              12,

                                            sm:
                                              4,

                                            md:
                                              2,
                                          }}
                                        >
                                          <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Cantidad"
                                            value={
                                              variante.cantidad
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              modificarVariante(
                                                item.idTemporal,

                                                variante.id,

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
                                                    0,

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
                                              4,

                                            md:
                                              2,
                                          }}
                                        >
                                          <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Costo"
                                            value={
                                              variante.precio_costo
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              modificarVariante(
                                                item.idTemporal,

                                                variante.id,

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
                                              12,

                                            md:
                                              2,
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
                                              cantidad *
                                                costo,
                                            )}
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    </Paper>
                                  );
                                },
                              )}

                              {/* SUBTOTAL PRODUCTO */}

                              <Stack
                                direction="row"
                                sx={{
                                  pt: 1,

                                  justifyContent:
                                    "flex-end",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  Subtotal producto:{" "}
                                  {formatearMoneda(
                                    subtotalProducto,
                                  )}
                                </Typography>
                              </Stack>
                            </Stack>
                          )}
                      </>
                    )}
                  </Paper>
                );
              },
            )}
          </Stack>

          {/* ======================= */}
          {/* TOTAL GENERAL */}
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
                    300,
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
        {/* ACCIONES */}
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