import api from "../../../services/api";

function extraerDatos(respuesta) {
  return respuesta?.data?.data;
}

export async function obtenerUsuarios({
  busqueda = "",
} = {}) {
  const { data } = await api.get(
    "/usuarios",
    {
      params: {
        busqueda:
          busqueda || undefined,
      },
    },
  );

  return data?.data ?? [];
}

export async function obtenerRoles() {
  const { data } = await api.get(
    "/usuarios/roles",
  );

  return data?.data ?? [];
}

export async function obtenerUsuario(id) {
  const { data } = await api.get(
    `/usuarios/${id}`,
  );

  return extraerDatos({
    data,
  });
}

export async function crearUsuario(
  datos,
) {
  const { data } = await api.post(
    "/usuarios",
    datos,
  );

  return data;
}

export async function actualizarUsuario(
  id,
  datos,
) {
  const { data } = await api.put(
    `/usuarios/${id}`,
    datos,
  );

  return data;
}

export async function cambiarEstadoUsuario(
  id,
  activo,
) {
  const { data } = await api.patch(
    `/usuarios/${id}/estado`,
    {
      activo,
    },
  );

  return data;
}

export async function cambiarPasswordUsuario(
  id,
  password,
) {
  const { data } = await api.patch(
    `/usuarios/${id}/password`,
    {
      password,
    },
  );

  return data;
}