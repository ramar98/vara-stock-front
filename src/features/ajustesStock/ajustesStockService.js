import api from "../../services/api";

function extraerDatos(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (respuesta?.data !== undefined) {
    return respuesta.data;
  }

  return respuesta;
}

export async function obtenerAjustesStock(
  filtros = {},
) {
  const params = {};

  if (filtros.fechaDesde) {
    params.fecha_desde =
      filtros.fechaDesde;
  }

  if (filtros.fechaHasta) {
    params.fecha_hasta =
      filtros.fechaHasta;
  }

  if (filtros.productoId) {
    params.producto_id =
      filtros.productoId;
  }

  const { data } = await api.get(
    "/ajustes-stock",
    {
      params,
    },
  );

  const resultado =
    extraerDatos(data);

  return Array.isArray(resultado)
    ? resultado
    : [];
}

export async function obtenerAjusteStockPorId(
  ajusteId,
) {
  if (!ajusteId) {
    throw new Error(
      "El ajuste seleccionado no es válido.",
    );
  }

  const { data } = await api.get(
    `/ajustes-stock/${ajusteId}`,
  );

  return extraerDatos(data);
}

export async function crearAjusteStock(
  datos,
) {
  if (!datos?.variante_id) {
    throw new Error(
      "Seleccioná una variante.",
    );
  }

  if (
    datos.nuevo_stock === undefined ||
    datos.nuevo_stock === ""
  ) {
    throw new Error(
      "Ingresá el nuevo stock.",
    );
  }

  if (!datos.motivo) {
    throw new Error(
      "Seleccioná un motivo.",
    );
  }

  const payload = {
    variante_id: Number(
      datos.variante_id,
    ),

    nuevo_stock: Number(
      datos.nuevo_stock,
    ),

    motivo: String(
      datos.motivo,
    )
      .trim()
      .toUpperCase(),

    observacion:
      datos.observacion?.trim() ||
      null,
  };

  const { data } = await api.post(
    "/ajustes-stock",
    payload,
  );

  return extraerDatos(data);
}