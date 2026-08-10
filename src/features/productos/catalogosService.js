import api from "../../services/api";

function obtenerDatos(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (Array.isArray(respuesta?.data)) {
    return respuesta.data;
  }

  return [];
}

export const obtenerCategorias = async () => {
  const { data } = await api.get("/categorias");

  return obtenerDatos(data);
};

export const obtenerMarcas = async () => {
  const { data } = await api.get("/marcas");

  return obtenerDatos(data);
};

export const obtenerProveedores = async () => {
  const { data } = await api.get("/proveedores");

  return obtenerDatos(data);
};

export const obtenerColores = async () => {
  const { data } = await api.get("/colores");

  return obtenerDatos(data);
};

export const obtenerTalles = async () => {
  const { data } = await api.get("/talles");

  return obtenerDatos(data);
};

export const obtenerCatalogosProductos = async () => {
  const resultados = await Promise.allSettled([
    obtenerCategorias(),
    obtenerMarcas(),
    obtenerProveedores(),
    obtenerColores(),
    obtenerTalles(),
  ]);

  const [
    resultadoCategorias,
    resultadoMarcas,
    resultadoProveedores,
    resultadoColores,
    resultadoTalles,
  ] = resultados;

  const errores = [];

  if (resultadoCategorias.status === "rejected") {
    errores.push({
      catalogo: "categorías",
      error: resultadoCategorias.reason,
    });
  }

  if (resultadoMarcas.status === "rejected") {
    errores.push({
      catalogo: "marcas",
      error: resultadoMarcas.reason,
    });
  }

  if (resultadoProveedores.status === "rejected") {
    errores.push({
      catalogo: "proveedores",
      error: resultadoProveedores.reason,
    });
  }

  if (resultadoColores.status === "rejected") {
    errores.push({
      catalogo: "colores",
      error: resultadoColores.reason,
    });
  }

  if (resultadoTalles.status === "rejected") {
    errores.push({
      catalogo: "talles",
      error: resultadoTalles.reason,
    });
  }

  return {
    categorias:
      resultadoCategorias.status === "fulfilled"
        ? resultadoCategorias.value
        : [],

    marcas:
      resultadoMarcas.status === "fulfilled"
        ? resultadoMarcas.value
        : [],

    proveedores:
      resultadoProveedores.status === "fulfilled"
        ? resultadoProveedores.value
        : [],

    colores:
      resultadoColores.status === "fulfilled"
        ? resultadoColores.value
        : [],

    talles:
      resultadoTalles.status === "fulfilled"
        ? resultadoTalles.value
        : [],

    errores,
  };
};