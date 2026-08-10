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

export async function obtenerVentas(filtros = {}) {
  const parametros = {};

  if (filtros.fechaDesde) {
    parametros.fecha_desde = filtros.fechaDesde;
  }

  if (filtros.fechaHasta) {
    parametros.fecha_hasta = filtros.fechaHasta;
  }

  if (filtros.clienteId) {
    parametros.cliente_id = filtros.clienteId;
  }

  if (filtros.metodoPago) {
    parametros.metodo_pago = filtros.metodoPago;
  }

  const { data } = await api.get("/ventas", {
    params: parametros,
  });

  return extraerDatos(data) ?? [];
}

export async function obtenerVentaPorId(ventaId) {
  if (!ventaId) {
    throw new Error("La venta no es válida.");
  }

  const { data } = await api.get(
    `/ventas/${ventaId}`,
  );

  return extraerDatos(data);
}

export async function crearVenta(datos) {
  if (
    !Array.isArray(datos?.productos) ||
    datos.productos.length === 0
  ) {
    throw new Error(
      "Agregá al menos un producto a la venta.",
    );
  }

  if (!datos.metodo_pago) {
    throw new Error(
      "Seleccioná un método de pago.",
    );
  }

  const payload = {
    cliente_id: datos.cliente_id
      ? Number(datos.cliente_id)
      : null,

    descuento: Number(
      datos.descuento ?? 0,
    ),

    metodo_pago: String(
      datos.metodo_pago,
    ).toUpperCase(),

    usuario_id: datos.usuario_id
      ? Number(datos.usuario_id)
      : null,

    productos: datos.productos.map(
      (item) => ({
        variante_id: Number(
          item.variante_id,
        ),

        cantidad: Number(
          item.cantidad,
        ),

        precio_unitario: Number(
          item.precio_unitario,
        ),
      }),
    ),
  };

  const { data } = await api.post(
    "/ventas",
    payload,
  );

  return extraerDatos(data);
}