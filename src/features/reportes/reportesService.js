import api from "../../services/api";

function extraerDatos(respuesta) {
  if (respuesta?.data !== undefined) {
    return respuesta.data;
  }

  return respuesta;
}

function construirParametros({
  fechaDesde = "",
  fechaHasta = "",
} = {}) {
  const params = {};

  if (fechaDesde) {
    params.fecha_desde = fechaDesde;
  }

  if (fechaHasta) {
    params.fecha_hasta = fechaHasta;
  }

  return params;
}

export async function obtenerReporteGeneral(
  filtros = {},
) {
  const { data } = await api.get(
    "/reportes/general",
    {
      params: construirParametros(filtros),
    },
  );

  return extraerDatos(data);
}

export async function obtenerResumenVentas(
  filtros = {},
) {
  const { data } = await api.get(
    "/reportes/resumen-ventas",
    {
      params: construirParametros(filtros),
    },
  );

  return extraerDatos(data);
}

export async function obtenerVentasPorDia(
  filtros = {},
) {
  const { data } = await api.get(
    "/reportes/ventas-por-dia",
    {
      params: construirParametros(filtros),
    },
  );

  const resultado = extraerDatos(data);

  return Array.isArray(resultado)
    ? resultado
    : [];
}

export async function obtenerProductosMasVendidos({
  fechaDesde = "",
  fechaHasta = "",
  limite = 10,
} = {}) {
  const params = {
    ...construirParametros({
      fechaDesde,
      fechaHasta,
    }),
    limite,
  };

  const { data } = await api.get(
    "/reportes/productos-mas-vendidos",
    {
      params,
    },
  );

  const resultado = extraerDatos(data);

  return Array.isArray(resultado)
    ? resultado
    : [];
}

export async function obtenerVentasPorMetodoPago(
  filtros = {},
) {
  const { data } = await api.get(
    "/reportes/ventas-por-metodo-pago",
    {
      params: construirParametros(filtros),
    },
  );

  const resultado = extraerDatos(data);

  return Array.isArray(resultado)
    ? resultado
    : [];
}

export async function obtenerReporteStock() {
  const { data } = await api.get(
    "/reportes/stock",
  );

  const resultado = extraerDatos(data);

  return {
    resumen: resultado?.resumen ?? {
      variantes: 0,
      unidades: 0,
      stock_bajo: 0,
      valor_costo: 0,
      valor_venta: 0,
    },

    productos: Array.isArray(
      resultado?.productos,
    )
      ? resultado.productos
      : [],
  };
}