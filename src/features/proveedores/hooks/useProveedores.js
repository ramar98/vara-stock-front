import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarProveedor,
  crearProveedor,
  eliminarProveedor,
  obtenerProveedores,
} from "../proveedoresService";

function obtenerMensajeError(
  error,
  mensajePredeterminado,
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    mensajePredeterminado
  );
}

export default function useProveedores(
  busqueda = "",
) {
  const queryClient = useQueryClient();

  const proveedoresQuery = useQuery({
    queryKey: [
      "proveedores",
      busqueda.trim(),
    ],

    queryFn: () =>
      obtenerProveedores({
        busqueda,
      }),

    staleTime: 30 * 1000,
  });

  const refrescarProveedores = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["proveedores"],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "catalogos-productos",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: ["productos"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["ingresos"],
      }),
    ]);
  };

  const crearMutation = useMutation({
    mutationFn: crearProveedor,
    onSuccess: refrescarProveedores,
  });

  const actualizarMutation = useMutation({
    mutationFn: ({
      proveedorId,
      datos,
    }) =>
      actualizarProveedor(
        proveedorId,
        datos,
      ),

    onSuccess: refrescarProveedores,
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarProveedor,
    onSuccess: refrescarProveedores,
  });

  const guardarProveedor = async ({
    proveedorSeleccionado,
    datos,
  }) => {
    try {
      if (proveedorSeleccionado?.id) {
        const respuesta =
          await actualizarMutation.mutateAsync({
            proveedorId:
              proveedorSeleccionado.id,
            datos,
          });

        return {
          success: true,
          message:
            "Proveedor actualizado correctamente.",
          data: respuesta,
        };
      }

      const respuesta =
        await crearMutation.mutateAsync(
          datos,
        );

      return {
        success: true,
        message:
          "Proveedor creado correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,

        message: obtenerMensajeError(
          error,
          "No se pudo guardar el proveedor.",
        ),

        errors:
          error?.response?.data?.errors ??
          [],
      };
    }
  };

  const borrarProveedor = async (
    proveedor,
  ) => {
    if (!proveedor?.id) {
      return {
        success: false,
        message:
          "El proveedor seleccionado no es válido.",
      };
    }

    try {
      const respuesta =
        await eliminarMutation.mutateAsync(
          proveedor.id,
        );

      return {
        success: true,
        message:
          "Proveedor eliminado correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,

        message: obtenerMensajeError(
          error,
          "No se pudo eliminar el proveedor.",
        ),
      };
    }
  };

  return {
    proveedores:
      proveedoresQuery.data ?? [],

    cargandoProveedores:
      proveedoresQuery.isLoading,

    actualizandoProveedores:
      proveedoresQuery.isFetching,

    errorProveedores:
      proveedoresQuery.error,

    recargarProveedores:
      proveedoresQuery.refetch,

    guardarProveedor,
    borrarProveedor,

    guardandoProveedor:
      crearMutation.isPending ||
      actualizarMutation.isPending,

    eliminandoProveedor:
      eliminarMutation.isPending,
  };
}