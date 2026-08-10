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

export async function obtenerProveedores({
  busqueda = "",
} = {}) {
  const params = {};

  const texto = String(busqueda ?? "").trim();

  if (texto) {
    params.busqueda = texto;
  }

  const { data } = await api.get(
    "/proveedores",
    {
      params,
    },
  );

  return extraerDatos(data) ?? [];
}

export async function obtenerProveedorPorId(
  proveedorId,
) {
  if (!proveedorId) {
    throw new Error(
      "El proveedor seleccionado no es válido.",
    );
  }

  const { data } = await api.get(
    `/proveedores/${proveedorId}`,
  );

  return extraerDatos(data);
}

export async function crearProveedor(datos) {
  const payload = {
    nombre:
      datos.nombre?.trim() ?? "",

    telefono:
      datos.telefono?.trim() || null,

    email:
      datos.email?.trim() || null,

    direccion:
      datos.direccion?.trim() || null,

    observaciones:
      datos.observaciones?.trim() || null,
  };

  const { data } = await api.post(
    "/proveedores",
    payload,
  );

  return extraerDatos(data);
}

export async function actualizarProveedor(
  proveedorId,
  datos,
) {
  if (!proveedorId) {
    throw new Error(
      "El proveedor seleccionado no es válido.",
    );
  }

  const payload = {
    nombre:
      datos.nombre?.trim() ?? "",

    telefono:
      datos.telefono?.trim() || null,

    email:
      datos.email?.trim() || null,

    direccion:
      datos.direccion?.trim() || null,

    observaciones:
      datos.observaciones?.trim() || null,
  };

  const { data } = await api.put(
    `/proveedores/${proveedorId}`,
    payload,
  );

  return extraerDatos(data);
}

export async function eliminarProveedor(
  proveedorId,
) {
  if (!proveedorId) {
    throw new Error(
      "El proveedor seleccionado no es válido.",
    );
  }

  const { data } = await api.delete(
    `/proveedores/${proveedorId}`,
  );

  return extraerDatos(data);
}