import {
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import {
  useNavigate,
} from "react-router-dom";

import {
  registrarEmpresa,
} from "../authService";

const FORMULARIO_INICIAL = {
  empresaNombre:
    "",

  cuit:
    "",

  empresaEmail:
    "",

  telefono:
    "",

  plan:
    "BASICO",

  nombre:
    "",

  apellido:
    "",

  usuario:
    "",

  email:
    "",

  password:
    "",

  confirmarPassword:
    "",
};

export default function RegistroEmpresaPage() {
  const navigate =
    useNavigate();

  const [
    formulario,
    setFormulario,
  ] = useState(
    FORMULARIO_INICIAL,
  );

  const [
    errores,
    setErrores,
  ] = useState({});

  const [
    errorServidor,
    setErrorServidor,
  ] = useState("");

  const [
    exito,
    setExito,
  ] = useState("");

  const [
    cargando,
    setCargando,
  ] = useState(false);

  const cambiarCampo = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormulario(
      (actual) => ({
        ...actual,

        [name]:
          value,
      }),
    );

    if (
      errores[name]
    ) {
      setErrores(
        (actual) => ({
          ...actual,

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

    if (exito) {
      setExito(
        "",
      );
    }
  };

  const validarEmail = (
    email,
  ) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    );
  };

  const validar = () => {
    const nuevosErrores =
      {};

    /*
     * EMPRESA
     */

    if (
      !formulario
        .empresaNombre
        .trim()
    ) {
      nuevosErrores
        .empresaNombre =
        "Ingresá el nombre de la empresa.";
    }

    if (
      formulario
        .empresaEmail &&
      !validarEmail(
        formulario
          .empresaEmail
          .trim(),
      )
    ) {
      nuevosErrores
        .empresaEmail =
        "Ingresá un correo válido.";
    }

    /*
     * ADMINISTRADOR
     */

    if (
      !formulario
        .nombre
        .trim()
    ) {
      nuevosErrores
        .nombre =
        "Ingresá el nombre.";
    }

    if (
      !formulario
        .apellido
        .trim()
    ) {
      nuevosErrores
        .apellido =
        "Ingresá el apellido.";
    }

    if (
      !formulario
        .usuario
        .trim()
    ) {
      nuevosErrores
        .usuario =
        "Ingresá un nombre de usuario.";
    }

    if (
      !formulario
        .email
        .trim()
    ) {
      nuevosErrores
        .email =
        "Ingresá el correo electrónico.";
    } else if (
      !validarEmail(
        formulario
          .email
          .trim(),
      )
    ) {
      nuevosErrores
        .email =
        "Ingresá un correo válido.";
    }

    if (
      !formulario.password
    ) {
      nuevosErrores
        .password =
        "Ingresá una contraseña.";
    } else if (
      formulario
        .password
        .length < 8
    ) {
      nuevosErrores
        .password =
        "La contraseña debe tener al menos 8 caracteres.";
    }

    if (
      !formulario
        .confirmarPassword
    ) {
      nuevosErrores
        .confirmarPassword =
        "Confirmá la contraseña.";
    } else if (
      formulario.password !==
      formulario
        .confirmarPassword
    ) {
      nuevosErrores
        .confirmarPassword =
        "Las contraseñas no coinciden.";
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

    setExito(
      "",
    );

    if (!validar()) {
      return;
    }

    setCargando(
      true,
    );

    try {
      await registrarEmpresa({
        empresa: {
          nombre:
            formulario
              .empresaNombre
              .trim(),

          cuit:
            formulario
              .cuit
              .trim(),

          email:
            formulario
              .empresaEmail
              .trim(),

          telefono:
            formulario
              .telefono
              .trim(),

          plan:
            formulario
              .plan,
        },

        administrador: {
          nombre:
            formulario
              .nombre
              .trim(),

          apellido:
            formulario
              .apellido
              .trim(),

          usuario:
            formulario
              .usuario
              .trim(),

          email:
            formulario
              .email
              .trim(),

          password:
            formulario
              .password,
        },
      });

      setExito(
        "Empresa creada correctamente. Ya podés iniciar sesión.",
      );

      setFormulario(
        FORMULARIO_INICIAL,
      );

      setTimeout(
        () => {
          navigate(
            "/login",
            {
              replace:
                true,
            },
          );
        },
        1500,
      );
    } catch (error) {
      const respuesta =
        error
          ?.response
          ?.data;

      if (
        Array.isArray(
          respuesta?.errors,
        ) &&
        respuesta.errors
          .length > 0
      ) {
        setErrorServidor(
          respuesta
            .errors
            .join(" "),
        );
      } else {
        setErrorServidor(
          respuesta
            ?.message ||
            error
              ?.message ||
            "No se pudo crear la empresa.",
        );
      }
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

        backgroundColor:
          "background.default",

        py: {
          xs:
            2,

          md:
            5,
        },

        px: {
          xs:
            2,

          md:
            4,
        },
      }}
    >
      <Box
        sx={{
          width:
            "100%",

          maxWidth:
            1050,

          mx:
            "auto",
        }}
      >
        <Button
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate(
              "/login",
            )
          }
          sx={{
            mb:
              2,
          }}
        >
          Volver al login
        </Button>

        <Card
          sx={{
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

                md:
                  5,
              },

              "&:last-child": {
                pb: {
                  xs:
                    3,

                  md:
                    5,
                },
              },
            }}
          >
            <Stack
              component="form"
              onSubmit={
                enviar
              }
              spacing={4}
            >
              {/* ====================== */}
              {/* MARCA PLATAFORMA */}
              {/* ====================== */}

              <Stack
                alignItems="center"
                spacing={1.5}
              >
                <Box
                  sx={{
                    width:
                      64,

                    height:
                      64,

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
                        32,
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

              <Box
                sx={{
                  textAlign:
                    "center",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  Crear una empresa
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mt:
                      1,
                  }}
                >
                  Registrá tu negocio y
                  creá tu cuenta de
                  administrador.
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

              {exito && (
                <Alert
                  severity="success"
                >
                  {
                    exito
                  }
                </Alert>
              )}

              {/* ====================== */}
              {/* EMPRESA */}
              {/* ====================== */}

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    mb:
                      2,
                  }}
                >
                  <BusinessOutlinedIcon />

                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Datos de la empresa
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display:
                      "grid",

                    gridTemplateColumns: {
                      xs:
                        "1fr",

                      md:
                        "1fr 1fr",
                    },

                    gap:
                      2,
                  }}
                >
                  <TextField
                    fullWidth
                    required
                    label="Nombre de la empresa"
                    name="empresaNombre"
                    value={
                      formulario
                        .empresaNombre
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      errores
                        .empresaNombre,
                    )}
                    helperText={
                      errores
                        .empresaNombre
                    }
                    disabled={
                      cargando
                    }
                  />

                  <TextField
                    fullWidth
                    label="CUIT"
                    name="cuit"
                    value={
                      formulario
                        .cuit
                    }
                    onChange={
                      cambiarCampo
                    }
                    disabled={
                      cargando
                    }
                  />

                  <TextField
                    fullWidth
                    type="email"
                    label="Email de la empresa"
                    name="empresaEmail"
                    value={
                      formulario
                        .empresaEmail
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      errores
                        .empresaEmail,
                    )}
                    helperText={
                      errores
                        .empresaEmail
                    }
                    disabled={
                      cargando
                    }
                  />

                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={
                      formulario
                        .telefono
                    }
                    onChange={
                      cambiarCampo
                    }
                    disabled={
                      cargando
                    }
                  />

                  <TextField
                    fullWidth
                    select
                    label="Plan"
                    name="plan"
                    value={
                      formulario
                        .plan
                    }
                    onChange={
                      cambiarCampo
                    }
                    disabled={
                      cargando
                    }
                  >
                    <MenuItem
                      value="BASICO"
                    >
                      Básico
                    </MenuItem>
                  </TextField>
                </Box>
              </Box>

              <Divider />

              {/* ====================== */}
              {/* ADMINISTRADOR */}
              {/* ====================== */}

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    mb:
                      2,
                  }}
                >
                  <PersonIcon />

                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Administrador
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display:
                      "grid",

                    gridTemplateColumns: {
                      xs:
                        "1fr",

                      md:
                        "1fr 1fr",
                    },

                    gap:
                      2,
                  }}
                >
                  <TextField
                    fullWidth
                    required
                    label="Nombre"
                    name="nombre"
                    value={
                      formulario
                        .nombre
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      errores
                        .nombre,
                    )}
                    helperText={
                      errores
                        .nombre
                    }
                    disabled={
                      cargando
                    }
                  />

                  <TextField
                    fullWidth
                    required
                    label="Apellido"
                    name="apellido"
                    value={
                      formulario
                        .apellido
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      errores
                        .apellido,
                    )}
                    helperText={
                      errores
                        .apellido
                    }
                    disabled={
                      cargando
                    }
                  />

                  <TextField
                    fullWidth
                    required
                    label="Usuario"
                    name="usuario"
                    value={
                      formulario
                        .usuario
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      errores
                        .usuario,
                    )}
                    helperText={
                      errores
                        .usuario
                    }
                    disabled={
                      cargando
                    }
                  />

                  <TextField
                    fullWidth
                    required
                    type="email"
                    label="Correo electrónico"
                    name="email"
                    value={
                      formulario
                        .email
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      errores
                        .email,
                    )}
                    helperText={
                      errores
                        .email
                    }
                    disabled={
                      cargando
                    }
                  />

                  <TextField
                    fullWidth
                    required
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
                        .password ||
                      "Mínimo 8 caracteres."
                    }
                    disabled={
                      cargando
                    }
                  />

                  <TextField
                    fullWidth
                    required
                    type="password"
                    label="Confirmar contraseña"
                    name="confirmarPassword"
                    value={
                      formulario
                        .confirmarPassword
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      errores
                        .confirmarPassword,
                    )}
                    helperText={
                      errores
                        .confirmarPassword
                    }
                    disabled={
                      cargando
                    }
                  />
                </Box>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={
                  cargando ||
                  Boolean(
                    exito,
                  )
                }
                startIcon={
                  cargando ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <BusinessOutlinedIcon />
                  )
                }
                sx={{
                  minHeight:
                    50,
                }}
              >
                {cargando
                  ? "Creando empresa..."
                  : "Crear empresa"}
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  textAlign:
                    "center",
                }}
              >
                Al crear la empresa se
                generará automáticamente
                una cuenta de
                Administrador.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}