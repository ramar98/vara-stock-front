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

import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import logoVara from "../../../assets/logo-vara.jpg";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        autenticado,
        iniciarSesion,
    } = useAuth();

    const [formulario, setFormulario] =
        useState({
            identificador: "",
            password: "",
        });

    const [errores, setErrores] =
        useState({});

    const [errorServidor, setErrorServidor] =
        useState("");

    const [cargando, setCargando] =
        useState(false);

    const destino =
        location.state?.from?.pathname ||
        "/dashboard";

    if (autenticado) {
        return (
            <Navigate
                to={destino}
                replace
            />
        );
    }

    const cambiarCampo = (event) => {
        const { name, value } =
            event.target;

        setFormulario((estadoActual) => ({
            ...estadoActual,
            [name]: value,
        }));

        if (errores[name]) {
            setErrores((estadoActual) => ({
                ...estadoActual,
                [name]: "",
            }));
        }

        if (errorServidor) {
            setErrorServidor("");
        }
    };

    const validar = () => {
        const nuevosErrores = {};

        if (!formulario.identificador.trim()) {
            nuevosErrores.identificador =
                "Ingresá tu usuario o correo electrónico.";
        }

        if (!formulario.password) {
            nuevosErrores.password =
                "Ingresá tu contraseña.";
        }

        setErrores(nuevosErrores);

        return (
            Object.keys(nuevosErrores)
                .length === 0
        );
    };

    const enviar = async (event) => {
        event.preventDefault();

        setErrorServidor("");

        if (!validar()) {
            return;
        }

        setCargando(true);

        try {
            await iniciarSesion({
                identificador:
                    formulario.identificador.trim(),

                password:
                    formulario.password,
            });

            navigate(destino, {
                replace: true,
            });
        } catch (error) {
            setErrorServidor(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "No se pudo iniciar sesión.",
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    md: "1.1fr 0.9fr",
                },
                backgroundColor:
                    "background.default",
            }}
        >
            <Box
                sx={{
                    display: {
                        xs: "none",
                        md: "flex",
                    },
                    position: "relative",
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 5,
                    color: "#FFFFFF",
                    background:
                        "linear-gradient(135deg, #111111 0%, #342F2B 70%, #5D554D 100%)",

                    "&::before": {
                        content: '""',
                        position: "absolute",
                        width: 420,
                        height: 420,
                        borderRadius: "50%",
                        top: -160,
                        left: -120,
                        background:
                            "rgba(255,255,255,0.05)",
                    },

                    "&::after": {
                        content: '""',
                        position: "absolute",
                        width: 320,
                        height: 320,
                        borderRadius: "50%",
                        right: -120,
                        bottom: -140,
                        background:
                            "rgba(255,255,255,0.04)",
                    },
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        maxWidth: 520,
                    }}
                >
                    <Typography
                        variant="overline"
                        sx={{
                            color: "#D8D0C7",
                            fontWeight: 700,
                            letterSpacing: "0.2em",
                        }}
                    >
                        VARA MODAS
                    </Typography>

                    <Typography
                        variant="h2"
                        sx={{
                            mt: 1,
                            fontWeight: 700,
                            lineHeight: 1.05,
                            letterSpacing: "-0.05em",
                        }}
                    >
                        Gestión simple para acompañar tu negocio.
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            mt: 3,
                            maxWidth: 430,
                            color: "#D8D0C7",
                            lineHeight: 1.8,
                        }}
                    >
                        Administrá productos, compras, ventas, stock y reportes desde una única plataforma.
                    </Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: {
                        xs: 2,
                        sm: 4,
                        md: 5,
                    },
                }}
            >
                <Card
                    sx={{
                        width: "100%",
                        maxWidth: 460,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow:
                            "0 24px 70px rgba(35, 30, 25, 0.10)",
                    }}
                >
                    <CardContent
                        sx={{
                            p: {
                                xs: 3,
                                sm: 4,
                            },

                            "&:last-child": {
                                pb: {
                                    xs: 3,
                                    sm: 4,
                                },
                            },
                        }}
                    >
                        <Stack
                            spacing={3}
                            component="form"
                            onSubmit={enviar}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <Box
                                    component="img"
                                    src={logoVara}
                                    alt="Vara Modas"
                                    sx={{
                                        width: "100%",
                                        maxWidth: 210,
                                        maxHeight: 150,
                                        objectFit: "contain",
                                    }}
                                />
                            </Box>

                            <Box>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        textAlign: "center",
                                    }}
                                >
                                    Iniciar sesión
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 1,
                                        textAlign: "center",
                                    }}
                                >
                                    Ingresá con tu usuario o correo electrónico.
                                </Typography>
                            </Box>

                            {errorServidor && (
                                <Alert severity="error">
                                    {errorServidor}
                                </Alert>
                            )}

                            <TextField
                                fullWidth
                                autoFocus
                                label="Usuario o correo"
                                name="identificador"
                                value={
                                    formulario.identificador
                                }
                                onChange={cambiarCampo}
                                error={Boolean(
                                    errores.identificador,
                                )}
                                helperText={
                                    errores.identificador
                                }
                                disabled={cargando}
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
                                    formulario.password
                                }
                                onChange={cambiarCampo}
                                error={Boolean(
                                    errores.password,
                                )}
                                helperText={
                                    errores.password
                                }
                                disabled={cargando}
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
                                disabled={cargando}
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
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}