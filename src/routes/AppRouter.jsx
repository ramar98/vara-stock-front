import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";

import RegistroEmpresaPage from "../features/auth/pages/RegistroEmpresaPage";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import RoleRoute from "../features/auth/components/RoleRoute";

import MainLayout from "../components/layout/MainLayout";

import Dashboard from "../pages/Dashboard/Dashboard";

import ProductoPage from "../features/productos/pages/ProductoPage";

import IngresosPage from "../features/ingresos/pages/IngresosPage";

import VentasPage from "../features/ventas/pages/VentasPage";

import ProveedoresPage from "../features/proveedores/pages/ProveedoresPage";

import ClientesPage from "../features/clientes/pages/ClientesPage";

import ReportesPage from "../features/reportes/pages/ReportesPage";

import CatalogosPage from "../features/catalogos/pages/CatalogosPage";

import AjustesStockPage from "../features/ajustesStock/pages/AjustesStockPage";

import ConfiguracionPage from "../features/configuracion/pages/ConfiguracionPage";

import UsuariosPage from "../features/usuarios/pages/UsuariosPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* ========================= */}
      {/* RUTAS PÚBLICAS */}
      {/* ========================= */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/registro"
        element={
          <RegistroEmpresaPage />
        }
      />

      {/* ========================= */}
      {/* RUTAS AUTENTICADAS */}
      {/* ========================= */}

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* ========================= */}
        {/* ADMINISTRADOR + VENDEDOR */}
        {/* ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/productos"
          element={<ProductoPage />}
        />

        <Route
          path="/ventas"
          element={<VentasPage />}
        />

        <Route
          path="/clientes"
          element={<ClientesPage />}
        />

        {/* ========================= */}
        {/* SOLO ADMINISTRADOR */}
        {/* ========================= */}

        <Route
          path="/compras"
          element={
            <RoleRoute
              roles={[
                "Administrador",
              ]}
            >
              <IngresosPage />
            </RoleRoute>
          }
        />

        <Route
          path="/proveedores"
          element={
            <RoleRoute
              roles={[
                "Administrador",
              ]}
            >
              <ProveedoresPage />
            </RoleRoute>
          }
        />

        <Route
          path="/ajustes-stock"
          element={
            <RoleRoute
              roles={[
                "Administrador",
              ]}
            >
              <AjustesStockPage />
            </RoleRoute>
          }
        />

        <Route
          path="/reportes"
          element={
            <RoleRoute
              roles={[
                "Administrador",
              ]}
            >
              <ReportesPage />
            </RoleRoute>
          }
        />

        <Route
          path="/catalogos"
          element={
            <RoleRoute
              roles={[
                "Administrador",
              ]}
            >
              <CatalogosPage />
            </RoleRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <RoleRoute
              roles={[
                "Administrador",
              ]}
            >
              <UsuariosPage />
            </RoleRoute>
          }
        />

        <Route
          path="/configuracion"
          element={
            <RoleRoute
              roles={[
                "Administrador",
              ]}
            >
              <ConfiguracionPage />
            </RoleRoute>
          }
        />
      </Route>

      {/* ========================= */}
      {/* ENTRADA PRINCIPAL */}
      {/* ========================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* ========================= */}
      {/* RUTA DESCONOCIDA */}
      {/* ========================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}