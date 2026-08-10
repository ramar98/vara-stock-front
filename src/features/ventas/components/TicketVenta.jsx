import logoVara from "../../../assets/logo-vara.png";

function formatearMoneda(valor) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(
    Number(valor ?? 0),
  );
}

function formatearFecha(valor) {
  if (!valor) {
    return "-";
  }

  const fecha =
    new Date(valor);

  if (
    Number.isNaN(
      fecha.getTime(),
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(fecha);
}

function obtenerUsuario(venta) {
  const nombreCompleto = [
    venta?.usuario_nombre,
    venta?.usuario_apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    nombreCompleto ||
    "Sistema"
  );
}

function obtenerVariante(item) {
  const partes = [
    item?.color,
    item?.talle,
  ].filter(Boolean);

  if (
    partes.length === 0
  ) {
    return "";
  }

  return partes.join(
    " / ",
  );
}

function obtenerMetodoPago(valor) {
  const metodos = {
    EFECTIVO:
      "Efectivo",

    TRANSFERENCIA:
      "Transferencia",

    TARJETA:
      "Tarjeta",

    OTRO:
      "Otro",
  };

  return (
    metodos[valor] ||
    valor ||
    "-"
  );
}

function completarNumero(
  numero,
) {
  return String(
    numero ?? "",
  ).padStart(
    6,
    "0",
  );
}

export default function TicketVenta({
  venta,
}) {
  if (!venta) {
    return null;
  }

  const productos =
    Array.isArray(
      venta.productos,
    )
      ? venta.productos
      : [];

  return (
    <div
      id="ticket-venta-print"
      className="ticket-print-root"
    >
      <div className="ticket">
        {/* ===================== */}
        {/* ENCABEZADO */}
        {/* ===================== */}

        <div className="ticket-header">
          <img
            src={logoVara}
            alt="Vara"
            className="ticket-logo"
          />

          <div className="ticket-titulo">
            VARA MODAS
          </div>

          <div className="ticket-subtitulo">
            Comprobante de venta
          </div>
        </div>

        <div className="ticket-separador" />

        {/* ===================== */}
        {/* DATOS VENTA */}
        {/* ===================== */}

        <div className="ticket-info">
          <div className="ticket-fila">
            <span>
              Venta
            </span>

            <strong>
              #
              {completarNumero(
                venta.id,
              )}
            </strong>
          </div>

          <div className="ticket-fila">
            <span>
              Fecha
            </span>

            <span>
              {formatearFecha(
                venta.fecha,
              )}
            </span>
          </div>
        </div>

        <div className="ticket-separador" />

        {/* ===================== */}
        {/* CLIENTE */}
        {/* ===================== */}

        <div className="ticket-dato">
          <div className="ticket-label">
            Cliente
          </div>

          <div>
            {venta.cliente ||
              "Consumidor final"}
          </div>
        </div>

        <div className="ticket-dato">
          <div className="ticket-label">
            Vendedor
          </div>

          <div>
            {obtenerUsuario(
              venta,
            )}
          </div>
        </div>

        <div className="ticket-separador" />

        {/* ===================== */}
        {/* PRODUCTOS */}
        {/* ===================== */}

        <div className="ticket-productos">
          {productos.map(
            (item) => {
              const variante =
                obtenerVariante(
                  item,
                );

              return (
                <div
                  className="ticket-producto"
                  key={
                    item.id
                  }
                >
                  <div className="ticket-producto-nombre">
                    {item.producto_nombre ||
                      "Producto"}
                  </div>

                  {item.producto_codigo && (
                    <div className="ticket-producto-detalle">
                      Código:{" "}
                      {
                        item.producto_codigo
                      }
                    </div>
                  )}

                  {variante && (
                    <div className="ticket-producto-detalle">
                      {variante}
                    </div>
                  )}

                  <div className="ticket-producto-calculo">
                    <span>
                      {Number(
                        item.cantidad ??
                          0,
                      )}{" "}
                      x{" "}
                      {formatearMoneda(
                        item.precio_unitario,
                      )}
                    </span>

                    <strong>
                      {formatearMoneda(
                        item.subtotal,
                      )}
                    </strong>
                  </div>
                </div>
              );
            },
          )}
        </div>

        <div className="ticket-separador" />

        {/* ===================== */}
        {/* TOTALES */}
        {/* ===================== */}

        <div className="ticket-totales">
          <div className="ticket-fila">
            <span>
              Subtotal
            </span>

            <span>
              {formatearMoneda(
                venta.subtotal,
              )}
            </span>
          </div>

          {Number(
            venta.descuento ??
              0,
          ) > 0 && (
            <div className="ticket-fila">
              <span>
                Descuento
              </span>

              <span>
                -{" "}
                {formatearMoneda(
                  venta.descuento,
                )}
              </span>
            </div>
          )}
        </div>

        <div className="ticket-total">
          <span>
            TOTAL
          </span>

          <strong>
            {formatearMoneda(
              venta.total,
            )}
          </strong>
        </div>

        {/* ===================== */}
        {/* MÉTODO DE PAGO */}
        {/* ===================== */}

        <div className="ticket-separador" />

        <div className="ticket-pago">
          <span>
            Método de pago
          </span>

          <strong>
            {obtenerMetodoPago(
              venta.metodo_pago,
            )}
          </strong>
        </div>

        {/* ===================== */}
        {/* PIE */}
        {/* ===================== */}

        <div className="ticket-separador" />

        <div className="ticket-footer">
          <div>
            ¡Gracias por tu compra!
          </div>

          <div className="ticket-footer-secundario">
            Conservá este comprobante.
          </div>
        </div>
      </div>
    </div>
  );
}