import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  eliminarImagenProducto,
  marcarImagenPrincipal,
  obtenerImagenesProducto,
  subirImagenProducto,
  subirVariasImagenesProducto,
} from "../imagenesService";

function obtenerMensajeError(
  error,
  mensajePredeterminado,
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    mensajePredeterminado
  );
}

export default function useImagenesProducto(
  productoId,
) {
  const queryClient = useQueryClient();

  const queryKey = [
    "imagenes-producto",
    productoId,
  ];

  const imagenesQuery = useQuery({
    queryKey,
    queryFn: () =>
      obtenerImagenesProducto(productoId),
    enabled: Boolean(productoId),
  });

  const refrescarDatos = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey,
      }),

      queryClient.invalidateQueries({
        queryKey: ["productos"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["producto", productoId],
      }),
    ]);
  };

  const subirImagenMutation = useMutation({
    mutationFn: subirImagenProducto,
    onSuccess: refrescarDatos,
  });

  const subirVariasMutation = useMutation({
    mutationFn:
      subirVariasImagenesProducto,
    onSuccess: refrescarDatos,
  });

  const marcarPrincipalMutation = useMutation({
    mutationFn: marcarImagenPrincipal,
    onSuccess: refrescarDatos,
  });

  const eliminarImagenMutation = useMutation({
    mutationFn: eliminarImagenProducto,
    onSuccess: refrescarDatos,
  });

  const subirImagen = async ({
    archivo,
    principal = false,
  }) => {
    if (!productoId) {
      return {
        success: false,
        message:
          "El producto seleccionado no es válido.",
      };
    }

    try {
      const respuesta =
        await subirImagenMutation.mutateAsync({
          productoId,
          archivo,
          principal,
        });

      return {
        success: true,
        message:
          "Imagen subida correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,
        message: obtenerMensajeError(
          error,
          "No se pudo subir la imagen.",
        ),
      };
    }
  };

  const subirVariasImagenes = async (
    archivos,
  ) => {
    if (!productoId) {
      return {
        success: false,
        message:
          "El producto seleccionado no es válido.",
      };
    }

    try {
      const respuesta =
        await subirVariasMutation.mutateAsync({
          productoId,
          archivos,
        });

      return {
        success: true,
        message:
          "Imágenes subidas correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,
        message: obtenerMensajeError(
          error,
          "No se pudieron subir las imágenes.",
        ),
      };
    }
  };

  const establecerComoPrincipal = async (
    imagen,
  ) => {
    if (!imagen?.id) {
      return {
        success: false,
        message:
          "La imagen seleccionada no es válida.",
      };
    }

    if (Boolean(imagen.principal)) {
      return {
        success: true,
        message:
          "La imagen ya es la principal.",
        data: imagen,
      };
    }

    try {
      const respuesta =
        await marcarPrincipalMutation.mutateAsync(
          imagen.id,
        );

      return {
        success: true,
        message:
          "Imagen principal actualizada correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,
        message: obtenerMensajeError(
          error,
          "No se pudo establecer la imagen principal.",
        ),
      };
    }
  };

  const eliminarImagen = async (
    imagen,
  ) => {
    if (!imagen?.id) {
      return {
        success: false,
        message:
          "La imagen seleccionada no es válida.",
      };
    }

    try {
      const respuesta =
        await eliminarImagenMutation.mutateAsync(
          imagen.id,
        );

      return {
        success: true,
        message:
          "Imagen eliminada correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,
        message: obtenerMensajeError(
          error,
          "No se pudo eliminar la imagen.",
        ),
      };
    }
  };

  return {
    imagenes:
      imagenesQuery.data ?? [],

    cargandoImagenes:
      imagenesQuery.isLoading,

    errorImagenes:
      imagenesQuery.error,

    recargarImagenes:
      imagenesQuery.refetch,

    subirImagen,
    subirVariasImagenes,
    establecerComoPrincipal,
    eliminarImagen,

    subiendoImagen:
      subirImagenMutation.isPending,

    subiendoVariasImagenes:
      subirVariasMutation.isPending,

    marcandoPrincipal:
      marcarPrincipalMutation.isPending,

    eliminandoImagen:
      eliminarImagenMutation.isPending,

    subiendo:
      subirImagenMutation.isPending ||
      subirVariasMutation.isPending,

    procesandoImagen:
      subirImagenMutation.isPending ||
      subirVariasMutation.isPending ||
      marcarPrincipalMutation.isPending ||
      eliminarImagenMutation.isPending,
  };
}