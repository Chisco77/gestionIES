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
