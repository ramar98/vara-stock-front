import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  eliminarSesionGuardada,
  iniciarSesion as iniciarSesionService,
  obtenerSesionActual,
  obtenerTokenGuardado,
  obtenerUsuarioGuardado,
} from "../authService";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const queryClient =
    useQueryClient();

  const [usuario, setUsuario] =
    useState(
      obtenerUsuarioGuardado(),
    );

  const [
    cargandoSesion,
    setCargandoSesion,
  ] = useState(true);

  /*
   * =====================================
   * CARGAR SESIÓN EXISTENTE
   * =====================================
   */

  useEffect(() => {
    let activo = true;

    const cargarSesion =
      async () => {
        const token =
          obtenerTokenGuardado();

        if (!token) {
          if (activo) {
            setUsuario(null);
            setCargandoSesion(
              false,
            );
          }

          return;
        }

        try {
          const usuarioActual =
            await obtenerSesionActual();

          if (activo) {
            setUsuario(
              usuarioActual,
            );
          }
        } catch {
          /*
           * Si el token venció o dejó
           * de ser válido, eliminamos
           * tanto la sesión como todos
           * los datos privados cacheados.
           */

          eliminarSesionGuardada();

          queryClient.clear();

          if (activo) {
            setUsuario(
              null,
            );
          }
        } finally {
          if (activo) {
            setCargandoSesion(
              false,
            );
          }
        }
      };

    cargarSesion();

    return () => {
      activo = false;
    };
  }, [
    queryClient,
  ]);

  /*
   * =====================================
   * INICIAR SESIÓN
   * =====================================
   */

  const iniciarSesion =
    async (
      credenciales,
    ) => {
      /*
       * Antes de iniciar una nueva
       * sesión eliminamos cualquier
       * caché perteneciente a una
       * empresa anterior.
       */

      queryClient.clear();

      const resultado =
        await iniciarSesionService(
          credenciales,
        );

      setUsuario(
        resultado.usuario,
      );

      return resultado.usuario;
    };

  /*
   * =====================================
   * CERRAR SESIÓN
   * =====================================
   */

  const cerrarSesion = () => {
    /*
     * Eliminamos token + usuario
     * del localStorage.
     */

    eliminarSesionGuardada();

    /*
     * IMPORTANTE:
     *
     * Eliminamos TODOS los datos
     * almacenados por React Query.
     *
     * Esto evita que la próxima
     * empresa vea temporalmente:
     *
     * - configuración
     * - logo
     * - productos
     * - dashboard
     * - clientes
     * - proveedores
     * - ventas
     * - reportes
     * etc.
     */

    queryClient.clear();

    setUsuario(
      null,
    );
  };

  /*
   * =====================================
   * CONTEXTO
   * =====================================
   */

  const value =
    useMemo(
      () => ({
        usuario,

        autenticado:
          Boolean(
            usuario,
          ),

        cargandoSesion,

        iniciarSesion,

        cerrarSesion,
      }),
      [
        usuario,
        cargandoSesion,
      ],
    );

  return (
    <AuthContext.Provider
      value={
        value
      }
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto =
    useContext(
      AuthContext,
    );

  if (!contexto) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider.",
    );
  }

  return contexto;
}