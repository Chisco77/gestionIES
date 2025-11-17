/**
 * NavMain.jsx - Componente de navegación principal lateral
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
 * Componente que renderiza la navegación principal del sidebar.
 * - Agrupa items y subitems del menú lateral.
 * - Utiliza Collapsible para desplegar submenús.
 * - Integra tooltips, iconos y rutas con react-router-dom.
 *
 * Props:
 * - items: Array de objetos que representan los items del menú principal,
 *   con propiedades:
 *     - title: string, título del item
 *     - icon: componente opcional para icono
 *     - isActive: boolean, si el item inicia abierto
 *     - items: array de subitems con propiedades title, url y opcional onClick
 *
 * Dependencias:
 * - lucide-react
 * - @/components/ui/collapsible
 * - @/components/ui/sidebar
 * - react-router-dom
 *
 * Notas:
 * - Al hacer click en subitem con onClick se previene el comportamiento por defecto
 * - Rotación de icono ChevronRight al abrir/cerrar Collapsible
 */

/*"use client";

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { Link } from "react-router-dom";

export function NavMain({ items }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>IES Francisco de Orellana</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {item.items?.length > 0 ? (
              <Collapsible defaultOpen={item.isActive}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          {subItem.onClick ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                subItem.onClick();
                              }}
                              className="w-full text-left"
                            >
                              {subItem.title}
                            </button>
                          ) : (
                            <Link to={subItem.url}>{subItem.title}</Link>
                          )}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ) : item.url ? (
              <Link to={item.url}>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            ) : (
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
*/

"use client";

import { ChevronRight } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({ items }) {
  const location = useLocation(); // 🔹 detecta la ruta actual

  return (
    <SidebarGroup>
      <SidebarGroupLabel>IES Francisco de Orellana</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // 🔹 Determinar si el item principal o algún subitem está activo
          const isItemActive =
            item.url === location.pathname ||
            item.items?.some((sub) => sub.url === location.pathname);

          return (
            <SidebarMenuItem key={item.title}>
              {item.items?.length > 0 ? (
                <Collapsible defaultOpen={isItemActive}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={
                        isItemActive ? "bg-blue-100 text-blue-600" : ""
                      }
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubActive = subItem.url === location.pathname;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              {subItem.onClick ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    subItem.onClick();
                                  }}
                                  className={`w-full text-left ${
                                    isSubActive
                                      ? "bg-blue-100 text-blue-600 font-semibold"
                                      : ""
                                  }`}
                                >
                                  {subItem.title}
                                </button>
                              ) : (
                                <Link
                                  to={subItem.url}
                                  className={`block w-full ${
                                    isSubActive
                                      ? "bg-blue-100 text-blue-600 font-semibold"
                                      : ""
                                  }`}
                                >
                                  {subItem.title}
                                </Link>
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : item.url ? (
                <Link to={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={
                      item.url === location.pathname
                        ? "bg-blue-100 text-blue-600"
                        : ""
                    }
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              ) : (
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
