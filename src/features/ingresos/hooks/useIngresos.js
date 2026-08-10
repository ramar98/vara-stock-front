import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  crearIngreso,
  obtenerIngresos,
} from "../ingresosService";

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

export default function useIngresos(
  filtros = {},
) {
  const queryClient = useQueryClient();

  const {
    fechaDesde = "",
    fechaHasta = "",
    proveedorId = "",
  } = filtros;

  const ingresosQuery = useQuery({
    queryKey: [
      "ingresos",
      {
        fechaDesde,
        fechaHasta,
        proveedorId,
      },
    ],

    queryFn: () =>
      obtenerIngresos({
        fechaDesde,
        fechaHasta,
        proveedorId,
      }),

    staleTime: 30 * 1000,
  });

  const refrescarDatosRelacionados =
    async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["ingresos"],
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
      ]);
    };

  const crearIngresoMutation =
    useMutation({
      mutationFn: crearIngreso,

      onSuccess:
        refrescarDatosRelacionados,
    });

  const registrarIngreso = async (
    datos,
  ) => {
    try {
      const respuesta =
        await crearIngresoMutation.mutateAsync(
          datos,
        );

      return {
        success: true,
        message:
          "Ingreso registrado correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,

        message: obtenerMensajeError(
          error,
          "No se pudo registrar el ingreso.",
        ),

        errors:
          error?.response?.data?.errors ??
          [],
      };
    }
  };

  return {
    ingresos:
      ingresosQuery.data ?? [],

    cargandoIngresos:
      ingresosQuery.isLoading,

    actualizandoIngresos:
      ingresosQuery.isFetching,

    errorIngresos:
      ingresosQuery.error,

    recargarIngresos:
      ingresosQuery.refetch,

    registrarIngreso,

    registrandoIngreso:
      crearIngresoMutation.isPending,

    errorRegistro:
      crearIngresoMutation.error,
  };
}