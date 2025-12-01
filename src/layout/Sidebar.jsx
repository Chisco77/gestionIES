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

import { useAuth } from "@/context/AuthContext";
import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/nav-main";

import {
  Home,
  Users,
  CalendarCheck,
  Library,
  BookMarked,
  GraduationCap,
  UserCheck,
  KeySquare,
  KeyRound,
  Map,
  ShieldCheck,
  IdCard,
  ListChecks,
  Building2,
  Tag,
  Wrench,
  Power,
  User,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function SidebarComponent({ onOpenRestricciones, onOpenEtiquetas, ...props }) {
  const navigate = useNavigate();
  const { user, setUser, loading } = useAuth();

  // Menús por perfil con iconos mejorados
  const menusPorPerfil = {
    directiva: [
      {
        title: "Inicio",
        url: "/",
        icon: Home,
      },
      {
        title: "Usuarios",
        url: "#",
        icon: Users,
        items: [
          { title: "Alumnos", url: "/alumnos" },
          { title: "Profesores", url: "/profesores" },
          { title: "Todos", url: "/todos" },
        ],
      },
      {
        title: "Reservas",
        url: "#",
        icon: CalendarCheck,
        items: [
          { title: "Aulas", url: "/reservasEstancias" },
          { title: "Asuntos Propios", url: "/asuntos_propios" },
          { title: "Extraescolares", url: "/extraescolares" },
        ],
      },
      {
        title: "Préstamo Libros",
        url: "#",
        icon: Library,
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
        icon: KeySquare,
        items: [
          { title: "Llaves prestadas", url: "/llavesPrestadas" },
          { title: "Planta BAJA", url: "/llavesPlantaBaja" },
          { title: "Planta PRIMERA", url: "/llavesPlantaPrimera" },
          { title: "Planta SEGUNDA", url: "/llavesPlantaSegunda" },
        ],
      },
      {
        title: "Administrador",
        url: "#",
        icon: ShieldCheck,
        items: [
          { title: "Perfiles de Usuario", url: "/perfiles" },
          { title: "Estancias", url: "/estancias" },
          { title: "Avisos", url: "/avisos", icon: Building2 },

          {
            title: "Reglas Asuntos Propios",
            url: "#",
            onClick: () => onOpenRestricciones(),
          },
          {
            title: "Etiquetas genéricas",
            url: "#",
            onClick: () => onOpenEtiquetas(),
          },
        ],
      },
    ],

    profesor: [
      {
        title: "Inicio",
        url: "/",
        icon: Home,
      },
      {
        title: "Usuarios",
        url: "#",
        icon: Users,
        items: [
          { title: "Alumnos", url: "/alumnos" },
        ],
      },
      {
        title: "Reservas",
        url: "#",
        icon: CalendarCheck,
        items: [
          { title: "Aulas", url: "/reservasEstancias" },
          { title: "Asuntos Propios", url: "/asuntos_propios" },
          { title: "Extraescolares", url: "/extraescolares" },
        ],
      },
    ],

    ordenanza: [
      {
        title: "Préstamo Llaves",
        url: "#",
        icon: KeySquare,
        isActive: true,
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
        title: "Inicio",
        url: "/",
        icon: Home,
      },
      {
        title: "Usuarios",
        url: "#",
        icon: Users,
        items: [
          { title: "Alumnos", url: "/alumnos" },
          { title: "Profesores", url: "/profesores" },
          { title: "Todos", url: "/todos" },
          { title: "Perfiles de Usuario", url: "/perfiles" },
        ],
      },

      {
        title: "Reservas",
        url: "#",
        icon: CalendarCheck,
        items: [
          { title: "Aulas", url: "/reservasEstancias" },
          { title: "Asuntos Propios", url: "/asuntos_propios" },
          { title: "Extraescolares", url: "/extraescolares" },
        ],
      },
      {
        title: "Préstamo Libros",
        url: "#",
        icon: Library,
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
        icon: KeySquare,
        items: [
          { title: "Llaves prestadas", url: "/llavesPrestadas" },
          { title: "Edición de Planos", url: "/edicionPlanos", icon: Map },
          { title: "Planta BAJA", url: "/llavesPlantaBaja" },
          { title: "Planta PRIMERA", url: "/llavesPlantaPrimera" },
          { title: "Planta SEGUNDA", url: "/llavesPlantaSegunda" },
        ],
      },
      {
        title: "Administrador",
        url: "#",
        icon: ShieldCheck,
        items: [
          { title: "Perfiles de Usuario", url: "/perfiles" },
          { title: "Estancias", url: "/estancias" },
          { title: "Avisos", url: "/avisos", icon: Building2 },

          {
            title: "Reglas Asuntos Propios",
            url: "#",
            onClick: () => onOpenRestricciones(),
          },
          {
            title: "Etiquetas genéricas",
            url: "#",
            onClick: () => onOpenEtiquetas(),
          },
        ],
      },
    ],

    educadora: [
      {
        title: "Inicio",
        url: "/",
        icon: Home,
      },
      {
        title: "Usuarios",
        url: "#",
        icon: Users,
        items: [
          { title: "Alumnos", url: "/alumnos" },
        ],
      },
      {
        title: "Reservas",
        url: "#",
        icon: CalendarCheck,
        items: [
          { title: "Aulas", url: "/reservasEstancias" },
          { title: "Asuntos Propios", url: "/asuntos_propios" },
          { title: "Extraescolares", url: "/extraescolares" },
        ],
      },
      {
        title: "Préstamo Libros",
        url: "#",
        icon: Library,
        items: [
          { title: "Alumnos", url: "/prestamos" },
          { title: "Profesores", url: "/prestamosProfesores" },
          { title: "Libros", url: "/libros" },
          { title: "Cursos", url: "/cursos" },
        ],
      },
    ],
  };

  const navMain = user ? (menusPorPerfil[user.perfil] ?? []) : [];

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
    </Sidebar>
  );
}

export default React.memo(SidebarComponent);
