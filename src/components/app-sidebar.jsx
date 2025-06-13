import * as React from "react";
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

export function AppSidebar(props) {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("Usuario");

  // Obtener info del usuario desde backend (opcional)
  React.useEffect(() => {
    fetch("http://localhost:5000/api/check-auth", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          setUsername(data.username);
        }
      })
      .catch(() => {
        setUsername("Usuario");
      });
  }, []);

  const handleClick = () => {
    fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      navigate("/login");
    });
  };

  const navMain = [
    {
      title: "Usuarios",
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
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        { title: "Genesis", url: "#" },
        { title: "Explorer", url: "#" },
        { title: "Quantum", url: "#" },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Introduction", url: "#" },
        { title: "Get Started", url: "#" },
        { title: "Tutorials", url: "#" },
        { title: "Changelog", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
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
            <Power className="cursor-pointer" color="red" onClick={handleClick} />
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
