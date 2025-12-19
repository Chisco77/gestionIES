/**
 * LibrosIndex.jsx - Página de gestión de libros
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
 * Página principal de administración de libros.
 * - Muestra una tabla interactiva de libros (TablaLibros) con filtros por curso y texto.
 * - Permite insertar, editar y eliminar libros mediante diálogos controlados.
 * - Integra selección de fila única, paginación y acciones adicionales (informes).
 * - Enriquecer los libros con el nombre del curso correspondiente.
 *
 * Estado interno:
 * - libros: array con todos los libros cargados desde la API.
 * - librosFiltrados: array con los libros actualmente filtrados y visibles en la tabla.
 * - cursos: array con los cursos disponibles para filtrado y selección.
 * - libroSeleccionado: objeto con el libro actualmente seleccionado.
 * - abrirInsertar / abrirEditar / abrirEliminar: booleanos para controlar la visibilidad de los diálogos.
 *
 * Funcionalidad:
 * - fetchCursos(): obtiene los cursos desde la API, ordenados alfabéticamente.
 * - fetchLibros(): obtiene los libros desde la API y les añade el nombre del curso correspondiente.
 * - onSuccess(): callback que recarga los datos y cierra los diálogos tras insertar, editar o eliminar un libro.
 * - handleEditar / handleEliminar: abren los diálogos de edición o eliminación solo si hay un libro seleccionado.
 * - Pasa los datos, filtros y callbacks a TablaLibros, incluyendo las acciones sobre la fila seleccionada.
 *
 * Props de TablaLibros:
 * - columns: definiciones de columnas.
 * - data: array de libros.
 * - cursos: array de cursos.
 * - onFilteredChange: callback que recibe los libros filtrados.
 * - informes: elementos adicionales para la zona de filtros (ej. botones de PDF o listados).
 * - acciones: función que recibe el libro seleccionado y devuelve los botones de acción.
 *
 * Dependencias:
 * - React (useState, useEffect)
 * - @tanstack/react-table (a través de TablaLibros)
 * - @/components/ui/button
 * - lucide-react (iconos)
 * - @/components/ui/dropdown-menu
 * - ../components/TablaLibros
 * - ../components/DialogoInsertarLibro
 * - ../components/DialogoEditarLibro
 * - ../components/DialogoEliminarLibro
 *
 * Notas:
 * - Solo se permite seleccionar una fila a la vez en la tabla.
 * - Los botones de acción (Insertar, Editar, Eliminar) se habilitan según el libro seleccionado.
 * - Los diálogos se abren de forma controlada mediante el estado correspondiente.
 */

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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAbrirInsertar(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-500 text-white">
                  <p>Nuevo Libro</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditar(seleccionado)}
                    disabled={!seleccionado}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-500 text-white">
                  <p>Editar Libro</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEliminar(seleccionado)}
                    disabled={!seleccionado}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-500 text-white">
                  <p>Eliminar Libro</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
