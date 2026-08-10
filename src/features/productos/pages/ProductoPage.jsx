import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { useAuth } from "../../auth/context/AuthContext";

import useCatalogosProductos from "../hooks/useCatalogosProductos";
import useProductos from "../hooks/useProductos";
import useProductoMutations from "../hooks/useProductoMutations";

import ProductoDetalleDialog from "../components/ProductoDetalleDialog";
import ProductoDialog from "../components/ProductoDialog";
import ProductoTable from "../components/ProductoTable";

function normalizarRol(rol) {
  return String(rol ?? "")
    .trim()
    .toUpperCase();
}

export default function ProductoPage() {
  const {
    usuario,
  } = useAuth();

  const rolUsuario =
    normalizarRol(
      usuario?.rol,
    );

  const esAdministrador =
    rolUsuario ===
    "ADMINISTRADOR";

  const esVendedor =
    rolUsuario ===
    "VENDEDOR";

  const {
    data,
    isLoading,
    isError,
    error,
  } = useProductos();

  const {
    data: catalogos,
    isLoading:
    cargandoCatalogos,
    isError:
    errorCatalogos,
  } = useCatalogosProductos();

  const categorias =
    catalogos?.categorias ??
    [];

  const marcas =
    catalogos?.marcas ??
    [];

  const proveedores =
    catalogos?.proveedores ??
    [];

  const colores =
    catalogos?.colores ??
    [];

  const talles =
    catalogos?.talles ??
    [];

  const {
    guardarProducto,
    borrarProducto,
    guardando,
    eliminando,
  } = useProductoMutations();

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    dialogAbierto,
    setDialogAbierto,
  ] = useState(false);

  const [
    detalleAbierto,
    setDetalleAbierto,
  ] = useState(false);

  const [
    productoSeleccionado,
    setProductoSeleccionado,
  ] = useState(null);

  const [
    productoDetalle,
    setProductoDetalle,
  ] = useState(null);

  const [
    productoAEliminar,
    setProductoAEliminar,
  ] = useState(null);

  const [
    errorFormulario,
    setErrorFormulario,
  ] = useState("");

  const [
    notificacion,
    setNotificacion,
  ] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [
    tabDetalleInicial,
    setTabDetalleInicial,
  ] = useState(0);

  const productos =
    useMemo(() => {
      if (
        Array.isArray(data)
      ) {
        return data;
      }

      if (
        Array.isArray(
          data?.data,
        )
      ) {
        return data.data;
      }

      return [];
    }, [data]);

  const productosFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      if (!texto) {
        return productos;
      }

      return productos.filter(
        (producto) => {
          const campos = [
            producto.codigo,
            producto.nombre,
            producto.categoria,
            producto.marca,
            producto.proveedor,
          ];

          return campos.some(
            (campo) =>
              String(
                campo ?? "",
              )
                .toLowerCase()
                .includes(
                  texto,
                ),
          );
        },
      );
    }, [
      productos,
      busqueda,
    ]);

  const mostrarNotificacion = (
    message,
    severity = "success",
  ) => {
    setNotificacion({
      open: true,
      message,
      severity,
    });
  };

  const cerrarNotificacion =
    () => {
      setNotificacion(
        (estadoActual) => ({
          ...estadoActual,
          open: false,
        }),
      );
    };

  const abrirNuevoProducto =
    () => {
      if (
        !esAdministrador
      ) {
        return;
      }

      setProductoSeleccionado(
        null,
      );

      setErrorFormulario("");

      setDialogAbierto(
        true,
      );
    };

  const abrirEditarProducto =
    (producto) => {
      if (
        !esAdministrador
      ) {
        return;
      }

      setDetalleAbierto(
        false,
      );

      setProductoDetalle(
        null,
      );

      setProductoSeleccionado(
        producto,
      );

      setErrorFormulario("");

      setDialogAbierto(
        true,
      );
    };

  const cerrarDialog =
    () => {
      if (guardando) {
        return;
      }

      setDialogAbierto(
        false,
      );

      setProductoSeleccionado(
        null,
      );

      setErrorFormulario("");
    };

  const abrirDetalleProducto = (
    producto,
  ) => {
    setProductoDetalle(
      producto,
    );

    setTabDetalleInicial(0);

    setDetalleAbierto(true);
  };

  const cerrarDetalleProducto =
    () => {
      setDetalleAbierto(
        false,
      );

      setProductoDetalle(
        null,
      );
    };

  const editarDesdeDetalle =
    (producto) => {
      if (
        !esAdministrador
      ) {
        return;
      }

      cerrarDetalleProducto();

      abrirEditarProducto(
        producto,
      );
    };

  const guardar = async (
    datos,
  ) => {
    if (!esAdministrador) {
      return;
    }

    setErrorFormulario("");

    // Guardamos esto antes porque
    // después limpiamos productoSeleccionado.
    const creandoProducto =
      !productoSeleccionado?.id;

    const resultado =
      await guardarProducto({
        productoSeleccionado,
        datos,
      });

    if (!resultado.success) {
      setErrorFormulario(
        resultado.message,
      );

      return;
    }

    setDialogAbierto(false);

    setProductoSeleccionado(
      null,
    );

    setErrorFormulario("");

    mostrarNotificacion(
      resultado.message,
      "success",
    );

    /*
     * Si solamente estábamos editando,
     * terminamos acá.
     */
    if (!creandoProducto) {
      return;
    }

    /*
     * Producto recién creado.
     *
     * guardarProducto debería devolver
     * el producto creado en data.
     */
    const productoCreado =
      resultado.data;

    if (!productoCreado?.id) {
      return;
    }

    setProductoDetalle(
      productoCreado,
    );

    /*
     * 0 = Información
     * 1 = Variantes
     * 2 = Imágenes
     * 3 = Movimientos
     */
    setTabDetalleInicial(1);

    setDetalleAbierto(true);
  };

  const solicitarEliminacion =
    (producto) => {
      if (
        !esAdministrador
      ) {
        return;
      }

      setProductoAEliminar(
        producto,
      );
    };

  const cancelarEliminacion =
    () => {
      if (!eliminando) {
        setProductoAEliminar(
          null,
        );
      }
    };

  const confirmarEliminacion =
    async () => {
      if (
        !esAdministrador ||
        !productoAEliminar
      ) {
        return;
      }

      const resultado =
        await borrarProducto(
          productoAEliminar,
        );

      if (
        !resultado.success
      ) {
        mostrarNotificacion(
          resultado.message,
          "error",
        );

        return;
      }

      setProductoAEliminar(
        null,
      );

      mostrarNotificacion(
        resultado.message,
        "success",
      );
    };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error
          ?.response
          ?.data
          ?.message ||
          error
            ?.response
            ?.data
            ?.error ||
          error?.message ||
          "No se pudo cargar el listado de productos."}
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
            variant="h4"
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
            sx={{
              mt: 0.5,
            }}
          >
            {esAdministrador
              ? "Administrá las prendas, variantes, precios y existencias."
              : "Consultá productos, precios de venta y existencias."}
          </Typography>
        </Box>

        {esAdministrador && (
          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            onClick={
              abrirNuevoProducto
            }
            disabled={
              cargandoCatalogos
            }
          >
            Nuevo producto
          </Button>
        )}
      </Stack>

      {errorCatalogos &&
        esAdministrador && (
          <Alert
            severity="warning"
            sx={{
              mb: 2,
            }}
          >
            No se pudieron cargar todos los catálogos. Revisá los
            endpoints de categorías, marcas, proveedores, colores y
            talles.
          </Alert>
        )}

      <Card>
        <CardContent>
          <TextField
            fullWidth
            label="Buscar productos"
            placeholder="Nombre, código, categoría, marca o proveedor"
            value={busqueda}
            onChange={(
              event,
            ) =>
              setBusqueda(
                event.target
                  .value,
              )
            }
            sx={{
              mb: 3,
            }}
          />

          {productosFiltrados.length ===
            0 ? (
            <Alert severity="info">
              {productos.length ===
                0
                ? "Todavía no hay productos registrados."
                : "No se encontraron productos con ese criterio."}
            </Alert>
          ) : (
            <ProductoTable
              productos={
                productosFiltrados
              }
              esAdministrador={
                esAdministrador
              }
              esVendedor={
                esVendedor
              }
              onVerDetalle={
                abrirDetalleProducto
              }
              onEditar={
                esAdministrador
                  ? abrirEditarProducto
                  : undefined
              }
              onEliminar={
                esAdministrador
                  ? solicitarEliminacion
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      {esAdministrador && (
        <ProductoDialog
          open={
            dialogAbierto
          }
          producto={
            productoSeleccionado
          }
          categorias={
            categorias
          }
          marcas={marcas}
          proveedores={
            proveedores
          }
          loading={
            guardando ||
            cargandoCatalogos
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

      <ProductoDetalleDialog
        open={
          detalleAbierto
        }
        producto={
          productoDetalle
        }
        colores={colores}
        talles={talles}
        esAdministrador={
          esAdministrador
        }
        esVendedor={
          esVendedor
        }
        tabInicial={
          tabDetalleInicial
        }
        onClose={
          cerrarDetalleProducto
        }
        onEditar={
          esAdministrador
            ? editarDesdeDetalle
            : undefined
        }
        onNotificar={
          mostrarNotificacion
        }
      />

      {esAdministrador && (
        <Dialog
          open={Boolean(
            productoAEliminar,
          )}
          onClose={
            cancelarEliminacion
          }
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>
            Eliminar producto
          </DialogTitle>

          <DialogContent>
            <Typography>
              ¿Seguro que querés eliminar{" "}
              <strong>
                {
                  productoAEliminar
                    ?.nombre
                }
              </strong>
              ?
            </Typography>

            <Alert
              severity="warning"
              sx={{
                mt: 2,
              }}
            >
              El producto quedará inactivo y dejará de aparecer en el
              listado. Sus movimientos históricos se conservarán.
            </Alert>
          </DialogContent>

          <DialogActions>
            <Button
              variant="outlined"
              onClick={
                cancelarEliminacion
              }
              disabled={
                eliminando
              }
            >
              Cancelar
            </Button>

            <Button
              color="error"
              variant="contained"
              onClick={
                confirmarEliminacion
              }
              disabled={
                eliminando
              }
              startIcon={
                eliminando ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : null
              }
            >
              {eliminando
                ? "Eliminando..."
                : "Eliminar"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={
          notificacion.open
        }
        autoHideDuration={
          4000
        }
        onClose={
          cerrarNotificacion
        }
        anchorOrigin={{
          vertical:
            "bottom",
          horizontal:
            "right",
        }}
      >
        <Alert
          severity={
            notificacion.severity
          }
          variant="filled"
          onClose={
            cerrarNotificacion
          }
        >
          {
            notificacion.message
          }
        </Alert>
      </Snackbar>
    </Box>
  );
}