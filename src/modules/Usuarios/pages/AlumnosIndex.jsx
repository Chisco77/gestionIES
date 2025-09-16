/**
 * AlumnosIndex.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Componente principal para visualizar y gestionar alumnos desde LDAP.
 *
 * Funcionalidades:
 * - Obtiene alumnos mediante el hook `useAlumnosLdap` (React Query)
 * - Muestra los alumnos en `TablaUsuarios` con:
 *     • Filtrado por grupo, apellidos y usuario
 *     • Ordenación y paginación
 *     • Ofuscación de datos sensibles
 * - Permite generar un listado PDF de alumnos por curso a través de:
 *     - `DialogoListadoCurso`
 * - Sincroniza los alumnos filtrados para su uso en el diálogo de listado
 *
 * Estados principales:
 * - abrirDialogoListadoCurso: control de apertura del diálogo de listado por curso
 * - alumnosFiltrados: alumnos visibles tras filtrado en la tabla
 *
 * Dependencias:
 * - TablaUsuarios: tabla con filtros, ordenación y paginación
 * - DialogoListadoCurso: generación de PDF con listado de alumnos por curso
 * - Componentes UI: Button, DropdownMenu
 * - Iconos: lucide-react
 * - Hook: useAlumnosLdap
 *
 */


import { useState } from "react";
import { columns } from "../components/colums";
import { TablaUsuarios } from "../components/TablaUsuarios";
import { DialogoListadoCurso } from "../components/DialogoListadoCurso";
import { Loader, Printer, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAlumnosLdap } from "@/hooks/useAlumnosLdap";

export function AlumnosIndex() {
  const [abrirDialogoListadoCurso, setAbrirDialogoListadoCurso] = useState(false);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);

  const { data: alumnos, isLoading, error } = useAlumnosLdap();

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">
          ❌ Error al cargar alumnos: {error.message}
        </div>
      ) : (
        <TablaUsuarios
          columns={columns}
          data={alumnos}
          onFilteredChange={(rows) => setAlumnosFiltrados(rows)}
          acciones={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Printer className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setAbrirDialogoListadoCurso(true)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Alumnos por grupo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      )}

      <DialogoListadoCurso
        alumnos={alumnosFiltrados}
        open={abrirDialogoListadoCurso}
        onOpenChange={setAbrirDialogoListadoCurso}
      />
    </div>
  );
}
