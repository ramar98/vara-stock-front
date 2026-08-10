import { useEffect, useState } from "react";

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

import { obtenerIngresoPorId } from "../ingresosService";

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

function formatearFecha(valor) {
  if (!valor) {
    return "-";
  }

  const fechaTexto = String(valor).slice(0, 10);
  const [anio, mes, dia] = fechaTexto.split("-");

  if (!anio || !mes || !dia) {
    return "-";
  }

  return `${dia}/${mes}/${anio}`;
}

function obtenerUsuario(ingreso) {
  const nombreCompleto = [
    ingreso?.usuario_nombre,
    ingreso?.usuario_apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return nombreCompleto || "Sistema";
}

function obtenerVariante(item) {
  const partes = [
    item.color,
    item.talle,
  ].filter(Boolean);

  if (partes.length > 0) {
    return partes.join(" / ");
  }

  return "Sin variante";
}

export default function IngresoDetalleDialog({
  open,
  ingresoId,
  onClose,
}) {
  const [ingreso, setIngreso] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !ingresoId) {
      return;
    }

    let activo = true;

    const cargarIngreso = async () => {
      setCargando(true);
      setError("");
      setIngreso(null);

      try {
        const datos = await obtenerIngresoPorId(
          ingresoId,
        );

        if (activo) {
          setIngreso(datos);
        }
      } catch (errorPeticion) {
        if (activo) {
          setError(
            errorPeticion?.response?.data?.message ||
              errorPeticion?.response?.data?.error ||
              errorPeticion?.message ||
              "No se pudo cargar el detalle del ingreso.",
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarIngreso();

    return () => {
      activo = false;
    };
  }, [open, ingresoId]);

  useEffect(() => {
    if (!open) {
      setIngreso(null);
      setError("");
      setCargando(false);
    }
  }, [open]);

  const cerrar = () => {
    if (!cargando) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={cerrar}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        Detalle del ingreso
        {ingresoId ? ` #${ingresoId}` : ""}
      </DialogTitle>

      <DialogContent dividers>
        {cargando && (
          <Box
            minHeight={320}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <CircularProgress />
          </Box>
        )}

        {!cargando && error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {!cargando && !error && ingreso && (
          <Stack spacing={3}>
            <Paper
              variant="outlined"
              sx={{ p: 2 }}
            >
              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                spacing={3}
                divider={
                  <Divider
                    orientation="vertical"
                    flexItem
                  />
                }
              >
                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Proveedor
                  </Typography>

                  <Typography fontWeight="bold">
                    {ingreso.proveedor || "-"}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Fecha
                  </Typography>

                  <Typography fontWeight="bold">
                    {formatearFecha(ingreso.fecha)}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Comprobante
                  </Typography>

                  <Typography fontWeight="bold">
                    {ingreso.numero_comprobante ||
                      "-"}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Usuario
                  </Typography>

                  <Typography fontWeight="bold">
                    {obtenerUsuario(ingreso)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {ingreso.observaciones && (
              <Alert severity="info">
                {ingreso.observaciones}
              </Alert>
            )}

            <Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                mb={2}
              >
                Mercadería ingresada
              </Typography>

              {!Array.isArray(ingreso.productos) ||
              ingreso.productos.length === 0 ? (
                <Alert severity="info">
                  Este ingreso no tiene productos
                  asociados.
                </Alert>
              ) : (
                <TableContainer
                  component={Paper}
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
                          Costo unitario
                        </TableCell>

                        <TableCell align="right">
                          Subtotal
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {ingreso.productos.map(
                        (item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.producto_codigo ||
                                "-"}
                            </TableCell>

                            <TableCell>
                              <Typography
                                fontWeight={500}
                              >
                                {item.producto_nombre ||
                                  "-"}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              {obtenerVariante(item)}
                            </TableCell>

                            <TableCell>
                              {item.codigo_barras ||
                                "-"}
                            </TableCell>

                            <TableCell align="right">
                              {Number(
                                item.cantidad ?? 0,
                              )}
                            </TableCell>

                            <TableCell align="right">
                              {formatearMoneda(
                                item.precio_costo,
                              )}
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                fontWeight: 700,
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

            <Stack
              direction="row"
              justifyContent="flex-end"
            >
              <Paper
                variant="outlined"
                sx={{
                  px: 3,
                  py: 2,
                  minWidth: 260,
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
                  fontWeight="bold"
                >
                  {formatearMoneda(ingreso.total)}
                </Typography>
              </Paper>
            </Stack>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="contained"
          onClick={cerrar}
          disabled={cargando}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}