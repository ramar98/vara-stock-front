import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  BarChart,
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

import { useAuth } from "../../features/auth/context/AuthContext";

import logoVara from "../../assets/logo-vara.png";

const menu = [
  {
    text: "Dashboard",
    icon: <Dashboard />,
    path: "/dashboard",
    roles: [
      "ADMINISTRADOR",
      "VENDEDOR",
    ],
  },

  {
    text: "Productos",
    icon: <Inventory2 />,
    path: "/productos",
    roles: [
      "ADMINISTRADOR",
      "VENDEDOR",
    ],
  },

  {
    text: "Compras",
    icon: <ShoppingCart />,
    path: "/compras",
    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text: "Ventas",
    icon: <PointOfSale />,
    path: "/ventas",
    roles: [
      "ADMINISTRADOR",
      "VENDEDOR",
    ],
  },

  {
    text: "Proveedores",
    icon: <LocalShipping />,
    path: "/proveedores",
    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text: "Clientes",
    icon: <People />,
    path: "/clientes",
    roles: [
      "ADMINISTRADOR",
      "VENDEDOR",
    ],
  },

  {
    text: "Ajustes de stock",
    icon: <Tune />,
    path: "/ajustes-stock",
    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text: "Reportes",
    icon: <BarChart />,
    path: "/reportes",
    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text: "Catálogos",
    icon: <Category />,
    path: "/catalogos",
    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text: "Usuarios",
    icon: <ManageAccounts />,
    path: "/usuarios",
    roles: [
      "ADMINISTRADOR",
    ],
  },

  {
    text: "Configuración",
    icon: <Settings />,
    path: "/configuracion",
    roles: [
      "ADMINISTRADOR",
    ],
  },
];

function obtenerIniciales(usuario) {
  const nombre =
    usuario?.nombre?.trim() ?? "";

  const apellido =
    usuario?.apellido?.trim() ?? "";

  const inicialNombre =
    nombre.charAt(0);

  const inicialApellido =
    apellido.charAt(0);

  const iniciales =
    `${inicialNombre}${inicialApellido}`.toUpperCase();

  return iniciales || "U";
}

function obtenerNombreCompleto(usuario) {
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

function normalizarRol(rol) {
  return String(
    rol ?? "",
  )
    .trim()
    .toUpperCase();
}

export default function Sidebar({
  drawerWidth,
}) {
  const navigate = useNavigate();

  const {
    usuario,
    cerrarSesion,
  } = useAuth();

  const rolUsuario =
    normalizarRol(
      usuario?.rol,
    );

  /*
   * Solo mostramos las opciones
   * permitidas para el rol actual.
   */
  const menuVisible =
    menu.filter((item) =>
      item.roles.includes(
        rolUsuario,
      ),
    );

  const salir = () => {
    cerrarSesion();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing:
            "border-box",

          borderRight:
            "1px solid #E7E2DA",

          backgroundColor:
            "#FFFFFF",

          color: "#111111",

          display: "flex",

          flexDirection:
            "column",
        },
      }}
    >
      {/* LOGO */}
      <Box
        sx={{
          px: 1,
          pt: 0.8,
          pb: 0.5,

          height: 125,

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          overflow:
            "hidden",

          background:
            "linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)",
        }}
      >
        <Box
          component="img"
          src={logoVara}
          alt="Vara Modas"
          sx={{
            width: "92%",

            maxWidth: 245,

            height: "auto",

            maxHeight: 115,

            objectFit:
              "contain",

            display: "block",
          }}
        />
      </Box>

      <Divider
        sx={{
          borderColor:
            "#E7E2DA",
        }}
      />

      {/* MENÚ */}
      <Box
        sx={{
          flex: 1,

          px: 1.5,

          py: 1.5,

          overflowY:
            "auto",
        }}
      >
        <List disablePadding>
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
                sx={{
                  minHeight:
                    46,

                  mb: 0.75,

                  px: 2,

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

                      transition:
                        "color 0.2s ease",
                    },

                  "&:hover":
                    {
                      backgroundColor:
                        "#F1EDE7",

                      color:
                        "#111111",

                      transform:
                        "translateX(2px)",

                      "& .MuiListItemIcon-root":
                        {
                          color:
                            "#111111",
                        },
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
                    primary: {
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

      <Divider
        sx={{
          borderColor:
            "#E7E2DA",
        }}
      />

      {/* USUARIO */}
      <Box
        sx={{
          p: 1.5,

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

            p: 1.25,

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
              width: 38,

              height: 38,

              backgroundColor:
                "#171717",

              color:
                "#FFFFFF",

              fontSize: 13,

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
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontWeight:
                  700,

                color:
                  "text.primary",
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
              sx={{
                display:
                  "block",
              }}
            >
              {usuario?.rol ||
                usuario?.usuario ||
                "Usuario"}
            </Typography>
          </Box>

          <Tooltip title="Cerrar sesión">
            <ListItemButton
              onClick={salir}
              aria-label="Cerrar sesión"
              sx={{
                width: 38,

                height: 38,

                minWidth:
                  38,

                p: 0,

                borderRadius:
                  2,

                justifyContent:
                  "center",

                color:
                  "#716A63",

                "&:hover":
                  {
                    backgroundColor:
                      "#F1EDE7",

                    color:
                      "#A94A45",
                  },
              }}
            >
              <Logout fontSize="small" />
            </ListItemButton>
          </Tooltip>
        </Stack>
      </Box>
    </Drawer>
  );
}