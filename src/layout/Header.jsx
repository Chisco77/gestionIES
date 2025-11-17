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
import { RelojPeriodo } from "@/modules/Utilidades/components/RelojPeriodo";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export default function Header() {
  const { tituloActivo } = useSidebarContext();
  const [periodosDB, setPeriodosDB] = useState([]);

  useEffect(() => {
    const fetchTodosPeriodos = async () => {
      try {
        const res = await fetch(`${API_BASE}/periodos-horarios`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error al obtener periodos");

        const data = await res.json();
        const periodosData =
          data.periodos?.map((p) => ({ ...p, id: parseInt(p.id) })) || [];

        setPeriodosDB(periodosData);
      } catch (err) {
        console.error("[DEBUG] Error carga periodos:", err);
        setPeriodosDB([]);
      }
    };

    fetchTodosPeriodos();
  }, []);

  return (
    <header className="relative flex h-[60px] items-center gap-4 border-b px-4">
      {/* IZQUIERDA: menu + título */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-lg font-semibold">{tituloActivo}</h1>
      </div>

      {/* CENTRO: reloj */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <RelojPeriodo periodos={periodosDB} />
      </div>
    </header>
  );
}
