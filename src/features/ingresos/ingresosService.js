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

export async function obtenerIngresos(filtros = {}) {
  const parametros = {};

  if (filtros.fechaDesde) {
    parametros.fecha_desde = filtros.fechaDesde;
  }

  if (filtros.fechaHasta) {
    parametros.fecha_hasta = filtros.fechaHasta;
  }

  if (filtros.proveedorId) {
    parametros.proveedor_id = filtros.proveedorId;
  }

  const { data } = await api.get("/ingresos", {
    params: parametros,
  });

  return extraerDatos(data) ?? [];
}

export async function obtenerIngresoPorId(ingresoId) {
  if (!ingresoId) {
    throw new Error("El ingreso no es válido.");
  }

  const { data } = await api.get(
    `/ingresos/${ingresoId}`,
  );

  return extraerDatos(data);
}

export async function crearIngreso(datos) {
  if (!datos?.proveedor_id) {
    throw new Error("Seleccioná un proveedor.");
  }

  if (!datos?.fecha) {
    throw new Error("Ingresá la fecha del ingreso.");
  }

  if (
    !Array.isArray(datos.productos) ||
    datos.productos.length === 0
  ) {
    throw new Error(
      "Agregá al menos una variante al ingreso.",
    );
  }

  const payload = {
    proveedor_id: Number(datos.proveedor_id),

    numero_comprobante:
      datos.numero_comprobante?.trim() || null,

    fecha: datos.fecha,

    observaciones:
      datos.observaciones?.trim() || null,

    usuario_id: datos.usuario_id
      ? Number(datos.usuario_id)
      : null,

    productos: datos.productos.map((item) => ({
      variante_id: Number(item.variante_id),
      cantidad: Number(item.cantidad),
      precio_costo: Number(item.precio_costo),
    })),
  };

  const { data } = await api.post(
    "/ingresos",
    payload,
  );

  return extraerDatos(data);
}