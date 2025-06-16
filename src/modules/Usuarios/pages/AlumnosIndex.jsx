import { useEffect, useState } from "react";
import { columns } from "../components/colums";
import { TablaUsuarios } from "../components/TablaUsuarios";
import { DialogoEtiquetas } from "../components/DialogoEtiquetas";
import { DialogoListadoCurso } from "../components/DialogoListadoCurso";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Printer, Tag, Users } from "lucide-react";

export function AlumnosIndex() {
  const [data, setData] = useState([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
  const [abrirDialogoEtiquetas, setAbrirDialogoEtiquetas] = useState(false);
  const [abrirDialogoListadoCurso, setAbrirDialogoListadoCurso] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/ldap/alumnos?tipo=students", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Datos LDAP:", data);
        setData(data);
        setAlumnosFiltrados(data); // al principio, sin filtros
      })
      .catch((error) => {
        console.error("❌ Error al cargar alumnos:", error);
      });
  }, []);

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {/* Tabla */}
      <TablaUsuarios
        columns={columns}
        data={data}
        onFilteredChange={(rows) => setAlumnosFiltrados(rows)}
        acciones={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Printer className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setAbrirDialogoEtiquetas(true)}>
                <Tag className="mr-2 h-4 w-4" />
                Etiquetas libros
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAbrirDialogoListadoCurso(true)}>
                <Users className="mr-2 h-4 w-4" />
                Alumnos por grupo
              </DropdownMenuItem>              
              {/* Aquí puedes añadir más opciones */}
              {/* <DropdownMenuItem>Otro documento</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Diálogo para generar etiquetas */}
      <DialogoEtiquetas
        alumnos={alumnosFiltrados}
        open={abrirDialogoEtiquetas}
        onOpenChange={setAbrirDialogoEtiquetas}
      />

      <DialogoListadoCurso
        alumnos={alumnosFiltrados}
        open={abrirDialogoListadoCurso}
        onOpenChange={setAbrirDialogoListadoCurso}
      />      
    </div>
  );
}
