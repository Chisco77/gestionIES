import { useEffect, useState } from "react";
import { columns } from "../components/columns";
import { TablaLibros } from "../components/TablaLibros";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Printer, Tag, Users } from "lucide-react";
import { DialogoInsertarLibro } from "../components/DialogoInsertarLibro";
import { DialogoEditarLibro } from "../components/DialogoEditarLibro";
import { DialogoEliminarLibro } from "../components/DialogoEliminarLibro";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function LibrosIndex() {
  const [librosFiltrados, setLibrosFiltrados] = useState([]);
  const [libros, setLibros] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [abrirInsertar, setAbrirInsertar] = useState(false);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirEliminar, setAbrirEliminar] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  
  const fetchLibros = async () => {
    try {
      const res = await fetch(`${API_URL}/db/libros`, {
        credentials: "include",
      });
      const data = await res.json();

      // Enriquecer los libros con el nombre del curso
      const librosConCurso = data.map((libro) => {
        const curso = cursos.find((c) => c.id === libro.idcurso);
        return {
          ...libro,
          curso: curso ? curso.curso : "Curso desconocido", // añade campo curso
        };
      });

      setLibros(librosConCurso);
    } catch (error) {
      console.error("❌ Error al obtener libros:", error);
      setLibros([]);
    }
  };

  // obtengo los cursos ya ordenados
  const fetchCursos = async () => {
    try {
      const res = await fetch(`${API_URL}/db/cursos`, {
        credentials: "include",
      });
      const data = await res.json();

      // Ordenar alfabéticamente por nombre del curso
      const cursosOrdenados = data.sort((a, b) =>
        a.curso.localeCompare(b.curso)
      );
      setCursos(cursosOrdenados);
    } catch (error) {
      console.error("❌ Error al obtener cursos:", error);
      setCursos([]);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  useEffect(() => {
    if (cursos.length > 0) {
      fetchLibros();
    }
  }, [cursos]);

  const handleEditar = (libro) => {
    if (!libro) {
      alert("Selecciona un libro para editar.");
      return;
    }
    setLibroSeleccionado(libro);
    setAbrirEditar(true);
  };

  const handleEliminar = (libro) => {
    if (!libro) {
      alert("Selecciona un libro para eliminar.");
      return;
    }
    setLibroSeleccionado(libro);
    setAbrirEliminar(true);
  };

  const onSuccess = () => {
    fetchLibros();
    setAbrirInsertar(false);
    setAbrirEditar(false);
    setAbrirEliminar(false);
    setLibroSeleccionado(null);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaLibros
        columns={columns}
        data={libros}
        cursos={cursos} //
        onFilteredChange={(filtrados) => setLibrosFiltrados(filtrados)}
        acciones={(seleccionado) => (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAbrirInsertar(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEditar(seleccionado)}
              disabled={!seleccionado}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEliminar(seleccionado)}
              disabled={!seleccionado}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
        informes={
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
              <DropdownMenuItem
                onClick={() => setAbrirDialogoListadoCurso(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                Alumnos por grupo
              </DropdownMenuItem>
              {/* Aquí puedes añadir más opciones */}
              {/* <DropdownMenuItem>Otro documento</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <DialogoInsertarLibro
        open={abrirInsertar}
        onClose={() => setAbrirInsertar(false)}
        cursos={cursos}
        onSuccess={onSuccess}
      />

      <DialogoEditarLibro
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        libroSeleccionado={libroSeleccionado}
        cursos={cursos}
        onSuccess={onSuccess}
      />

      <DialogoEliminarLibro
        open={abrirEliminar}
        onClose={() => setAbrirEliminar(false)}
        libroSeleccionado={libroSeleccionado}
        onSuccess={onSuccess}
      />
    </div>
  );
}
