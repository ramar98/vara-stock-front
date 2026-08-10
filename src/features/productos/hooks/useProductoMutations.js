import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
} from "../productoService";

function obtenerMensajeError(error, mensajePredeterminado) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    mensajePredeterminado
  );
}

export default function useProductoMutations() {
  const queryClient = useQueryClient();

  const actualizarListado = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["productos"],
    });
  };

  const crearMutation = useMutation({
    mutationFn: crearProducto,

    onSuccess: actualizarListado,
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, producto }) =>
      actualizarProducto(id, producto),

    onSuccess: actualizarListado,
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarProducto,

    onSuccess: actualizarListado,
  });

  const guardarProducto = async ({
    productoSeleccionado,
    datos,
  }) => {
    try {
      if (productoSeleccionado?.id) {
        const respuesta =
          await actualizarMutation.mutateAsync({
            id: productoSeleccionado.id,
            producto: datos,
          });

        return {
          success: true,
          message: "Producto actualizado correctamente.",
          data: respuesta,
        };
      }

      const respuesta =
        await crearMutation.mutateAsync(datos);

      return {
        success: true,
        message: "Producto creado correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,
        message: obtenerMensajeError(
          error,
          "No se pudo guardar el producto.",
        ),
      };
    }
  };

  const borrarProducto = async (producto) => {
    if (!producto?.id) {
      return {
        success: false,
        message: "El producto seleccionado no es válido.",
      };
    }

    try {
      const respuesta =
        await eliminarMutation.mutateAsync(producto.id);

      return {
        success: true,
        message: "Producto eliminado correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,
        message: obtenerMensajeError(
          error,
          "No se pudo eliminar el producto.",
        ),
      };
    }
  };

  return {
    guardarProducto,
    borrarProducto,

    creando: crearMutation.isPending,
    actualizando: actualizarMutation.isPending,
    eliminando: eliminarMutation.isPending,

    guardando:
      crearMutation.isPending ||
      actualizarMutation.isPending,

    errorCrear: crearMutation.error,
    errorActualizar: actualizarMutation.error,
    errorEliminar: eliminarMutation.error,
  };
}