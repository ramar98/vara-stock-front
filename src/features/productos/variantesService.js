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

export async function obtenerVariantesPorProducto(productoId) {
  if (!productoId) {
    throw new Error("El producto no es válido.");
  }

  const { data } = await api.get(
    `/variantes/producto/${productoId}`,
  );

  return extraerDatos(data) ?? [];
}

export async function crearVariante(datos) {
  const { data } = await api.post(
    "/variantes",
    datos,
  );

  return extraerDatos(data);
}

export async function actualizarVariante(
  varianteId,
  datos,
) {
  if (!varianteId) {
    throw new Error("La variante no es válida.");
  }

  const { data } = await api.put(
    `/variantes/${varianteId}`,
    datos,
  );

  return extraerDatos(data);
}

export async function eliminarVariante(varianteId) {
  if (!varianteId) {
    throw new Error("La variante no es válida.");
  }

  const { data } = await api.delete(
    `/variantes/${varianteId}`,
  );

  return extraerDatos(data);
}