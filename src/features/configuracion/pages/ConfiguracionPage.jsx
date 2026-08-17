import {
  useEffect,
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
  Grid,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";

import useConfiguracion from "../hooks/useConfiguracion";

const estadoInicial = {
  nombre_negocio: "",
  eslogan: "",
  telefono: "",
  email: "",
  direccion: "",
  moneda: "ARS",
  porcentaje_iva: "21",
  stock_minimo_predeterminado:
    "1",
  encabezado_comprobante: "",
  pie_comprobante: "",
};

const MONEDAS = [
  {
    value: "ARS",
    label:
      "Peso argentino (ARS)",
  },
  {
    value: "USD",
    label:
      "Dólar estadounidense (USD)",
  },
  {
    value: "EUR",
    label: "Euro (EUR)",
  },
];

function validarEmail(email) {
  if (!email) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

export default function ConfiguracionPage() {
  const {
    configuracion,
    cargandoConfiguracion,
    errorConfiguracion,

    guardarConfiguracion,
    guardandoConfiguracion,

    guardarLogo,
    guardandoLogo,

    borrarLogo,
    eliminandoLogo,
  } = useConfiguracion();

  const [
    formulario,
    setFormulario,
  ] = useState(
    estadoInicial,
  );

  const [
    erroresFormulario,
    setErroresFormulario,
  ] = useState({});

  const [
    erroresServidor,
    setErroresServidor,
  ] = useState([]);

  const [
    notificacion,
    setNotificacion,
  ] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [
    logoSeleccionado,
    setLogoSeleccionado,
  ] = useState(null);

  const [
    vistaPreviaLogo,
    setVistaPreviaLogo,
  ] = useState("");

  /*
   * =====================================
   * CARGAR CONFIGURACIÓN
   * =====================================
   */

  useEffect(() => {
    if (!configuracion) {
      return;
    }

    setFormulario({
      nombre_negocio:
        configuracion
          .nombre_negocio ??
        "",

      eslogan:
        configuracion
          .eslogan ??
        "",

      telefono:
        configuracion
          .telefono ??
        "",

      email:
        configuracion
          .email ??
        "",

      direccion:
        configuracion
          .direccion ??
        "",

      moneda:
        configuracion
          .moneda ??
        "ARS",

      porcentaje_iva:
        String(
          configuracion
            .porcentaje_iva ??
            21,
        ),

      stock_minimo_predeterminado:
        String(
          configuracion
            .stock_minimo_predeterminado ??
            1,
        ),

      encabezado_comprobante:
        configuracion
          .encabezado_comprobante ??
        "",

      pie_comprobante:
        configuracion
          .pie_comprobante ??
        "",
    });
  }, [configuracion]);

  /*
   * =====================================
   * CAMBIAR CAMPOS
   * =====================================
   */

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
      erroresFormulario[
        name
      ]
    ) {
      setErroresFormulario(
        (estadoActual) => ({
          ...estadoActual,

          [name]:
            "",
        }),
      );
    }

    if (
      erroresServidor
        .length > 0
    ) {
      setErroresServidor(
        [],
      );
    }
  };

  /*
   * =====================================
   * VALIDAR CONFIGURACIÓN
   * =====================================
   */

  const validar = () => {
    const nuevosErrores = {};

    const nombreNegocio =
      formulario
        .nombre_negocio
        .trim();

    const eslogan =
      formulario
        .eslogan
        .trim();

    const telefono =
      formulario
        .telefono
        .trim();

    const email =
      formulario
        .email
        .trim();

    const direccion =
      formulario
        .direccion
        .trim();

    const porcentajeIva =
      Number(
        formulario
          .porcentaje_iva,
      );

    const stockMinimo =
      Number(
        formulario
          .stock_minimo_predeterminado,
      );

    const encabezado =
      formulario
        .encabezado_comprobante
        .trim();

    const pie =
      formulario
        .pie_comprobante
        .trim();

    if (!nombreNegocio) {
      nuevosErrores
        .nombre_negocio =
        "El nombre del negocio es obligatorio.";
    } else if (
      nombreNegocio.length >
      150
    ) {
      nuevosErrores
        .nombre_negocio =
        "El nombre no puede superar los 150 caracteres.";
    }

    if (
      eslogan.length >
      250
    ) {
      nuevosErrores
        .eslogan =
        "El eslogan no puede superar los 250 caracteres.";
    }

    if (
      telefono.length >
      50
    ) {
      nuevosErrores
        .telefono =
        "El teléfono no puede superar los 50 caracteres.";
    }

    if (
      !validarEmail(
        email,
      )
    ) {
      nuevosErrores
        .email =
        "Ingresá un correo electrónico válido.";
    } else if (
      email.length >
      150
    ) {
      nuevosErrores
        .email =
        "El correo no puede superar los 150 caracteres.";
    }

    if (
      direccion.length >
      250
    ) {
      nuevosErrores
        .direccion =
        "La dirección no puede superar los 250 caracteres.";
    }

    if (
      formulario
        .porcentaje_iva ===
        "" ||
      Number.isNaN(
        porcentajeIva,
      ) ||
      porcentajeIva < 0 ||
      porcentajeIva > 100
    ) {
      nuevosErrores
        .porcentaje_iva =
        "El IVA debe estar entre 0 y 100.";
    }

    if (
      formulario
        .stock_minimo_predeterminado ===
        "" ||
      !Number.isInteger(
        stockMinimo,
      ) ||
      stockMinimo < 0
    ) {
      nuevosErrores
        .stock_minimo_predeterminado =
        "El stock mínimo debe ser un entero mayor o igual a cero.";
    }

    if (
      encabezado.length >
      250
    ) {
      nuevosErrores
        .encabezado_comprobante =
        "El encabezado no puede superar los 250 caracteres.";
    }

    if (
      pie.length >
      500
    ) {
      nuevosErrores
        .pie_comprobante =
        "El pie no puede superar los 500 caracteres.";
    }

    setErroresFormulario(
      nuevosErrores,
    );

    return (
      Object.keys(
        nuevosErrores,
      ).length === 0
    );
  };

  /*
   * =====================================
   * GUARDAR CONFIGURACIÓN
   * =====================================
   */

  const guardar = async () => {
    setErroresServidor(
      [],
    );

    if (!validar()) {
      return;
    }

    const resultado =
      await guardarConfiguracion({
        nombre_negocio:
          formulario
            .nombre_negocio,

        eslogan:
          formulario
            .eslogan,

        telefono:
          formulario
            .telefono,

        email:
          formulario
            .email,

        direccion:
          formulario
            .direccion,

        moneda:
          formulario
            .moneda,

        porcentaje_iva:
          formulario
            .porcentaje_iva,

        stock_minimo_predeterminado:
          formulario
            .stock_minimo_predeterminado,

        encabezado_comprobante:
          formulario
            .encabezado_comprobante,

        pie_comprobante:
          formulario
            .pie_comprobante,
      });

    if (
      !resultado.success
    ) {
      setErroresServidor(
        resultado.errors ?? [
          resultado.message,
        ],
      );

      setNotificacion({
        open: true,

        message:
          resultado.message,

        severity:
          "error",
      });

      return;
    }

    setNotificacion({
      open: true,

      message:
        resultado.message,

      severity:
        "success",
    });
  };

  /*
   * =====================================
   * SELECCIONAR LOGO
   * =====================================
   */

  const seleccionarLogo = (
    event,
  ) => {
    const archivo =
      event.target
        .files?.[0];

    if (!archivo) {
      return;
    }

    const tiposPermitidos = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (
      !tiposPermitidos.includes(
        archivo.type,
      )
    ) {
      setNotificacion({
        open: true,

        message:
          "Seleccioná una imagen PNG, JPG o WEBP.",

        severity:
          "error",
      });

      event.target.value =
        "";

      return;
    }

    if (
      archivo.size >
      500 * 1024
    ) {
      setNotificacion({
        open: true,

        message:
          "El logo no puede superar los 500 KB.",

        severity:
          "error",
      });

      event.target.value =
        "";

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setLogoSeleccionado(
        reader.result,
      );

      setVistaPreviaLogo(
        reader.result,
      );
    };

    reader.readAsDataURL(
      archivo,
    );
  };

  /*
   * =====================================
   * GUARDAR LOGO
   * =====================================
   */

  const guardarLogoSeleccionado =
    async () => {
      if (
        !logoSeleccionado
      ) {
        return;
      }

      const resultado =
        await guardarLogo(
          logoSeleccionado,
        );

      setNotificacion({
        open: true,

        message:
          resultado.message,

        severity:
          resultado.success
            ? "success"
            : "error",
      });

      if (
        resultado.success
      ) {
        setLogoSeleccionado(
          null,
        );

        setVistaPreviaLogo(
          "",
        );
      }
    };

  /*
   * =====================================
   * ELIMINAR LOGO
   * =====================================
   */

  const eliminarLogoActual =
    async () => {
      const resultado =
        await borrarLogo();

      setNotificacion({
        open: true,

        message:
          resultado.message,

        severity:
          resultado.success
            ? "success"
            : "error",
      });

      if (
        resultado.success
      ) {
        setLogoSeleccionado(
          null,
        );

        setVistaPreviaLogo(
          "",
        );
      }
    };

  /*
   * =====================================
   * CERRAR NOTIFICACIÓN
   * =====================================
   */

  const cerrarNotificacion =
    () => {
      setNotificacion(
        (estadoActual) => ({
          ...estadoActual,

          open: false,
        }),
      );
    };

  /*
   * =====================================
   * CARGANDO
   * =====================================
   */

  if (
    cargandoConfiguracion
  ) {
    return (
      <Box
        sx={{
          minHeight: 400,

          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* ====================== */}
      {/* ENCABEZADO */}
      {/* ====================== */}

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
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight:
                700,
            }}
          >
            Configuración
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Administrá la información general del negocio y sus parámetros.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={
            guardandoConfiguracion ? (
              <CircularProgress
                size={17}
                color="inherit"
              />
            ) : (
              <SaveIcon />
            )
          }
          onClick={guardar}
          disabled={
            guardandoConfiguracion
          }
        >
          {guardandoConfiguracion
            ? "Guardando..."
            : "Guardar cambios"}
        </Button>
      </Stack>

      {/* ====================== */}
      {/* ERRORES */}
      {/* ====================== */}

      {errorConfiguracion && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {errorConfiguracion
            ?.response
            ?.data
            ?.message ||
            errorConfiguracion
              ?.response
              ?.data
              ?.error ||
            errorConfiguracion
              ?.message ||
            "No se pudo cargar la configuración."}
        </Alert>
      )}

      {erroresServidor.length >
        0 && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {erroresServidor.map(
            (
              mensaje,
              indice,
            ) => (
              <Typography
                key={`${mensaje}-${indice}`}
                variant="body2"
              >
                • {mensaje}
              </Typography>
            ),
          )}
        </Alert>
      )}

      <Grid
        container
        spacing={3}
      >
        {/* ====================== */}
        {/* DATOS NEGOCIO */}
        {/* ====================== */}

        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <Card>
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,

                    borderRadius:
                      2,

                    backgroundColor:
                      "#F1EDE7",

                    display:
                      "flex",

                    justifyContent:
                      "center",

                    alignItems:
                      "center",

                    color:
                      "primary.main",
                  }}
                >
                  <BusinessIcon />
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight:
                        700,
                    }}
                  >
                    Datos del negocio
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Información principal de tu negocio.
                  </Typography>
                </Box>
              </Stack>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  size={12}
                >
                  <TextField
                    fullWidth
                    required
                    label="Nombre del negocio"
                    name="nombre_negocio"
                    value={
                      formulario
                        .nombre_negocio
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      erroresFormulario
                        .nombre_negocio,
                    )}
                    helperText={
                      erroresFormulario
                        .nombre_negocio
                    }
                    disabled={
                      guardandoConfiguracion
                    }
                    slotProps={{
                      htmlInput: {
                        maxLength:
                          150,
                      },
                    }}
                  />
                </Grid>

                <Grid
                  size={12}
                >
                  <TextField
                    fullWidth
                    label="Eslogan"
                    name="eslogan"
                    value={
                      formulario
                        .eslogan
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      erroresFormulario
                        .eslogan,
                    )}
                    helperText={
                      erroresFormulario
                        .eslogan ||
                      `${formulario.eslogan.length}/250`
                    }
                    disabled={
                      guardandoConfiguracion
                    }
                    slotProps={{
                      htmlInput: {
                        maxLength:
                          250,
                      },
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
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
                    error={Boolean(
                      erroresFormulario
                        .telefono,
                    )}
                    helperText={
                      erroresFormulario
                        .telefono
                    }
                    disabled={
                      guardandoConfiguracion
                    }
                    slotProps={{
                      htmlInput: {
                        maxLength:
                          50,
                      },
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    fullWidth
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
                      erroresFormulario
                        .email,
                    )}
                    helperText={
                      erroresFormulario
                        .email
                    }
                    disabled={
                      guardandoConfiguracion
                    }
                    slotProps={{
                      htmlInput: {
                        maxLength:
                          150,
                      },
                    }}
                  />
                </Grid>

                <Grid
                  size={12}
                >
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="direccion"
                    value={
                      formulario
                        .direccion
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      erroresFormulario
                        .direccion,
                    )}
                    helperText={
                      erroresFormulario
                        .direccion
                    }
                    disabled={
                      guardandoConfiguracion
                    }
                    slotProps={{
                      htmlInput: {
                        maxLength:
                          250,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ====================== */}
        {/* PARÁMETROS */}
        {/* ====================== */}

        <Grid
          size={{
            xs: 12,
            lg: 5,
          }}
        >
          <Card
            sx={{
              height:
                "100%",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,

                    borderRadius:
                      2,

                    backgroundColor:
                      "#F1EDE7",

                    display:
                      "flex",

                    justifyContent:
                      "center",

                    alignItems:
                      "center",

                    color:
                      "primary.main",
                  }}
                >
                  <SettingsIcon />
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight:
                        700,
                    }}
                  >
                    Parámetros generales
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Valores predeterminados del sistema.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                spacing={2}
              >
                <TextField
                  select
                  fullWidth
                  label="Moneda"
                  name="moneda"
                  value={
                    formulario
                      .moneda
                  }
                  onChange={
                    cambiarCampo
                  }
                  disabled={
                    guardandoConfiguracion
                  }
                >
                  {MONEDAS.map(
                    (moneda) => (
                      <MenuItem
                        key={
                          moneda.value
                        }
                        value={
                          moneda.value
                        }
                      >
                        {
                          moneda.label
                        }
                      </MenuItem>
                    ),
                  )}
                </TextField>

                <TextField
                  fullWidth
                  type="number"
                  label="Porcentaje de IVA"
                  name="porcentaje_iva"
                  value={
                    formulario
                      .porcentaje_iva
                  }
                  onChange={
                    cambiarCampo
                  }
                  error={Boolean(
                    erroresFormulario
                      .porcentaje_iva,
                  )}
                  helperText={
                    erroresFormulario
                      .porcentaje_iva ||
                    "Ingresá un valor entre 0 y 100."
                  }
                  disabled={
                    guardandoConfiguracion
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: 100,
                      step: "0.01",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Stock mínimo predeterminado"
                  name="stock_minimo_predeterminado"
                  value={
                    formulario
                      .stock_minimo_predeterminado
                  }
                  onChange={
                    cambiarCampo
                  }
                  error={Boolean(
                    erroresFormulario
                      .stock_minimo_predeterminado,
                  )}
                  helperText={
                    erroresFormulario
                      .stock_minimo_predeterminado ||
                    "Se aplicará por defecto al crear nuevas variantes."
                  }
                  disabled={
                    guardandoConfiguracion
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: 1,
                    },
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ====================== */}
        {/* LOGO */}
        {/* ====================== */}

        <Grid
          size={12}
        >
          <Card>
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,

                    borderRadius:
                      2,

                    backgroundColor:
                      "#F1EDE7",

                    display:
                      "flex",

                    justifyContent:
                      "center",

                    alignItems:
                      "center",

                    color:
                      "primary.main",
                  }}
                >
                  <ImageIcon />
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight:
                        700,
                    }}
                  >
                    Logo del negocio
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    El logo se mostrará en el menú lateral.
                  </Typography>
                </Box>
              </Stack>

              <Divider
                sx={{
                  mb: 3,
                }}
              />

              <Box
                sx={{
                  display:
                    "flex",

                  flexDirection: {
                    xs: "column",
                    md: "row",
                  },

                  alignItems: {
                    xs: "stretch",
                    md: "center",
                  },

                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    width: {
                      xs: "100%",
                      md: 240,
                    },

                    height:
                      160,

                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    borderRadius:
                      2,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    backgroundColor:
                      "#FAF8F5",

                    overflow:
                      "hidden",
                  }}
                >
                  {vistaPreviaLogo ||
                  configuracion?.logo_data ? (
                    <Box
                      component="img"
                      src={
                        vistaPreviaLogo ||
                        configuracion
                          ?.logo_data
                      }
                      alt="Logo del negocio"
                      sx={{
                        width:
                          "100%",

                        height:
                          "100%",

                        objectFit:
                          "contain",

                        p: 1,
                      }}
                    />
                  ) : (
                    <Stack
                      alignItems="center"
                      spacing={1}
                      color="text.secondary"
                    >
                      <ImageIcon />

                      <Typography
                        variant="body2"
                      >
                        Sin logo
                      </Typography>
                    </Stack>
                  )}
                </Box>

                <Stack
                  spacing={1.5}
                  sx={{
                    flex: 1,

                    maxWidth:
                      360,
                  }}
                >
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={
                      guardandoLogo ||
                      eliminandoLogo
                    }
                  >
                    Seleccionar imagen

                    <input
                      hidden
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={
                        seleccionarLogo
                      }
                    />
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={
                      guardandoLogo ? (
                        <CircularProgress
                          size={17}
                          color="inherit"
                        />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    onClick={
                      guardarLogoSeleccionado
                    }
                    disabled={
                      !logoSeleccionado ||
                      guardandoLogo ||
                      eliminandoLogo
                    }
                  >
                    {guardandoLogo
                      ? "Guardando logo..."
                      : "Guardar logo"}
                  </Button>

                  {configuracion?.logo_data && (
                    <Button
                      color="error"
                      variant="outlined"
                      startIcon={
                        eliminandoLogo ? (
                          <CircularProgress
                            size={
                              17
                            }
                            color="inherit"
                          />
                        ) : (
                          <DeleteIcon />
                        )
                      }
                      onClick={
                        eliminarLogoActual
                      }
                      disabled={
                        guardandoLogo ||
                        eliminandoLogo
                      }
                    >
                      {eliminandoLogo
                        ? "Eliminando..."
                        : "Eliminar logo"}
                    </Button>
                  )}

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Formatos permitidos:
                    PNG, JPG y WEBP.
                    Tamaño máximo:
                    500 KB.
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ====================== */}
        {/* COMPROBANTES */}
        {/* ====================== */}

        <Grid
          size={12}
        >
          <Card>
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,

                    borderRadius:
                      2,

                    backgroundColor:
                      "#F1EDE7",

                    display:
                      "flex",

                    justifyContent:
                      "center",

                    alignItems:
                      "center",

                    color:
                      "primary.main",
                  }}
                >
                  <ReceiptLongIcon />
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight:
                        700,
                    }}
                  >
                    Datos de comprobantes
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Textos que podrán utilizarse en tickets o comprobantes.
                  </Typography>
                </Box>
              </Stack>

              <Divider
                sx={{
                  mb: 3,
                }}
              />

              <Grid
                container
                spacing={2}
              >
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Encabezado del comprobante"
                    name="encabezado_comprobante"
                    value={
                      formulario
                        .encabezado_comprobante
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      erroresFormulario
                        .encabezado_comprobante,
                    )}
                    helperText={
                      erroresFormulario
                        .encabezado_comprobante ||
                      `${formulario.encabezado_comprobante.length}/250`
                    }
                    disabled={
                      guardandoConfiguracion
                    }
                    slotProps={{
                      htmlInput: {
                        maxLength:
                          250,
                      },
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Pie del comprobante"
                    name="pie_comprobante"
                    value={
                      formulario
                        .pie_comprobante
                    }
                    onChange={
                      cambiarCampo
                    }
                    error={Boolean(
                      erroresFormulario
                        .pie_comprobante,
                    )}
                    helperText={
                      erroresFormulario
                        .pie_comprobante ||
                      `${formulario.pie_comprobante.length}/500`
                    }
                    disabled={
                      guardandoConfiguracion
                    }
                    slotProps={{
                      htmlInput: {
                        maxLength:
                          500,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ====================== */}
      {/* NOTIFICACIÓN */}
      {/* ====================== */}

      <Snackbar
        open={
          notificacion.open
        }
        autoHideDuration={
          4000
        }
        onClose={
          cerrarNotificacion
        }
        anchorOrigin={{
          vertical:
            "bottom",

          horizontal:
            "right",
        }}
      >
        <Alert
          severity={
            notificacion
              .severity
          }
          variant="filled"
          onClose={
            cerrarNotificacion
          }
        >
          {
            notificacion
              .message
          }
        </Alert>
      </Snackbar>
    </Box>
  );
}