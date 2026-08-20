import { useMemo, useState } from "react";

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
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import RefreshIcon from "@mui/icons-material/Refresh";
import SavingsIcon from "@mui/icons-material/Savings";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { DataGrid } from "@mui/x-data-grid";

import StatCard from "../../../components/common/StatCard";
import useReportes from "../hooks/useReportes";

const METODOS_PAGO = {
  EFECTIVO: {
    etiqueta: "Efectivo",
    color: "success",
  },

  TRANSFERENCIA: {
    etiqueta: "Transferencia",
    color: "info",
  },

  TARJETA: {
    etiqueta: "Tarjeta",
    color: "primary",
  },

  OTRO: {
    etiqueta: "Otro",
    color: "default",
  },
};

/*
 * =====================================
 * FECHAS
 * =====================================
 */

function formatearFechaParaInput(
  fecha,
) {
  const anio =
    fecha.getFullYear();

  const mes =
    String(
      fecha.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const dia =
    String(
      fecha.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${anio}-${mes}-${dia}`;
}

function obtenerPrimerDiaMes() {
  const fecha =
    new Date();

  return formatearFechaParaInput(
    new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      1,
    ),
  );
}

function obtenerFechaActual() {
  return formatearFechaParaInput(
    new Date(),
  );
}

/*
 * =====================================
 * FORMATEO
 * =====================================
 */

function formatearMoneda(
  valor,
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    },
  ).format(
    Number(
      valor ?? 0,
    ),
  );
}

function formatearCantidad(
  valor,
) {
  const numero =
    Number(
      valor ?? 0,
    );

  if (
    !Number.isFinite(
      numero,
    )
  ) {
    return "0";
  }

  return new Intl.NumberFormat(
    "es-AR",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    },
  ).format(
    numero,
  );
}

function formatearFecha(
  valor,
) {
  if (!valor) {
    return "-";
  }

  const fechaTexto =
    String(
      valor,
    ).slice(
      0,
      10,
    );

  const [
    anio,
    mes,
    dia,
  ] =
    fechaTexto.split(
      "-",
    );

  if (
    !anio ||
    !mes ||
    !dia
  ) {
    return "-";
  }

  return `${dia}/${mes}/${anio}`;
}

function obtenerTextoPeriodo(
  filtros,
) {
  const desde =
    filtros?.fechaDesde;

  const hasta =
    filtros?.fechaHasta;

  if (
    !desde &&
    !hasta
  ) {
    return "Todo el período";
  }

  if (
    desde &&
    hasta
  ) {
    return `${formatearFecha(
      desde,
    )} al ${formatearFecha(
      hasta,
    )}`;
  }

  if (desde) {
    return `Desde ${formatearFecha(
      desde,
    )}`;
  }

  return `Hasta ${formatearFecha(
    hasta,
  )}`;
}

/*
 * =====================================
 * VARIANTES
 * =====================================
 */

function obtenerVariante(
  item,
) {
  if (
    Number(
      item?.usa_variantes ??
        1,
    ) === 0
  ) {
    return "Producto sin variantes";
  }

  const partes = [
    item?.color,
    item?.talle,
  ].filter(
    Boolean,
  );

  if (
    partes.length >
    0
  ) {
    return partes.join(
      " / ",
    );
  }

  return (
    item?.codigo_barras ||
    "-"
  );
}

/*
 * =====================================
 * TAB PANEL
 * =====================================
 */

function TabPanel({
  value,
  index,
  children,
}) {
  if (
    value !== index
  ) {
    return null;
  }

  return (
    <Box
      role="tabpanel"
      sx={{
        pt: 3,
      }}
    >
      {children}
    </Box>
  );
}

/*
 * =====================================
 * GRÁFICO VENTAS POR DÍA
 * =====================================
 */

function GraficoVentasPorDia({
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
    datos.length ===
    0
  ) {
    return (
      <Alert
        severity="info"
      >
        No hay ventas registradas para el período seleccionado.
      </Alert>
    );
  }

  return (
    <Stack
      spacing={
        2
      }
    >
      {datos.map(
        (item) => {
          const total =
            Number(
              item.total ??
                0,
            );

          const porcentaje =
            Math.min(
              (
                total /
                maximo
              ) *
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
                justifyContent="space-between"
                alignItems={{
                  xs: "flex-start",
                  sm: "center",
                }}
                spacing={
                  1
                }
                mb={
                  0.75
                }
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {formatearFecha(
                    item.fecha,
                  )}
                </Typography>

                <Stack
                  direction="row"
                  spacing={
                    2
                  }
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
                    fontWeight="bold"
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
                  height: 10,
                  borderRadius: 5,
                }}
              />
            </Box>
          );
        },
      )}
    </Stack>
  );
}

/*
 * =====================================
 * REPORTES
 * =====================================
 */

export default function ReportesPage() {
  /*
   * =================================
   * PERÍODO
   * =================================
   *
   * filtrosEdicion:
   * fechas visibles en los inputs.
   *
   * filtrosAplicados:
   * fechas que realmente consulta
   * useReportes.
   */

  const periodoInicial = {
    fechaDesde:
      obtenerPrimerDiaMes(),

    fechaHasta:
      obtenerFechaActual(),
  };

  const [
    filtrosEdicion,
    setFiltrosEdicion,
  ] =
    useState(
      periodoInicial,
    );

  const [
    filtrosAplicados,
    setFiltrosAplicados,
  ] =
    useState(
      periodoInicial,
    );

  const [
    errorPeriodo,
    setErrorPeriodo,
  ] =
    useState(
      "",
    );

  const [
    tabActual,
    setTabActual,
  ] =
    useState(
      0,
    );

  /*
   * =================================
   * HOOK REPORTES
   * =================================
   */

  const {
    resumenVentas,
    ventasPorDia,
    productosMasVendidos,
    ventasPorMetodoPago,
    resumenStock,
    productosStock,

    cargandoReportes,
    actualizandoReportes,
    errorReportes,

    recargarReportes,
  } =
    useReportes(
      filtrosAplicados,
    );

  /*
   * =================================
   * CAMBIAR FECHAS
   * =================================
   */

  const cambiarFiltro =
    (
      event,
    ) => {
      const {
        name,
        value,
      } =
        event.target;

      setFiltrosEdicion(
        (
          actuales,
        ) => ({
          ...actuales,

          [name]:
            value,
        }),
      );

      if (
        errorPeriodo
      ) {
        setErrorPeriodo(
          "",
        );
      }
    };

  /*
   * =================================
   * VALIDAR PERÍODO
   * =================================
   */

  const validarPeriodo =
    (
      filtros,
    ) => {
      const {
        fechaDesde,
        fechaHasta,
      } =
        filtros;

      if (
        fechaDesde &&
        fechaHasta &&
        fechaDesde >
          fechaHasta
      ) {
        setErrorPeriodo(
          "La fecha Desde no puede ser posterior a la fecha Hasta.",
        );

        return false;
      }

      setErrorPeriodo(
        "",
      );

      return true;
    };

  /*
   * =================================
   * APLICAR FILTROS
   * =================================
   */

  const aplicarFiltros =
    () => {
      if (
        !validarPeriodo(
          filtrosEdicion,
        )
      ) {
        return;
      }

      setFiltrosAplicados({
        ...filtrosEdicion,
      });
    };

  /*
   * =================================
   * MES ACTUAL
   * =================================
   */

  const aplicarMesActual =
    () => {
      const periodo = {
        fechaDesde:
          obtenerPrimerDiaMes(),

        fechaHasta:
          obtenerFechaActual(),
      };

      setFiltrosEdicion(
        periodo,
      );

      setFiltrosAplicados(
        periodo,
      );

      setErrorPeriodo(
        "",
      );
    };

  /*
   * =================================
   * TODO EL PERÍODO
   * =================================
   */

  const aplicarTodoPeriodo =
    () => {
      const periodo = {
        fechaDesde:
          "",

        fechaHasta:
          "",
      };

      setFiltrosEdicion(
        periodo,
      );

      setFiltrosAplicados(
        periodo,
      );

      setErrorPeriodo(
        "",
      );
    };

  /*
   * =================================
   * MARGEN
   * =================================
   */

  const porcentajeMargen =
    useMemo(
      () => {
        const totalVentas =
          Number(
            resumenVentas
              .total_ventas ??
              0,
          );

        const ganancia =
          Number(
            resumenVentas
              .ganancia_estimada ??
              0,
          );

        if (
          totalVentas <=
          0
        ) {
          return 0;
        }

        return (
          (
            ganancia /
            totalVentas
          ) *
          100
        );
      },
      [
        resumenVentas,
      ],
    );

  /*
   * =================================
   * COLUMNAS INVENTARIO
   * =================================
   */

  const columnasStock = [
    {
      field:
        "producto_codigo",

      headerName:
        "Código",

      width:
        130,
    },

    {
      field:
        "producto_nombre",

      headerName:
        "Producto",

      minWidth:
        220,

      flex:
        1,
    },

    {
      field:
        "variante",

      headerName:
        "Variante",

      width:
        160,

      valueGetter:
        (
          _,
          row,
        ) =>
          obtenerVariante(
            row,
          ),
    },

    {
      field:
        "codigo_barras",

      headerName:
        "Código de barras",

      width:
        170,

      valueGetter:
        (
          value,
          row,
        ) =>
          Number(
            row?.usa_variantes ??
              1,
          ) ===
          0
            ? "-"
            : value ||
              "-",
    },

    {
      field:
        "stock_actual",

      headerName:
        "Stock",

      width:
        110,

      align:
        "center",

      headerAlign:
        "center",

      renderCell:
        (
          params,
        ) => {
          const stock =
            Number(
              params
                .row
                .stock_actual ??
                0,
            );

          const minimo =
            Number(
              params
                .row
                .stock_minimo ??
                0,
            );

          return (
            <Chip
              size="small"
              label={formatearCantidad(
                stock,
              )}
              color={
                stock <=
                minimo
                  ? "error"
                  : "success"
              }
              variant={
                stock <=
                minimo
                  ? "filled"
                  : "outlined"
              }
            />
          );
        },
    },

    {
      field:
        "stock_minimo",

      headerName:
        "Mínimo",

      width:
        110,

      align:
        "center",

      headerAlign:
        "center",

      valueFormatter:
        (
          value,
        ) =>
          formatearCantidad(
            value,
          ),
    },

    {
      field:
        "precio_costo",

      headerName:
        "Costo",

      width:
        130,

      align:
        "right",

      headerAlign:
        "right",

      valueFormatter:
        (
          value,
        ) =>
          formatearMoneda(
            value,
          ),
    },

    {
      field:
        "precio_venta",

      headerName:
        "Venta",

      width:
        130,

      align:
        "right",

      headerAlign:
        "right",

      valueFormatter:
        (
          value,
        ) =>
          formatearMoneda(
            value,
          ),
    },

    {
      field:
        "valor_costo",

      headerName:
        "Valor a costo",

      width:
        150,

      align:
        "right",

      headerAlign:
        "right",

      valueFormatter:
        (
          value,
        ) =>
          formatearMoneda(
            value,
          ),
    },

    {
      field:
        "valor_venta",

      headerName:
        "Valor a venta",

      width:
        150,

      align:
        "right",

      headerAlign:
        "right",

      valueFormatter:
        (
          value,
        ) =>
          formatearMoneda(
            value,
          ),
    },
  ];

  /*
   * =================================
   * CARGANDO
   * =================================
   */

  if (
    cargandoReportes
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
      {/* ======================= */}
      {/* ENCABEZADO */}
      {/* ======================= */}

      <Stack
        direction={{
          xs:
            "column",

          sm:
            "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs:
            "stretch",

          sm:
            "center",
        }}
        spacing={
          2
        }
        sx={{
          mb:
            3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight:
                700,
            }}
          >
            Reportes
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt:
                0.5,
            }}
          >
            Analizá ventas, rentabilidad y valorización del inventario.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            actualizandoReportes ? (
              <CircularProgress
                size={
                  17
                }
              />
            ) : (
              <RefreshIcon />
            )
          }
          onClick={
            recargarReportes
          }
          disabled={
            actualizandoReportes
          }
        >
          {actualizandoReportes
            ? "Actualizando..."
            : "Actualizar"}
        </Button>
      </Stack>

      {/* ======================= */}
      {/* ERRORES */}
      {/* ======================= */}

      {errorReportes && (
        <Alert
          severity="error"
          sx={{
            mb:
              3,
          }}
        >
          {errorReportes
            ?.response
            ?.data
            ?.message ||
            errorReportes
              ?.response
              ?.data
              ?.error ||
            errorReportes
              ?.message ||
            "No se pudieron cargar los reportes."}
        </Alert>
      )}

      {/* ======================= */}
      {/* FILTROS */}
      {/* ======================= */}

      <Card
        sx={{
          mb:
            3,

          overflow:
            "visible",
        }}
      >
        <CardContent
          sx={{
            overflow:
              "visible",
          }}
        >
          <Grid
            container
            spacing={
              2
            }
            sx={{
              alignItems:
                "center",
            }}
          >
            {/* DESDE */}

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
                type="date"
                label="Desde"
                name="fechaDesde"
                value={
                  filtrosEdicion.fechaDesde
                }
                onChange={
                  cambiarFiltro
                }
                disabled={
                  actualizandoReportes
                }
                slotProps={{
                  inputLabel: {
                    shrink:
                      true,
                  },

                  htmlInput: {
                    max:
                      filtrosEdicion.fechaHasta ||
                      undefined,

                    style: {
                      minWidth:
                        0,
                    },
                  },
                }}
                sx={{
                  minWidth:
                    0,

                  "& input[type='date']":
                    {
                      minWidth:
                        0,

                      width:
                        "100%",

                      boxSizing:
                        "border-box",
                    },
                }}
              />
            </Grid>

            {/* HASTA */}

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
                type="date"
                label="Hasta"
                name="fechaHasta"
                value={
                  filtrosEdicion.fechaHasta
                }
                onChange={
                  cambiarFiltro
                }
                disabled={
                  actualizandoReportes
                }
                slotProps={{
                  inputLabel: {
                    shrink:
                      true,
                  },

                  htmlInput: {
                    min:
                      filtrosEdicion.fechaDesde ||
                      undefined,

                    style: {
                      minWidth:
                        0,
                    },
                  },
                }}
                sx={{
                  minWidth:
                    0,

                  "& input[type='date']":
                    {
                      minWidth:
                        0,

                      width:
                        "100%",

                      boxSizing:
                        "border-box",
                    },
                }}
              />
            </Grid>

            {/* BOTONES */}

            <Grid
              size={{
                xs:
                  12,

                md:
                  6,
              }}
            >
              <Stack
                direction={{
                  xs:
                    "column",

                  sm:
                    "row",
                }}
                spacing={
                  1
                }
                sx={{
                  width:
                    "100%",

                  justifyContent:
                    "flex-end",

                  alignItems:
                    {
                      xs:
                        "stretch",

                      sm:
                        "center",
                    },

                  flexWrap:
                    "wrap",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={
                    aplicarTodoPeriodo
                  }
                  disabled={
                    actualizandoReportes
                  }
                  sx={{
                    minWidth:
                      140,

                    height:
                      42,
                  }}
                >
                  Todo el período
                </Button>

                <Button
                  variant="outlined"
                  onClick={
                    aplicarMesActual
                  }
                  disabled={
                    actualizandoReportes
                  }
                  sx={{
                    minWidth:
                      120,

                    height:
                      42,
                  }}
                >
                  Mes actual
                </Button>

                <Button
                  variant="contained"
                  onClick={
                    aplicarFiltros
                  }
                  disabled={
                    actualizandoReportes
                  }
                  sx={{
                    minWidth:
                      140,

                    height:
                      42,
                  }}
                >
                  Aplicar filtros
                </Button>
              </Stack>
            </Grid>

            {/* ERROR FECHAS */}

            {errorPeriodo && (
              <Grid
                size={
                  12
                }
              >
                <Alert
                  severity="warning"
                >
                  {
                    errorPeriodo
                  }
                </Alert>
              </Grid>
            )}

            {/* PERÍODO ACTIVO */}

            <Grid
              size={
                12
              }
            >
              <Box
                sx={{
                  pt:
                    0.5,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    1,

                  flexWrap:
                    "wrap",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight:
                      600,
                  }}
                >
                  Período aplicado:
                </Typography>

                <Chip
                  size="small"
                  variant="outlined"
                  color="primary"
                  label={obtenerTextoPeriodo(
                    filtrosAplicados,
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ======================= */}
      {/* MÉTRICAS */}
      {/* ======================= */}

      <Grid
        container
        spacing={
          3
        }
      >
        <Grid
          size={{
            xs:
              12,

            sm:
              6,

            lg:
              3,
          }}
        >
          <StatCard
            title="Total vendido"
            value={formatearMoneda(
              resumenVentas.total_ventas,
            )}
            icon={
              <AttachMoneyIcon />
            }
            color="success.main"
          />
        </Grid>

        <Grid
          size={{
            xs:
              12,

            sm:
              6,

            lg:
              3,
          }}
        >
          <StatCard
            title="Cantidad de ventas"
            value={Number(
              resumenVentas.cantidad_ventas ??
                0,
            ).toLocaleString(
              "es-AR",
            )}
            icon={
              <PointOfSaleIcon />
            }
            color="primary.main"
          />
        </Grid>

        <Grid
          size={{
            xs:
              12,

            sm:
              6,

            lg:
              3,
          }}
        >
          <StatCard
            title="Cantidad vendida"
            value={formatearCantidad(
              resumenVentas.unidades_vendidas,
            )}
            icon={
              <ShoppingBagIcon />
            }
            color="info.main"
          />
        </Grid>

        <Grid
          size={{
            xs:
              12,

            sm:
              6,

            lg:
              3,
          }}
        >
          <StatCard
            title="Ganancia estimada"
            value={formatearMoneda(
              resumenVentas.ganancia_estimada,
            )}
            icon={
              <TrendingUpIcon />
            }
            color={
              Number(
                resumenVentas.ganancia_estimada ??
                  0,
              ) >=
              0
                ? "success.main"
                : "error.main"
            }
          />
        </Grid>

        <Grid
          size={{
            xs:
              12,

            sm:
              6,

            lg:
              3,
          }}
        >
          <StatCard
            title="Costo estimado"
            value={formatearMoneda(
              resumenVentas.costo_estimado,
            )}
            icon={
              <SavingsIcon />
            }
            color="warning.main"
          />
        </Grid>

        <Grid
          size={{
            xs:
              12,

            sm:
              6,

            lg:
              3,
          }}
        >
          <StatCard
            title="Descuentos"
            value={formatearMoneda(
              resumenVentas.descuentos,
            )}
            icon={
              <AttachMoneyIcon />
            }
            color="error.main"
          />
        </Grid>

        <Grid
          size={{
            xs:
              12,

            sm:
              6,

            lg:
              3,
          }}
        >
          <StatCard
            title="Margen estimado"
            value={`${porcentajeMargen.toFixed(
              1,
            )} %`}
            icon={
              <TrendingUpIcon />
            }
            color="success.main"
          />
        </Grid>

        <Grid
          size={{
            xs:
              12,

            sm:
              6,

            lg:
              3,
          }}
        >
          <StatCard
            title="Valor del stock"
            value={formatearMoneda(
              resumenStock.valor_costo,
            )}
            icon={
              <Inventory2Icon />
            }
            color="primary.main"
          />
        </Grid>
      </Grid>

      {/* ======================= */}
      {/* TABS */}
      {/* ======================= */}

      <Card
        sx={{
          mt:
            3,
        }}
      >
        <CardContent>
          <Tabs
            value={
              tabActual
            }
            onChange={(
              _,
              nuevoValor,
            ) =>
              setTabActual(
                nuevoValor,
              )
            }
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom:
                1,

              borderColor:
                "divider",
            }}
          >
            <Tab
              label="Ventas por día"
            />

            <Tab
              label="Productos más vendidos"
            />

            <Tab
              label="Métodos de pago"
            />

            <Tab
              label="Inventario valorizado"
            />
          </Tabs>

          {/* ======================= */}
          {/* VENTAS POR DÍA */}
          {/* ======================= */}

          <TabPanel
            value={
              tabActual
            }
            index={
              0
            }
          >
            <Stack
              direction={{
                xs:
                  "column",

                sm:
                  "row",
              }}
              spacing={
                1
              }
              sx={{
                mb:
                  3,

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
                  variant="h6"
                  fontWeight="bold"
                >
                  Evolución de ventas
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt:
                      0.5,
                  }}
                >
                  Facturación diaria dentro del período seleccionado.
                </Typography>
              </Box>

              <Chip
                size="small"
                variant="outlined"
                label={obtenerTextoPeriodo(
                  filtrosAplicados,
                )}
              />
            </Stack>

            <GraficoVentasPorDia
              datos={
                ventasPorDia
              }
            />
          </TabPanel>

          {/* ======================= */}
          {/* PRODUCTOS MÁS VENDIDOS */}
          {/* ======================= */}

          <TabPanel
            value={
              tabActual
            }
            index={
              1
            }
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                mb:
                  0.5,
              }}
            >
              Productos más vendidos
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb:
                  3,
              }}
            >
              Ranking por cantidad vendida durante{" "}
              {obtenerTextoPeriodo(
                filtrosAplicados,
              ).toLowerCase()}
              .
            </Typography>

            {productosMasVendidos.length ===
            0 ? (
              <Alert
                severity="info"
              >
                No hay productos vendidos en el período seleccionado.
              </Alert>
            ) : (
              <Stack
                spacing={
                  2
                }
                divider={
                  <Divider
                    flexItem
                  />
                }
              >
                {productosMasVendidos.map(
                  (
                    producto,
                    indice,
                  ) => (
                    <Stack
                      key={
                        producto.producto_id
                      }
                      direction={{
                        xs:
                          "column",

                        sm:
                          "row",
                      }}
                      justifyContent="space-between"
                      alignItems={{
                        xs:
                          "flex-start",

                        sm:
                          "center",
                      }}
                      spacing={
                        2
                      }
                    >
                      <Stack
                        direction="row"
                        spacing={
                          2
                        }
                        alignItems="center"
                      >
                        <Chip
                          label={
                            indice +
                            1
                          }
                          color={
                            indice <
                            3
                              ? "primary"
                              : "default"
                          }
                        />

                        <Box>
                          <Typography
                            fontWeight="bold"
                          >
                            {
                              producto.producto_nombre
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {
                              producto.producto_codigo
                            }
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={
                          3
                        }
                      >
                        <Box
                          textAlign="right"
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Cantidad
                          </Typography>

                          <Typography
                            fontWeight="bold"
                          >
                            {formatearCantidad(
                              producto.unidades_vendidas,
                            )}
                          </Typography>
                        </Box>

                        <Box
                          textAlign="right"
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Total
                          </Typography>

                          <Typography
                            fontWeight="bold"
                          >
                            {formatearMoneda(
                              producto.total_vendido,
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  ),
                )}
              </Stack>
            )}
          </TabPanel>

          {/* ======================= */}
          {/* MÉTODOS DE PAGO */}
          {/* ======================= */}

          <TabPanel
            value={
              tabActual
            }
            index={
              2
            }
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                mb:
                  0.5,
              }}
            >
              Ventas por método de pago
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb:
                  3,
              }}
            >
              Distribución de cobros en el período seleccionado.
            </Typography>

            {ventasPorMetodoPago.length ===
            0 ? (
              <Alert
                severity="info"
              >
                No hay ventas registradas para mostrar.
              </Alert>
            ) : (
              <Grid
                container
                spacing={
                  2
                }
              >
                {ventasPorMetodoPago.map(
                  (
                    metodo,
                  ) => {
                    const configuracion =
                      METODOS_PAGO[
                        metodo.metodo_pago
                      ] ?? {
                        etiqueta:
                          metodo.metodo_pago,

                        color:
                          "default",
                      };

                    return (
                      <Grid
                        size={{
                          xs:
                            12,

                          sm:
                            6,

                          lg:
                            3,
                        }}
                        key={
                          metodo.metodo_pago
                        }
                      >
                        <Card
                          variant="outlined"
                          sx={{
                            height:
                              "100%",
                          }}
                        >
                          <CardContent>
                            <Chip
                              label={
                                configuracion.etiqueta
                              }
                              color={
                                configuracion.color
                              }
                              size="small"
                            />

                            <Typography
                              variant="h5"
                              fontWeight="bold"
                              sx={{
                                mt:
                                  2,
                              }}
                            >
                              {formatearMoneda(
                                metodo.total,
                              )}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt:
                                  0.5,
                              }}
                            >
                              {Number(
                                metodo.cantidad_ventas ??
                                  0,
                              )}{" "}
                              ventas
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  },
                )}
              </Grid>
            )}
          </TabPanel>

          {/* ======================= */}
          {/* INVENTARIO */}
          {/* ======================= */}

          <TabPanel
            value={
              tabActual
            }
            index={
              3
            }
          >
            <Stack
              direction={{
                xs:
                  "column",

                sm:
                  "row",
              }}
              justifyContent="space-between"
              alignItems={{
                xs:
                  "stretch",

                sm:
                  "center",
              }}
              spacing={
                2
              }
              sx={{
                mb:
                  3,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                >
                  Inventario valorizado
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Valor actual de cada producto y variante a costo y precio de venta.
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={
                  1
                }
                flexWrap="wrap"
                useFlexGap
              >
                <Chip
                  icon={
                    <Inventory2Icon />
                  }
                  label={`${formatearCantidad(
                    resumenStock.unidades,
                  )} de stock`}
                  color="primary"
                  variant="outlined"
                />

                <Chip
                  icon={
                    <WarningAmberIcon />
                  }
                  label={`${Number(
                    resumenStock.stock_bajo ??
                      0,
                  )} con stock bajo`}
                  color={
                    Number(
                      resumenStock.stock_bajo ??
                        0,
                    ) >
                    0
                      ? "error"
                      : "success"
                  }
                  variant="outlined"
                />
              </Stack>
            </Stack>

            {productosStock.length ===
            0 ? (
              <Alert
                severity="info"
              >
                No hay productos registrados en el inventario.
              </Alert>
            ) : (
              <DataGrid
                rows={
                  productosStock
                }
                columns={
                  columnasStock
                }
                getRowId={(
                  row,
                ) =>
                  row.variante_id
                }
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[
                  10,
                  25,
                  50,
                  100,
                ]}
                initialState={{
                  pagination:
                    {
                      paginationModel:
                        {
                          page:
                            0,

                          pageSize:
                            10,
                        },
                    },
                }}
                sx={{
                  border:
                    0,
                }}
              />
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}