/**
 * Layout.jsx - Componente principal de disposición de la aplicación
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
 * Componente que define la estructura general de la aplicación,
 * integrando la barra lateral, la cabecera y el área de contenido principal.
 *
 * Funcionalidad:
 * - Usa `SidebarProvider` para manejar el estado global de la barra lateral.
 * - Renderiza el componente `Sidebar` con props y la opción de abrir
 *   el diálogo de etiquetas genéricas.
 * - Renderiza `Header` en la parte superior y el contenido dinámico de
 *   las rutas hijas mediante `<Outlet />`.
 * - Controla la apertura del `DialogoEtiquetasGenericas`.
 * - Actualiza el título activo en función de la ruta actual (`location.pathname`).
 *
 * Dependencias:
 * - react-router-dom (useLocation, Outlet)
 * - @/components/ui/sidebar
 * - ./Sidebar
 * - ./Header
 * - @/modules/Utilidades/components/DialogoEtiquetasGenericas
 * - @/context/SidebarContext
 *
 * Notas:
 * - El estado `openEtiquetas` determina si se muestra el diálogo de etiquetas
 *   o el contenido principal.
 * - El título de la cabecera se mapea desde la ruta actual.
 */

import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { DialogoEtiquetasGenericas } from "@/modules/Utilidades/components/DialogoEtiquetasGenericas";
import { useSidebarContext } from "@/context/SidebarContext";

import { DialogoAsuntosRestricciones } from "../modules/AsuntosPropios/components/DialogoAsuntosRestricciones";
import { DialogoLlavesRestricciones } from "@/modules/Llaves/components/DialogoLlavesRestricciones";
import { DialogoImportarHorariosUNTIS } from "@/modules/Guardias/components/DialogoImportarHorariosUNTIS";

export default function Layout(props) {
  const [openEtiquetas, setOpenEtiquetas] = useState(false);
  const [openRestricciones, setOpenRestricciones] = useState(false);
  const [openLlavesRestricciones, setOpenLlavesRestricciones] = useState(false);
  const [openImportarHorariosUNTIS, setOpenImportarHorariosUNTIS] =
    useState(false);

  const [tabActivo, setTabActivo] = useState("permisos");

  const location = useLocation();
  const { setTituloActivo } = useSidebarContext();

  useEffect(() => {
    const pathToTitleMap = {
      "/": "Inicio",
      "/alumnos": "Alumnos",
      "/profesores": "Profesores",
      "/staff": "Personal no docente",
      "/todos": "Todos",
      "/cursos": "Cursos",
      "/libros": "Libros",
      "/materias": "Materias",
      "/perfilesUsuario": "Administrar  Usuarios",
      "/prestamos": "Préstamos Alumnos",
      "/prestamosProfesores": "Préstamos Profesores",
      "/reservasEstancias": "Reservas de Aulas",
      "/llavesPrestadas": "Llaves Prestadas",
      "/llavesPlantaBaja": "Llaves Planta Baja",
      "/llavesPlantaPrimera": "Llaves Planta Primera",
      "/llavesPlantaSegunda": "Llaves Planta Segunda",
      "/permisos": "Permisos",
      "/asuntos": "Asuntos Propios",
      "/extraescolares": "Actividades Extraescolares",
      "/estancias": "Estancias",
      "/perfiles": "Perfiles de Usuario",
      "/periodos-horarios": "Periodos Horarios",
      "/horarios": "Horarios de Profesores",
      "/cuadrante-guardias": "Horario de Guardias",
    };

    const titulo = pathToTitleMap[location.pathname];
    if (titulo) {
      setTituloActivo(titulo);
    }
  }, [location.pathname, setTituloActivo]);

  return (
    <SidebarProvider>
      <Sidebar
        onOpenRestricciones={() => setOpenRestricciones(true)}
        onOpenEtiquetas={() => setOpenEtiquetas(true)}
        onOpenLlavesRestricciones={() => setOpenLlavesRestricciones(true)}
        onOpenImportarHorariosUNTIS={() => setOpenImportarHorariosUNTIS(true)}
      />

      <SidebarInset>
        <Header setTabActivo={setTabActivo} />
        {!openEtiquetas && <Outlet context={{ tabActivo, setTabActivo }} />}
        <DialogoAsuntosRestricciones
          open={openRestricciones}
          onOpenChange={setOpenRestricciones}
        />

        <DialogoLlavesRestricciones
          open={openLlavesRestricciones}
          onOpenChange={setOpenLlavesRestricciones}
        />

        <DialogoEtiquetasGenericas
          open={openEtiquetas}
          onOpenChange={setOpenEtiquetas}
        />
        <DialogoImportarHorariosUNTIS
          open={openImportarHorariosUNTIS}
          onOpenChange={setOpenImportarHorariosUNTIS}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
