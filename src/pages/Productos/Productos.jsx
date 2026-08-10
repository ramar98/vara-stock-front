import { Typography } from "@mui/material";

export default function Productos() {
  return (
    <>
      <Typography variant="h4" fontWeight="bold">
        Productos
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Aquí se mostrará el listado de productos.
      </Typography>
    </>
  );
}