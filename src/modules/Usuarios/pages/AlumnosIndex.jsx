// Con react query. Usa hook useAlumnosLdap.jsx
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
