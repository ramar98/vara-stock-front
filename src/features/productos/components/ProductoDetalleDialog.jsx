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

export default function ProductoDetalleDialog({
  open,
  producto,
  colores = [],
  talles = [],

  esAdministrador = false,
  esVendedor = false,

  /*
   * 0 = Información
   * 1 = Variantes
   * 2 = Imágenes
   * 3 = Movimientos
   */
  tabInicial = 0,

  onClose,
  onEditar,
  onNotificar,
}) {
  const [
    tabActual,
    setTabActual,
  ] = useState(
    tabInicial,
  );

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
   * ==================================
   * CARGAR PRODUCTO
   * ==================================
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

        /*
         * IMPORTANTE:
         * antes estaba:
         *
         * setTabActual(0)
         *
         * y siempre abría Información.
         *
         * Ahora respetamos la pestaña
         * solicitada desde ProductoPage.
         */
        setTabActual(
          tabInicial,
        );

        try {
          const respuesta =
            await api.get(
              `/productos/${productoId}`,
            );

          const datos =
            obtenerProductoRespuesta(
              respuesta,
            );

          setDetalle(
            datos,
          );
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
    tabInicial,
  ]);

  /*
   * ==================================
   * LIMPIAR AL CERRAR
   * ==================================
   */

  useEffect(() => {
    if (!open) {
      setDetalle(null);

      setError("");

      setTabActual(0);
    }
  }, [open]);

  const productoMostrado =
    detalle || producto;

  /*
   * ==================================
   * CAMBIAR PESTAÑA
   * ==================================
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
   * ==================================
   * CERRAR
   * ==================================
   */

  const cerrar = () => {
    if (!cargando) {
      onClose?.();
    }
  };

  /*
   * ==================================
   * EDITAR DATOS GENERALES
   * ==================================
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

  return (
    <Dialog
      open={open}
      onClose={cerrar}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          maxHeight:
            "92vh",

          display:
            "flex",

          flexDirection:
            "column",

          overflow:
            "hidden",

          borderRadius: 3,
        },
      }}
    >
      {/* ======================= */}
      {/* TITULO */}
      {/* ======================= */}

      <DialogTitle
        sx={{
          flexShrink: 0,
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

      {/* ======================= */}
      {/* CONTENIDO */}
      {/* ======================= */}

      <DialogContent
        sx={{
          flex:
            "1 1 auto",

          overflowY:
            "auto",

          overflowX:
            "hidden",
        }}
      >
        {cargando && (
          <Box
            sx={{
              minHeight:
                300,

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
        )}

        {!cargando &&
          error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

        {!cargando &&
          !error &&
          productoMostrado && (
            <>
              {/* ================= */}
              {/* TABS */}
              {/* ================= */}

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
                <Tab label="Información" />

                <Tab label="Variantes" />

                <Tab label="Imágenes" />

                {esAdministrador && (
                  <Tab label="Movimientos" />
                )}
              </Tabs>

              {/* ================= */}
              {/* INFORMACIÓN */}
              {/* ================= */}

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
                  {/* PRIORIDAD */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <CampoDetalle
                      etiqueta="Precio de venta"
                      valor={
                        productoMostrado
                          .precio_venta !=
                        null
                          ? new Intl.NumberFormat(
                              "es-AR",
                              {
                                style:
                                  "currency",

                                currency:
                                  "ARS",

                                maximumFractionDigits:
                                  2,
                              },
                            ).format(
                              Number(
                                productoMostrado
                                  .precio_venta ??
                                  0,
                              ),
                            )
                          : "-"
                      }
                    />
                  </Grid>

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
                        0
                      }
                    />
                  </Grid>

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

                  {/* DATOS GENERALES */}

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

              {/* ================= */}
              {/* VARIANTES */}
              {/* ================= */}

              <TabPanel
                value={
                  tabActual
                }
                index={1}
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

              {/* ================= */}
              {/* IMÁGENES */}
              {/* ================= */}

              <TabPanel
                value={
                  tabActual
                }
                index={2}
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

              {/* ================= */}
              {/* MOVIMIENTOS */}
              {/* SOLO ADMIN */}
              {/* ================= */}

              {esAdministrador && (
                <TabPanel
                  value={
                    tabActual
                  }
                  index={3}
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

      {/* ======================= */}
      {/* ACCIONES */}
      {/* ======================= */}

      <DialogActions
        sx={{
          px: 3,

          py: 2,

          flexShrink: 0,

          justifyContent:
            "flex-end",

          gap: 1,

          borderTop:
            "1px solid",

          borderColor:
            "divider",

          backgroundColor:
            "background.paper",
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
          tabActual ===
            0 && (
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