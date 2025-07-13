import * as React from "react";
import { DialogoEtiquetasGenericas } from "@/modules/Utilidades/components/DialogoEtiquetasGenericas";

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  Power,
  User,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
} from "@/components/ui/sidebar";

import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export function AppSidebar({ onOpenEtiquetas, ...props }) {
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

  const handleClick = () => {
    fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      navigate("/login");
    });
  };

  const navMain = [
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
      isActive: true,
      items: [
        { title: "Red Troncal", url: "/alumnos" },
        { title: "Profesores", url: "/profesores" },
        { title: "Todos", url: "/todos" },
      ],
    },
    {
      title: "Préstamo Libros",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Préstamos", url: "/prestamos" },
        { title: "Libros", url: "/libros" },
        { title: "Cursos", url: "/cursos" },
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
          onClick: () => setOpenEtiquetas(true), // ✅ abre el diálogo
        },
      ],
    },
  ];

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
              onClick={handleClick}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{username}</span>
              <User className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <DialogoEtiquetasGenericas
        open={openEtiquetas}
        onOpenChange={setOpenEtiquetas}
      />
    </Sidebar>
  );
}
