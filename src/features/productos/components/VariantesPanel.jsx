import { useState } from "react";

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
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import useVariantesProducto from "../hooks/useVariantesProducto";
import VarianteDialog from "./VarianteDialog";

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

export default function VariantesPanel({
  producto,
  colores = [],
  talles = [],
  esAdministrador = false,
  esVendedor = false,
  onNotificar,
}) {
  const productoId =
    producto?.id;

  const {
    variantes,
    cargandoVariantes,
    errorVariantes,
    guardarVariante,
    borrarVariante,
    guardandoVariante,
    eliminandoVariante,
  } = useVariantesProducto(
    productoId,
  );

  const [
    dialogAbierto,
    setDialogAbierto,
  ] = useState(false);

  const [
    varianteSeleccionada,
    setVarianteSeleccionada,
  ] = useState(null);

  const [
    varianteAEliminar,
    setVarianteAEliminar,
  ] = useState(null);

  const [
    errorFormulario,
    setErrorFormulario,
  ] = useState("");

  /*
   * ============================
   * NUEVA VARIANTE
   * Solo Administrador
   * ============================
   */
  const abrirNuevaVariante = () => {
    if (!esAdministrador) {
      return;
    }

    setVarianteSeleccionada(
      null,
    );

    setErrorFormulario("");

    setDialogAbierto(true);
  };

  /*
   * ============================
   * EDITAR VARIANTE
   * Solo Administrador
   * ============================
   */
  const abrirEditarVariante = (
    variante,
  ) => {
    if (!esAdministrador) {
      return;
    }

    setVarianteSeleccionada(
      variante,
    );

    setErrorFormulario("");

    setDialogAbierto(true);
  };

  const cerrarDialog = () => {
    if (guardandoVariante) {
      return;
    }

    setDialogAbierto(false);

    setVarianteSeleccionada(
      null,
    );

    setErrorFormulario("");
  };

  /*
   * ============================
   * GUARDAR VARIANTE
   * Solo Administrador
   * ============================
   */
  const guardar = async (
    datos,
  ) => {
    if (!esAdministrador) {
      return;
    }

    setErrorFormulario("");

    const resultado =
      await guardarVariante({
        varianteSeleccionada,
        datos,
      });

    if (!resultado.success) {
      setErrorFormulario(
        resultado.message,
      );

      return;
    }

    cerrarDialog();

    onNotificar?.(
      resultado.message,
      "success",
    );
  };

  /*
   * ============================
   * ELIMINAR VARIANTE
   * Solo Administrador
   * ============================
   */
  const confirmarEliminacion =
    async () => {
      if (
        !esAdministrador ||
        !varianteAEliminar
      ) {
        return;
      }

      const resultado =
        await borrarVariante(
          varianteAEliminar,
        );

      if (!resultado.success) {
        onNotificar?.(
          resultado.message,
          "error",
        );

        return;
      }

      setVarianteAEliminar(
        null,
      );

      onNotificar?.(
        resultado.message,
        "success",
      );
    };

  if (!productoId) {
    return (
      <Alert severity="info">
        Primero guardá el producto para poder agregar variantes.
      </Alert>
    );
  }

  return (
    <Box>
      {/* ======================== */}
      {/* ENCABEZADO */}
      {/* ======================== */}

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
            xs: "stretch",
            sm: "center",
          },
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Variantes
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {esAdministrador
              ? "Administrá precios, stock, colores y talles."
              : "Consultá precios de venta, stock, colores y talles."}
          </Typography>
        </Box>

        {esAdministrador && (
          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            onClick={
              abrirNuevaVariante
            }
          >
            Nueva variante
          </Button>
        )}
      </Stack>

      {/* ======================== */}
      {/* CARGANDO */}
      {/* ======================== */}

      {cargandoVariantes && (
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "center",
            py: 5,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* ======================== */}
      {/* ERROR */}
      {/* ======================== */}

      {errorVariantes && (
        <Alert severity="error">
          {errorVariantes
            ?.response
            ?.data
            ?.message ||
            errorVariantes
              ?.response
              ?.data
              ?.error ||
            errorVariantes
              ?.message ||
            "No se pudieron cargar las variantes."}
        </Alert>
      )}

      {/* ======================== */}
      {/* SIN VARIANTES */}
      {/* ======================== */}

      {!cargandoVariantes &&
        !errorVariantes &&
        variantes.length === 0 && (
          <Alert severity="info">
            Este producto todavía no tiene variantes.
          </Alert>
        )}

      {/* ======================== */}
      {/* TABLA */}
      {/* ======================== */}

      {!cargandoVariantes &&
        !errorVariantes &&
        variantes.length > 0 && (
          <TableContainer
            component={Paper}
            variant="outlined"
          >
            <Table>
              <TableHead>
                <TableRow>
                  {/*
                   * Primero mostramos
                   * lo más importante.
                   */}

                  <TableCell align="right">
                    Precio venta
                  </TableCell>

                  <TableCell align="center">
                    Stock
                  </TableCell>

                  <TableCell align="center">
                    Mínimo
                  </TableCell>

                  {/*
                   * El costo es sensible.
                   * Solo Administrador.
                   */}
                  {esAdministrador && (
                    <TableCell align="right">
                      Costo
                    </TableCell>
                  )}

                  {/*
                   * Detalles de la variante
                   * después de precios/stock.
                   */}
                  <TableCell>
                    Color
                  </TableCell>

                  <TableCell>
                    Talle
                  </TableCell>

                  <TableCell>
                    Código de barras
                  </TableCell>

                  {/*
                   * Acciones solamente
                   * Administrador.
                   */}
                  {esAdministrador && (
                    <TableCell align="center">
                      Acciones
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {variantes.map(
                  (variante) => {
                    const stock =
                      Number(
                        variante.stock_actual ??
                          0,
                      );

                    const stockMinimo =
                      Number(
                        variante.stock_minimo ??
                          0,
                      );

                    const stockBajo =
                      stock <=
                      stockMinimo;

                    let colorStock =
                      "success";

                    if (
                      stock <= 0
                    ) {
                      colorStock =
                        "error";
                    } else if (
                      stockBajo
                    ) {
                      colorStock =
                        "warning";
                    }

                    return (
                      <TableRow
                        key={
                          variante.id
                        }
                        hover
                      >
                        {/* PRECIO VENTA */}

                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                700,
                            }}
                          >
                            {formatearMoneda(
                              variante.precio_venta,
                            )}
                          </Typography>
                        </TableCell>

                        {/* STOCK */}

                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={stock}
                            color={
                              colorStock
                            }
                            variant={
                              stock >
                              stockMinimo
                                ? "outlined"
                                : "filled"
                            }
                          />
                        </TableCell>

                        {/* STOCK MÍNIMO */}

                        <TableCell align="center">
                          {
                            stockMinimo
                          }
                        </TableCell>

                        {/* COSTO - ADMIN */}

                        {esAdministrador && (
                          <TableCell align="right">
                            {formatearMoneda(
                              variante.precio_costo,
                            )}
                          </TableCell>
                        )}

                        {/* COLOR */}

                        <TableCell>
                          {variante.color ||
                            "-"}
                        </TableCell>

                        {/* TALLE */}

                        <TableCell>
                          {variante.talle ||
                            "-"}
                        </TableCell>

                        {/* CÓDIGO */}

                        <TableCell>
                          {variante.codigo_barras ||
                            "-"}
                        </TableCell>

                        {/* ACCIONES - ADMIN */}

                        {esAdministrador && (
                          <TableCell align="center">
                            <Tooltip title="Editar variante">
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  abrirEditarVariante(
                                    variante,
                                  )
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar variante">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  setVarianteAEliminar(
                                    variante,
                                  )
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

      {/* ======================== */}
      {/* CREAR / EDITAR */}
      {/* SOLO ADMINISTRADOR */}
      {/* ======================== */}

      {esAdministrador && (
        <VarianteDialog
          open={
            dialogAbierto
          }
          variante={
            varianteSeleccionada
          }
          colores={colores}
          talles={talles}
          loading={
            guardandoVariante
          }
          error={
            errorFormulario
          }
          onClose={
            cerrarDialog
          }
          onGuardar={
            guardar
          }
        />
      )}

      {/* ======================== */}
      {/* CONFIRMAR ELIMINACIÓN */}
      {/* SOLO ADMINISTRADOR */}
      {/* ======================== */}

      {esAdministrador && (
        <Dialog
          open={Boolean(
            varianteAEliminar,
          )}
          onClose={() => {
            if (
              !eliminandoVariante
            ) {
              setVarianteAEliminar(
                null,
              );
            }
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>
            Eliminar variante
          </DialogTitle>

          <DialogContent>
            <Typography>
              ¿Seguro que querés eliminar la variante{" "}
              <strong>
                {varianteAEliminar
                  ?.color ||
                  "-"}{" "}
                /{" "}
                {varianteAEliminar
                  ?.talle ||
                  "-"}
              </strong>
              ?
            </Typography>

            <Alert
              severity="warning"
              sx={{
                mt: 2,
              }}
            >
              No conviene eliminar variantes que ya tengan ingresos,
              ventas o movimientos de stock asociados.
            </Alert>
          </DialogContent>

          <DialogActions>
            <Button
              variant="outlined"
              disabled={
                eliminandoVariante
              }
              onClick={() =>
                setVarianteAEliminar(
                  null,
                )
              }
            >
              Cancelar
            </Button>

            <Button
              color="error"
              variant="contained"
              disabled={
                eliminandoVariante
              }
              onClick={
                confirmarEliminacion
              }
              startIcon={
                eliminandoVariante ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : null
              }
            >
              {eliminandoVariante
                ? "Eliminando..."
                : "Eliminar"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}