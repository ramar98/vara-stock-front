import api from "../../services/api";

const TOKEN_KEY = "vara_token";
const USER_KEY = "vara_usuario";

function extraerDatos(respuesta) {
  if (respuesta?.data !== undefined) {
    return respuesta.data;
  }

  return respuesta;
}

export function guardarSesion({
  token,
  usuario,
}) {
  localStorage.setItem(
    TOKEN_KEY,
    token,
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(usuario),
  );
}

export function obtenerTokenGuardado() {
  return localStorage.getItem(
    TOKEN_KEY,
  );
}

export function obtenerUsuarioGuardado() {
  const usuarioTexto =
    localStorage.getItem(USER_KEY);

  if (!usuarioTexto) {
    return null;
  }

  try {
    return JSON.parse(
      usuarioTexto,
    );
  } catch {
    localStorage.removeItem(
      USER_KEY,
    );

    return null;
  }
}

export function eliminarSesionGuardada() {
  localStorage.removeItem(
    TOKEN_KEY,
  );

  localStorage.removeItem(
    USER_KEY,
  );
}

export async function iniciarSesion({
  identificador,
  password,
}) {
  const { data } = await api.post(
    "/auth/login",
    {
      identificador,
      password,
    },
  );

  const resultado =
    extraerDatos(data);

  guardarSesion(resultado);

  return resultado;
}

export async function obtenerSesionActual() {
  const { data } = await api.get(
    "/auth/me",
  );

  const resultado =
    extraerDatos(data);

  const usuario =
    resultado?.usuario ?? null;

  if (usuario) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(usuario),
    );
  }

  return usuario;
}

export async function registrarUsuario(
  datos,
) {
  const payload = {
    nombre:
      datos.nombre?.trim() ?? "",

    apellido:
      datos.apellido?.trim() ?? "",

    usuario:
      datos.usuario?.trim() ?? "",

    email:
      datos.email
        ?.trim()
        .toLowerCase() ?? "",

    password:
      datos.password ?? "",

    rol_id: Number(
      datos.rol_id,
    ),
  };

  const { data } = await api.post(
    "/auth/register",
    payload,
  );

  return extraerDatos(data);
}

export async function registrarEmpresa(
  datos,
) {
  const payload = {
    empresa: {
      nombre:
        datos.empresa?.nombre
          ?.trim() ?? "",

      cuit:
        datos.empresa?.cuit
          ?.trim() ?? "",

      email:
        datos.empresa?.email
          ?.trim()
          .toLowerCase() ?? "",

      telefono:
        datos.empresa?.telefono
          ?.trim() ?? "",

      plan:
        datos.empresa?.plan ??
        "BASICO",
    },

    administrador: {
      nombre:
        datos.administrador?.nombre
          ?.trim() ?? "",

      apellido:
        datos.administrador?.apellido
          ?.trim() ?? "",

      usuario:
        datos.administrador?.usuario
          ?.trim() ?? "",

      email:
        datos.administrador?.email
          ?.trim()
          .toLowerCase() ?? "",

      password:
        datos.administrador?.password ??
        "",
    },
  };

  const { data } =
    await api.post(
      "/empresas",
      payload,
    );

  return extraerDatos(
    data,
  );
}