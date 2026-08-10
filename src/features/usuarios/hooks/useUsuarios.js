import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  cambiarPasswordUsuario,
  crearUsuario,
  obtenerRoles,
  obtenerUsuarios,
} from "../services/usuariosService";

function obtenerMensajeError(
  error,
  mensajePorDefecto,
) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    mensajePorDefecto
  );
}

export default function useUsuarios(
  busqueda = "",
) {
  const [
    usuarios,
    setUsuarios,
  ] = useState([]);

  const [
    roles,
    setRoles,
  ] = useState([]);

  const [
    cargandoUsuarios,
    setCargandoUsuarios,
  ] = useState(true);

  const [
    actualizandoUsuarios,
    setActualizandoUsuarios,
  ] = useState(false);

  const [
    guardandoUsuario,
    setGuardandoUsuario,
  ] = useState(false);

  const [
    cambiandoEstado,
    setCambiandoEstado,
  ] = useState(false);

  const [
    cambiandoPassword,
    setCambiandoPassword,
  ] = useState(false);

  const [
    errorUsuarios,
    setErrorUsuarios,
  ] = useState(null);

  const cargarUsuarios =
    useCallback(
      async ({
        mostrarCarga = false,
      } = {}) => {
        try {
          if (mostrarCarga) {
            setCargandoUsuarios(
              true,
            );
          } else {
            setActualizandoUsuarios(
              true,
            );
          }

          setErrorUsuarios(null);

          const [
            usuariosRespuesta,
            rolesRespuesta,
          ] = await Promise.all([
            obtenerUsuarios({
              busqueda,
            }),
            obtenerRoles(),
          ]);

          setUsuarios(
            usuariosRespuesta,
          );

          setRoles(
            rolesRespuesta,
          );
        } catch (error) {
          setErrorUsuarios(
            error,
          );
        } finally {
          setCargandoUsuarios(
            false,
          );

          setActualizandoUsuarios(
            false,
          );
        }
      },
      [busqueda],
    );

  useEffect(() => {
    cargarUsuarios({
      mostrarCarga: true,
    });
  }, [cargarUsuarios]);

  const guardarUsuario =
    async ({
      usuarioSeleccionado,
      datos,
    }) => {
      try {
        setGuardandoUsuario(
          true,
        );

        let respuesta;

        if (
          usuarioSeleccionado?.id
        ) {
          respuesta =
            await actualizarUsuario(
              usuarioSeleccionado.id,
              datos,
            );
        } else {
          respuesta =
            await crearUsuario(
              datos,
            );
        }

        await cargarUsuarios();

        return {
          success: true,

          message:
            respuesta?.message ||
            (usuarioSeleccionado
              ? "Usuario actualizado correctamente."
              : "Usuario creado correctamente."),

          data:
            respuesta?.data,
        };
      } catch (error) {
        return {
          success: false,

          message:
            obtenerMensajeError(
              error,
              "No se pudo guardar el usuario.",
            ),

          errors:
            error?.response?.data
              ?.errors ?? [],
        };
      } finally {
        setGuardandoUsuario(
          false,
        );
      }
    };

  const cambiarEstado =
    async (
      usuario,
      activo,
    ) => {
      try {
        setCambiandoEstado(
          true,
        );

        const respuesta =
          await cambiarEstadoUsuario(
            usuario.id,
            activo,
          );

        await cargarUsuarios();

        return {
          success: true,

          message:
            respuesta?.message ||
            "Estado actualizado correctamente.",
        };
      } catch (error) {
        return {
          success: false,

          message:
            obtenerMensajeError(
              error,
              "No se pudo cambiar el estado del usuario.",
            ),
        };
      } finally {
        setCambiandoEstado(
          false,
        );
      }
    };

  const cambiarPassword =
    async (
      usuario,
      password,
    ) => {
      try {
        setCambiandoPassword(
          true,
        );

        const respuesta =
          await cambiarPasswordUsuario(
            usuario.id,
            password,
          );

        return {
          success: true,

          message:
            respuesta?.message ||
            "Contraseña actualizada correctamente.",
        };
      } catch (error) {
        return {
          success: false,

          message:
            obtenerMensajeError(
              error,
              "No se pudo cambiar la contraseña.",
            ),

          errors:
            error?.response?.data
              ?.errors ?? [],
        };
      } finally {
        setCambiandoPassword(
          false,
        );
      }
    };

  return {
    usuarios,
    roles,

    cargandoUsuarios,
    actualizandoUsuarios,
    guardandoUsuario,
    cambiandoEstado,
    cambiandoPassword,

    errorUsuarios,

    recargarUsuarios:
      cargarUsuarios,

    guardarUsuario,
    cambiarEstado,
    cambiarPassword,
  };
}