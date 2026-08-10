import api from "../../services/api";

const TIPOS_VALIDOS = [
  "categorias",
  "marcas",
  "colores",
  "talles",
];

function validarTipo(tipo) {
  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw new Error(
      "El tipo de catálogo no es válido.",
    );
  }
}

function extraerDatos(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (respuesta?.data !== undefined) {
    return respuesta.data;
  }

  return respuesta;
}

export async function obtenerElementosCatalogo({
  tipo,
  busqueda = "",
}) {
  validarTipo(tipo);

  const params = {};

  const texto = String(
    busqueda ?? "",
  ).trim();

  if (texto) {
    params.busqueda = texto;
  }

  const { data } = await api.get(
    `/admin/catalogos/${tipo}`,
    {
      params,
    },
  );

  const resultado = extraerDatos(data);

  return Array.isArray(resultado)
    ? resultado
    : [];
}

export async function obtenerElementoCatalogo({
  tipo,
  elementoId,
}) {
  validarTipo(tipo);

  if (!elementoId) {
    throw new Error(
      "El elemento seleccionado no es válido.",
    );
  }

  const { data } = await api.get(
    `/admin/catalogos/${tipo}/${elementoId}`,
  );

  return extraerDatos(data);
}

export async function crearElementoCatalogo({
  tipo,
  datos,
}) {
  validarTipo(tipo);

  const payload = {
    nombre:
      datos?.nombre?.trim() ?? "",
  };

  const { data } = await api.post(
    `/admin/catalogos/${tipo}`,
    payload,
  );

  return extraerDatos(data);
}

export async function actualizarElementoCatalogo({
  tipo,
  elementoId,
  datos,
}) {
  validarTipo(tipo);

  if (!elementoId) {
    throw new Error(
      "El elemento seleccionado no es válido.",
    );
  }

  const payload = {
    nombre:
      datos?.nombre?.trim() ?? "",
  };

  const { data } = await api.put(
    `/admin/catalogos/${tipo}/${elementoId}`,
    payload,
  );

  return extraerDatos(data);
}

export async function eliminarElementoCatalogo({
  tipo,
  elementoId,
}) {
  validarTipo(tipo);

  if (!elementoId) {
    throw new Error(
      "El elemento seleccionado no es válido.",
    );
  }

  const { data } = await api.delete(
    `/admin/catalogos/${tipo}/${elementoId}`,
  );

  return extraerDatos(data);
}

export {
  TIPOS_VALIDOS,
};