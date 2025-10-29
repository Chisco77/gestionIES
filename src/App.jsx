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
import { LibrosIndex } from "./modules/Libros/pages/LibrosIndex";
import { PrestamosAlumnosIndex } from "./modules/Prestamos/pages/PrestamosAlumnosIndex";
import { PrestamosProfesoresIndex } from "./modules/Prestamos/pages/PrestamosProfesoresIndex";
import { PrestamosLlavesIndex } from "./modules/Llaves/pages/PrestamosLlavesIndex";
import { PlanoPlanta } from "./modules/Llaves/pages/PlanoPlanta";
import PlanoEstanciasEdicion from "./modules/Llaves/components/PlanoEstanciasEdicion";
import { PerfilesUsuarioIndex } from "./modules/PerfilesUsuario/pages/PerfilesUsuarioIndex";
import { EstanciasIndex } from "./modules/Estancias/pages/EstanciasIndex";
import { DialogoAsuntosRestricciones } from "./modules/AsuntosPropios/components/DialogoAsuntosRestricciones";
import { SidebarProviderCustom } from "./context/SidebarContext";
import { AsuntosPropiosIndex } from "./modules/AsuntosPropios/pages/AsuntosPropiosIndex";
import { DialogoEtiquetasGenericas } from "./modules/Utilidades/components/DialogoEtiquetasGenericas";


const queryClient = new QueryClient();

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
    case "administrador":
      return <DashboardAdmin />;
    case "educadora":
      return <DashboardEducadora />;
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
        { path: "profesores", element: <ProfesoresIndex /> },
        { path: "todos", element: <TodosIndex /> },
        { path: "cursos", element: <CursosIndex /> },
        { path: "libros", element: <LibrosIndex /> },
        { path: "prestamos", element: <PrestamosAlumnosIndex /> },
        { path: "prestamosProfesores", element: <PrestamosProfesoresIndex /> },
        { path: "llavesPrestadas", element: <PrestamosLlavesIndex /> },
        { path: "edicionPlanos", element: <PlanoEstanciasEdicion /> },
        { path: "llavesPlantaBaja", element: <PlanoPlanta planta="baja" /> },
        {
          path: "llavesPlantaPrimera",
          element: <PlanoPlanta planta="primera" />,
        },
        {
          path: "llavesPlantaSegunda",
          element: <PlanoPlanta planta="segunda" />,
        },
        { path: "perfiles", element: <PerfilesUsuarioIndex /> },
        { path: "estancias", element: <EstanciasIndex /> },
        { path: "asuntos_restricciones", element: <DialogoAsuntosRestricciones /> },
        { path: "etiquetas_genericas", element: <DialogoEtiquetasGenericas /> },
        { path: "asuntos_propios", element: <AsuntosPropiosIndex /> },
      ],
    },
  ],
  {
    basename: "/gestionIES", 
  }
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TaskProvider>
          <SidebarProviderCustom>
            <Toaster richColors />
            <RouterProvider router={router} />
          </SidebarProviderCustom>
        </TaskProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
