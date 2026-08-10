import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarElementoCatalogo,
  crearElementoCatalogo,
  eliminarElementoCatalogo,
  obtenerElementosCatalogo,
} from "../catalogosAdminService";

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

export default function useCatalogoAdmin({
  tipo,
  busqueda = "",
}) {
  const queryClient =
    useQueryClient();

  const queryKey = [
    "catalogo-admin",
    tipo,
    busqueda.trim(),
  ];

  const catalogoQuery = useQuery({
    queryKey,

    queryFn: () =>
      obtenerElementosCatalogo({
        tipo,
        busqueda,
      }),

    enabled: Boolean(tipo),

    staleTime: 30 * 1000,

    retry: false,
  });

  const refrescarCatalogos = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "catalogo-admin",
          tipo,
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "catalogos-productos",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: ["productos"],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "variantes-producto",
        ],
      }),
    ]);
  };

  const crearMutation = useMutation({
    mutationFn:
      crearElementoCatalogo,

    onSuccess:
      refrescarCatalogos,
  });

  const actualizarMutation =
    useMutation({
      mutationFn:
        actualizarElementoCatalogo,

      onSuccess:
        refrescarCatalogos,
    });

  const eliminarMutation =
    useMutation({
      mutationFn:
        eliminarElementoCatalogo,

      onSuccess:
        refrescarCatalogos,
    });

  const guardarElemento = async ({
    elementoSeleccionado,
    datos,
  }) => {
    try {
      if (
        elementoSeleccionado?.id
      ) {
        const respuesta =
          await actualizarMutation.mutateAsync(
            {
              tipo,
              elementoId:
                elementoSeleccionado.id,
              datos,
            },
          );

        return {
          success: true,
          message:
            "Elemento actualizado correctamente.",
          data: respuesta,
        };
      }

      const respuesta =
        await crearMutation.mutateAsync(
          {
            tipo,
            datos,
          },
        );

      return {
        success: true,
        message:
          "Elemento creado correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,

        message:
          obtenerMensajeError(
            error,
            "No se pudo guardar el elemento.",
          ),

        errors:
          error?.response?.data
            ?.errors ?? [],
      };
    }
  };

  const borrarElemento = async (
    elemento,
  ) => {
    if (!elemento?.id) {
      return {
        success: false,
        message:
          "El elemento seleccionado no es válido.",
      };
    }

    try {
      const respuesta =
        await eliminarMutation.mutateAsync(
          {
            tipo,
            elementoId:
              elemento.id,
          },
        );

      return {
        success: true,
        message:
          "Elemento eliminado correctamente.",
        data: respuesta,
      };
    } catch (error) {
      return {
        success: false,

        message:
          obtenerMensajeError(
            error,
            "No se pudo eliminar el elemento.",
          ),
      };
    }
  };

  return {
    elementos:
      catalogoQuery.data ?? [],

    cargandoElementos:
      catalogoQuery.isLoading,

    actualizandoElementos:
      catalogoQuery.isFetching,

    errorElementos:
      catalogoQuery.error,

    recargarElementos:
      catalogoQuery.refetch,

    guardarElemento,
    borrarElemento,

    guardandoElemento:
      crearMutation.isPending ||
      actualizarMutation.isPending,

    eliminandoElemento:
      eliminarMutation.isPending,
  };
}