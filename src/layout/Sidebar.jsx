/**
 * Sidebar.jsx - Componente de barra lateral de la aplicación
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Componente que renderiza la barra lateral de navegación principal.
 * - Integra secciones de menú organizadas (Personas, Máquinas, Préstamo Libros, Préstamo Llaves, Utilidades).
 * - Obtiene y muestra el nombre del usuario autenticado mediante `/check-auth`.
 * - Permite cerrar sesión mediante `/logout`, redirigiendo a la vista de login.
 * - Gestiona la apertura del diálogo de etiquetas de ordenadores a través del prop `onOpenEtiquetas`.
 *
 * Props:
 * - onOpenEtiquetas: función opcional para notificar al componente padre
 *   cuando se abre el diálogo de etiquetas.
 * - ...props: se propagan al componente raíz `<Sidebar>`.
 *
 * Estado interno:
 * - username: nombre del usuario autenticado (por defecto "Usuario").
 * - openEtiquetas: controla la apertura del diálogo de etiquetas desde el menú de utilidades.
 *
 * Dependencias:
 * - react-router-dom (useNavigate)
 * - @/components/ui/sidebar
 * - lucide-react (Power, User, BookOpen, SquareTerminal, Settings2)
 * - @/components/nav-main
 *
 * Notas:
 * - Se usa `React.memo` para optimizar el rendimiento y evitar renders innecesarios.
 * - La opción "Etiquetas Ordenadores" activa el estado interno `openEtiquetas`,
 *   que a su vez dispara el callback `onOpenEtiquetas` si está definido.
 * - El pie del sidebar incluye un botón de logout y la información del usuario activo.
 */

/*function SidebarComponent({ onOpenEtiquetas, ...props }) {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("Usuario");
  const [openEtiquetas, setOpenEtiquetas] = React.useState(false);

  React.useEffect(() => {
    fetch(`${API_URL}/check-auth`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setUsername(data.username);
        }
      })
      .catch(() => {
        setUsername("Usuario");
      });
  }, []);

  const handleClickLogout = () => {
    fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      navigate("/login");
    });
  };

  const navMain = [
    {
      title: "Inicio", // Panel resumen del usuario (profesor) con info de aulas y armarios reservados en el día y sus asuntos propios pedidos.
      url: "/",
      icon: SquareTerminal,
      isActive: true,
      /*items: [
        { title: "Alumnos", url: "/alumnos" },
        { title: "Profesores", url: "/profesores" },
        { title: "Todos", url: "/todos" },
      ],
    },
    {
      title: "Personas",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "Alumnos", url: "/alumnos" },
        { title: "Profesores", url: "/profesores" },
        { title: "Todos", url: "/todos" },
      ],
    },
    {
      title: "Máquinas",
      url: "#",
      icon: SquareTerminal,
      items: [
        { title: "Red Troncal", url: "/alumnos" },
        { title: "Profesores", url: "/profesores" },
        { title: "Todos", url: "/todos" },
      ],
    },
    {
      title: "Reserva de recursos",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Aulas", url: "/llavesPrestadas" },
        { title: "Armarios de Portátiles", url: "/llavesPlantaBaja" },
      ],
    },
    {
      title: "Asuntos Propios",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Mis asuntos propios", url: "/llavesPrestadas" },
        { title: "Solicitar", url: "/llavesPlantaBaja" },
      ],
    },

    {
      title: "Préstamo Libros",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Alumnos", url: "/prestamos" },
        { title: "Profesores", url: "/prestamosProfesores" },
        { title: "Libros", url: "/libros" },
        { title: "Cursos", url: "/cursos" },
      ],
    },
    {
      title: "Préstamo Llaves",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Llaves prestadas", url: "/llavesPrestadas" },
        { title: "Planta BAJA", url: "/llavesPlantaBaja" },
        { title: "Planta PRIMERA", url: "/llavesPlantaPrimera" },
        { title: "Planta SEGUNDA", url: "/llavesPlantaSegunda" },
      ],
    },

    {
      title: "Utilidades",
      url: "#",
      icon: Settings2,
      items: [
        { title: "Importar de Rayuela", url: "#" },
        {
          title: "Etiquetas Ordenadores",
          url: "#",
          onClick: () => setOpenEtiquetas(true),
        },
      ],
    },
    {
      title: "Administrador",
      url: "#",
      icon: Settings2,
      items: [{ title: "Perfiles de Usuario", url: "/perfiles" }],
    },
  ];

  // Cuando el diálogo interno cambia el estado, notificamos al padre si existe onOpenEtiquetas
  React.useEffect(() => {
    if (openEtiquetas && onOpenEtiquetas) {
      onOpenEtiquetas();
      setOpenEtiquetas(false); // reseteamos para evitar loops
    }
  }, [openEtiquetas, onOpenEtiquetas]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="border-t p-4">
          <div className="flex items-center justify-between w-full">
            <Power
              className="cursor-pointer"
              color="red"
              onClick={handleClickLogout}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{username}</span>
              <User className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
*/

import { useAuth } from "@/context/AuthContext";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Power, User, BookOpen, SquareTerminal, Settings2 } from "lucide-react";
import { NavMain } from "@/components/nav-main";

const API_URL = import.meta.env.VITE_API_URL;
function SidebarComponent({ onOpenEtiquetas, ...props }) {
  const navigate = useNavigate();
  const [openEtiquetas, setOpenEtiquetas] = React.useState(false);
  const { user, setUser, loading } = useAuth();

  // Menús por perfil
  const menusPorPerfil = {
    profesor: [
      {
        title: "Usuarios",
        url: "#",
        icon: SquareTerminal,
        items: [
          { title: "Alumnos", url: "/alumnos" },
          { title: "Profesores", url: "/profesores" },
          { title: "Todos", url: "/todos" },
        ],
      },
      {
        title: "Reserva de recursos",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Aulas", url: "/llavesPrestadas" },
          { title: "Armarios de Portátiles", url: "/llavesPlantaBaja" },
        ],
      },
      {
        title: "Asuntos Propios",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Mis asuntos propios", url: "/llavesPrestadas" },
          { title: "Solicitar", url: "/llavesPlantaBaja" },
        ],
      },
    ],
    ordenanza: [
      {
        title: "Préstamo Llaves",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Llaves prestadas", url: "/llavesPrestadas" },
          { title: "Planta BAJA", url: "/llavesPlantaBaja" },
          { title: "Planta PRIMERA", url: "/llavesPlantaPrimera" },
          { title: "Planta SEGUNDA", url: "/llavesPlantaSegunda" },
        ],
      },
    ],
    administrador: [
      {
        title: "Usuarios",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          { title: "Alumnos", url: "/alumnos" },
          { title: "Profesores", url: "/profesores" },
          { title: "Todos", url: "/todos" },
          { title: "Perfiles de Usuario", url: "/perfiles" },
        ],
      },
     
      {
        title: "Reserva de recursos",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Aulas", url: "/llavesPrestadas" },
          { title: "Armarios de Portátiles", url: "/llavesPlantaBaja" },
        ],
      },
      {
        title: "Asuntos Propios",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Mis asuntos propios", url: "/llavesPrestadas" },
          { title: "Solicitar", url: "/llavesPlantaBaja" },
        ],
      },
      {
        title: "Préstamo Libros",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Alumnos", url: "/prestamos" },
          { title: "Profesores", url: "/prestamosProfesores" },
          { title: "Libros", url: "/libros" },
          { title: "Cursos", url: "/cursos" },
        ],
      },
      {
        title: "Préstamo Llaves",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Llaves prestadas", url: "/llavesPrestadas" },
          { title: "Estancias", url: "/estancias" },
          { title: "Planta BAJA", url: "/llavesPlantaBaja" },
          { title: "Planta PRIMERA", url: "/llavesPlantaPrimera" },
          { title: "Planta SEGUNDA", url: "/llavesPlantaSegunda" },
        ],
      },
      {
        title: "Administrador",
        url: "#",
        icon: Settings2,
        items: [{ title: "Perfiles de Usuario", url: "/perfiles" }],
      },
    ],
    educador: [
      {
        title: "Usuarios",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          { title: "Alumnos", url: "/alumnos" },
          { title: "Profesores", url: "/profesores" },
          { title: "Todos", url: "/todos" },
        ],
      },

      {
        title: "Reserva de recursos",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Aulas", url: "/llavesPrestadas" },
          { title: "Armarios de Portátiles", url: "/llavesPlantaBaja" },
        ],
      },
      {
        title: "Asuntos Propios",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Mis asuntos propios", url: "/llavesPrestadas" },
          { title: "Solicitar", url: "/llavesPlantaBaja" },
        ],
      },

      {
        title: "Préstamo Libros",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Alumnos", url: "/prestamos" },
          { title: "Profesores", url: "/prestamosProfesores" },
          { title: "Libros", url: "/libros" },
          { title: "Cursos", url: "/cursos" },
        ],
      },
      {
        title: "Préstamo Llaves",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Llaves prestadas", url: "/llavesPrestadas" },
          { title: "Planta BAJA", url: "/llavesPlantaBaja" },
          { title: "Planta PRIMERA", url: "/llavesPlantaPrimera" },
          { title: "Planta SEGUNDA", url: "/llavesPlantaSegunda" },
        ],
      },
    ],
  };
  const navMain = user ? (menusPorPerfil[user.perfil] ?? []) : [];

  const handleClickLogout = () => {
    fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      setUser(null);
      navigate("/login");
    });
  };

  // Cuando se abre etiquetas, notificar al padre
  React.useEffect(() => {
    if (openEtiquetas && onOpenEtiquetas) {
      onOpenEtiquetas();
      setOpenEtiquetas(false);
    }
  }, [openEtiquetas, onOpenEtiquetas]);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        {loading ? (
          <div>Cargando...</div>
        ) : !user ? (
          <div>No autenticado</div>
        ) : (
          <NavMain items={navMain} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="border-t p-4">
          <div className="flex items-center justify-between w-full">
            <Power
              className="cursor-pointer"
              color="red"
              onClick={handleClickLogout}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user?.username}</span>
              <User className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default React.memo(SidebarComponent);
