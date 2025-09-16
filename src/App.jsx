/**
 * App.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Componente principal de la aplicación React.
 *
 * Funcionalidades:
 * - Configura el router principal de la aplicación con React Router v6.
 * - Protege rutas mediante `ProtectedRoute`.
 * - Define rutas para módulos de alumnos, profesores, cursos, libros, préstamos y llaves.
 * - Proporciona contextos y proveedores globales:
 *     • SidebarProviderCustom → contexto para gestión del sidebar.
 * - Proporciona React Query Client y Devtools para la gestión de datos asincrónicos.
 * - Muestra notificaciones globales con `Toaster`.
 *
 * Dependencias:
 * - react-router-dom: enrutamiento
 * - @tanstack/react-query: gestión de datos asincrónicos
 * - sonner: notificaciones
 * - context personalizados: TaskContext, SidebarContext
 * - ProtectedRoute: seguridad de rutas
 *
 */


import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layout/Layout";
import { Dashboard } from "./modules/Dashboard/pages/Dashboard";
import Login from "./modules/Login/pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import { TaskProvider } from "./context/TaskContext";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AlumnosIndex } from "./modules/Usuarios/pages/AlumnosIndex";
import { TodosIndex } from "./modules/Usuarios/pages/TodosIndex";
import { CursosIndex } from "./modules/Cursos/pages/CursosIndex";
import { LibrosIndex } from "./modules/Libros/pages/LibrosIndex";
import { PrestamosAlumnosIndex } from "./modules/Prestamos/pages/PrestamosAlumnosIndex";
import { SidebarProviderCustom } from "./context/SidebarContext";
import { PrestamosProfesoresIndex } from "./modules/Prestamos/pages/PrestamosProfesoresIndex";
import { ProfesoresIndex } from "./modules/Usuarios/pages/ProfesoresIndex";
import { PrestamosLlavesIndex } from "./modules/Llaves/pages/PrestamosLlavesIndex";
import { PlanoPlanta } from "./modules/Llaves/pages/PlanoPlanta";

const router = createBrowserRouter([
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
        path: "/",
        element: <Dashboard />, 
      },
      {
        path: "/alumnos",
        element: <AlumnosIndex />,
      },
      {
        path: "/profesores",
        element: <ProfesoresIndex />,
      },
      {
        path: "/todos",
        element: <TodosIndex />,
      },
      {
        path: "/cursos",
        element: <CursosIndex />,
      },
      {
        path: "/libros",
        element: <LibrosIndex />,
      },
      {
        path: "/prestamos",
        element: <PrestamosAlumnosIndex />,
      },
      {
        path: "/prestamosProfesores",
        element: <PrestamosProfesoresIndex />,
      },
      {
        path: "/llavesPrestadas",
        element: <PrestamosLlavesIndex />,
      },
      {
        path: "/llavesPlantaBaja",
        element: <PlanoPlanta planta="baja" />,
      },
      {
        path: "/llavesPlantaPrimera",
        element: <PlanoPlanta planta="primera" />,
      },
      {
        path: "/llavesPlantaSegunda",
        element: <PlanoPlanta planta="segunda" />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <TaskProvider>
          <SidebarProviderCustom>
            <Toaster richColors />
            <RouterProvider router={router} />
          </SidebarProviderCustom>
        </TaskProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
