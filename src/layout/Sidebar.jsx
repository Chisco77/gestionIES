import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Power, User, BookOpen, SquareTerminal, Settings2 } from "lucide-react";
import { NavMain } from "@/components/nav-main";

const API_URL = import.meta.env.VITE_API_URL;

function SidebarComponent({ onOpenEtiquetas, ...props }) {
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

  const handleClickLogout = () => {
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
          onClick: () => setOpenEtiquetas(true),
        },
      ],
    },
  ];

  // Cuando el diálogo interno cambia el estado, notificamos al padre si existe onOpenEtiquetas
  React.useEffect(() => {
    if (openEtiquetas && onOpenEtiquetas) {
      onOpenEtiquetas();
      setOpenEtiquetas(false); // reseteamos para evitar loops
    }
  }, [openEtiquetas, onOpenEtiquetas]);

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
              onClick={handleClickLogout}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{username}</span>
              <User className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default React.memo(SidebarComponent);
