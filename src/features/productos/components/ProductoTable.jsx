import {
  Box,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  DataGrid,
  GridActionsCellItem,
} from "@mui/x-data-grid";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001/api"
).replace(/\/api\/?$/, "");

/*
 * =====================================
 * FORMATEAR MONEDA
 * =====================================
 */

function formatearMoneda(valor) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    },
  ).format(
    Number(valor ?? 0),
  );
}

/*
 * =====================================
 * URL IMAGEN
 * =====================================
 */

function obtenerUrlImagen(ruta) {
  if (!ruta) {
    return "/no-image.png";
  }

  const rutaNormalizada =
    String(ruta).replaceAll(
      "\\",
      "/",
    );

  if (
    rutaNormalizada.startsWith(
      "http://",
    ) ||
    rutaNormalizada.startsWith(
      "https://",
    )
  ) {
    return rutaNormalizada;
  }

  return `${API_URL}/${rutaNormalizada.replace(
    /^\/+/,
    "",
  )}`;
}

/*
 * =====================================
 * PRODUCTO USA VARIANTES
 * =====================================
 */

function productoUsaVariantes(
  producto,
) {
  return (
    Number(
      producto?.usa_variantes ??
        1,
    ) === 1
  );
}

/*
 * =====================================
 * TABLA DE PRODUCTOS
 * =====================================
 */

export default function ProductoTable({
  productos = [],
  esAdministrador = false,
  esVendedor = false,
  onVerDetalle,
  onEditar,
  onEliminar,
}) {
  /*
   * ===================================
   * ACCIONES
   * ===================================
   */

  const columnaAcciones = {
    field: "acciones",
    type: "actions",
    headerName: "Acciones",

    width: esAdministrador
      ? 145
      : 80,

    minWidth: esAdministrador
      ? 145
      : 80,

    align: "center",
    headerAlign: "center",

    sortable: false,
    filterable: false,

    getActions: (params) => {
      const acciones = [
        <GridActionsCellItem
          key="detalle"
          icon={
            <Tooltip title="Ver detalle">
              <VisibilityIcon />
            </Tooltip>
          }
          label="Ver detalle"
          onClick={() =>
            onVerDetalle?.(
              params.row,
            )
          }
          showInMenu={false}
        />,
      ];

      if (esAdministrador) {
        acciones.push(
          <GridActionsCellItem
            key="editar"
            icon={
              <Tooltip title="Editar producto">
                <EditIcon />
              </Tooltip>
            }
            label="Editar"
            onClick={() =>
              onEditar?.(
                params.row,
              )
            }
            showInMenu={false}
            color="primary"
          />,
        );

        acciones.push(
          <GridActionsCellItem
            key="eliminar"
            icon={
              <Tooltip title="Eliminar producto">
                <DeleteIcon />
              </Tooltip>
            }
            label="Eliminar"
            onClick={() =>
              onEliminar?.(
                params.row,
              )
            }
            showInMenu={false}
            color="error"
          />,
        );
      }

      return acciones;
    },
  };

  /*
   * ===================================
   * IMAGEN
   * ===================================
   */

  const columnaImagen = {
    field: "imagen",
    headerName: "",

    width: 82,
    minWidth: 82,

    sortable: false,
    filterable: false,

    align: "center",
    headerAlign: "center",

    renderCell: (params) => (
      <Box
        sx={{
          width: "100%",
          height: "100%",

          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          component="img"
          src={obtenerUrlImagen(
            params.row.imagen,
          )}
          alt={
            params.row.nombre
          }
          onError={(event) => {
            event.currentTarget.src =
              "/no-image.png";
          }}
          sx={{
            width: 56,
            height: 56,

            borderRadius: 1.5,

            objectFit: "cover",

            border:
              "1px solid",

            borderColor:
              "divider",

            display: "block",
          }}
        />
      </Box>
    ),
  };

  /*
   * ===================================
   * PRODUCTO
   * ===================================
   */

  const columnaProducto = {
    field: "nombre",
    headerName: "Producto",

    minWidth: 250,
    flex: 1,

    renderCell: (params) => (
      <Stack
        spacing={0.4}
        sx={{
          width: "100%",
          height: "100%",

          justifyContent:
            "center",

          overflow:
            "hidden",

          py: 0.5,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,

            fontSize: 16,

            lineHeight: 1.25,

            color:
              "text.primary",

            overflow:
              "hidden",

            textOverflow:
              "ellipsis",

            whiteSpace:
              "nowrap",
          }}
          title={
            params.row.nombre
          }
        >
          {params.row.nombre ||
            "-"}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color:
              "text.secondary",

            fontSize: 12,

            lineHeight: 1.2,

            overflow:
              "hidden",

            textOverflow:
              "ellipsis",

            whiteSpace:
              "nowrap",
          }}
        >
          Código:{" "}
          {params.row.codigo ||
            "Sin código"}
        </Typography>
      </Stack>
    ),
  };

  /*
   * ===================================
   * PRECIO DE VENTA
   * ===================================
   */

  const columnaPrecioVenta = {
    field: "precio_venta",
    headerName: "Precio",

    width: 150,
    minWidth: 150,

    align: "center",
    headerAlign: "center",

    renderCell: (params) => (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            fontSize: 16,
            color: "success.dark",
            whiteSpace: "nowrap",
          }}
        >
          {formatearMoneda(
            params.value,
          )}
        </Typography>
      </Box>
    ),
  };

  /*
   * ===================================
   * STOCK
   * ===================================
   */

  const columnaStock = {
    field: "stock",
    headerName: "Stock",

    width: 110,
    minWidth: 110,

    align: "center",
    headerAlign: "center",

    renderCell: (params) => {
      const stock =
        Number(
          params.value ??
            0,
        );

      let color = "success";

      if (stock <= 0) {
        color = "error";
      } else if (
        stock <= 5
      ) {
        color = "warning";
      }

      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",

            display: "flex",

            justifyContent:
              "center",

            alignItems:
              "center",
          }}
        >
          <Chip
            label={stock}
            color={color}
            size="medium"
            sx={{
              minWidth: 52,
              height: 30,
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 2,
            }}
          />
        </Box>
      );
    },
  };

  /*
   * ===================================
   * COSTO
   * SOLO ADMINISTRADOR
   * ===================================
   */

  const columnaPrecioCosto = {
    field: "precio_costo",
    headerName: "Costo",

    width: 140,
    minWidth: 140,

    align: "right",
    headerAlign: "right",

    valueFormatter: (
      value,
    ) =>
      formatearMoneda(
        value,
      ),
  };

  /*
   * ===================================
   * MARGEN
   * SOLO ADMINISTRADOR
   * ===================================
   */

  const columnaMargen = {
    field: "margen",
    headerName: "Margen",

    width: 110,
    minWidth: 110,

    align: "right",
    headerAlign: "right",

    sortable: false,

    valueGetter: (
      _,
      row,
    ) => {
      const costo =
        Number(
          row.precio_costo ??
            0,
        );

      const venta =
        Number(
          row.precio_venta ??
            0,
        );

      if (costo <= 0) {
        return 0;
      }

      return (
        ((venta - costo) /
          costo) *
        100
      );
    },

    valueFormatter: (
      value,
    ) =>
      `${Number(
        value ?? 0,
      ).toFixed(1)} %`,
  };

  /*
   * ===================================
   * CÓDIGO
   * ===================================
   */

  const columnaCodigo = {
    field: "codigo",
    headerName: "Código",

    width: 140,
    minWidth: 140,

    align: "center",
    headerAlign: "center",

    sortable: true,

    renderCell: (params) => (
      <Box
        sx={{
          width: "100%",
          height: "100%",

          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",
        }}
      >
        <Chip
          label={
            params.value ||
            "-"
          }
          size="small"
          variant="outlined"
          sx={{
            minWidth: 90,
            fontWeight: 600,
            borderRadius: 1.5,
            fontFamily: "monospace",
            letterSpacing: 0.5,
          }}
        />
      </Box>
    ),
  };

  /*
   * ===================================
   * VARIANTES
   * ===================================
   *
   * IMPORTANTE:
   *
   * Un producto simple posee una
   * variante interna en la base de
   * datos para mantener un único
   * motor de stock.
   *
   * Esa variante no debe mostrarse
   * ni contarse en la interfaz.
   * ===================================
   */

  const columnaVariantes = {
    field: "variantes",
    headerName: "Variantes",

    width: 145,
    minWidth: 145,

    align: "center",
    headerAlign: "center",

    /*
     * Para ordenar:
     *
     * producto simple = 0
     * producto con variantes =
     * cantidad real.
     */

    valueGetter: (
      value,
      row,
    ) => {
      if (
        !productoUsaVariantes(
          row,
        )
      ) {
        return 0;
      }

      return Number(
        value ?? 0,
      );
    },

    renderCell: (
      params,
    ) => {
      const usaVariantes =
        productoUsaVariantes(
          params.row,
        );

      /*
       * PRODUCTO SIMPLE
       */

      if (!usaVariantes) {
        return (
          <Box
            sx={{
              width: "100%",
              height: "100%",

              display: "flex",

              justifyContent:
                "center",

              alignItems:
                "center",
            }}
          >
            <Chip
              label="Sin variantes"
              size="small"
              variant="outlined"
              color="default"
              sx={{
                fontWeight: 600,
              }}
            />
          </Box>
        );
      }

      /*
       * PRODUCTO CON VARIANTES
       */

      const cantidad =
        Number(
          params.row
            ?.variantes ??
            0,
        );

      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",

            display: "flex",

            justifyContent:
              "center",

            alignItems:
              "center",
          }}
        >
          <Chip
            label={
              cantidad === 1
                ? "1 variante"
                : `${cantidad} variantes`
            }
            size="small"
            color={
              cantidad > 0
                ? "primary"
                : "default"
            }
            variant="outlined"
            sx={{
              fontWeight: 600,
            }}
          />
        </Box>
      );
    },
  };

  /*
   * ===================================
   * CATEGORÍA
   * ===================================
   */

  const columnaCategoria = {
    field: "categoria",
    headerName: "Categoría",

    width: 150,
    minWidth: 150,

    align: "center",
    headerAlign: "center",

    renderCell: (params) => (
      <Box
        sx={{
          width: "100%",
          height: "100%",

          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
          }}
        >
          {params.value ||
            "-"}
        </Typography>
      </Box>
    ),
  };

  /*
   * ===================================
   * MARCA
   * ===================================
   */

  const columnaMarca = {
    field: "marca",
    headerName: "Marca",

    width: 140,
    minWidth: 140,

    align: "center",
    headerAlign: "center",

    renderCell: (params) => (
      <Box
        sx={{
          width: "100%",
          height: "100%",

          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
          }}
        >
          {params.value ||
            "-"}
        </Typography>
      </Box>
    ),
  };

  /*
   * ===================================
   * PROVEEDOR
   * ===================================
   */

  const columnaProveedor = {
    field: "proveedor",
    headerName: "Proveedor",

    width: 180,
    minWidth: 180,

    align: "center",
    headerAlign: "center",

    renderCell: (params) => (
      <Box
        sx={{
          width: "100%",
          height: "100%",

          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
          }}
        >
          {params.value ||
            "-"}
        </Typography>
      </Box>
    ),
  };

  /*
   * ===================================
   * ORDEN COLUMNAS
   * ===================================
   */

  const columnas = [
    columnaAcciones,
    columnaImagen,
    columnaProducto,

    // Información principal
    columnaStock,

    ...(esAdministrador
      ? [
          columnaPrecioCosto,
          columnaPrecioVenta,
          columnaMargen,
        ]
      : [
          columnaPrecioVenta,
        ]),

    // Información secundaria
    columnaCodigo,
    columnaVariantes,
    columnaCategoria,
    columnaMarca,
    columnaProveedor,
  ];

  /*
   * ===================================
   * TABLA
   * ===================================
   */

  return (
    <DataGrid
      rows={productos}
      columns={columnas}
      getRowId={(row) =>
        row.id
      }
      autoHeight
      disableRowSelectionOnClick

      /*
       * IMPORTANTE:
       * antes estaba en 64 y
       * recortaba nombre + código.
       */

      rowHeight={78}

      columnHeaderHeight={58}

      pageSizeOptions={[
        10,
        25,
        50,
      ]}

      initialState={{
        pagination: {
          paginationModel:
            {
              page: 0,
              pageSize:
                10,
            },
        },
      }}

      onRowDoubleClick={(
        params,
      ) =>
        onVerDetalle?.(
          params.row,
        )
      }

      sx={{
        border: 0,

        /*
         * HEADER
         */

        "& .MuiDataGrid-columnHeaders":
          {
            backgroundColor:
              "background.default",
          },

        "& .MuiDataGrid-columnHeaderTitle":
          {
            fontWeight: 700,

            color:
              "text.primary",
          },

        /*
         * CELDAS
         *
         * No usamos display:flex
         * global porque rompía
         * la celda Producto.
         */

        "& .MuiDataGrid-cell":
          {
            borderColor:
              "divider",
          },

        /*
         * FILAS
         */

        "& .MuiDataGrid-row":
          {
            cursor:
              "pointer",
          },

        "& .MuiDataGrid-row:hover":
          {
            backgroundColor:
              "action.hover",
          },

        /*
         * QUITAMOS OUTLINE AL HACER CLICK
         */

        "& .MuiDataGrid-cell:focus":
          {
            outline:
              "none",
          },

        "& .MuiDataGrid-columnHeader:focus":
          {
            outline:
              "none",
          },
      }}
    />
  );
}