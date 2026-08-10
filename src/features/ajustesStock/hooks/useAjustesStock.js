import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  crearAjusteStock,
  obtenerAjustesStock,
} from "../ajustesStockService";

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

export default function useAjustesStock(
  filtros = {},
) {
  const queryClient = useQueryClient();

  const {
    fechaDesde = "",
    fechaHasta = "",
    productoId = "",
  } = filtros;

  const ajustesQuery = useQuery({
    queryKey: [
      "ajustes-stock",
      {
        fechaDesde,
        fechaHasta,
        productoId,
      },
    ],

    queryFn: () =>
      obtenerAjustesStock({
        fechaDesde,
        fechaHasta,
        productoId,
      }),

    staleTime: 30 * 1000,
  });

  const refrescarDatosRelacionados =
    async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["ajustes-stock"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["productos"],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "variantes-producto",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "movimientos-producto",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["reportes"],
        }),
      ]);
    };

  const crearAjusteMutation =
    useMutation({
      mutationFn: crearAjusteStock,
      onSuccess:
        refrescarDatosRelacionados,
    });

  const registrarAjuste = async (
    datos,
  ) => {
    try {
      const respuesta =
        await crearAjusteMutation.mutateAsync(
          datos,
        );

      return {
        success: true,
        message:
          "Ajuste de stock registrado correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,

        message: obtenerMensajeError(
          error,
          "No se pudo registrar el ajuste de stock.",
        ),

        errors:
          error?.response?.data?.errors ??
          [],

        error:
          error?.response?.data?.error ??
          null,
      };
    }
  };

  return {
    ajustes:
      ajustesQuery.data ?? [],

    cargandoAjustes:
      ajustesQuery.isLoading,

    actualizandoAjustes:
      ajustesQuery.isFetching,

    errorAjustes:
      ajustesQuery.error,

    recargarAjustes:
      ajustesQuery.refetch,

    registrarAjuste,

    registrandoAjuste:
      crearAjusteMutation.isPending,

    errorRegistro:
      crearAjusteMutation.error,
  };
}