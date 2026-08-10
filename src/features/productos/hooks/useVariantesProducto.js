import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarVariante,
  crearVariante,
  eliminarVariante,
  obtenerVariantesPorProducto,
} from "../variantesService";

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

export default function useVariantesProducto(
  productoId,
) {
  const queryClient = useQueryClient();

  const queryKey = [
    "variantes-producto",
    productoId,
  ];

  const variantesQuery = useQuery({
    queryKey,
    queryFn: () =>
      obtenerVariantesPorProducto(productoId),
    enabled: Boolean(productoId),
  });

  const refrescarVariantes = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey,
      }),

      queryClient.invalidateQueries({
        queryKey: ["productos"],
      }),
    ]);
  };

  const crearMutation = useMutation({
    mutationFn: crearVariante,
    onSuccess: refrescarVariantes,
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ varianteId, datos }) =>
      actualizarVariante(varianteId, datos),

    onSuccess: refrescarVariantes,
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarVariante,
    onSuccess: refrescarVariantes,
  });

  const guardarVariante = async ({
    varianteSeleccionada,
    datos,
  }) => {
    try {
      if (varianteSeleccionada?.id) {
        const respuesta =
          await actualizarMutation.mutateAsync({
            varianteId:
              varianteSeleccionada.id,
            datos,
          });

        return {
          success: true,
          message:
            "Variante actualizada correctamente.",
          data: respuesta,
        };
      }

      const respuesta =
        await crearMutation.mutateAsync({
          ...datos,
          producto_id: productoId,
        });

      return {
        success: true,
        message:
          "Variante creada correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,
        message: obtenerMensajeError(
          error,
          "No se pudo guardar la variante.",
        ),
      };
    }
  };

  const borrarVariante = async (
    variante,
  ) => {
    if (!variante?.id) {
      return {
        success: false,
        message:
          "La variante seleccionada no es válida.",
      };
    }

    try {
      const respuesta =
        await eliminarMutation.mutateAsync(
          variante.id,
        );

      return {
        success: true,
        message:
          "Variante eliminada correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,
        message: obtenerMensajeError(
          error,
          "No se pudo eliminar la variante.",
        ),
      };
    }
  };

  return {
    variantes:
      variantesQuery.data ?? [],

    cargandoVariantes:
      variantesQuery.isLoading,

    errorVariantes:
      variantesQuery.error,

    recargarVariantes:
      variantesQuery.refetch,

    guardarVariante,
    borrarVariante,

    guardandoVariante:
      crearMutation.isPending ||
      actualizarMutation.isPending,

    eliminandoVariante:
      eliminarMutation.isPending,
  };
}