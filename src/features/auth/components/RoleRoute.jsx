import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function normalizarRol(rol) {
  return String(
    rol ?? "",
  )
    .trim()
    .toUpperCase();
}

export default function RoleRoute({
  roles = [],
  children,
}) {
  const location =
    useLocation();

  const {
    usuario,
  } = useAuth();

  const rolUsuario =
    normalizarRol(
      usuario?.rol,
    );

  const rolesPermitidos =
    roles.map(
      normalizarRol,
    );

  if (
    !rolesPermitidos.includes(
      rolUsuario,
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  return children;
}