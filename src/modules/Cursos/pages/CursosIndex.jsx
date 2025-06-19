import { useEffect, useState } from "react";
import { columns } from "../components/columns";
import { TablaCursos } from "../components/TablaCursos";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Printer, Tag, Users } from "lucide-react";

export function CursosIndex() {
  const [data, setData] = useState([]);
  const [cursosFiltrados, setCursosFiltrados] = useState([]);
  const [abrirDialogoEtiquetas, setAbrirDialogoEtiquetas] = useState(false);
  const [abrirDialogoListadoCurso, setAbrirDialogoListadoCurso] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/db/cursos", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Datos LDAP:", data);
        setData(data);
        setCursosFiltrados(data); // al principio, sin filtros
      })
      .catch((error) => {
        console.error("❌ Error al cargar Cursos:", error);
      });
  }, []);

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {/* Tabla */}
      <TablaCursos
        columns={columns}
        data={data}
        onFilteredChange={(rows) => setCursosFiltrados(rows)}
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
                Cursos por grupo
              </DropdownMenuItem>              
              {/* Aquí puedes añadir más opciones */}
              {/* <DropdownMenuItem>Otro documento</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

    </div>
  );
}
