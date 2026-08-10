import { useQuery } from "@tanstack/react-query";

import {
  obtenerReporteGeneral,
  obtenerReporteStock,
} from "../reportesService";

export default function useReportes(
  filtros = {},
) {
  const {
    fechaDesde = "",
    fechaHasta = "",
  } = filtros;

  const reporteGeneralQuery = useQuery({
    queryKey: [
      "reportes",
      "general",
      {
        fechaDesde,
        fechaHasta,
      },
    ],

    queryFn: () =>
      obtenerReporteGeneral({
        fechaDesde,
        fechaHasta,
      }),

    staleTime: 30 * 1000,
  });

  const reporteStockQuery = useQuery({
    queryKey: [
      "reportes",
      "stock",
    ],

    queryFn: obtenerReporteStock,

    staleTime: 30 * 1000,
  });

  const recargarReportes = async () => {
    await Promise.all([
      reporteGeneralQuery.refetch(),
      reporteStockQuery.refetch(),
    ]);
  };

  const reporteGeneral =
    reporteGeneralQuery.data ?? {
      periodo: {
        fecha_desde: fechaDesde || null,
        fecha_hasta: fechaHasta || null,
      },

      resumen: {
        cantidad_ventas: 0,
        subtotal_ventas: 0,
        descuentos: 0,
        total_ventas: 0,
        unidades_vendidas: 0,
        costo_estimado: 0,
        ganancia_estimada: 0,
      },

      ventas_por_dia: [],
      productos_mas_vendidos: [],
      ventas_por_metodo_pago: [],
    };

  const reporteStock =
    reporteStockQuery.data ?? {
      resumen: {
        variantes: 0,
        unidades: 0,
        stock_bajo: 0,
        valor_costo: 0,
        valor_venta: 0,
      },

      productos: [],
    };

  return {
    reporteGeneral,
    reporteStock,

    resumenVentas:
      reporteGeneral.resumen ?? {},

    ventasPorDia:
      reporteGeneral.ventas_por_dia ?? [],

    productosMasVendidos:
      reporteGeneral.productos_mas_vendidos ?? [],

    ventasPorMetodoPago:
      reporteGeneral.ventas_por_metodo_pago ?? [],

    resumenStock:
      reporteStock.resumen ?? {},

    productosStock:
      reporteStock.productos ?? [],

    cargandoReportes:
      reporteGeneralQuery.isLoading ||
      reporteStockQuery.isLoading,

    actualizandoReportes:
      reporteGeneralQuery.isFetching ||
      reporteStockQuery.isFetching,

    errorReportes:
      reporteGeneralQuery.error ||
      reporteStockQuery.error,

    recargarReportes,
  };
}