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
// Updated Header.jsx with ShadCN tooltip for logout icon
// (only the relevant part modified)

import React, { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useSidebarContext } from "@/context/SidebarContext";
import { RelojPeriodo } from "@/modules/Utilidades/components/RelojPeriodo";
import { useAuth } from "@/context/AuthContext";
import { Power, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import DialogoEditarUsuario from "@/modules/Usuarios/components/DialogoEditarUsuario";


const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export default function Header() {
  const { tituloActivo } = useSidebarContext();
  const [periodosDB, setPeriodosDB] = useState([]);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [abrirPerfil, setAbrirPerfil] = useState(false);
  const [empleadoPerfil, setEmpleadoPerfil] = useState(null);

  const handleClickLogout = () => {
    fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      setUser(null);
      navigate("/login");
    });
  };

  useEffect(() => {
    if (!abrirPerfil || !user?.username) return;

    fetch(`${API_URL}/db/empleados/${user.username}`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setEmpleadoPerfil(data))
      .catch(() => setEmpleadoPerfil(null));
  }, [abrirPerfil, user]);

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
    <header className="relative flex h-[60px] items-center px-4 bg-blue-500 text-white">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-white" />
        <Separator orientation="vertical" className="h-5 border-white/50" />
        <h1 className="text-lg font-semibold">{tituloActivo}</h1>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <RelojPeriodo periodos={periodosDB} />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {user?.givenName} {user?.sn} ({user?.username})
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <User
                  className="h-5 w-5 text-white cursor-pointer"
                  onClick={() => setAbrirPerfil(true)}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-blue-500 text-white">
                Editar perfil
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Tooltip en el icono de logout */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Power
                className="cursor-pointer"
                color="white"
                onClick={handleClickLogout}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-blue-500 text-white">
              Cerrar sesión
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <DialogoEditarUsuario
        open={abrirPerfil}
        onClose={() => setAbrirPerfil(false)}
        usuarioSeleccionado={
          user
            ? {
                ...user,
                uid: user.username,
              }
            : null
        }
        empleadoSeleccionado={empleadoPerfil}
        esAlumno={false}
        modo="perfil"
      />
    </header>
  );
}
