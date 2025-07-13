/*
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DialogoEtiquetasGenericas } from "@/modules/Utilidades/components/DialogoEtiquetasGenericas";
import { useSidebarContext } from "@/context/SidebarContext";

export default function Layout(props) {
  const [openEtiquetas, setOpenEtiquetas] = useState(false);
  const location = useLocation();
  const { setTituloActivo, tituloActivo } = useSidebarContext(); // ⬅️ también accedemos al título

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
      <AppSidebar {...props} onOpenEtiquetas={() => setOpenEtiquetas(true)} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-xl font-semibold">{tituloActivo}</h1>
        </header>

        {!openEtiquetas && <Outlet />}

        <DialogoEtiquetasGenericas
          open={openEtiquetas}
          onOpenChange={setOpenEtiquetas}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
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
