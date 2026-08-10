import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  crearVenta,
  obtenerVentas,
} from "../ventasService";

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

export default function useVentas(
  filtros = {},
) {
  const queryClient = useQueryClient();

  const {
    fechaDesde = "",
    fechaHasta = "",
    clienteId = "",
    metodoPago = "",
  } = filtros;

  const ventasQuery = useQuery({
    queryKey: [
      "ventas",
      {
        fechaDesde,
        fechaHasta,
        clienteId,
        metodoPago,
      },
    ],

    queryFn: () =>
      obtenerVentas({
        fechaDesde,
        fechaHasta,
        clienteId,
        metodoPago,
      }),

    staleTime: 30 * 1000,
  });

  const refrescarDatosRelacionados =
    async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["ventas"],
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
      ]);
    };

  const crearVentaMutation =
    useMutation({
      mutationFn: crearVenta,

      onSuccess:
        refrescarDatosRelacionados,
    });

  const registrarVenta = async (
    datos,
  ) => {
    try {
      const respuesta =
        await crearVentaMutation.mutateAsync(
          datos,
        );

      return {
        success: true,
        message:
          "Venta registrada correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,

        message: obtenerMensajeError(
          error,
          "No se pudo registrar la venta.",
        ),

        errors:
          error?.response?.data?.errors ??
          [],

        error: error?.response?.data?.error,
      };
    }
  };

  return {
    ventas:
      ventasQuery.data ?? [],

    cargandoVentas:
      ventasQuery.isLoading,

    actualizandoVentas:
      ventasQuery.isFetching,

    errorVentas:
      ventasQuery.error,

    recargarVentas:
      ventasQuery.refetch,

    registrarVenta,

    registrandoVenta:
      crearVentaMutation.isPending,

    errorRegistro:
      crearVentaMutation.error,
  };
}