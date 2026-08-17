import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarConfiguracion,
  actualizarLogo,
  eliminarLogo,
  obtenerConfiguracion,
} from "../configuracionService";

import {
  useAuth,
} from "../../auth/context/AuthContext";

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

export default function useConfiguracion() {
  const queryClient =
    useQueryClient();

  const {
    usuario,
  } = useAuth();

  /*
   * =====================================
   * EMPRESA ACTUAL
   * =====================================
   */

  const empresaId =
    Number(
      usuario?.empresa_id,
    ) || null;

  /*
   * Cada empresa tiene su propia
   * entrada de caché.
   *
   * Empresa 1:
   * ["configuracion", 1]
   *
   * Empresa 2:
   * ["configuracion", 2]
   */

  const configuracionKey = [
    "configuracion",
    empresaId,
  ];

  /*
   * =====================================
   * OBTENER CONFIGURACIÓN
   * =====================================
   */

  const configuracionQuery =
    useQuery({
      queryKey:
        configuracionKey,

      queryFn:
        obtenerConfiguracion,

      /*
       * No ejecutamos la consulta
       * hasta conocer la empresa.
       */

      enabled:
        Boolean(
          empresaId,
        ),

      staleTime:
        60 * 1000,
    });

  /*
   * =====================================
   * INVALIDAR CONFIGURACIÓN
   * =====================================
   */

  const invalidarConfiguracion =
    async () => {
      await queryClient.invalidateQueries({
        queryKey:
          configuracionKey,

        exact:
          true,
      });
    };

  /*
   * =====================================
   * ACTUALIZAR CONFIGURACIÓN
   * =====================================
   */

  const actualizarMutation =
    useMutation({
      mutationFn:
        actualizarConfiguracion,

      onSuccess:
        async () => {
          await Promise.all([
            invalidarConfiguracion(),

            queryClient.invalidateQueries({
              queryKey: [
                "productos",
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "dashboard",
              ],
            }),
          ]);
        },
    });

  /*
   * =====================================
   * ACTUALIZAR LOGO
   * =====================================
   */

  const logoMutation =
    useMutation({
      mutationFn:
        actualizarLogo,

      onSuccess:
        invalidarConfiguracion,
    });

  /*
   * =====================================
   * ELIMINAR LOGO
   * =====================================
   */

  const eliminarLogoMutation =
    useMutation({
      mutationFn:
        eliminarLogo,

      onSuccess:
        invalidarConfiguracion,
    });

  /*
   * =====================================
   * GUARDAR CONFIGURACIÓN
   * =====================================
   */

  const guardarConfiguracion =
    async (
      datos,
    ) => {
      try {
        const respuesta =
          await actualizarMutation
            .mutateAsync(
              datos,
            );

        return {
          success:
            true,

          message:
            "Configuración actualizada correctamente.",

          data:
            respuesta,
        };
      } catch (error) {
        return {
          success:
            false,

          message:
            obtenerMensajeError(
              error,
              "No se pudo actualizar la configuración.",
            ),

          errors:
            error
              ?.response
              ?.data
              ?.errors ??
            [],
        };
      }
    };

  /*
   * =====================================
   * GUARDAR LOGO
   * =====================================
   */

  const guardarLogo =
    async (
      logoData,
    ) => {
      try {
        const respuesta =
          await logoMutation
            .mutateAsync(
              logoData,
            );

        return {
          success:
            true,

          message:
            "Logo actualizado correctamente.",

          data:
            respuesta,
        };
      } catch (error) {
        return {
          success:
            false,

          message:
            obtenerMensajeError(
              error,
              "No se pudo actualizar el logo.",
            ),
        };
      }
    };

  /*
   * =====================================
   * BORRAR LOGO
   * =====================================
   */

  const borrarLogo =
    async () => {
      try {
        const respuesta =
          await eliminarLogoMutation
            .mutateAsync();

        return {
          success:
            true,

          message:
            "Logo eliminado correctamente.",

          data:
            respuesta,
        };
      } catch (error) {
        return {
          success:
            false,

          message:
            obtenerMensajeError(
              error,
              "No se pudo eliminar el logo.",
            ),
        };
      }
    };

  return {
    configuracion:
      configuracionQuery
        .data ??
      null,

    cargandoConfiguracion:
      configuracionQuery
        .isLoading,

    actualizandoConfiguracion:
      configuracionQuery
        .isFetching,

    errorConfiguracion:
      configuracionQuery
        .error,

    recargarConfiguracion:
      configuracionQuery
        .refetch,

    guardarConfiguracion,

    guardandoConfiguracion:
      actualizarMutation
        .isPending,

    guardarLogo,

    guardandoLogo:
      logoMutation
        .isPending,

    borrarLogo,

    eliminandoLogo:
      eliminarLogoMutation
        .isPending,
  };
}