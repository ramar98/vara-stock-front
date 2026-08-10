import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

const drawerWidth = 250;

export default function MainLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "background.default",
      }}
    >
      <Sidebar drawerWidth={drawerWidth} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: "100vh",

          backgroundColor: "background.default",

          /*
           * Este padding controla la distancia
           * entre el sidebar y las vistas.
           */
          px: {
            xs: 1.5,
            sm: 2,
            md: 2.5,
          },

          py: {
            xs: 1.5,
            md: 2,
          },

          /*
           * IMPORTANTE:
           * no agregar marginLeft ni ml,
           * porque el Drawer ya ocupa su espacio.
           */
          ml: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}