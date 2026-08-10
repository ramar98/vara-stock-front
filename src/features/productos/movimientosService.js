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

export async function obtenerMovimientosProducto(productoId) {
  if (!productoId) {
    throw new Error("El producto no es válido.");
  }

  const { data } = await api.get(
    `/movimientos/producto/${productoId}`,
  );

  return extraerDatos(data) ?? [];
}

export async function obtenerMovimientosVariante(varianteId) {
  if (!varianteId) {
    throw new Error("La variante no es válida.");
  }

  const { data } = await api.get(
    `/movimientos/variante/${varianteId}`,
  );

  return extraerDatos(data) ?? [];
}

export async function obtenerMovimiento(movimientoId) {
  if (!movimientoId) {
    throw new Error("El movimiento no es válido.");
  }

  const { data } = await api.get(
    `/movimientos/${movimientoId}`,
  );

  return extraerDatos(data);
}