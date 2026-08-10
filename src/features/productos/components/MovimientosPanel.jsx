import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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

import RefreshIcon from "@mui/icons-material/Refresh";

import useMovimientosProducto from "../hooks/useMovimientosProducto";

function formatearFecha(valor) {
  if (!valor) {
    return "-";
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(fecha);
}

function obtenerConfiguracionTipo(tipo) {
  const configuraciones = {
    INGRESO: {
      color: "success",
      etiqueta: "Ingreso",
      signo: "+",
    },

    VENTA: {
      color: "error",
      etiqueta: "Venta",
      signo: "-",
    },

    AJUSTE: {
      color: "warning",
      etiqueta: "Ajuste",
      signo: "",
    },

    DEVOLUCION: {
      color: "info",
      etiqueta: "Devolución",
      signo: "+",
    },
  };

  return (
    configuraciones[tipo] ?? {
      color: "default",
      etiqueta: tipo || "Movimiento",
      signo: "",
    }
  );
}

function obtenerUsuario(movimiento) {
  const nombreCompleto = [
    movimiento.usuario_nombre,
    movimiento.usuario_apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return nombreCompleto || "Sistema";
}

function obtenerVariante(movimiento) {
  const partes = [
    movimiento.color,
    movimiento.talle,
  ].filter(Boolean);

  if (partes.length > 0) {
    return partes.join(" / ");
  }

  return movimiento.codigo_barras || "-";
}

export default function MovimientosPanel({
  producto,
}) {
  const productoId = producto?.id;

  const {
    movimientos,
    cargandoMovimientos,
    actualizandoMovimientos,
    errorMovimientos,
    recargarMovimientos,
  } = useMovimientosProducto(productoId);

  if (!productoId) {
    return (
      <Alert severity="info">
        No se pudo identificar el producto.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        spacing={2}
        mb={2}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight="bold"
          >
            Movimientos de stock
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Historial de ingresos, ventas, devoluciones y ajustes.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            actualizandoMovimientos ? (
              <CircularProgress size={17} />
            ) : (
              <RefreshIcon />
            )
          }
          onClick={() => recargarMovimientos()}
          disabled={actualizandoMovimientos}
        >
          Actualizar
        </Button>
      </Stack>

      {cargandoMovimientos && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={250}
        >
          <CircularProgress />
        </Box>
      )}

      {!cargandoMovimientos &&
        errorMovimientos && (
          <Alert severity="error">
            {errorMovimientos?.response?.data
              ?.message ||
              errorMovimientos?.response?.data
                ?.error ||
              errorMovimientos?.message ||
              "No se pudieron cargar los movimientos."}
          </Alert>
        )}

      {!cargandoMovimientos &&
        !errorMovimientos &&
        movimientos.length === 0 && (
          <Alert severity="info">
            Este producto todavía no tiene movimientos de stock.
          </Alert>
        )}

      {!cargandoMovimientos &&
        !errorMovimientos &&
        movimientos.length > 0 && (
          <TableContainer
            component={Paper}
            variant="outlined"
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    Fecha
                  </TableCell>

                  <TableCell>
                    Tipo
                  </TableCell>

                  <TableCell>
                    Variante
                  </TableCell>

                  <TableCell align="right">
                    Cantidad
                  </TableCell>

                  <TableCell align="right">
                    Stock anterior
                  </TableCell>

                  <TableCell align="right">
                    Stock nuevo
                  </TableCell>

                  <TableCell>
                    Referencia
                  </TableCell>

                  <TableCell>
                    Usuario
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {movimientos.map(
                  (movimiento) => {
                    const configuracion =
                      obtenerConfiguracionTipo(
                        movimiento.tipo,
                      );

                    const cantidad = Number(
                      movimiento.cantidad ?? 0,
                    );

                    return (
                      <TableRow
                        key={movimiento.id}
                        hover
                      >
                        <TableCell>
                          {formatearFecha(
                            movimiento.created_at,
                          )}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              configuracion.etiqueta
                            }
                            color={
                              configuracion.color
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                            >
                              {obtenerVariante(
                                movimiento,
                              )}
                            </Typography>

                            {movimiento.codigo_barras && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {
                                  movimiento.codigo_barras
                                }
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {configuracion.signo}
                          {cantidad}
                        </TableCell>

                        <TableCell align="right">
                          {Number(
                            movimiento.stock_anterior ??
                              0,
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {Number(
                            movimiento.stock_nuevo ??
                              0,
                          )}
                        </TableCell>

                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2">
                              {movimiento.referencia ||
                                "-"}
                            </Typography>

                            {movimiento.observacion && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {
                                  movimiento.observacion
                                }
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>

                        <TableCell>
                          {obtenerUsuario(
                            movimiento,
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
    </Box>
  );
}