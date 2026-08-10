import api from "../../services/api";

function extraerDatos(respuesta) {
  if (
    respuesta?.data !== undefined
  ) {
    return respuesta.data;
  }

  return respuesta;
}

export const getProductos =
  async () => {
    const { data } =
      await api.get(
        "/productos",
      );

    /*
     * Para el listado dejamos
     * el objeto completo porque
     * useProductos actualmente
     * puede manejar:
     *
     * data
     * o
     * data.data
     */
    return data;
  };

export const getProducto =
  async (id) => {
    if (!id) {
      throw new Error(
        "El producto no es válido.",
      );
    }

    const { data } =
      await api.get(
        `/productos/${id}`,
      );

    return extraerDatos(
      data,
    );
  };

export const crearProducto =
  async (producto) => {
    const { data } =
      await api.post(
        "/productos",
        producto,
      );

    /*
     * Backend:
     *
     * {
     *   success: true,
     *   message: "...",
     *   data: productoCreado
     * }
     *
     * Devolvemos solamente
     * productoCreado.
     */
    return extraerDatos(
      data,
    );
  };

export const actualizarProducto =
  async (
    id,
    producto,
  ) => {
    if (!id) {
      throw new Error(
        "El producto no es válido.",
      );
    }

    const { data } =
      await api.put(
        `/productos/${id}`,
        producto,
      );

    return extraerDatos(
      data,
    );
  };

export const eliminarProducto =
  async (id) => {
    if (!id) {
      throw new Error(
        "El producto no es válido.",
      );
    }

    const { data } =
      await api.delete(
        `/productos/${id}`,
      );

    return data;
  };