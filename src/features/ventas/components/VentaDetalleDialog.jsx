import {
  useEffect,
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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import PrintIcon from "@mui/icons-material/Print";

import {
  obtenerVentaPorId,
} from "../ventasService";

import TicketVenta from "./TicketVenta";

import "./ticket.css";

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

function formatearFecha(valor) {
  if (!valor) {
    return "-";
  }

  const fecha =
    new Date(valor);

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
      timeStyle: "short",
    },
  ).format(fecha);
}

function obtenerUsuario(
  venta,
) {
  const nombreCompleto = [
    venta?.usuario_nombre,
    venta?.usuario_apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    nombreCompleto ||
    "Sistema"
  );
}

function obtenerVariante(
  item,
) {
  const partes = [
    item.color,
    item.talle,
  ].filter(Boolean);

  if (
    partes.length > 0
  ) {
    return partes.join(
      " / ",
    );
  }

  return "Sin variante";
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

export default function VentaDetalleDialog({
  open,
  ventaId,
  onClose,
}) {
  const [
    venta,
    setVenta,
  ] = useState(null);

  const [
    cargando,
    setCargando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (
      !open ||
      !ventaId
    ) {
      return;
    }

    let activo = true;

    const cargarVenta =
      async () => {
        setCargando(
          true,
        );

        setError("");

        setVenta(null);

        try {
          const datos =
            await obtenerVentaPorId(
              ventaId,
            );

          if (activo) {
            setVenta(
              datos,
            );
          }
        } catch (
          errorPeticion
        ) {
          if (activo) {
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
                "No se pudo cargar el detalle de la venta.",
            );
          }
        } finally {
          if (activo) {
            setCargando(
              false,
            );
          }
        }
      };

    cargarVenta();

    return () => {
      activo = false;
    };
  }, [
    open,
    ventaId,
  ]);

  useEffect(() => {
    if (!open) {
      setVenta(null);

      setError("");

      setCargando(
        false,
      );
    }
  }, [open]);

  const cerrar = () => {
    if (!cargando) {
      onClose?.();
    }
  };

  const imprimirTicket =
    () => {
      if (!venta) {
        return;
      }

      /*
       * Permitimos que React termine
       * de renderizar el TicketVenta
       * antes de abrir impresión.
       */
      requestAnimationFrame(
        () => {
          window.print();
        },
      );
    };

  return (
    <>
      <Dialog
        open={open}
        onClose={cerrar}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          Detalle de la venta
          {ventaId
            ? ` #${ventaId}`
            : ""}
        </DialogTitle>

        <DialogContent dividers>
          {cargando && (
            <Box
              sx={{
                minHeight:
                  320,

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
            venta && (
              <Stack spacing={3}>
                {/* ================= */}
                {/* DATOS GENERALES */}
                {/* ================= */}

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                  }}
                >
                  <Stack
                    direction={{
                      xs:
                        "column",

                      md:
                        "row",
                    }}
                    spacing={3}
                    divider={
                      <Divider
                        orientation="vertical"
                        flexItem
                      />
                    }
                  >
                    <Box
                      sx={{
                        flex: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Cliente
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight:
                            700,
                        }}
                      >
                        {venta.cliente ||
                          "Consumidor final"}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Fecha
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight:
                            700,
                        }}
                      >
                        {formatearFecha(
                          venta.fecha,
                        )}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Método de pago
                      </Typography>

                      <Box
                        sx={{
                          mt: 0.5,
                        }}
                      >
                        <Chip
                          size="small"
                          label={obtenerEtiquetaMetodoPago(
                            venta.metodo_pago,
                          )}
                          color={obtenerColorMetodoPago(
                            venta.metodo_pago,
                          )}
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Usuario
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight:
                            700,
                        }}
                      >
                        {obtenerUsuario(
                          venta,
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* ================= */}
                {/* DATOS CLIENTE */}
                {/* ================= */}

                {(venta.cliente_telefono ||
                  venta.cliente_email) && (
                  <Alert severity="info">
                    {venta.cliente_telefono && (
                      <Typography variant="body2">
                        Teléfono:{" "}
                        {
                          venta.cliente_telefono
                        }
                      </Typography>
                    )}

                    {venta.cliente_email && (
                      <Typography variant="body2">
                        Email:{" "}
                        {
                          venta.cliente_email
                        }
                      </Typography>
                    )}
                  </Alert>
                )}

                {/* ================= */}
                {/* PRODUCTOS */}
                {/* ================= */}

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight:
                        700,

                      mb: 2,
                    }}
                  >
                    Productos vendidos
                  </Typography>

                  {!Array.isArray(
                    venta.productos,
                  ) ||
                  venta.productos
                    .length ===
                    0 ? (
                    <Alert severity="info">
                      Esta venta no tiene productos asociados.
                    </Alert>
                  ) : (
                    <TableContainer
                      component={
                        Paper
                      }
                      variant="outlined"
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              Código
                            </TableCell>

                            <TableCell>
                              Producto
                            </TableCell>

                            <TableCell>
                              Variante
                            </TableCell>

                            <TableCell>
                              Código de barras
                            </TableCell>

                            <TableCell align="right">
                              Cantidad
                            </TableCell>

                            <TableCell align="right">
                              Precio unitario
                            </TableCell>

                            <TableCell align="right">
                              Subtotal
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {venta.productos.map(
                            (
                              item,
                            ) => (
                              <TableRow
                                key={
                                  item.id
                                }
                              >
                                <TableCell>
                                  {item.producto_codigo ||
                                    "-"}
                                </TableCell>

                                <TableCell>
                                  <Typography
                                    sx={{
                                      fontWeight:
                                        500,
                                    }}
                                  >
                                    {item.producto_nombre ||
                                      "-"}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  {obtenerVariante(
                                    item,
                                  )}
                                </TableCell>

                                <TableCell>
                                  {item.codigo_barras ||
                                    "-"}
                                </TableCell>

                                <TableCell align="right">
                                  {Number(
                                    item.cantidad ??
                                      0,
                                  )}
                                </TableCell>

                                <TableCell align="right">
                                  {formatearMoneda(
                                    item.precio_unitario,
                                  )}
                                </TableCell>

                                <TableCell
                                  align="right"
                                  sx={{
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  {formatearMoneda(
                                    item.subtotal,
                                  )}
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>

                {/* ================= */}
                {/* TOTAL */}
                {/* ================= */}

                <Stack
                  direction="row"
                  sx={{
                    justifyContent:
                      "flex-end",
                  }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      px: 3,
                      py: 2,
                      minWidth:
                        300,
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
                            venta.subtotal,
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
                            venta.descuento,
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
                            venta.total,
                          )}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Stack>
              </Stack>
            )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,

            justifyContent:
              "space-between",
          }}
        >
          <Button
            variant="outlined"
            onClick={cerrar}
            disabled={
              cargando
            }
          >
            Cerrar
          </Button>

          <Button
            variant="contained"
            startIcon={
              <PrintIcon />
            }
            onClick={
              imprimirTicket
            }
            disabled={
              cargando ||
              !venta
            }
          >
            Imprimir ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================= */}
      {/* VERSIÓN PARA IMPRESIÓN */}
      {/* ======================= */}

      {venta && (
        <TicketVenta
          venta={venta}
        />
      )}
    </>
  );
}