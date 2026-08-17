import api from "../../services/api";

function extraerDatos(respuesta) {
  if (respuesta?.data !== undefined) {
    return respuesta.data;
  }

  return respuesta;
}

export async function obtenerConfiguracion() {
  const { data } = await api.get(
    "/configuracion",
  );

  return extraerDatos(data);
}

export async function actualizarConfiguracion(
  datos,
) {
  const payload = {
    nombre_negocio:
      datos.nombre_negocio?.trim() ?? "",

    eslogan:
      datos.eslogan?.trim() || null,

    telefono:
      datos.telefono?.trim() || null,

    email:
      datos.email?.trim() || null,

    direccion:
      datos.direccion?.trim() || null,

    moneda:
      String(datos.moneda ?? "ARS")
        .trim()
        .toUpperCase(),

    porcentaje_iva: Number(
      datos.porcentaje_iva ?? 0,
    ),

    stock_minimo_predeterminado:
      Number(
        datos.stock_minimo_predeterminado ??
          0,
      ),

    encabezado_comprobante:
      datos.encabezado_comprobante?.trim() ||
      null,

    pie_comprobante:
      datos.pie_comprobante?.trim() ||
      null,
  };

  const { data } = await api.put(
    "/configuracion",
    payload,
  );

  return extraerDatos(data);
}

export async function actualizarLogo(
  logoData,
) {
  const { data } = await api.put(
    "/configuracion/logo",
    {
      logo_data: logoData,
    },
  );

  return extraerDatos(data);
}

export async function eliminarLogo() {
  const { data } = await api.delete(
    "/configuracion/logo",
  );

  return extraerDatos(data);
}