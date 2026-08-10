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

function generarIdTemporal() {
  if (
    typeof crypto !==
    "undefined" &&
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
  }, [open]);

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
            cantidad * precio
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
        Number.isNaN(
          valor,
        ) ||
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

    /*
     * MUY IMPORTANTE:
     *
     * cliente_id se mantiene SIEMPRE
     * como string dentro del frontend.
     *
     * ""  = Consumidor final
     * "1" = Cliente ID 1
     * "2" = Cliente ID 2
     */
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
        [name]: value,
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
   * MODIFICAR PRODUCTO
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
   * SELECCIONAR PRODUCTO
   * ==================================
   */

  const seleccionarProducto =
    async (
      item,
      productoId,
    ) => {
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

        modificarItem(
          item.idTemporal,
          {
            variantes:
              extraerDatos(
                data,
              ),

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
          !varianteId
        ) {
          nuevosErrores.productos =
            `Seleccioná la variante del ítem ${numeroItem}.`;
        } else if (
          !Number.isInteger(
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
            `El ítem ${numeroItem} solo tiene ${stockDisponible} unidades disponibles.`;
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
            `La variante del ítem ${numeroItem} está repetida.`;
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
        /*
         * Consumidor final:
         * cliente_id = ""
         *
         * Backend:
         * cliente_id = null
         */
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
    <Dialog
      open={open}
      onClose={cerrar}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          width:
            "95vw",

          maxWidth:
            1500,
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
        {/* ======================= */}
        {/* ERROR GENERAL */}
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

        {/* ======================= */}
        {/* ERRORES BACKEND */}
        {/* ======================= */}

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
                    •{" "}
                    {
                      mensaje
                    }
                  </Typography>
                ),
              )}
            </Alert>
          )}

        {/* ======================= */}
        {/* DATOS GENERALES */}
        {/* ======================= */}

        <Grid
          container
          spacing={2}
        >
          {/* ===================== */}
          {/* CLIENTE */}
          {/* ===================== */}

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

              /*
               * Siempre string.
               */
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
                  shrink: true,
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

                      /*
                       * El valor vacío
                       * representa a
                       * Consumidor final.
                       */
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

                    /*
                     * También string.
                     */
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

          {/* ===================== */}
          {/* MÉTODO PAGO */}
          {/* ===================== */}

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

          {/* ===================== */}
          {/* DESCUENTO */}
          {/* ===================== */}

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

        {/* ======================= */}
        {/* PRODUCTOS */}
        {/* ======================= */}

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
              Seleccioná las prendas, cantidades y precios de la venta.
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
            ) => (
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
                <Grid
                  container
                  spacing={2}
                  sx={{
                    alignItems:
                      "flex-start",
                  }}
                >
                  {/* PRODUCTO */}

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
                      sx={{
                        minWidth:
                          0,

                        "& .MuiSelect-select":
                        {
                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",

                          whiteSpace:
                            "nowrap",
                        },
                      }}
                    >
                      <MenuItem value="">
                        Seleccionar producto
                      </MenuItem>

                      {productos.map(
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

                  {/* VARIANTE */}

                  <Grid
                    size={{
                      xs:
                        12,

                      md:
                        2.5,
                    }}
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
                      sx={{
                        minWidth:
                          0,

                        "& .MuiSelect-select":
                        {
                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",

                          whiteSpace:
                            "nowrap",
                        },
                      }}
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
                  </Grid>

                  {/* CANTIDAD */}

                  <Grid
                    size={{
                      xs:
                        12,

                      sm:
                        6,

                      md:
                        1.5,
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
                        loading
                      }
                      slotProps={{
                        htmlInput:
                        {
                          min:
                            1,

                          max:
                            Number(
                              item.stock_disponible ??
                              0,
                            ),

                          step:
                            1,
                        },
                      }}
                    />
                  </Grid>

                  {/* PRECIO */}

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

                      sm:
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
                            item.precio_unitario ||
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

                      sm:
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
                        aria-label={`Eliminar ítem ${indice +
                          1
                          }`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ),
          )}
        </Stack>

        {/* ======================= */}
        {/* TOTALES */}
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

              width: {
                xs:
                  "100%",

                sm:
                  "auto",
              },

              minWidth: {
                sm:
                  300,
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

      {/* ======================= */}
      {/* ACCIONES */}
      {/* ======================= */}

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
  );
}