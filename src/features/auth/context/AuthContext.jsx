import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  const [usuario, setUsuario] =
    useState(
      obtenerUsuarioGuardado(),
    );

  const [cargandoSesion, setCargandoSesion] =
    useState(true);

  useEffect(() => {
    let activo = true;

    const cargarSesion = async () => {
      const token =
        obtenerTokenGuardado();

      if (!token) {
        if (activo) {
          setUsuario(null);
          setCargandoSesion(false);
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
        eliminarSesionGuardada();

        if (activo) {
          setUsuario(null);
        }
      } finally {
        if (activo) {
          setCargandoSesion(false);
        }
      }
    };

    cargarSesion();

    return () => {
      activo = false;
    };
  }, []);

  const iniciarSesion = async (
    credenciales,
  ) => {
    const resultado =
      await iniciarSesionService(
        credenciales,
      );

    setUsuario(
      resultado.usuario,
    );

    return resultado.usuario;
  };

  const cerrarSesion = () => {
    eliminarSesionGuardada();
    setUsuario(null);
  };

  const value = useMemo(
    () => ({
      usuario,
      autenticado:
        Boolean(usuario),
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
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto =
    useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider.",
    );
  }

  return contexto;
}