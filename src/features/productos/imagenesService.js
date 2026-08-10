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

export async function obtenerImagenesProducto(
  productoId,
) {
  if (!productoId) {
    throw new Error(
      "El producto no es válido.",
    );
  }

  const { data } = await api.get(
    `/imagenes/producto/${productoId}`,
  );

  return extraerDatos(data) ?? [];
}

export async function subirImagenProducto({
  productoId,
  archivo,
  principal = false,
}) {
  if (!productoId) {
    throw new Error(
      "El producto no es válido.",
    );
  }

  if (!archivo) {
    throw new Error(
      "Seleccioná una imagen.",
    );
  }

  const formulario =
    new FormData();

  formulario.append(
    "producto_id",
    String(productoId),
  );

  formulario.append(
    "principal",
    principal
      ? "true"
      : "false",
  );

  /*
   * IMPORTANTE:
   * este nombre tiene que coincidir
   * con upload.single("imagen")
   * del backend.
   */
  formulario.append(
    "imagen",
    archivo,
    archivo.name,
  );

  const { data } =
    await api.post(
      "/imagenes",
      formulario,
      {
        headers: {
          /*
           * No poner application/json.
           *
           * Axios/navegador generará
           * automáticamente el boundary.
           */
          "Content-Type":
            undefined,
        },
      },
    );

  return extraerDatos(
    data,
  );
}

export async function subirVariasImagenesProducto({
  productoId,
  archivos,
}) {
  if (!productoId) {
    throw new Error(
      "El producto no es válido.",
    );
  }

  if (
    !Array.isArray(
      archivos,
    ) ||
    archivos.length === 0
  ) {
    throw new Error(
      "Seleccioná al menos una imagen.",
    );
  }

  const resultados = [];

  for (
    let indice = 0;
    indice <
    archivos.length;
    indice += 1
  ) {
    const resultado =
      await subirImagenProducto({
        productoId,

        archivo:
          archivos[
            indice
          ],

        /*
         * La primera imagen
         * queda como principal.
         */
        principal:
          indice === 0,
      });

    resultados.push(
      resultado,
    );
  }

  return resultados;
}

export async function marcarImagenPrincipal(
  imagenId,
) {
  if (!imagenId) {
    throw new Error(
      "La imagen no es válida.",
    );
  }

  const { data } =
    await api.put(
      `/imagenes/${imagenId}/principal`,
    );

  return extraerDatos(
    data,
  );
}

export async function eliminarImagenProducto(
  imagenId,
) {
  if (!imagenId) {
    throw new Error(
      "La imagen no es válida.",
    );
  }

  const { data } =
    await api.delete(
      `/imagenes/${imagenId}`,
    );

  return extraerDatos(
    data,
  );
}