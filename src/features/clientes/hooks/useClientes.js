import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarCliente,
  crearCliente,
  eliminarCliente,
  obtenerClientes,
} from "../clientesService";

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

export default function useClientes(
  busqueda = "",
) {
  const queryClient = useQueryClient();

  const clientesQuery = useQuery({
    queryKey: [
      "clientes",
      busqueda.trim(),
    ],

    queryFn: () =>
      obtenerClientes({
        busqueda,
      }),

    staleTime: 30 * 1000,
  });

  const refrescarClientes = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["clientes"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["ventas"],
      }),
    ]);
  };

  const crearMutation = useMutation({
    mutationFn: crearCliente,
    onSuccess: refrescarClientes,
  });

  const actualizarMutation = useMutation({
    mutationFn: ({
      clienteId,
      datos,
    }) =>
      actualizarCliente(
        clienteId,
        datos,
      ),

    onSuccess: refrescarClientes,
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarCliente,
    onSuccess: refrescarClientes,
  });

  const guardarCliente = async ({
    clienteSeleccionado,
    datos,
  }) => {
    try {
      if (clienteSeleccionado?.id) {
        const respuesta =
          await actualizarMutation.mutateAsync({
            clienteId:
              clienteSeleccionado.id,
            datos,
          });

        return {
          success: true,
          message:
            "Cliente actualizado correctamente.",
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
          "Cliente creado correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,

        message: obtenerMensajeError(
          error,
          "No se pudo guardar el cliente.",
        ),

        errors:
          error?.response?.data?.errors ??
          [],
      };
    }
  };

  const borrarCliente = async (
    cliente,
  ) => {
    if (!cliente?.id) {
      return {
        success: false,
        message:
          "El cliente seleccionado no es válido.",
      };
    }

    try {
      const respuesta =
        await eliminarMutation.mutateAsync(
          cliente.id,
        );

      return {
        success: true,
        message:
          "Cliente eliminado correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,

        message: obtenerMensajeError(
          error,
          "No se pudo eliminar el cliente.",
        ),
      };
    }
  };

  return {
    clientes:
      clientesQuery.data ?? [],

    cargandoClientes:
      clientesQuery.isLoading,

    actualizandoClientes:
      clientesQuery.isFetching,

    errorClientes:
      clientesQuery.error,

    recargarClientes:
      clientesQuery.refetch,

    guardarCliente,
    borrarCliente,

    guardandoCliente:
      crearMutation.isPending ||
      actualizarMutation.isPending,

    eliminandoCliente:
      eliminarMutation.isPending,
  };
}