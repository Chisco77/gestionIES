/**
 * Header.jsx - Componente de cabecera de la aplicación
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
 * Componente que renderiza la cabecera principal de la aplicación.
 * - Muestra el título activo de la sección seleccionada en la barra lateral,
 *   obtenido desde el contexto `SidebarContext`.
 * - Incluye un botón (`SidebarTrigger`) para abrir/cerrar la barra lateral.
 * - Añade un separador visual entre el botón y el título.
 *
 * Estructura:
 *   <header>
 *     [Botón menú lateral] | [Título de la sección activa]
 *   </header>
 *
 * Dependencias:
 * - @/components/ui/sidebar
 * - @/components/ui/separator
 * - @/context/SidebarContext
 *
 * Notas:
 * - La altura está fijada en h-16 con borde inferior.
 * - Se emplea flexbox con gap para distribuir los elementos horizontalmente.
 */


import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useSidebarContext } from "@/context/SidebarContext";

export default function Header() {
  const { tituloActivo } = useSidebarContext();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-3">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-2" />
      <h1 className="text-m font-semibold">{tituloActivo}</h1>
    </header>
  );
}
