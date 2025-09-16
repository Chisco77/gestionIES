/**
 * Page.jsx - Layout principal de la aplicación
 *
 * Descripción:
 * Esta página define el layout principal de la app:
 * - Sidebar lateral (AppSidebar)
 * - Header superior con trigger del sidebar y Breadcrumb
 * - Contenedor principal para el contenido
 *
 * Estructura:
 * - SidebarProvider
 *   - AppSidebar
 *   - SidebarInset
 *     - Header (trigger + separator + breadcrumb)
 *     - Contenido principal (grid + bloque principal)
 *
 * Dependencias:
 * - @/components/app-sidebar
 * - @/components/ui/breadcrumb
 * - @/components/ui/separator
 * - @/components/ui/sidebar
 *
 * Notas:
 * - Los bloques del contenido son placeholders (bg-muted/50)
 * - Breadcrumb oculto en móviles para ahorrar espacio
 * - SidebarTrigger permite colapsar/expandir el sidebar
 */


// Importamos el sidebar principal de la aplicación
import { AppSidebar } from "@/components/app-sidebar"

// Componentes de Breadcrumb del diseño de la UI
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Componente separador vertical/horizontal
import { Separator } from "@/components/ui/separator"

// Componentes para manejar el sidebar (proveedor y trigger)
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Componente principal de la página
export default function Page() {
  return (
    // SidebarProvider envuelve toda la página para manejar el estado del sidebar
    <SidebarProvider>

      {/* Sidebar lateral de la app */}
      <AppSidebar />

      {/* Contenedor principal del contenido, ajustado para dejar espacio al sidebar */}
      <SidebarInset>

        {/* Header superior con trigger del sidebar, separador y breadcrumb */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">

            {/* Botón que permite colapsar o expandir el sidebar */}
            <SidebarTrigger className="-ml-1" />

            {/* Línea separadora vertical entre trigger y breadcrumb */}
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />

            {/* Breadcrumb (migas de pan) para mostrar navegación */}
            <Breadcrumb>
              <BreadcrumbList>

                {/* Primer elemento del breadcrumb (oculto en pantallas pequeñas) */}
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {/* Separador entre elementos del breadcrumb */}
                <BreadcrumbSeparator className="hidden md:block" />

                {/* Elemento actual de la página */}
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>

              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Contenedor principal del contenido de la página */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

          {/* Primera sección: grid con 3 bloques visuales (placeholder) */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>

          {/* Segunda sección: bloque principal del contenido (placeholder) */}
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
