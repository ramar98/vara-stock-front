import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

export default function LoginPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    autenticado,
    iniciarSesion,
  } = useAuth();

  const [
    formulario,
    setFormulario,
  ] = useState({
    identificador: "",
    password: "",
  });

  const [
    errores,
    setErrores,
  ] = useState({});

  const [
    errorServidor,
    setErrorServidor,
  ] = useState("");

  const [
    cargando,
    setCargando,
  ] = useState(false);

  const destino =
    location.state
      ?.from
      ?.pathname ||
    "/dashboard";

  if (autenticado) {
    return (
      <Navigate
        to={destino}
        replace
      />
    );
  }

  const cambiarCampo = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormulario(
      (estadoActual) => ({
        ...estadoActual,

        [name]:
          value,
      }),
    );

    if (
      errores[name]
    ) {
      setErrores(
        (estadoActual) => ({
          ...estadoActual,

          [name]:
            "",
        }),
      );
    }

    if (
      errorServidor
    ) {
      setErrorServidor(
        "",
      );
    }
  };

  const validar = () => {
    const nuevosErrores =
      {};

    if (
      !formulario
        .identificador
        .trim()
    ) {
      nuevosErrores
        .identificador =
        "Ingresá tu usuario o correo electrónico.";
    }

    if (
      !formulario.password
    ) {
      nuevosErrores
        .password =
        "Ingresá tu contraseña.";
    }

    setErrores(
      nuevosErrores,
    );

    return (
      Object.keys(
        nuevosErrores,
      ).length === 0
    );
  };

  const enviar = async (
    event,
  ) => {
    event.preventDefault();

    setErrorServidor(
      "",
    );

    if (!validar()) {
      return;
    }

    setCargando(
      true,
    );

    try {
      await iniciarSesion({
        identificador:
          formulario
            .identificador
            .trim(),

        password:
          formulario
            .password,
      });

      navigate(
        destino,
        {
          replace: true,
        },
      );
    } catch (error) {
      setErrorServidor(
        error
          ?.response
          ?.data
          ?.message ||
          error
            ?.response
            ?.data
            ?.error ||
          error?.message ||
          "No se pudo iniciar sesión.",
      );
    } finally {
      setCargando(
        false,
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight:
          "100vh",

        display:
          "grid",

        gridTemplateColumns: {
          xs:
            "1fr",

          md:
            "1.1fr 0.9fr",
        },

        backgroundColor:
          "background.default",
      }}
    >
      {/* ====================== */}
      {/* PANEL IZQUIERDO */}
      {/* ====================== */}

      <Box
        sx={{
          display: {
            xs:
              "none",

            md:
              "flex",
          },

          position:
            "relative",

          overflow:
            "hidden",

          alignItems:
            "center",

          justifyContent:
            "center",

          p:
            5,

          color:
            "#FFFFFF",

          background:
            "linear-gradient(135deg, #111111 0%, #342F2B 70%, #5D554D 100%)",

          "&::before": {
            content:
              '""',

            position:
              "absolute",

            width:
              420,

            height:
              420,

            borderRadius:
              "50%",

            top:
              -160,

            left:
              -120,

            background:
              "rgba(255,255,255,0.05)",
          },

          "&::after": {
            content:
              '""',

            position:
              "absolute",

            width:
              320,

            height:
              320,

            borderRadius:
              "50%",

            right:
              -120,

            bottom:
              -140,

            background:
              "rgba(255,255,255,0.04)",
          },
        }}
      >
        <Box
          sx={{
            position:
              "relative",

            zIndex:
              1,

            maxWidth:
              520,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box
              sx={{
                width:
                  46,

                height:
                  46,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                borderRadius:
                  2,

                backgroundColor:
                  "rgba(255,255,255,0.12)",
              }}
            >
              <Inventory2OutlinedIcon />
            </Box>

            <Typography
              variant="overline"
              sx={{
                color:
                  "#D8D0C7",

                fontWeight:
                  700,

                letterSpacing:
                  "0.2em",
              }}
            >
              STOCK SYSTEM
            </Typography>
          </Stack>

          <Typography
            variant="h2"
            sx={{
              mt:
                3,

              fontWeight:
                700,

              lineHeight:
                1.05,

              letterSpacing:
                "-0.05em",
            }}
          >
            Todo tu negocio en un solo lugar.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt:
                3,

              maxWidth:
                430,

              color:
                "#D8D0C7",

              lineHeight:
                1.8,
            }}
          >
            Administrá productos,
            compras, ventas, stock,
            clientes y reportes desde
            una plataforma simple y
            centralizada.
          </Typography>
        </Box>
      </Box>

      {/* ====================== */}
      {/* LOGIN */}
      {/* ====================== */}

      <Box
        sx={{
          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          p: {
            xs:
              2,

            sm:
              4,

            md:
              5,
          },
        }}
      >
        <Card
          sx={{
            width:
              "100%",

            maxWidth:
              460,

            border:
              "1px solid",

            borderColor:
              "divider",

            boxShadow:
              "0 24px 70px rgba(35, 30, 25, 0.10)",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs:
                  3,

                sm:
                  4,
              },

              "&:last-child": {
                pb: {
                  xs:
                    3,

                  sm:
                    4,
                },
              },
            }}
          >
            <Stack
              spacing={3}
              component="form"
              onSubmit={
                enviar
              }
            >
              {/* MARCA */}

              <Stack
                alignItems="center"
                spacing={1.5}
              >
                <Box
                  sx={{
                    width:
                      72,

                    height:
                      72,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    borderRadius:
                      3,

                    backgroundColor:
                      "#171717",

                    color:
                      "#FFFFFF",
                  }}
                >
                  <Inventory2OutlinedIcon
                    sx={{
                      fontSize:
                        36,
                    }}
                  />
                </Box>

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight:
                      800,

                    letterSpacing:
                      "0.08em",
                  }}
                >
                  STOCK SYSTEM
                </Typography>
              </Stack>

              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight:
                      700,

                    textAlign:
                      "center",
                  }}
                >
                  Iniciar sesión
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt:
                      1,

                    textAlign:
                      "center",
                  }}
                >
                  Ingresá con tu usuario o
                  correo electrónico.
                </Typography>
              </Box>

              {errorServidor && (
                <Alert
                  severity="error"
                >
                  {
                    errorServidor
                  }
                </Alert>
              )}

              <TextField
                fullWidth
                autoFocus
                label="Usuario o correo"
                name="identificador"
                value={
                  formulario
                    .identificador
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  errores
                    .identificador,
                )}
                helperText={
                  errores
                    .identificador
                }
                disabled={
                  cargando
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                type="password"
                label="Contraseña"
                name="password"
                value={
                  formulario
                    .password
                }
                onChange={
                  cambiarCampo
                }
                error={Boolean(
                  errores
                    .password,
                )}
                helperText={
                  errores
                    .password
                }
                disabled={
                  cargando
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={
                  cargando
                }
                startIcon={
                  cargando ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : null
                }
              >
                {cargando
                  ? "Ingresando..."
                  : "Ingresar"}
              </Button>

              <Box
                sx={{
                  textAlign:
                    "center",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb:
                      1,
                  }}
                >
                  ¿Todavía no tenés una cuenta?
                </Typography>

                <Button
                  type="button"
                  variant="outlined"
                  fullWidth
                  disabled={
                    cargando
                  }
                  onClick={() =>
                    navigate(
                      "/registro",
                    )
                  }
                >
                  Crear una empresa
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}