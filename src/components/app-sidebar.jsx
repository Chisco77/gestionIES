import * as React from "react";
import { GalleryVerticalEnd, Power, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Datos de navegación
const data = {
  navMain: [
    {
      title: "Menú",
      url: "/",
      items: [
        {
          title: "Becarios",
          url: "/becarios",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  const navigate = useNavigate();

  // Leer y decodificar el token
  const token = localStorage.getItem("token");
  let username = "";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.name || decoded.username || "Usuario";
    } catch (err) {
      console.error("Token inválido:", err);
      username = "Usuario";
    }
  }

  // logout
  const handleClick = () => {
    localStorage.removeItem("token");
    const url = "http://localhost:5000/api/logout";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      //body: JSON.stringify("usuario"),
      credentials: "include",
    });
    navigate("/login");
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Gestión de Becarios</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.url} className="font-medium">
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                          <Link to={subItem.url}>{subItem.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
  <SidebarMenu className="border-t p-4">
    <div className="flex items-center justify-between w-full">
      {/* Logout simple sin tooltip */}
      <Power
        className="cursor-pointer"
        color="red"
        onClick={handleClick}
      />

      {/* Usuario */}
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
