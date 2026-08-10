import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import useImagenesProducto from "../hooks/useImagenesProducto";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001/api"
).replace(/\/api\/?$/, "");

function obtenerUrlImagen(ruta) {
  if (!ruta) {
    return "/no-image.png";
  }

  const rutaNormalizada = String(ruta).replaceAll("\\", "/");

  if (
    rutaNormalizada.startsWith("http://") ||
    rutaNormalizada.startsWith("https://")
  ) {
    return rutaNormalizada;
  }

  return `${API_URL}/${rutaNormalizada.replace(/^\/+/, "")}`;
}

export default function ImagenesPanel({
  producto,
  onNotificar,
}) {
  const productoId = producto?.id;
  const inputRef = useRef(null);

  const {
    imagenes,
    cargandoImagenes,
    errorImagenes,
    subirVariasImagenes,
    establecerComoPrincipal,
    eliminarImagen,
    subiendo,
    marcandoPrincipal,
    eliminandoImagen,
    procesandoImagen,
  } = useImagenesProducto(productoId);

  const [archivosSeleccionados, setArchivosSeleccionados] =
    useState([]);

  const [imagenAEliminar, setImagenAEliminar] =
    useState(null);

  const vistasPrevias = useMemo(
    () =>
      archivosSeleccionados.map((archivo) => ({
        archivo,
        url: URL.createObjectURL(archivo),
      })),
    [archivosSeleccionados],
  );

  useEffect(() => {
    return () => {
      vistasPrevias.forEach((vista) => {
        URL.revokeObjectURL(vista.url);
      });
    };
  }, [vistasPrevias]);

  const seleccionarArchivos = (event) => {
    const nuevosArchivos = Array.from(
      event.target.files ?? [],
    );

    const imagenesValidas = nuevosArchivos.filter(
      (archivo) =>
        [
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(archivo.type) &&
        archivo.size <= 5 * 1024 * 1024,
    );

    if (
      imagenesValidas.length !== nuevosArchivos.length
    ) {
      onNotificar?.(
        "Algunas imágenes fueron rechazadas. Solo se permiten JPG, PNG o WebP de hasta 5 MB.",
        "warning",
      );
    }

    setArchivosSeleccionados((actuales) => [
      ...actuales,
      ...imagenesValidas,
    ]);

    event.target.value = "";
  };

  const quitarArchivo = (indice) => {
    setArchivosSeleccionados((actuales) =>
      actuales.filter(
        (_, indiceActual) => indiceActual !== indice,
      ),
    );
  };

  const subir = async () => {
    if (archivosSeleccionados.length === 0) {
      onNotificar?.(
        "Seleccioná al menos una imagen.",
        "warning",
      );

      return;
    }

    const resultado = await subirVariasImagenes(
      archivosSeleccionados,
    );

    if (!resultado.success) {
      onNotificar?.(
        resultado.message,
        "error",
      );

      return;
    }

    setArchivosSeleccionados([]);

    onNotificar?.(
      resultado.message,
      "success",
    );
  };

  const marcarPrincipal = async (imagen) => {
    const resultado =
      await establecerComoPrincipal(imagen);

    onNotificar?.(
      resultado.message,
      resultado.success ? "success" : "error",
    );
  };

  const confirmarEliminacion = async () => {
    if (!imagenAEliminar) {
      return;
    }

    const resultado = await eliminarImagen(
      imagenAEliminar,
    );

    if (!resultado.success) {
      onNotificar?.(
        resultado.message,
        "error",
      );

      return;
    }

    setImagenAEliminar(null);

    onNotificar?.(
      resultado.message,
      "success",
    );
  };

  if (!productoId) {
    return (
      <Alert severity="info">
        Primero guardá el producto para poder agregar imágenes.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight="bold"
          >
            Imágenes
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Subí fotografías del producto en formato JPG, PNG o WebP.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
        >
          <Button
            variant="outlined"
            startIcon={
              <AddPhotoAlternateIcon />
            }
            onClick={() =>
              inputRef.current?.click()
            }
            disabled={
              procesandoImagen
            }
          >
            Seleccionar imágenes
          </Button>

          {archivosSeleccionados.length > 0 && (
            <Button
              variant="contained"
              startIcon={
                subiendo ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <CloudUploadIcon />
                )
              }
              onClick={subir}
              disabled={subiendo}
            >
              {subiendo
                ? "Guardando..."
                : archivosSeleccionados.length === 1
                  ? "Guardar imagen"
                  : `Guardar ${archivosSeleccionados.length} imágenes`}
            </Button>
          )}
        </Stack>

        <Box
          component="input"
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={seleccionarArchivos}
          sx={{ display: "none" }}
        />
      </Stack>

      {vistasPrevias.length > 0 && (
        <Box mb={4}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            mb={2}
          >
            Imágenes seleccionadas
          </Typography>

          <Grid container spacing={2}>
            {vistasPrevias.map((vista, indice) => (
              <Grid
                item
                xs={6}
                sm={4}
                md={3}
                key={`${vista.archivo.name}-${indice}`}
              >
                <Card
                  variant="outlined"
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={vista.url}
                    alt={vista.archivo.name}
                    sx={{
                      height: 180,
                      objectFit: "cover",
                    }}
                  />

                  {indice === 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        bgcolor: "rgba(0,0,0,0.7)",
                        color: "white",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: 12,
                      }}
                    >
                      <StarIcon fontSize="small" />
                      Principal
                    </Box>
                  )}

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => quitarArchivo(indice)}
                    disabled={subiendo}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "background.paper",

                      "&:hover": {
                        bgcolor: "background.paper",
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Typography
        variant="subtitle1"
        fontWeight="bold"
        mb={2}
      >
        Galería del producto
      </Typography>

      {cargandoImagenes && (
        <Box
          display="flex"
          justifyContent="center"
          py={5}
        >
          <CircularProgress />
        </Box>
      )}

      {errorImagenes && (
        <Alert severity="error">
          {errorImagenes?.response?.data?.message ||
            errorImagenes?.response?.data?.error ||
            errorImagenes?.message ||
            "No se pudieron cargar las imágenes."}
        </Alert>
      )}

      {!cargandoImagenes &&
        !errorImagenes &&
        imagenes.length === 0 && (
          <Alert severity="info">
            Este producto todavía no tiene imágenes.
          </Alert>
        )}

      {!cargandoImagenes && imagenes.length > 0 && (
        <Grid container spacing={2}>
          {imagenes.map((imagen) => {
            const esPrincipal = Boolean(
              imagen.principal,
            );

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={imagen.id}
              >
                <Card
                  variant="outlined"
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={obtenerUrlImagen(
                      imagen.ruta,
                    )}
                    alt={
                      producto?.nombre ||
                      "Imagen del producto"
                    }
                    onError={(event) => {
                      event.currentTarget.src =
                        "/no-image.png";
                    }}
                    sx={{
                      height: 220,
                      objectFit: "cover",
                    }}
                  />

                  {esPrincipal && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        bgcolor: "rgba(0,0,0,0.75)",
                        color: "white",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: 12,
                      }}
                    >
                      <StarIcon fontSize="small" />
                      Principal
                    </Box>
                  )}

                  <CardActions
                    sx={{
                      mt: "auto",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <Tooltip
                      title={
                        esPrincipal
                          ? "Esta imagen ya es la principal"
                          : "Usar como imagen principal"
                      }
                    >
                      <span>
                        <Button
                          size="small"
                          variant={
                            esPrincipal
                              ? "contained"
                              : "text"
                          }
                          startIcon={
                            esPrincipal ? (
                              <StarIcon />
                            ) : (
                              <StarBorderIcon />
                            )
                          }
                          onClick={() =>
                            marcarPrincipal(imagen)
                          }
                          disabled={
                            esPrincipal ||
                            marcandoPrincipal ||
                            eliminandoImagen
                          }
                        >
                          {esPrincipal
                            ? "Principal"
                            : "Hacer principal"}
                        </Button>
                      </span>
                    </Tooltip>

                    <Tooltip title="Eliminar imagen">
                      <IconButton
                        color="error"
                        onClick={() =>
                          setImagenAEliminar(imagen)
                        }
                        disabled={procesandoImagen}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={Boolean(imagenAEliminar)}
        onClose={() => {
          if (!eliminandoImagen) {
            setImagenAEliminar(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Eliminar imagen
        </DialogTitle>

        <DialogContent>
          <Typography>
            ¿Seguro que querés eliminar esta imagen?
          </Typography>

          {Boolean(imagenAEliminar?.principal) && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Esta es la imagen principal. Si existen otras fotos,
              el sistema seleccionará automáticamente una nueva
              imagen principal.
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={() =>
              setImagenAEliminar(null)
            }
            disabled={eliminandoImagen}
          >
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={confirmarEliminacion}
            disabled={eliminandoImagen}
            startIcon={
              eliminandoImagen ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {eliminandoImagen
              ? "Eliminando..."
              : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}