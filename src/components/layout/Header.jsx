import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";

export default function Header({ drawerWidth }) {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
      }}
    >
      <Toolbar>

        <Typography variant="h6">
          Sistema de Stock
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton>
          <NotificationsIcon />
        </IconButton>

        <Avatar sx={{ ml: 2 }}>
          A
        </Avatar>

      </Toolbar>
    </AppBar>
  );
}