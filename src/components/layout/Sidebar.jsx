import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  BarChart,
  Business,
  Category,
  Dashboard,
  Inventory2,
  LocalShipping,
  Logout,
  ManageAccounts,
  People,
  PointOfSale,
  Settings,
  ShoppingCart,
  Tune,
} from "@mui/icons-material";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../features/auth/context/AuthContext";

import useConfiguracion from "../../features/configuracion/hooks/useConfiguracion";

const menu = [
  {
    text:
      "Dashboard",

    icon:
      <Dashboard />,

    path:
      "/dashboard",

    roles: [
      "ADMINISTRADOR",
      "VENDEDOR",
    ],
  },

  {
    text:
      "Productos",

    icon:
      <Inventory2 />,

    path:
      "/productos",

    roles: [
      "ADMINISTRADOR",
      "VENDEDOR",
    ],
  },

  {
    text:
      "Compras",

    icon:
      <ShoppingCart />,

    path:
      "/compras",

    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text:
      "Ventas",

    icon:
      <PointOfSale />,

    path:
      "/ventas",

    roles: [
      "ADMINISTRADOR",
      "VENDEDOR",
    ],
  },

  {
    text:
      "Proveedores",

    icon:
      <LocalShipping />,

    path:
      "/proveedores",

    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text:
      "Clientes",

    icon:
      <People />,

    path:
      "/clientes",

    roles: [
      "ADMINISTRADOR",
      "VENDEDOR",
    ],
  },

  {
    text:
      "Ajustes de stock",

    icon:
      <Tune />,

    path:
      "/ajustes-stock",

    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text:
      "Reportes",

    icon:
      <BarChart />,

    path:
      "/reportes",

    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text:
      "Catálogos",

    icon:
      <Category />,

    path:
      "/catalogos",

    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text:
      "Usuarios",

    icon:
      <ManageAccounts />,

    path:
      "/usuarios",

    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text:
      "Configuración",

    icon:
      <Settings />,

    path:
      "/configuracion",

    roles: [
      "ADMINISTRADOR",
    ],
  },
];

function obtenerIniciales(
  usuario,
) {
  const nombre =
    usuario
      ?.nombre
      ?.trim() ??
    "";

  const apellido =
    usuario
      ?.apellido
      ?.trim() ??
    "";

  const inicialNombre =
    nombre.charAt(0);

  const inicialApellido =
    apellido.charAt(0);

  const iniciales =
    `${inicialNombre}${inicialApellido}`
      .toUpperCase();

  return (
    iniciales ||
    "U"
  );
}

function obtenerNombreCompleto(
  usuario,
) {
  const nombreCompleto = [
    usuario?.nombre,
    usuario?.apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    nombreCompleto ||
    usuario?.usuario ||
    "Usuario"
  );
}

function normalizarRol(
  rol,
) {
  return String(
    rol ?? "",
  )
    .trim()
    .toUpperCase();
}

function obtenerNombreNegocio({
  configuracion,
  usuario,
}) {
  const nombreConfiguracion =
    configuracion
      ?.nombre_negocio
      ?.trim();

  if (
    nombreConfiguracion
  ) {
    return nombreConfiguracion;
  }

  const nombreEmpresa =
    usuario
      ?.empresa
      ?.trim();

  if (
    nombreEmpresa
  ) {
    return nombreEmpresa;
  }

  return "Mi negocio";
}

function obtenerInicialNegocio(
  nombre,
) {
  const texto =
    String(
      nombre ??
        "",
    ).trim();

  if (!texto) {
    return "N";
  }

  return texto
    .charAt(0)
    .toUpperCase();
}

export default function Sidebar({
  drawerWidth,
  mobile = false,
  open = false,
  onClose,
}) {
  const navigate =
    useNavigate();

  const {
    usuario,
    cerrarSesion,
  } = useAuth();

  const {
    configuracion,
    cargandoConfiguracion,
  } = useConfiguracion();

  const rolUsuario =
    normalizarRol(
      usuario?.rol,
    );

  const nombreNegocio =
    obtenerNombreNegocio({
      configuracion,
      usuario,
    });

  const inicialNegocio =
    obtenerInicialNegocio(
      nombreNegocio,
    );

  const menuVisible =
    menu.filter(
      (item) =>
        item.roles.includes(
          rolUsuario,
        ),
    );

  const cerrarSiMobile = () => {
    if (
      mobile &&
      onClose
    ) {
      onClose();
    }
  };

  const salir = () => {
    cerrarSesion();

    cerrarSiMobile();

    navigate(
      "/login",
      {
        replace:
          true,
      },
    );
  };

  const contenidoSidebar = (
    <>
      {/* ====================== */}
      {/* NEGOCIO */}
      {/* ====================== */}

      <Box
        sx={{
          px:
            2,

          py:
            2,

          minHeight:
            105,

          display:
            "flex",

          alignItems:
            "center",

          background:
            "linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)",
        }}
      >
        {cargandoConfiguracion ? (
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              width:
                "100%",
            }}
          >
            <Skeleton
              variant="rounded"
              width={52}
              height={52}
            />

            <Box
              sx={{
                flex:
                  1,
              }}
            >
              <Skeleton
                width="75%"
                height={26}
              />

              <Skeleton
                width="45%"
                height={20}
              />
            </Box>
          </Stack>
        ) : (
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              width:
                "100%",

              minWidth:
                0,
            }}
          >
            {configuracion
              ?.logo_data ? (
              <Box
                sx={{
                  width:
                    58,

                  height:
                    58,

                  flexShrink:
                    0,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  overflow:
                    "hidden",

                  borderRadius:
                    2,

                  border:
                    "1px solid #E7E2DA",

                  backgroundColor:
                    "#FFFFFF",
                }}
              >
                <Box
                  component="img"
                  src={
                    configuracion
                      .logo_data
                  }
                  alt={
                    nombreNegocio
                  }
                  sx={{
                    width:
                      "100%",

                    height:
                      "100%",

                    objectFit:
                      "contain",

                    p:
                      0.5,
                  }}
                />
              </Box>
            ) : (
              <Avatar
                variant="rounded"
                sx={{
                  width:
                    52,

                  height:
                    52,

                  backgroundColor:
                    "#171717",

                  color:
                    "#FFFFFF",

                  fontWeight:
                    800,

                  fontSize:
                    21,

                  borderRadius:
                    2,
                }}
              >
                {
                  inicialNegocio
                }
              </Avatar>
            )}

            <Box
              sx={{
                minWidth:
                  0,

                flex:
                  1,
              }}
            >
              <Typography
                variant="subtitle1"
                noWrap
                sx={{
                  fontWeight:
                    800,

                  color:
                    "#111111",

                  lineHeight:
                    1.25,
                }}
              >
                {
                  nombreNegocio
                }
              </Typography>

              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{
                  mt:
                    0.5,
                }}
              >
                <Business
                  sx={{
                    fontSize:
                      14,

                    color:
                      "text.secondary",
                  }}
                />

                <Typography
                  variant="caption"
                  noWrap
                  color="text.secondary"
                >
                  Sistema de gestión
                </Typography>
              </Stack>
            </Box>
          </Stack>
        )}
      </Box>

      <Divider />

      {/* ====================== */}
      {/* MENÚ */}
      {/* ====================== */}

      <Box
        sx={{
          flex:
            1,

          px:
            1.5,

          py:
            1.5,

          overflowY:
            "auto",
        }}
      >
        <List
          disablePadding
        >
          {menuVisible.map(
            (item) => (
              <ListItemButton
                key={
                  item.text
                }
                component={
                  NavLink
                }
                to={
                  item.path
                }
                onClick={
                  cerrarSiMobile
                }
                sx={{
                  minHeight:
                    46,

                  mb:
                    0.75,

                  px:
                    2,

                  borderRadius:
                    2,

                  color:
                    "#3E3A36",

                  transition:
                    "background-color 0.2s ease, color 0.2s ease, transform 0.2s ease",

                  "& .MuiListItemIcon-root":
                    {
                      minWidth:
                        40,

                      color:
                        "#67615B",
                    },

                  "&:hover":
                    {
                      backgroundColor:
                        "#F1EDE7",

                      color:
                        "#111111",

                      transform:
                        "translateX(2px)",
                    },

                  "&.active":
                    {
                      backgroundColor:
                        "#111111",

                      color:
                        "#FFFFFF",

                      boxShadow:
                        "0 8px 18px rgba(17, 17, 17, 0.14)",

                      "& .MuiListItemIcon-root":
                        {
                          color:
                            "#FFFFFF",
                        },

                      "&:hover":
                        {
                          backgroundColor:
                            "#262626",
                        },
                    },
                }}
              >
                <ListItemIcon>
                  {
                    item.icon
                  }
                </ListItemIcon>

                <ListItemText
                  primary={
                    item.text
                  }
                  slotProps={{
                    primary:
                      {
                        fontSize:
                          14,

                        fontWeight:
                          600,
                      },
                  }}
                />
              </ListItemButton>
            ),
          )}
        </List>
      </Box>

      <Divider />

      {/* ====================== */}
      {/* USUARIO */}
      {/* ====================== */}

      <Box
        sx={{
          p:
            1.5,

          backgroundColor:
            "#FCFAF7",
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems:
              "center",

            p:
              1.25,

            borderRadius:
              2,

            border:
              "1px solid #E7E2DA",

            backgroundColor:
              "#FFFFFF",
          }}
        >
          <Avatar
            sx={{
              width:
                38,

              height:
                38,

              backgroundColor:
                "#171717",

              color:
                "#FFFFFF",

              fontSize:
                13,

              fontWeight:
                700,
            }}
          >
            {obtenerIniciales(
              usuario,
            )}
          </Avatar>

          <Box
            sx={{
              flex:
                1,

              minWidth:
                0,
            }}
          >
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontWeight:
                  700,
              }}
            >
              {obtenerNombreCompleto(
                usuario,
              )}
            </Typography>

            <Typography
              variant="caption"
              noWrap
              color="text.secondary"
            >
              {usuario?.rol ||
                usuario?.usuario ||
                "Usuario"}
            </Typography>
          </Box>

          <Tooltip
            title="Cerrar sesión"
          >
            <ListItemButton
              onClick={
                salir
              }
              aria-label="Cerrar sesión"
              sx={{
                width:
                  38,

                height:
                  38,

                minWidth:
                  38,

                p:
                  0,

                borderRadius:
                  2,

                justifyContent:
                  "center",

                color:
                  "#716A63",
              }}
            >
              <Logout
                fontSize="small"
              />
            </ListItemButton>
          </Tooltip>
        </Stack>
      </Box>
    </>
  );

  return (
    <Drawer
      variant={
        mobile
          ? "temporary"
          : "permanent"
      }
      open={
        mobile
          ? open
          : true
      }
      onClose={
        onClose
      }
      ModalProps={{
        keepMounted:
          true,
      }}
      sx={{
        width:
          drawerWidth,

        flexShrink:
          mobile
            ? 0
            : 0,

        "& .MuiDrawer-paper":
          {
            width:
              drawerWidth,

            boxSizing:
              "border-box",

            borderRight:
              "1px solid #E7E2DA",

            backgroundColor:
              "#FFFFFF",

            color:
              "#111111",

            display:
              "flex",

            flexDirection:
              "column",
          },
      }}
    >
      {
        contenidoSidebar
      }
    </Drawer>
  );
}