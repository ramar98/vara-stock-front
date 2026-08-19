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
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import api from "../../../services/api";

import VariantesPanel from "./VariantesPanel";
import ImagenesPanel from "./ImagenesPanel";
import MovimientosPanel from "./MovimientosPanel";

function TabPanel({
  children,
  value,
  index,
}) {
  if (value !== index) {
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

function CampoDetalle({
  etiqueta,
  valor,
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mb: 0.4,
          fontWeight: 600,
        }}
      >
        {etiqueta}
      </Typography>

      <Typography
        variant="body1"
        fontWeight={500}
      >
        {valor ?? "-"}
      </Typography>
    </Box>
  );
}

function obtenerProductoRespuesta(
  respuesta,
) {
  if (
    respuesta?.data?.data
  ) {
    return respuesta.data.data;
  }

  if (respuesta?.data) {
    return respuesta.data;
  }

  return null;
}

function formatearMoneda(valor) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return "-";
  }

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    },
  ).format(
    Number(valor),
  );
}

export default function ProductoDetalleDialog({
  open,
  producto,
  colores = [],
  talles = [],

  esAdministrador = false,
  esVendedor = false,

  onClose,
  onEditar,
  onNotificar,
}) {
  const [
    tabActual,
    setTabActual,
  ] = useState(0);

  const [
    detalle,
    setDetalle,
  ] = useState(null);

  const [
    cargando,
    setCargando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const productoId =
    producto?.id;

  /*
   * =====================================
   * CARGAR DETALLE
   * =====================================
   */

  useEffect(() => {
    if (
      !open ||
      !productoId
    ) {
      return;
    }

    const cargarDetalle =
      async () => {
        setCargando(true);

        setError("");

        setTabActual(0);

        try {
          const respuesta =
            await api.get(
              `/productos/${productoId}`,
            );

          const datos =
            obtenerProductoRespuesta(
              respuesta,
            );

          setDetalle(datos);
        } catch (
          errorPeticion
        ) {
          setError(
            errorPeticion
              ?.response
              ?.data
              ?.message ||
            errorPeticion
              ?.response
              ?.data
              ?.error ||
            errorPeticion
              ?.message ||
            "No se pudo cargar el producto.",
          );
        } finally {
          setCargando(
            false,
          );
        }
      };

    cargarDetalle();
  }, [
    open,
    productoId,
  ]);

  /*
   * =====================================
   * LIMPIAR AL CERRAR
   * =====================================
   */

  useEffect(() => {
    if (!open) {
      setDetalle(null);

      setError("");

      setTabActual(0);
    }
  }, [open]);

  /*
   * =====================================
   * PRODUCTO A MOSTRAR
   * =====================================
   */

  const productoMostrado =
    detalle || producto;

  /*
   * =====================================
   * TIPO DE PRODUCTO
   * =====================================
   */

  const usaVariantes =
    Number(
      productoMostrado
        ?.usa_variantes ??
        1,
    ) === 1;

  /*
   * =====================================
   * ÍNDICES DE PESTAÑAS
   * =====================================
   *
   * CON VARIANTES
   *
   * 0 Información
   * 1 Variantes
   * 2 Imágenes
   * 3 Movimientos
   *
   * SIN VARIANTES
   *
   * 0 Información
   * 1 Imágenes
   * 2 Movimientos
   */

  const indiceVariantes =
    usaVariantes
      ? 1
      : null;

  const indiceImagenes =
    usaVariantes
      ? 2
      : 1;

  const indiceMovimientos =
    usaVariantes
      ? 3
      : 2;

  /*
   * =====================================
   * CAMBIAR TAB
   * =====================================
   */

  const cambiarTab = (
    event,
    nuevoValor,
  ) => {
    setTabActual(
      nuevoValor,
    );
  };

  /*
   * =====================================
   * CERRAR
   * =====================================
   */

  const cerrar = () => {
    if (!cargando) {
      onClose?.();
    }
  };

  /*
   * =====================================
   * EDITAR
   * =====================================
   */

  const editar = () => {
    if (
      !esAdministrador ||
      !productoMostrado
    ) {
      return;
    }

    onEditar?.(
      productoMostrado,
    );
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
      maxWidth="lg"
    >
      {/* ===================== */}
      {/* TÍTULO */}
      {/* ===================== */}

      <DialogTitle>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            {productoMostrado
              ?.nombre ||
              "Detalle del producto"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Código:{" "}
            {productoMostrado
              ?.codigo ||
              "-"}
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {/* ===================== */}
        {/* CARGANDO */}
        {/* ===================== */}

        {cargando && (
          <Box
            sx={{
              minHeight: 300,

              display: "flex",

              justifyContent:
                "center",

              alignItems:
                "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* ===================== */}
        {/* ERROR */}
        {/* ===================== */}

        {!cargando &&
          error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

        {/* ===================== */}
        {/* CONTENIDO */}
        {/* ===================== */}

        {!cargando &&
          !error &&
          productoMostrado && (
            <>
              {/* ===================== */}
              {/* PESTAÑAS */}
              {/* ===================== */}

              <Tabs
                value={
                  tabActual
                }
                onChange={
                  cambiarTab
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
                  label="Información"
                />

                {usaVariantes && (
                  <Tab
                    label="Variantes"
                  />
                )}

                <Tab
                  label="Imágenes"
                />

                {esAdministrador && (
                  <Tab
                    label="Movimientos"
                  />
                )}
              </Tabs>

              {/* ===================== */}
              {/* INFORMACIÓN */}
              {/* ===================== */}

              <TabPanel
                value={
                  tabActual
                }
                index={0}
              >
                <Grid
                  container
                  spacing={3}
                >
                  {/* ===================== */}
                  {/* PRECIO VENTA */}
                  {/* ===================== */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <CampoDetalle
                      etiqueta="Precio de venta"
                      valor={
                        usaVariantes
                          ? formatearMoneda(
                              productoMostrado
                                .precio_venta,
                            )
                          : formatearMoneda(
                              productoMostrado
                                .precio_venta_default,
                            )
                      }
                    />
                  </Grid>

                  {/* ===================== */}
                  {/* STOCK TOTAL */}
                  {/* ===================== */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <CampoDetalle
                      etiqueta="Stock total"
                      valor={
                        productoMostrado
                          .stock ??
                        (
                          Array.isArray(
                            productoMostrado
                              .variantes,
                          )
                            ? productoMostrado
                              .variantes
                              .reduce(
                                (
                                  total,
                                  variante,
                                ) =>
                                  total +
                                  Number(
                                    variante
                                      .stock_actual ??
                                      0,
                                  ),
                                0,
                              )
                            : 0
                        )
                      }
                    />
                  </Grid>

                  {/* ===================== */}
                  {/* TIPO PRODUCTO */}
                  {/* ===================== */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <CampoDetalle
                      etiqueta="Tipo de producto"
                      valor={
                        usaVariantes
                          ? "Con variantes"
                          : "Sin variantes"
                      }
                    />
                  </Grid>

                  {/* ===================== */}
                  {/* COSTO SOLO ADMIN */}
                  {/* ===================== */}

                  {esAdministrador && (
                    <Grid
                      size={{
                        xs: 12,
                        md: 4,
                      }}
                    >
                      <CampoDetalle
                        etiqueta={
                          usaVariantes
                            ? "Costo predeterminado"
                            : "Precio de costo"
                        }
                        valor={
                          formatearMoneda(
                            productoMostrado
                              .precio_costo_default,
                          )
                        }
                      />
                    </Grid>
                  )}

                  {/* ===================== */}
                  {/* PRECIO BASE VENTA */}
                  {/* SOLO CON VARIANTES */}
                  {/* ===================== */}

                  {usaVariantes && (
                    <Grid
                      size={{
                        xs: 12,
                        md: 4,
                      }}
                    >
                      <CampoDetalle
                        etiqueta="Venta predeterminada"
                        valor={
                          formatearMoneda(
                            productoMostrado
                              .precio_venta_default,
                          )
                        }
                      />
                    </Grid>
                  )}

                  {/* ===================== */}
                  {/* CANTIDAD VARIANTES */}
                  {/* SOLO PRODUCTOS CON */}
                  {/* VARIANTES */}
                  {/* ===================== */}

                  {usaVariantes && (
                    <Grid
                      size={{
                        xs: 12,
                        md: 4,
                      }}
                    >
                      <CampoDetalle
                        etiqueta="Variantes"
                        valor={
                          Array.isArray(
                            productoMostrado
                              .variantes,
                          )
                            ? productoMostrado
                              .variantes
                              .length
                            : Number(
                                productoMostrado
                                  .variantes ??
                                  0,
                              )
                        }
                      />
                    </Grid>
                  )}

                  {/* ===================== */}
                  {/* MENSAJE PRODUCTO */}
                  {/* SIMPLE */}
                  {/* ===================== */}

                  {!usaVariantes && (
                    <Grid
                      size={{
                        xs: 12,
                      }}
                    >
                      <Alert
                        severity="info"
                      >
                        Este producto no utiliza variantes. El stock,
                        los ingresos y las ventas se gestionan
                        directamente sobre el producto.
                      </Alert>
                    </Grid>
                  )}

                  {/* ===================== */}
                  {/* CÓDIGO */}
                  {/* ===================== */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <CampoDetalle
                      etiqueta="Código"
                      valor={
                        productoMostrado
                          .codigo
                      }
                    />
                  </Grid>

                  {/* ===================== */}
                  {/* NOMBRE */}
                  {/* ===================== */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 8,
                    }}
                  >
                    <CampoDetalle
                      etiqueta="Nombre"
                      valor={
                        productoMostrado
                          .nombre
                      }
                    />
                  </Grid>

                  {/* ===================== */}
                  {/* CATEGORÍA */}
                  {/* ===================== */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <CampoDetalle
                      etiqueta="Categoría"
                      valor={
                        productoMostrado
                          .categoria
                      }
                    />
                  </Grid>

                  {/* ===================== */}
                  {/* MARCA */}
                  {/* ===================== */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <CampoDetalle
                      etiqueta="Marca"
                      valor={
                        productoMostrado
                          .marca
                      }
                    />
                  </Grid>

                  {/* ===================== */}
                  {/* PROVEEDOR */}
                  {/* SOLO ADMIN */}
                  {/* ===================== */}

                  {esAdministrador && (
                    <Grid
                      size={{
                        xs: 12,
                        md: 4,
                      }}
                    >
                      <CampoDetalle
                        etiqueta="Proveedor"
                        valor={
                          productoMostrado
                            .proveedor
                        }
                      />
                    </Grid>
                  )}

                  {/* ===================== */}
                  {/* DESCRIPCIÓN */}
                  {/* ===================== */}

                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <CampoDetalle
                      etiqueta="Descripción"
                      valor={
                        productoMostrado
                          .descripcion
                      }
                    />
                  </Grid>

                  {/* ===================== */}
                  {/* ESTADO */}
                  {/* ===================== */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <CampoDetalle
                      etiqueta="Estado"
                      valor={
                        productoMostrado
                          .activo ===
                        false
                          ? "Inactivo"
                          : "Activo"
                      }
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* ===================== */}
              {/* VARIANTES */}
              {/* SOLO SI USA VARIANTES */}
              {/* ===================== */}

              {usaVariantes && (
                <TabPanel
                  value={
                    tabActual
                  }
                  index={
                    indiceVariantes
                  }
                >
                  <VariantesPanel
                    producto={
                      productoMostrado
                    }

                    colores={
                      colores
                    }

                    talles={
                      talles
                    }

                    esAdministrador={
                      esAdministrador
                    }

                    esVendedor={
                      esVendedor
                    }

                    onNotificar={
                      onNotificar
                    }
                  />
                </TabPanel>
              )}

              {/* ===================== */}
              {/* IMÁGENES */}
              {/* ===================== */}

              <TabPanel
                value={
                  tabActual
                }
                index={
                  indiceImagenes
                }
              >
                <ImagenesPanel
                  producto={
                    productoMostrado
                  }

                  esAdministrador={
                    esAdministrador
                  }

                  esVendedor={
                    esVendedor
                  }

                  onNotificar={
                    onNotificar
                  }
                />
              </TabPanel>

              {/* ===================== */}
              {/* MOVIMIENTOS */}
              {/* SOLO ADMINISTRADOR */}
              {/* ===================== */}

              {esAdministrador && (
                <TabPanel
                  value={
                    tabActual
                  }
                  index={
                    indiceMovimientos
                  }
                >
                  <MovimientosPanel
                    producto={
                      productoMostrado
                    }
                  />
                </TabPanel>
              )}
            </>
          )}
      </DialogContent>

      {/* ===================== */}
      {/* ACCIONES */}
      {/* ===================== */}

      <DialogActions
        sx={{
          px: 3,

          py: 2,

          justifyContent:
            "flex-end",

          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          onClick={
            cerrar
          }
          disabled={
            cargando
          }
        >
          Cerrar
        </Button>

        {esAdministrador &&
          tabActual === 0 && (
            <Button
              variant="contained"
              onClick={
                editar
              }
              disabled={
                cargando ||
                !productoMostrado
              }
            >
              Editar datos
            </Button>
          )}
      </DialogActions>
    </Dialog>
  );
}