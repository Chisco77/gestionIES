import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useSidebarContext } from "@/context/SidebarContext";

export default function Header() {
  const { tituloActivo } = useSidebarContext();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-3">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <h1 className="text-xl font-semibold">{tituloActivo}</h1>
    </header>
  );
}
