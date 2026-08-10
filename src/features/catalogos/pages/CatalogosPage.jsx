import { useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
    DataGrid,
    GridActionsCellItem,
} from "@mui/x-data-grid";

import CatalogoElementoDialog from "../components/CatalogoElementoDialog";
import useCatalogoAdmin from "../hooks/useCatalogoAdmin";

const CATALOGOS = [
    {
        tipo: "categorias",
        etiqueta: "Categorías",
        singular: "categoría",
        descripcion:
            "Clasificá los productos, por ejemplo: remeras, pantalones o camperas.",
    },
    {
        tipo: "marcas",
        etiqueta: "Marcas",
        singular: "marca",
        descripcion:
            "Administrá las marcas asociadas a las prendas.",
    },
    {
        tipo: "colores",
        etiqueta: "Colores",
        singular: "color",
        descripcion:
            "Definí los colores disponibles para las variantes.",
    },
    {
        tipo: "talles",
        etiqueta: "Talles",
        singular: "talle",
        descripcion:
            "Administrá los talles utilizados en las variantes.",
    },
];


export default function CatalogosPage() {
    const [tabActual, setTabActual] = useState(0);
    const [busqueda, setBusqueda] = useState("");

    const catalogoActual =
        CATALOGOS[tabActual] ?? CATALOGOS[0];

    const {
        elementos,
        cargandoElementos,
        actualizandoElementos,
        errorElementos,
        recargarElementos,
        guardarElemento,
        borrarElemento,
        guardandoElemento,
        eliminandoElemento,
    } = useCatalogoAdmin({
        tipo: catalogoActual.tipo,
        busqueda,
    });

    const [dialogAbierto, setDialogAbierto] =
        useState(false);

    const [
        elementoSeleccionado,
        setElementoSeleccionado,
    ] = useState(null);

    const [
        elementoAEliminar,
        setElementoAEliminar,
    ] = useState(null);

    const [
        errorFormulario,
        setErrorFormulario,
    ] = useState("");

    const [
        erroresFormulario,
        setErroresFormulario,
    ] = useState([]);

    const [notificacion, setNotificacion] =
        useState({
            open: false,
            message: "",
            severity: "success",
        });

    const mostrarNotificacion = (
        message,
        severity = "success",
    ) => {
        setNotificacion({
            open: true,
            message,
            severity,
        });
    };

    const cerrarNotificacion = () => {
        setNotificacion((actual) => ({
            ...actual,
            open: false,
        }));
    };

    const cambiarTab = (_, nuevoValor) => {
        setTabActual(nuevoValor);
        setBusqueda("");
        setElementoSeleccionado(null);
        setElementoAEliminar(null);
        setDialogAbierto(false);
        setErrorFormulario("");
        setErroresFormulario([]);
    };

    const abrirNuevoElemento = () => {
        setElementoSeleccionado(null);
        setErrorFormulario("");
        setErroresFormulario([]);
        setDialogAbierto(true);
    };

    const abrirEditarElemento = (elemento) => {
        setElementoSeleccionado(elemento);
        setErrorFormulario("");
        setErroresFormulario([]);
        setDialogAbierto(true);
    };

    const cerrarDialog = () => {
        if (guardandoElemento) {
            return;
        }

        setDialogAbierto(false);
        setElementoSeleccionado(null);
        setErrorFormulario("");
        setErroresFormulario([]);

    };

    const guardar = async (datos) => {
        setErrorFormulario("");
        setErroresFormulario([]);

        const resultado = await guardarElemento({
            elementoSeleccionado,
            datos,
        });

        if (!resultado.success) {
            setErrorFormulario(resultado.message);
            setErroresFormulario(
                resultado.errors ?? [],
            );
            return;
        }

        setDialogAbierto(false);
        setElementoSeleccionado(null);

        mostrarNotificacion(
            resultado.message,
            "success",
        );

    };

    const confirmarEliminacion = async () => {
        if (!elementoAEliminar) {
            return;
        }

        const resultado = await borrarElemento(
            elementoAEliminar,
        );

        if (!resultado.success) {
            mostrarNotificacion(
                resultado.message,
                "error",
            );
            return;
        }

        setElementoAEliminar(null);

        mostrarNotificacion(
            resultado.message,
            "success",
        );

    };

    const columnas = [
        {
            field: "id",
            headerName: "ID",
            width: 90,
        },
        {
            field: "nombre",
            headerName: "Nombre",
            minWidth: 240,
            flex: 1,
        },
        {
            field: "acciones",
            type: "actions",
            headerName: "Acciones",
            width: 120,
            align: "center",
            headerAlign: "center",
            getActions: (params) => [
                <GridActionsCellItem
                    key="editar"
                    icon={<EditIcon />}
                    label="Editar"
                    color="primary"
                    showInMenu={false}
                    onClick={() =>
                        abrirEditarElemento(params.row)
                    }
                />,

                <GridActionsCellItem
                    key="eliminar"
                    icon={<DeleteIcon />}
                    label="Eliminar"
                    color="error"
                    showInMenu={false}
                    onClick={() =>
                        setElementoAEliminar(params.row)
                    }
                />,
            ],
        },

    ];

    return (<Box>
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
        > <Box> <Typography
            variant="h4"
            fontWeight="bold"
        >
            Catálogos </Typography>

                < Typography
                    variant="body2"
                    color="text.secondary"
                    mt={0.5}
                >
                    Administrá categorías, marcas, colores y
                    talles del sistema.
                </Typography >
            </Box >

            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={abrirNuevoElemento}
            >
                Nueva {catalogoActual.singular}
            </Button>
        </Stack >

        <Card>
            <CardContent>
                <Tabs
                    value={tabActual}
                    onChange={cambiarTab}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        mb: 3,
                    }}
                >
                    {CATALOGOS.map((catalogo) => (
                        <Tab
                            key={catalogo.tipo}
                            label={catalogo.etiqueta}
                        />
                    ))}
                </Tabs>

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
                            {catalogoActual.etiqueta}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {catalogoActual.descripcion}
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={
                            actualizandoElementos ? (
                                <CircularProgress size={17} />
                            ) : (
                                <RefreshIcon />
                            )
                        }
                        onClick={() =>
                            recargarElementos()
                        }
                        disabled={actualizandoElementos}
                    >
                        Actualizar
                    </Button>
                </Stack>

                <TextField
                    fullWidth
                    label={`Buscar ${catalogoActual.etiqueta.toLowerCase()} `}
                    placeholder="Ingresá un nombre"
                    value={busqueda}
                    onChange={(event) =>
                        setBusqueda(event.target.value)
                    }
                    sx={{ mb: 3 }}
                />

                {cargandoElementos && (
                    <Box
                        minHeight={280}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <CircularProgress />
                    </Box>
                )}

                {!cargandoElementos &&
                    errorElementos && (
                        <Alert severity="error">
                            {errorElementos?.response?.data
                                ?.message ||
                                errorElementos?.response?.data
                                    ?.error ||
                                errorElementos?.message ||
                                "No se pudo cargar el catálogo."}
                        </Alert>
                    )}

                {!cargandoElementos &&
                    !errorElementos &&
                    elementos.length === 0 && (
                        <Alert severity="info">
                            {busqueda.trim()
                                ? "No se encontraron elementos."
                                : `Todavía no hay ${catalogoActual.etiqueta.toLowerCase()} registradas.`}
                        </Alert>
                    )}

                {!cargandoElementos &&
                    !errorElementos &&
                    elementos.length > 0 && (
                        <DataGrid
                            rows={elementos}
                            columns={columnas}
                            getRowId={(row) => row.id}
                            autoHeight
                            disableRowSelectionOnClick
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        page: 0,
                                        pageSize: 10,
                                    },
                                },
                            }}
                            onRowDoubleClick={(params) =>
                                abrirEditarElemento(params.row)
                            }
                            sx={{
                                border: 0,

                                "& .MuiDataGrid-row": {
                                    cursor: "pointer",
                                },
                            }}
                        />
                    )}
            </CardContent>
        </Card>

        <CatalogoElementoDialog
            open={dialogAbierto}
            elemento={elementoSeleccionado}
            tipoEtiqueta={catalogoActual.singular}
            loading={guardandoElemento}
            error={errorFormulario}
            errors={erroresFormulario}
            onClose={cerrarDialog}
            onGuardar={guardar}
        />

        <Dialog
            open={Boolean(elementoAEliminar)}
            onClose={() => {
                if (!eliminandoElemento) {
                    setElementoAEliminar(null);
                }
            }}
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle>
                Eliminar {catalogoActual.singular}
            </DialogTitle>

            <DialogContent>
                <Typography>
                    ¿Seguro que querés eliminar{" "}
                    <strong>
                        {elementoAEliminar?.nombre}
                    </strong>
                    ?
                </Typography>

                <Alert severity="warning" sx={{ mt: 2 }}>
                    No podrá eliminarse si está asociada a
                    productos o variantes.
                </Alert>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="outlined"
                    disabled={eliminandoElemento}
                    onClick={() =>
                        setElementoAEliminar(null)
                    }
                >
                    Cancelar
                </Button>

                <Button
                    color="error"
                    variant="contained"
                    disabled={eliminandoElemento}
                    onClick={confirmarEliminacion}
                    startIcon={
                        eliminandoElemento ? (
                            <CircularProgress
                                size={18}
                                color="inherit"
                            />
                        ) : (
                            <DeleteIcon />
                        )
                    }
                >
                    {eliminandoElemento
                        ? "Eliminando..."
                        : "Eliminar"}
                </Button>
            </DialogActions>
        </Dialog>

        <Snackbar
            open={notificacion.open}
            autoHideDuration={4000}
            onClose={cerrarNotificacion}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
        >
            <Alert
                severity={notificacion.severity}
                variant="filled"
                onClose={cerrarNotificacion}
            >
                {notificacion.message}
            </Alert>
        </Snackbar>
    </Box >

    );
}
