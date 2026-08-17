import {
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

import {
  Outlet,
} from "react-router-dom";

import {
  useState,
} from "react";

import Sidebar from "./Sidebar";

const drawerWidth = 250;

export default function MainLayout() {
  const theme =
    useTheme();

  const esMobile =
    useMediaQuery(
      theme.breakpoints.down("md"),
    );

  const [
    sidebarAbierto,
    setSidebarAbierto,
  ] = useState(false);

  const abrirSidebar = () => {
    setSidebarAbierto(true);
  };

  const cerrarSidebar = () => {
    setSidebarAbierto(false);
  };

  return (
    <Box
      sx={{
        display:
          "flex",

        minHeight:
          "100vh",

        width:
          "100%",

        backgroundColor:
          "background.default",
      }}
    >
      {/* ====================== */}
      {/* SIDEBAR */}
      {/* ====================== */}

      <Sidebar
        drawerWidth={
          drawerWidth
        }
        mobile={
          esMobile
        }
        open={
          sidebarAbierto
        }
        onClose={
          cerrarSidebar
        }
      />

      {/* ====================== */}
      {/* CONTENIDO */}
      {/* ====================== */}

      <Box
        component="main"
        sx={{
          flexGrow:
            1,

          minWidth:
            0,

          minHeight:
            "100vh",

          backgroundColor:
            "background.default",

          px: {
            xs:
              1.5,

            sm:
              2,

            md:
              2.5,
          },

          py: {
            xs:
              1.5,

            md:
              2,
          },

          ml:
            0,
        }}
      >
        {/* ====================== */}
        {/* BOTÓN MOBILE */}
        {/* ====================== */}

        {esMobile && (
          <Box
            sx={{
              mb:
                1.5,

              display:
                "flex",

              alignItems:
                "center",
            }}
          >
            <IconButton
              onClick={
                abrirSidebar
              }
              aria-label="Abrir menú"
              sx={{
                width:
                  42,

                height:
                  42,

                border:
                  "1px solid",

                borderColor:
                  "divider",

                backgroundColor:
                  "background.paper",

                "&:hover": {
                  backgroundColor:
                    "#F1EDE7",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        <Outlet />
      </Box>
    </Box>
  );
}