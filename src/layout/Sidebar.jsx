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
  BookOpen,
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
  Info,
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
          { title: "Alumnos", url: "/alumnos", icon: GraduationCap },
          { title: "Profesores", url: "/profesores", icon: UserCheck },
          { title: "Todos", url: "/todos", icon: User },
        ],
      },
      {
        title: "Reservas",
        url: "#",
        icon: CalendarCheck,
        items: [
          { title: "Aulas", url: "/reservasEstancias", icon: Building2 },

          {
            title: "Extraescolares",
            url: "/extraescolares",
            icon: CalendarCheck,
          },
          {
            title: "Asuntos Propios",
            url: "/asuntos",
            icon: ListChecks,
          },
          {
            title: "Permisos",
            url: "/permisos",
            icon: ListChecks,
          },
        ],
      },
      {
        title: "Préstamo Libros",
        url: "#",
        icon: Library,
        items: [
          { title: "Alumnos", url: "/prestamos", icon: GraduationCap },
          { title: "Profesores", url: "/prestamosProfesores", icon: UserCheck },
          { title: "Libros", url: "/libros", icon: BookMarked },
          { title: "Cursos", url: "/cursos", icon: BookOpen },
        ],
      },
      {
        title: "Préstamo Llaves",
        url: "#",
        icon: KeySquare,
        items: [
          {
            title: "Llaves prestadas",
            url: "/llavesPrestadas",
            icon: KeyRound,
          },
        ],
      },

      {
        title: "Utilidades",
        url: "#",
        icon: Wrench,
        items: [
          {
            title: "Etiquetas genéricas",
            url: "#",
            onClick: () => onOpenEtiquetas(),
            icon: Tag,
          },
        ],
      },
      {
        title: "Configuración",
        url: "#",
        icon: ShieldCheck,
        items: [
          {
            title: "Asuntos Propios",
            url: "#",
            onClick: () => onOpenRestricciones(),
            icon: Wrench,
          },
          { title: "Avisos", url: "/avisos", icon: Info },
          { title: "Estancias", url: "/estancias", icon: Building2 },
          { title: "Perfiles de Usuario", url: "/perfiles", icon: IdCard },

          {
            title: "Periodos Horarios",
            url: "/periodos-horarios",
            icon: ListChecks,
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
        items: [{ title: "Alumnos", url: "/alumnos", icon: GraduationCap }],
      },
      {
        title: "Reservas",
        url: "#",
        icon: CalendarCheck,
        items: [
          { title: "Aulas", url: "/reservasEstancias", icon: Building2 },

          {
            title: "Extraescolares",
            url: "/extraescolares",
            icon: CalendarCheck,
          },
          {
            title: "Asuntos Propios",
            url: "/asuntos",
            icon: ListChecks,
          },
          {
            title: "Permisos",
            url: "/permisos",
            icon: ListChecks,
          },
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
          {
            title: "Llaves prestadas",
            url: "/llavesPrestadas",
            icon: KeyRound,
          },
          { title: "Planta BAJA", url: "/llavesPlantaBaja", icon: KeySquare },
          {
            title: "Planta PRIMERA",
            url: "/llavesPlantaPrimera",
            icon: KeySquare,
          },
          {
            title: "Planta SEGUNDA",
            url: "/llavesPlantaSegunda",
            icon: KeySquare,
          },
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
          { title: "Alumnos", url: "/alumnos", icon: GraduationCap },
          { title: "Profesores", url: "/profesores", icon: UserCheck },
          { title: "Todos", url: "/todos", icon: User },
          { title: "Perfiles de Usuario", url: "/perfiles", icon: IdCard },
        ],
      },
      {
        title: "Reservas",
        url: "#",
        icon: CalendarCheck,
        items: [
          { title: "Aulas", url: "/reservasEstancias", icon: Building2 },

          {
            title: "Extraescolares",
            url: "/extraescolares",
            icon: CalendarCheck,
          },
          {
            title: "Asuntos Propios",
            url: "/asuntos",
            icon: ListChecks,
          },
          {
            title: "Permisos",
            url: "/permisos",
            icon: ListChecks,
          },
        ],
      },
      {
        title: "Préstamo Libros",
        url: "#",
        icon: Library,
        items: [
          { title: "Alumnos", url: "/prestamos", icon: GraduationCap },
          { title: "Profesores", url: "/prestamosProfesores", icon: UserCheck },
          { title: "Libros", url: "/libros", icon: BookMarked },
          { title: "Cursos", url: "/cursos", icon: BookOpen },
        ],
      },
      {
        title: "Préstamo Llaves",
        url: "#",
        icon: KeySquare,
        items: [
          {
            title: "Llaves prestadas",
            url: "/llavesPrestadas",
            icon: KeyRound,
          },
          { title: "Planta BAJA", url: "/llavesPlantaBaja", icon: KeySquare },
          {
            title: "Planta PRIMERA",
            url: "/llavesPlantaPrimera",
            icon: KeySquare,
          },
          {
            title: "Planta SEGUNDA",
            url: "/llavesPlantaSegunda",
            icon: KeySquare,
          },
        ],
      },
      {
        title: "Utilidades",
        url: "#",
        icon: Wrench,
        items: [
          {
            title: "Etiquetas genéricas",
            url: "#",
            onClick: () => onOpenEtiquetas(),
            icon: Tag,
          },
        ],
      },
      {
        title: "Administrador",
        url: "#",
        icon: ShieldCheck,
        items: [
          {
            title: "Asuntos Propios",
            url: "#",
            onClick: () => onOpenRestricciones(),
            icon: Wrench,
          },
          { title: "Avisos", url: "/avisos", icon: Info },
          { title: "Edición de Planos", url: "/edicionPlanos", icon: Map },
          { title: "Estancias", url: "/estancias", icon: Building2 },

          { title: "Perfiles de Usuario", url: "/perfiles", icon: IdCard },
          {
            title: "Periodos Horarios",
            url: "/periodos-horarios",
            icon: ListChecks,
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
        items: [{ title: "Alumnos", url: "/alumnos", icon: GraduationCap }],
      },
      {
        title: "Reservas",
        url: "#",
        icon: CalendarCheck,
        items: [
          { title: "Aulas", url: "/reservasEstancias", icon: Building2 },

          {
            title: "Extraescolares",
            url: "/extraescolares",
            icon: CalendarCheck,
          },
          {
            title: "Asuntos Propios",
            url: "/asuntos",
            icon: ListChecks,
          },
          {
            title: "Permisos",
            url: "/permisos",
            icon: ListChecks,
          },
        ],
      },
      {
        title: "Préstamo Libros",
        url: "#",
        icon: Library,
        items: [
          { title: "Alumnos", url: "/prestamos", icon: GraduationCap },
          { title: "Profesores", url: "/prestamosProfesores", icon: UserCheck },
          { title: "Libros", url: "/libros", icon: BookMarked },
          { title: "Cursos", url: "/cursos", icon: BookOpen },
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
