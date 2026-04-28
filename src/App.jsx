/**
 * App.jsx
 *
 * Componente principal de la aplicación React.
 * - Configura el router principal con React Router v6.
 * - Protege rutas mediante `ProtectedRoute`.
 * - Dashboard dinámico según perfil de usuario.
 * - Proporciona contextos globales y React Query Client.
 */

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./modules/Login/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import { TaskProvider } from "./context/TaskContext";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider, useAuth } from "./context/AuthContext";

import { DashboardProfesor } from "./modules/Dashboard/pages/DashboardProfesor";
import { DashboardAdmin } from "./modules/Dashboard/pages/DashboardAdmin";
import { DashboardEducadora } from "./modules/Dashboard/pages/DashboardEducadora";
import { DashboardDirectiva } from "./modules/Dashboard/pages/DashboardDirectiva";

import { AlumnosIndex } from "./modules/Usuarios/pages/AlumnosIndex";
import { ProfesoresIndex } from "./modules/Usuarios/pages/ProfesoresIndex";
import { TodosIndex } from "./modules/Usuarios/pages/TodosIndex";
import { CursosIndex } from "./modules/Cursos/pages/CursosIndex";
import { PlanosConfigIndex } from "./modules/Planos/pages/PlanosConfigIndex";
import { LibrosIndex } from "./modules/Libros/pages/LibrosIndex";
import { PrestamosAlumnosIndex } from "./modules/Prestamos/pages/PrestamosAlumnosIndex";
import { PrestamosProfesoresIndex } from "./modules/Prestamos/pages/PrestamosProfesoresIndex";
import { PrestamosLlavesIndex } from "./modules/Llaves/pages/PrestamosLlavesIndex";
import { PlanoPlanta } from "./modules/Llaves/pages/PlanoPlanta";
import PlanoEstanciasEdicion from "./modules/Llaves/components/PlanoEstanciasEdicion";
import { PerfilesUsuarioIndex } from "./modules/PerfilesUsuario/pages/PerfilesUsuarioIndex";
import { EstanciasIndex } from "./modules/Estancias/pages/EstanciasIndex";
import { SidebarProviderCustom } from "./context/SidebarContext";
import { AsuntosPropiosIndex } from "./modules/AsuntosPropios/pages/AsuntosPropiosIndex";
import { ReservasEstanciasIndex } from "./modules/ReservasEstancias/pages/ReservasEstanciasIndex";
import { ExtraescolaresIndex } from "./modules/Extraescolares/pages/ExtraescolaresIndex";
import { AvisosIndex } from "./modules/Avisos/pages/AvisosIndex";
import { PeriodosHorariosIndex } from "./modules/PeriodosHorarios/pages/PeriodosHorariosIndex";
import { PermisosIndex } from "./modules/Permisos/pages/PermisosIndex";
import { useState } from "react"; // asegurarse de importar useState
import { StaffIndex } from "./modules/Usuarios/pages/StaffIndex";
import { DashboardAdmministrativos } from "./modules/Dashboard/pages/DashboardAdministrativos";
import { MateriasIndex } from "./modules/Materias/pages/MateriasIndex";
import { HorariosIndex } from "./modules/HorariosProfesorado/pages/HorariosIndex";
import { CuadranteGuardiasIndex } from "./modules/Guardias/pages/CuadranteGuardiasIndex";
import { AusenciasIndex } from "./modules/Ausencias/pages/AusenciasIndex";
import { PanelGuardias } from "./modules/Guardias/pages/PanelGuardias";
import { PanelProyeccion } from "./modules/Guardias/pages/PanelProyeccion";
import { GuardiasIndex } from "./modules/Guardias/pages/GuardiasIndex";

import { useConfiguracionCentro } from "./hooks/useConfiguracionCentro";
import { usePlanos } from "./hooks/usePlanos";
import { Navigate } from "react-router-dom";

import { useEffect } from "react";

const queryClient = new QueryClient();

function OrdenanzaRedirect() {
  const { data: planos = [], isLoading } = usePlanos();

  if (isLoading) return <div>Cargando...</div>;

  // Buscamos el plano con orden 0
  const planoInicial = planos.find((p) => p.orden === 0) || planos[0];

  if (planoInicial) {
    return <Navigate to={`/planos/${planoInicial.id}`} replace />;
  }

  return <Navigate to="/" replace />;
}

// Selector de dashboard según perfil
function DashboardSelector() {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;
  switch (user.perfil) {
    case "directiva":
      return <DashboardDirectiva />;
    case "profesor":
      return <DashboardProfesor />;
    case "extraescolares":
      return <DashboardProfesor />;
    case "administrador":
      return <DashboardAdmin />;
    case "educadora":
      return <DashboardEducadora />;
    case "administrativo":
      return <DashboardAdmministrativos />;
    default:
      return <div>Perfil no reconocido</div>;
  }
}

// Configuración del router
const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/public-panel/:token",
      element: <PanelProyeccion />,
    },
    {
      path: "/gestionIES/public-panel/:token",
      element: <PanelProyeccion />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <DashboardSelector />, // Dashboard dinámico
        },
        { path: "alumnos", element: <AlumnosIndex /> },
        {
          path: "profesores",
          element: (
            <ProtectedRoute
              perfilesPermitidos={[
                "administrador",
                "directiva",
                "administrativo",
              ]}
            >
              {" "}
              <ProfesoresIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "staff",
          element: (
            <ProtectedRoute
              perfilesPermitidos={[
                "administrador",
                "directiva",
                "administrativo",
              ]}
            >
              {" "}
              <StaffIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "todos",
          element: (
            <ProtectedRoute
              perfilesPermitidos={["administrador", "directiva", "educadora"]}
            >
              {" "}
              <TodosIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "cursos",
          element: (
            <ProtectedRoute
              perfilesPermitidos={[
                "administrador",
                "directiva",
                "educadora",
                "administrativo",
              ]}
            >
              {" "}
              <CursosIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "materias",
          element: (
            <ProtectedRoute
              perfilesPermitidos={[
                "administrador",
                "directiva",
                "educadora",
                "administrativo",
              ]}
            >
              {" "}
              <MateriasIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "libros",
          element: (
            <ProtectedRoute
              perfilesPermitidos={[
                "administrador",
                "directiva",
                "educadora",
                "administrativo",
              ]}
            >
              {" "}
              <LibrosIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "prestamos",
          element: (
            <ProtectedRoute
              perfilesPermitidos={[
                "administrador",
                "directiva",
                "educadora",
                "administrativo",
              ]}
            >
              {" "}
              <PrestamosAlumnosIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "prestamosProfesores",
          element: (
            <ProtectedRoute
              perfilesPermitidos={[
                "administrador",
                "directiva",
                "educadora",
                "administrativo",
              ]}
            >
              {" "}
              <PrestamosProfesoresIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "planos",
          element: (
            <ProtectedRoute perfilesPermitidos={["administrador"]}>
              {" "}
              <PlanosConfigIndex />
            </ProtectedRoute>
          ),
        },
        {
          path: "llavesPrestadas",
          element: (
            <ProtectedRoute
              perfilesPermitidos={["administrador", "directiva", "ordenanza"]}
            >
              {" "}
              <PrestamosLlavesIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "edicionPlanos",
          element: (
            <ProtectedRoute perfilesPermitidos={["administrador", "directiva"]}>
              {" "}
              <PlanoEstanciasEdicion />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "ordenanza-home",
          element: (
            <ProtectedRoute>
              <OrdenanzaRedirect />
            </ProtectedRoute>
          ),
        },
        {
          path: "planos/:planoId",
          element: (
            <ProtectedRoute
              perfilesPermitidos={["administrador", "directiva", "ordenanza"]}
            >
              <PlanoPlanta />
            </ProtectedRoute>
          ),
        },
        {
          path: "perfiles",
          element: (
            <ProtectedRoute perfilesPermitidos={["administrador", "directiva"]}>
              <PerfilesUsuarioIndex />
            </ProtectedRoute>
          ),
        },
        {
          path: "estancias",
          element: (
            <ProtectedRoute perfilesPermitidos={["administrador", "directiva"]}>
              {" "}
              <EstanciasIndex />{" "}
            </ProtectedRoute>
          ),
        },

        { path: "asuntos", element: <AsuntosPropiosIndex /> },
        { path: "permisos", element: <PermisosIndex /> },

        { path: "extraescolares", element: <ExtraescolaresIndex /> },
        { path: "reservasEstancias", element: <ReservasEstanciasIndex /> },
        {
          path: "avisos",
          element: (
            <ProtectedRoute perfilesPermitidos={["administrador", "directiva"]}>
              {" "}
              <AvisosIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "periodos-horarios",
          element: (
            <ProtectedRoute perfilesPermitidos={["administrador", "directiva"]}>
              {" "}
              <PeriodosHorariosIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "horarios",
          element: (
            <ProtectedRoute perfilesPermitidos={["administrador", "directiva"]}>
              {" "}
              <HorariosIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "cuadrante-guardias",
          element: (
            <ProtectedRoute perfilesPermitidos={["administrador", "directiva"]}>
              {" "}
              <CuadranteGuardiasIndex />{" "}
            </ProtectedRoute>
          ),
        },

        {
          path: "ausencias-profesorado",
          element: (
            <ProtectedRoute
              perfilesPermitidos={[
                "administrador",
                "directiva",
                "profesor",
                "extraescolares",
              ]}
            >
              {" "}
              <AusenciasIndex />{" "}
            </ProtectedRoute>
          ),
        },
        {
          path: "guardias-profesorado",
          element: (
            <ProtectedRoute
              perfilesPermitidos={[
                "administrador",
                "directiva",
                "profesor",
                "extraescolares",
              ]}
            >
              {" "}
              <GuardiasIndex />{" "}
            </ProtectedRoute>
          ),
        },

        { path: "panel-guardias", element: <PanelGuardias /> },
      ],
    },
  ],
  {
    basename: "/gestionIES",
  }
);

function TitleUpdater() {
  const { data: centro } = useConfiguracionCentro();
  const APP_NAME = import.meta.env.VITE_APP_NAME || "gestionIES";

  useEffect(() => {
    if (!centro) return;

    // 1. Actualizar el Título
    if (centro.nombreIes) {
      document.title = `${APP_NAME} - ${centro.nombreIes}`;
    }

    // 2. Actualizar el Favicon
    // IMPORTANTE: Usamos faviconUrl (camelCase) como definimos en el Hook
    if (centro.faviconUrl) {
      // Buscamos cualquier etiqueta de icono existente
      const existingFavicon = document.querySelector("link[rel*='icon']");

      if (existingFavicon) {
        // Si existe, simplemente actualizamos su href
        existingFavicon.href = centro.faviconUrl;
      } else {
        // Si no existe (raro), la creamos
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/x-icon";
        link.href = centro.faviconUrl;
        document.head.appendChild(link);
      }
    }
  }, [centro, APP_NAME]); // Se dispara cuando cambian los datos del centro

  return null;
}

function App() {
  const [tabActivo, setTabActivo] = useState("permisos"); // estado global para tabs directiva

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TaskProvider>
          <SidebarProviderCustom>
            <TitleUpdater />
            <Toaster richColors />
            <RouterProvider
              router={router}
              context={{ tabActivo, setTabActivo }} // React Router v6.14+ permite pasar contexto
            />
          </SidebarProviderCustom>
        </TaskProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
