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

export default function Layout(props) {
  const [openEtiquetas, setOpenEtiquetas] = useState(false);
  const location = useLocation();
  const { setTituloActivo } = useSidebarContext();

  const handleOpenEtiquetas = useCallback(() => {
    setOpenEtiquetas(true);
  }, []);

  useEffect(() => {
    const pathToTitleMap = {
      "/": "Dashboard",
      "/alumnos": "Alumnos",
      "/profesores": "Profesores",
      "/todos": "Todos",
      "/cursos": "Cursos",
      "/libros": "Libros",
      "/prestamos": "Préstamos",
    };

    const titulo = pathToTitleMap[location.pathname];
    if (titulo) {
      setTituloActivo(titulo);
    }
  }, [location.pathname, setTituloActivo]);

  return (
    <SidebarProvider>
      <Sidebar {...props} onOpenEtiquetas={handleOpenEtiquetas} />
      <SidebarInset>
        <Header />
        {!openEtiquetas && <Outlet />}
        <DialogoEtiquetasGenericas
          open={openEtiquetas}
          onOpenChange={setOpenEtiquetas}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
