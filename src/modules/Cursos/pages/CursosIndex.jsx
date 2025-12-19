/**
 * CursosIndex.jsx - Página de gestión de cursos
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
 * Página principal de administración de cursos.
 * - Muestra una tabla interactiva de cursos (TablaCursos).
 * - Permite insertar, editar y eliminar cursos mediante diálogos.
 * - Integra filtros, selección de fila única y paginación.
 * - Mantiene el estado de cursos filtrados y curso seleccionado.
 *
 * Estado interno:
 * - data: array con todos los cursos cargados desde la API.
 * - cursosFiltrados: array con los cursos filtrados visibles en la tabla.
 * - abrirDialogoInsertar: boolean para mostrar/ocultar diálogo de inserción.
 * - abrirDialogoEditar: boolean para mostrar/ocultar diálogo de edición.
 * - abrirDialogoEliminar: boolean para mostrar/ocultar diálogo de eliminación.
 * - cursoSeleccionado: objeto con el curso actualmente seleccionado.
 *
 * Funcionalidad:
 * - fetchCursos(): obtiene los cursos desde la API y actualiza el estado.
 * - onInsertarSuccess, onEditarSuccess, onEliminarSuccess: recargan la lista tras cambios.
 * - handleEditar / handleEliminar: muestran el diálogo correspondiente solo si hay un curso seleccionado.
 * - Pasa los datos y callbacks a TablaCursos, incluyendo las acciones sobre la fila seleccionada.
 *
 * Dependencias:
 * - React (useState, useEffect)
 * - @tanstack/react-table (indirectamente a través de TablaCursos)
 * - @/components/ui/button
 * - lucide-react
 * - ../components/TablaCursos
 * - ../components/DialogoInsertarCurso
 * - ../components/DialogoEditarCurso
 * - ../components/DialogoEliminarCurso
 *
 * Notas:
 * - Solo se permite seleccionar una fila a la vez en la tabla.
 * - Los botones de acción (Insertar, Editar, Eliminar) se habilitan según la fila seleccionada.
 * - Los diálogos se abren de forma controlada mediante el estado correspondiente.
 */

import { useEffect, useState } from "react";
import { columns } from "../components/columns";
import { TablaCursos } from "../components/TablaCursos";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DialogoInsertarCurso } from "../components/DialogoInsertarCurso";
import { DialogoEditarCurso } from "../components/DialogoEditarCurso";
import { DialogoEliminarCurso } from "../components/DialogoEliminarCurso";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CursosIndex() {
  const [data, setData] = useState([]);
  const [cursosFiltrados, setCursosFiltrados] = useState([]);
  const [abrirDialogoInsertar, setAbrirDialogoInsertar] = useState(false);
  const [abrirDialogoEditar, setAbrirDialogoEditar] = useState(false);
  const [abrirDialogoEliminar, setAbrirDialogoEliminar] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Función para cargar cursos
  const fetchCursos = async () => {
    try {
      const response = await fetch(`${API_URL}/db/cursos`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al obtener cursos");
      const data = await response.json();
      setData(data);
      setCursosFiltrados(data);
    } catch (error) {
      console.error("❌ Error al cargar Cursos:", error);
      setData([]);
      setCursosFiltrados([]);
    }
  };

  const onEditarSuccess = async () => {
    await fetchCursos();
    setAbrirDialogoEditar(false);
    setCursoSeleccionado(null);
  };

  const onEliminarSuccess = async () => {
    await fetchCursos();
    setAbrirDialogoEliminar(false);
    setCursoSeleccionado(null);
  };

  const onInsertarSuccess = async () => {
    await fetchCursos();
    setAbrirDialogoInsertar(false);
    setCursoSeleccionado(null);
  };

  // Carga inicial
  useEffect(() => {
    fetchCursos();
  }, []);

  const handleEditar = (curso) => {
    if (!curso) {
      alert("Selecciona un curso para editar.");
      return;
    }
    setCursoSeleccionado(curso);
    setAbrirDialogoEditar(true);
  };

  const handleEliminar = (curso) => {
    if (!curso) {
      alert("Selecciona un curso para eliminar.");
      return;
    }
    setCursoSeleccionado(curso);
    setAbrirDialogoEliminar(true);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaCursos
        columns={columns}
        data={data}
        onFilteredChange={(rows) => setCursosFiltrados(rows)}
        acciones={(seleccionado) => (
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAbrirDialogoInsertar(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-500 text-white">
                  <p>Nuevo curso</p>
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
                  <p>Editar curso</p>
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
                  <p>Eliminar curso</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      />
      <DialogoEditarCurso
        open={abrirDialogoEditar}
        onClose={() => setAbrirDialogoEditar(false)}
        cursoSeleccionado={cursoSeleccionado}
        onSuccess={onEditarSuccess}
      />

      <DialogoEliminarCurso
        open={abrirDialogoEliminar}
        onClose={() => setAbrirDialogoEliminar(false)}
        cursoSeleccionado={cursoSeleccionado}
        onSuccess={onEliminarSuccess}
      />

      <DialogoInsertarCurso
        open={abrirDialogoInsertar}
        onClose={() => setAbrirDialogoInsertar(false)}
        cursoSeleccionado={cursoSeleccionado}
        onSuccess={onInsertarSuccess}
      />
    </div>
  );
}
