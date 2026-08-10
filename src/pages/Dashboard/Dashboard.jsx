import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WarehouseIcon from "@mui/icons-material/Warehouse";

import useDashboard from "../../features/dashboard/hooks/useDashboard";
import StatCard from "../../components/common/StatCard";

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(valor ?? 0));
}

function formatearFecha(
  valor,
  incluirHora = false,
) {
  if (!valor) {
    return "-";
  }

  const fecha = new Date(valor);

  if (
    Number.isNaN(
      fecha.getTime(),
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      dateStyle: "short",

      ...(incluirHora
        ? {
            timeStyle:
              "short",
          }
        : {}),
    },
  ).format(fecha);
}

function obtenerConfiguracionMovimiento(
  tipo,
) {
  const configuraciones = {
    INGRESO: {
      etiqueta: "Ingreso",
      color: "success",
      signo: "+",
    },

    VENTA: {
      etiqueta: "Venta",
      color: "error",
      signo: "-",
    },

    AJUSTE: {
      etiqueta: "Ajuste",
      color: "warning",
      signo: "",
    },

    DEVOLUCION: {
      etiqueta:
        "Devolución",
      color: "info",
      signo: "+",
    },
  };

  return (
    configuraciones[tipo] ?? {
      etiqueta:
        tipo ||
        "Movimiento",

      color:
        "default",

      signo:
        "",
    }
  );
}

function obtenerVariante(
  elemento,
) {
  const partes = [
    elemento?.color,
    elemento?.talle,
  ].filter(Boolean);

  if (
    partes.length > 0
  ) {
    return partes.join(
      " / ",
    );
  }

  return (
    elemento?.codigo_barras ||
    "-"
  );
}

function obtenerEtiquetaMetodoPago(
  valor,
) {
  const etiquetas = {
    EFECTIVO:
      "Efectivo",

    TRANSFERENCIA:
      "Transferencia",

    TARJETA:
      "Tarjeta",

    OTRO:
      "Otro",
  };

  return (
    etiquetas[valor] ||
    valor ||
    "-"
  );
}

function obtenerColorMetodoPago(
  valor,
) {
  const colores = {
    EFECTIVO:
      "success",

    TRANSFERENCIA:
      "info",

    TARJETA:
      "primary",

    OTRO:
      "default",
  };

  return (
    colores[valor] ||
    "default"
  );
}

function GraficoVentas({
  datos = [],
}) {
  const maximo =
    Math.max(
      ...datos.map(
        (item) =>
          Number(
            item.total ??
              0,
          ),
      ),
      1,
    );

  if (
    datos.length === 0
  ) {
    return (
      <Alert severity="info">
        Todavía no hay ventas para mostrar en el gráfico.
      </Alert>
    );
  }

  return (
    <Stack spacing={2.25}>
      {datos.map(
        (item) => {
          const total =
            Number(
              item.total ??
                0,
            );

          const porcentaje =
            Math.min(
              (total /
                maximo) *
                100,
              100,
            );

          return (
            <Box
              key={String(
                item.fecha,
              )}
            >
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1}
                sx={{
                  mb: 0.8,

                  justifyContent:
                    "space-between",

                  alignItems: {
                    xs:
                      "flex-start",

                    sm:
                      "center",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight:
                      500,
                  }}
                >
                  {formatearFecha(
                    item.fecha,
                  )}
                </Typography>

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    alignItems:
                      "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {Number(
                      item.cantidad_ventas ??
                        0,
                    )}{" "}
                    ventas
                  </Typography>

                  <Typography
                    variant="body2"
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

              <LinearProgress
                variant="determinate"
                value={
                  porcentaje
                }
                sx={{
                  height: 9,

                  borderRadius:
                    10,

                  backgroundColor:
                    "#EEE9E2",

                  "& .MuiLinearProgress-bar":
                    {
                      borderRadius:
                        10,

                      background:
                        "linear-gradient(90deg, #171717 0%, #726A62 100%)",
                    },
                }}
              />
            </Box>
          );
        },
      )}
    </Stack>
  );
}

function EncabezadoSeccion({
  titulo,
  descripcion,
  accion = null,
}) {
  return (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing={2}
      sx={{
        mb: 3,

        justifyContent:
          "space-between",

        alignItems: {
          xs: "stretch",
          sm: "center",
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
          {titulo}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.4,
          }}
        >
          {descripcion}
        </Typography>
      </Box>

      {accion}
    </Stack>
  );
}

export default function Dashboard() {
  const [
    diasGrafico,
    setDiasGrafico,
  ] = useState(7);

  const {
    resumen,
    ventasPorDia,
    productosStockBajo,

    cargandoDashboard,
    actualizandoDashboard,
    errorDashboard,

    recargarDashboard,
  } = useDashboard({
    diasGrafico,
  });

  const ultimosMovimientos =
    resumen.ultimos_movimientos ??
    [];

  const ultimasVentas =
    resumen.ultimas_ventas ??
    [];

  if (
    cargandoDashboard
  ) {
    return (
      <Box
        sx={{
          minHeight:
            400,

          display:
            "flex",

          justifyContent:
            "center",

          alignItems:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* ====================== */}
      {/* HERO */}
      {/* ====================== */}

      <Card
        sx={{
          mb: 3,

          overflow:
            "hidden",

          border: 0,

          color:
            "#FFFFFF",

          background:
            "linear-gradient(135deg, #151515 0%, #34302C 65%, #5A5149 100%)",

          position:
            "relative",

          "&::before":
            {
              content:
                '""',

              position:
                "absolute",

              width:
                260,

              height:
                260,

              borderRadius:
                "50%",

              right:
                -80,

              top:
                -120,

              background:
                "rgba(255, 255, 255, 0.055)",
            },

          "&::after":
            {
              content:
                '""',

              position:
                "absolute",

              width:
                180,

              height:
                180,

              borderRadius:
                "50%",

              right:
                100,

              bottom:
                -130,

              background:
                "rgba(255, 255, 255, 0.035)",
            },
        }}
      >
        <CardContent
          sx={{
            position:
              "relative",

            zIndex:
              1,

            p: {
              xs: 3,
              md: 4,
            },

            "&:last-child":
              {
                pb: {
                  xs: 3,
                  md: 4,
                },
              },
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color:
                  "#D8D0C7",

                fontWeight:
                  700,

                letterSpacing:
                  "0.18em",
              }}
            >
              VARA MODAS
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,

                color:
                  "#FFFFFF",

                fontWeight:
                  700,

                letterSpacing:
                  "-0.035em",
              }}
            >
              Panel de gestión
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 1,

                maxWidth:
                  620,

                color:
                  "#D8D0C7",

                lineHeight:
                  1.7,

                pr: {
                  xs: 0,
                  sm: 6,
                },
              }}
            >
              Controlá las ventas, compras, existencias y movimientos
              del negocio desde un solo lugar.
            </Typography>
          </Box>

          <Button
            aria-label="Actualizar dashboard"
            title="Actualizar datos"
            onClick={
              recargarDashboard
            }
            disabled={
              actualizandoDashboard
            }
            sx={{
              position:
                "absolute",

              right: {
                xs: 20,
                md: 28,
              },

              bottom: {
                xs: 20,
                md: 28,
              },

              minWidth:
                0,

              width:
                38,

              height:
                38,

              p: 0,

              borderRadius:
                "50%",

              backgroundColor:
                "rgba(255, 255, 255, 0.12)",

              color:
                "#FFFFFF",

              border:
                "1px solid rgba(255, 255, 255, 0.18)",

              boxShadow:
                "none",

              transition:
                "background-color .2s ease, transform .25s ease",

              "&:hover":
                {
                  backgroundColor:
                    "rgba(255, 255, 255, 0.22)",

                  transform:
                    actualizandoDashboard
                      ? "none"
                      : "rotate(90deg)",

                  boxShadow:
                    "none",
                },

              "&.Mui-disabled":
                {
                  color:
                    "rgba(255, 255, 255, 0.55)",

                  backgroundColor:
                    "rgba(255, 255, 255, 0.08)",
                },
            }}
          >
            {actualizandoDashboard ? (
              <CircularProgress
                size={17}
                color="inherit"
              />
            ) : (
              <RefreshIcon fontSize="small" />
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ====================== */}
      {/* ERROR */}
      {/* ====================== */}

      {errorDashboard && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {errorDashboard
            ?.response
            ?.data
            ?.message ||
            errorDashboard
              ?.response
              ?.data
              ?.error ||
            errorDashboard
              ?.message ||
            "No se pudo cargar el dashboard."}
        </Alert>
      )}

      {/* ====================== */}
      {/* MÉTRICAS COMERCIALES */}
      {/* ====================== */}

      <Grid
        container
        columnSpacing={3}
        rowSpacing={3}
        sx={{
          mb: 3,
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <StatCard
            title="Ventas de hoy"
            value={formatearMoneda(
              resumen.ventas_hoy,
            )}
            subtitle="Facturación registrada hoy"
            icon={
              <PointOfSaleIcon />
            }
            color="success.main"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <StatCard
            title="Ventas del mes"
            value={formatearMoneda(
              resumen.ventas_mes,
            )}
            subtitle="Facturación acumulada del mes"
            icon={
              <AttachMoneyIcon />
            }
            color="primary.main"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <StatCard
            title="Compras del mes"
            value={formatearMoneda(
              resumen.compras_mes,
            )}
            subtitle="Mercadería ingresada durante el mes"
            icon={
              <ShoppingCartIcon />
            }
            color="warning.main"
          />
        </Grid>

        {/* ====================== */}
        {/* MÉTRICAS DE INVENTARIO */}
        {/* ====================== */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <StatCard
            title="Productos activos"
            value={Number(
              resumen.productos ??
                0,
            ).toLocaleString(
              "es-AR",
            )}
            subtitle="Productos disponibles"
            icon={
              <Inventory2Icon />
            }
            color="primary.main"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <StatCard
            title="Unidades en stock"
            value={Number(
              resumen.unidades_stock ??
                0,
            ).toLocaleString(
              "es-AR",
            )}
            subtitle="Unidades disponibles en inventario"
            icon={
              <WarehouseIcon />
            }
            color="info.main"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <StatCard
            title="Productos agotados"
            value={Number(
              resumen.sin_stock ??
                0,
            ).toLocaleString(
              "es-AR",
            )}
            subtitle="Variantes sin unidades disponibles"
            icon={
              <WarningAmberIcon />
            }
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* ====================== */}
      {/* VENTAS + STOCK BAJO */}
      {/* ====================== */}

      <Grid
        container
        columnSpacing={3}
        rowSpacing={3}
        sx={{
          mb: 3,
        }}
      >
        <Grid
          size={{
            xs: 12,
            lg: 8,
          }}
        >
          <Card
            sx={{
              height:
                "100%",

              background:
                "linear-gradient(145deg, #FFFFFF 0%, #FCFAF7 100%)",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },

                "&:last-child":
                  {
                    pb: {
                      xs: 2.5,
                      md: 3,
                    },
                  },
              }}
            >
              <EncabezadoSeccion
                titulo="Evolución de ventas"
                descripcion="Total facturado por día durante el período seleccionado."
                accion={
                  <TextField
                    select
                    size="small"
                    label="Período"
                    value={
                      diasGrafico
                    }
                    onChange={(
                      event,
                    ) =>
                      setDiasGrafico(
                        Number(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                    sx={{
                      minWidth:
                        165,
                    }}
                  >
                    <MenuItem
                      value={7}
                    >
                      Últimos 7 días
                    </MenuItem>

                    <MenuItem
                      value={15}
                    >
                      Últimos 15 días
                    </MenuItem>

                    <MenuItem
                      value={30}
                    >
                      Últimos 30 días
                    </MenuItem>

                    <MenuItem
                      value={60}
                    >
                      Últimos 60 días
                    </MenuItem>

                    <MenuItem
                      value={90}
                    >
                      Últimos 90 días
                    </MenuItem>
                  </TextField>
                }
              />

              <GraficoVentas
                datos={
                  ventasPorDia
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ====================== */}
        {/* STOCK BAJO DETALLADO */}
        {/* ====================== */}

        <Grid
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          <Card
            sx={{
              height:
                "100%",

              background:
                "linear-gradient(145deg, #FFFFFF 0%, #FCFAF7 100%)",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },

                "&:last-child":
                  {
                    pb: {
                      xs: 2.5,
                      md: 3,
                    },
                  },
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  mb: 2.5,

                  justifyContent:
                    "space-between",

                  alignItems:
                    "flex-start",
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
                    Stock bajo
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.4,
                    }}
                  >
                    Variantes que requieren reposición.
                  </Typography>
                </Box>

                <Chip
                  label={
                    productosStockBajo.length
                  }
                  color={
                    productosStockBajo.length >
                    0
                      ? "error"
                      : "success"
                  }
                  size="small"
                />
              </Stack>

              {productosStockBajo.length ===
              0 ? (
                <Alert severity="success">
                  No hay productos con stock bajo.
                </Alert>
              ) : (
                <Stack
                  spacing={1.6}
                  divider={
                    <Divider flexItem />
                  }
                >
                  {productosStockBajo
                    .slice(
                      0,
                      8,
                    )
                    .map(
                      (
                        producto,
                      ) => (
                        <Box
                          key={
                            producto.variante_id
                          }
                          sx={{
                            py: 0.3,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={
                              2
                            }
                            sx={{
                              justifyContent:
                                "space-between",

                              alignItems:
                                "flex-start",
                            }}
                          >
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
                                  producto.producto_nombre
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {obtenerVariante(
                                  producto,
                                )}
                              </Typography>
                            </Box>

                            <Chip
                              size="small"
                              color="error"
                              variant="outlined"
                              label={`${Number(
                                producto.stock_actual ??
                                  0,
                              )} / ${Number(
                                producto.stock_minimo ??
                                  0,
                              )}`}
                            />
                          </Stack>
                        </Box>
                      ),
                    )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ====================== */}
      {/* MOVIMIENTOS + VENTAS */}
      {/* ====================== */}

      <Grid
        container
        columnSpacing={3}
        rowSpacing={3}
      >
        {/* ÚLTIMOS MOVIMIENTOS */}

        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <Card
            sx={{
              height:
                "100%",

              background:
                "linear-gradient(145deg, #FFFFFF 0%, #FCFAF7 100%)",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },

                "&:last-child":
                  {
                    pb: {
                      xs: 2.5,
                      md: 3,
                    },
                  },
              }}
            >
              <EncabezadoSeccion
                titulo="Últimos movimientos"
                descripcion="Actividad reciente del inventario."
              />

              {ultimosMovimientos.length ===
              0 ? (
                <Alert severity="info">
                  Todavía no hay movimientos de stock.
                </Alert>
              ) : (
                <Stack
                  spacing={1.7}
                  divider={
                    <Divider flexItem />
                  }
                >
                  {ultimosMovimientos.map(
                    (
                      movimiento,
                    ) => {
                      const configuracion =
                        obtenerConfiguracionMovimiento(
                          movimiento.tipo,
                        );

                      return (
                        <Stack
                          key={
                            movimiento.id
                          }
                          direction={{
                            xs:
                              "column",

                            sm:
                              "row",
                          }}
                          spacing={
                            1.5
                          }
                          sx={{
                            py: 0.2,

                            justifyContent:
                              "space-between",

                            alignItems:
                              {
                                xs:
                                  "flex-start",

                                sm:
                                  "center",
                              },
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  700,
                              }}
                            >
                              {
                                movimiento.producto_nombre
                              }
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {obtenerVariante(
                                movimiento,
                              )}{" "}
                              ·{" "}
                              {formatearFecha(
                                movimiento.created_at,
                                true,
                              )}
                            </Typography>
                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              alignItems:
                                "center",
                            }}
                          >
                            <Chip
                              size="small"
                              label={
                                configuracion.etiqueta
                              }
                              color={
                                configuracion.color
                              }
                              variant="outlined"
                            />

                            <Typography
                              variant="body2"
                              sx={{
                                minWidth:
                                  34,

                                textAlign:
                                  "right",

                                fontWeight:
                                  700,
                              }}
                            >
                              {
                                configuracion.signo
                              }

                              {Number(
                                movimiento.cantidad ??
                                  0,
                              )}
                            </Typography>
                          </Stack>
                        </Stack>
                      );
                    },
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ÚLTIMAS VENTAS */}

        <Grid
          size={{
            xs: 12,
            lg: 5,
          }}
        >
          <Card
            sx={{
              height:
                "100%",

              background:
                "linear-gradient(145deg, #FFFFFF 0%, #FCFAF7 100%)",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },

                "&:last-child":
                  {
                    pb: {
                      xs: 2.5,
                      md: 3,
                    },
                  },
              }}
            >
              <EncabezadoSeccion
                titulo="Últimas ventas"
                descripcion="Operaciones comerciales recientes."
              />

              {ultimasVentas.length ===
              0 ? (
                <Alert severity="info">
                  Todavía no hay ventas registradas.
                </Alert>
              ) : (
                <Stack
                  spacing={1.7}
                  divider={
                    <Divider flexItem />
                  }
                >
                  {ultimasVentas.map(
                    (venta) => (
                      <Stack
                        key={
                          venta.id
                        }
                        direction={{
                          xs:
                            "column",

                          sm:
                            "row",
                        }}
                        spacing={
                          1.5
                        }
                        sx={{
                          py: 0.2,

                          justifyContent:
                            "space-between",

                          alignItems:
                            {
                              xs:
                                "flex-start",

                              sm:
                                "center",
                            },
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                700,
                            }}
                          >
                            Venta #
                            {
                              venta.id
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {
                              venta.cliente
                            }{" "}
                            ·{" "}
                            {formatearFecha(
                              venta.fecha,
                              true,
                            )}
                          </Typography>
                        </Box>

                        <Stack
                          spacing={
                            0.7
                          }
                          sx={{
                            alignItems:
                              {
                                xs:
                                  "flex-start",

                                sm:
                                  "flex-end",
                              },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                700,
                            }}
                          >
                            {formatearMoneda(
                              venta.total,
                            )}
                          </Typography>

                          <Chip
                            size="small"
                            variant="outlined"
                            color={obtenerColorMetodoPago(
                              venta.metodo_pago,
                            )}
                            label={obtenerEtiquetaMetodoPago(
                              venta.metodo_pago,
                            )}
                          />
                        </Stack>
                      </Stack>
                    ),
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}