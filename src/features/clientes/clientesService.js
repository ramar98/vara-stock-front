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

export async function obtenerClientes({
  busqueda = "",
} = {}) {
  const parametros = {};

  if (busqueda.trim()) {
    parametros.busqueda = busqueda.trim();
  }

  const { data } = await api.get(
    "/clientes",
    {
      params: parametros,
    },
  );

  return extraerDatos(data) ?? [];
}

export async function obtenerClientePorId(
  clienteId,
) {
  if (!clienteId) {
    throw new Error(
      "El cliente seleccionado no es válido.",
    );
  }

  const { data } = await api.get(
    `/clientes/${clienteId}`,
  );

  return extraerDatos(data);
}

export async function crearCliente(datos) {
  const payload = {
    nombre: datos.nombre?.trim() ?? "",

    telefono:
      datos.telefono?.trim() || null,

    email:
      datos.email?.trim() || null,

    direccion:
      datos.direccion?.trim() || null,
  };

  const { data } = await api.post(
    "/clientes",
    payload,
  );

  return extraerDatos(data);
}

export async function actualizarCliente(
  clienteId,
  datos,
) {
  if (!clienteId) {
    throw new Error(
      "El cliente seleccionado no es válido.",
    );
  }

  const payload = {
    nombre: datos.nombre?.trim() ?? "",

    telefono:
      datos.telefono?.trim() || null,

    email:
      datos.email?.trim() || null,

    direccion:
      datos.direccion?.trim() || null,
  };

  const { data } = await api.put(
    `/clientes/${clienteId}`,
    payload,
  );

  return extraerDatos(data);
}

export async function eliminarCliente(
  clienteId,
) {
  if (!clienteId) {
    throw new Error(
      "El cliente seleccionado no es válido.",
    );
  }

  const { data } = await api.delete(
    `/clientes/${clienteId}`,
  );

  return extraerDatos(data);
}