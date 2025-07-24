import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layout/Layout";
import { Dashboard } from "./modules/Dashboard/pages/Dashboard";
import Login from "./modules/Login/pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import { TaskProvider } from "./context/TaskContext";
import { Provider } from "react-redux";
import store from "./reducers/store";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AlumnosIndex } from "./modules/Usuarios/pages/AlumnosIndex";
import { ProfesoresIndex } from "./modules/Usuarios/pages/ProfesoresIndex";
import { TodosIndex } from "./modules/Usuarios/pages/TodosIndex";
import { CursosIndex } from "./modules/Cursos/pages/CursosIndex";
import { LibrosIndex } from "./modules/Libros/pages/LibrosIndex";
import { PrestamosIndex } from "./modules/Prestamos/pages/PrestamosIndex";
import { SidebarProviderCustom } from "./context/SidebarContext";

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
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
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
        element: <PrestamosIndex />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <TaskProvider>
          <SidebarProviderCustom>
            <Toaster richColors />
            <RouterProvider router={router} />
          </SidebarProviderCustom>
        </TaskProvider>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
