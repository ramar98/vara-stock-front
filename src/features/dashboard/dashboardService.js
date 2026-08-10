import api from "../../services/api";

function extraerDatos(respuesta) {
  if (
    respuesta?.data !== undefined
  ) {
    return respuesta.data;
  }

  return respuesta;
}

export async function obtenerResumenDashboard() {
  const { data } =
    await api.get(
      "/dashboard/resumen",
    );

  return extraerDatos(
    data,
  );
}

export async function obtenerVentasPorDia(
  dias = 7,
) {
  const { data } =
    await api.get(
      "/dashboard/ventas-por-dia",
      {
        params: {
          dias,
        },
      },
    );

  return extraerDatos(
    data,
  );
}

export async function obtenerProductosStockBajo() {
  const { data } =
    await api.get(
      "/dashboard/stock-bajo",
    );

  return extraerDatos(
    data,
  );
}