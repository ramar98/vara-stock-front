import {
  useQuery,
} from "@tanstack/react-query";

import {
  obtenerProductosStockBajo,
  obtenerResumenDashboard,
  obtenerVentasPorDia,
} from "../dashboardService";

import {
  useAuth,
} from "../../auth/context/AuthContext";

function normalizarRol(
  rol,
) {
  return String(
    rol ?? "",
  )
    .trim()
    .toUpperCase();
}

export default function useDashboard({
  diasGrafico = 7,
} = {}) {
  /*
   * =================================
   * USUARIO LOGUEADO
   * =================================
   */

  const {
    usuario,
  } = useAuth();

  const usuarioId =
    usuario?.id ??
    null;

  const rolUsuario =
    normalizarRol(
      usuario?.rol,
    );

  /*
   * =================================
   * RESUMEN
   * =================================
   *
   * MUY IMPORTANTE:
   *
   * La queryKey incluye usuarioId
   * y rol.
   *
   * Así React Query NO reutiliza
   * el dashboard de otro usuario.
   */

  const resumenQuery =
    useQuery({
      queryKey: [
        "dashboard",
        "resumen",
        usuarioId,
        rolUsuario,
      ],

      queryFn:
        obtenerResumenDashboard,

      enabled:
        Boolean(
          usuarioId,
        ),

      /*
       * Para el dashboard queremos
       * refrescar al entrar.
       */
      staleTime: 0,

      refetchOnMount:
        "always",

      refetchOnWindowFocus:
        true,
    });

  /*
   * =================================
   * VENTAS POR DÍA
   * =================================
   */

  const ventasPorDiaQuery =
    useQuery({
      queryKey: [
        "dashboard",
        "ventas-por-dia",
        usuarioId,
        rolUsuario,
        diasGrafico,
      ],

      queryFn: () =>
        obtenerVentasPorDia(
          diasGrafico,
        ),

      enabled:
        Boolean(
          usuarioId,
        ),

      staleTime: 0,

      refetchOnMount:
        "always",
    });

  /*
   * =================================
   * STOCK BAJO
   * =================================
   */

  const stockBajoQuery =
    useQuery({
      queryKey: [
        "dashboard",
        "stock-bajo",
        usuarioId,
        rolUsuario,
      ],

      queryFn:
        obtenerProductosStockBajo,

      enabled:
        Boolean(
          usuarioId,
        ),

      staleTime:
        30 * 1000,
    });

  /*
   * =================================
   * REFRESCAR
   * =================================
   */

  const recargarDashboard =
    async () => {
      await Promise.all([
        resumenQuery.refetch(),

        ventasPorDiaQuery.refetch(),

        stockBajoQuery.refetch(),
      ]);
    };

  /*
   * =================================
   * RETURN
   * =================================
   */

  return {
    resumen:
      resumenQuery.data ?? {
        productos: 0,

        unidades_stock:
          0,

        ventas_hoy:
          0,

        ventas_mes:
          0,

        compras_mes:
          0,

        ganancia_bruta_estimada:
          0,

        stock_bajo:
          0,

        ultimos_movimientos:
          [],

        ultimas_ventas:
          [],
      },

    ventasPorDia:
      ventasPorDiaQuery.data ??
      [],

    productosStockBajo:
      stockBajoQuery.data ??
      [],

    cargandoDashboard:
      resumenQuery.isLoading ||
      ventasPorDiaQuery.isLoading ||
      stockBajoQuery.isLoading,

    actualizandoDashboard:
      resumenQuery.isFetching ||
      ventasPorDiaQuery.isFetching ||
      stockBajoQuery.isFetching,

    errorDashboard:
      resumenQuery.error ||
      ventasPorDiaQuery.error ||
      stockBajoQuery.error,

    recargarDashboard,
  };
}