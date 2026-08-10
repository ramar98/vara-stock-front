import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarConfiguracion,
  obtenerConfiguracion,
} from "../configuracionService";

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

export default function useConfiguracion() {
  const queryClient =
    useQueryClient();

  const configuracionQuery =
    useQuery({
      queryKey: ["configuracion"],

      queryFn:
        obtenerConfiguracion,

      staleTime: 60 * 1000,
    });

  const actualizarMutation =
    useMutation({
      mutationFn:
        actualizarConfiguracion,

      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              "configuracion",
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "productos",
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "dashboard",
            ],
          }),
        ]);
      },
    });

  const guardarConfiguracion =
    async (datos) => {
      try {
        const respuesta =
          await actualizarMutation.mutateAsync(
            datos,
          );

        return {
          success: true,

          message:
            "Configuración actualizada correctamente.",

          data: respuesta,
        };
      } catch (error) {
        return {
          success: false,

          message:
            obtenerMensajeError(
              error,
              "No se pudo actualizar la configuración.",
            ),

          errors:
            error?.response?.data
              ?.errors ?? [],
        };
      }
    };

  return {
    configuracion:
      configuracionQuery.data ??
      null,

    cargandoConfiguracion:
      configuracionQuery.isLoading,

    actualizandoConfiguracion:
      configuracionQuery.isFetching,

    errorConfiguracion:
      configuracionQuery.error,

    recargarConfiguracion:
      configuracionQuery.refetch,

    guardarConfiguracion,

    guardandoConfiguracion:
      actualizarMutation.isPending,
  };
}