import { useQuery } from "@tanstack/react-query";

import {
  obtenerMovimientosProducto,
} from "../movimientosService";

export default function useMovimientosProducto(productoId) {
  const movimientosQuery = useQuery({
    queryKey: [
      "movimientos-producto",
      productoId,
    ],

    queryFn: () =>
      obtenerMovimientosProducto(productoId),

    enabled: Boolean(productoId),

    staleTime: 30 * 1000,
  });

  return {
    movimientos:
      movimientosQuery.data ?? [],

    cargandoMovimientos:
      movimientosQuery.isLoading,

    actualizandoMovimientos:
      movimientosQuery.isFetching,

    errorMovimientos:
      movimientosQuery.error,

    recargarMovimientos:
      movimientosQuery.refetch,
  };
}