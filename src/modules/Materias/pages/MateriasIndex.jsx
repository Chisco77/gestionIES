/**
 * MateriasIndex.jsx - Página de gestión de materias
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * ------------------------------------------------------------
 *
 * Descripción:
 * Página principal de administración de materias.
 * - Muestra una tabla interactiva de materias (TablaMaterias).
 * - Permite insertar, editar y eliminar materias mediante diálogos.
 * - Integración de filtros, selección de fila única y paginación.
 */

import { useEffect, useState } from "react";
import { columns } from "../components/columns";
import { TablaMaterias } from "../components/TablaMaterias";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DialogoInsertarMateria } from "../components/DialogoInsertarMateria";
import { DialogoEditarMateria } from "../components/DialogoEditarMateria";
import { DialogoEliminarMateria } from "../components/DialogoEliminarMateria";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MateriasIndex() {
  const [data, setData] = useState([]);
  const [materiasFiltradas, setMateriasFiltradas] = useState([]);
  const [abrirDialogoInsertar, setAbrirDialogoInsertar] = useState(false);
  const [abrirDialogoEditar, setAbrirDialogoEditar] = useState(false);
  const [abrirDialogoEliminar, setAbrirDialogoEliminar] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Cargar materias
  const fetchMaterias = async () => {
    try {
      const res = await fetch(`${API_URL}/db/materias`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener materias");
      const data = await res.json();
      setData(data);
      setMateriasFiltradas(data);
    } catch (err) {
      console.error("❌ Error al cargar materias:", err);
      setData([]);
      setMateriasFiltradas([]);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const onInsertarSuccess = async () => {
    await fetchMaterias();
    setAbrirDialogoInsertar(false);
    setMateriaSeleccionada(null);
  };

  const onEditarSuccess = async () => {
    await fetchMaterias();
    setAbrirDialogoEditar(false);
    setMateriaSeleccionada(null);
  };

  const onEliminarSuccess = async () => {
    await fetchMaterias();
    setAbrirDialogoEliminar(false);
    setMateriaSeleccionada(null);
  };

  const handleEditar = (materia) => {
    if (!materia) {
      alert("Selecciona una materia para editar.");
      return;
    }
    setMateriaSeleccionada(materia);
    setAbrirDialogoEditar(true);
  };

  const handleEliminar = (materia) => {
    if (!materia) {
      alert("Selecciona una materia para eliminar.");
      return;
    }
    setMateriaSeleccionada(materia);
    setAbrirDialogoEliminar(true);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaMaterias
        columns={columns}
        data={data}
        onFilteredChange={setMateriasFiltradas}
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
                  <p>Nueva materia</p>
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
                  <p>Editar materia</p>
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
                  <p>Eliminar materia</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      />

      <DialogoInsertarMateria
        open={abrirDialogoInsertar}
        onClose={() => setAbrirDialogoInsertar(false)}
        onSuccess={onInsertarSuccess}
      />
      <DialogoEditarMateria
        open={abrirDialogoEditar}
        onClose={() => setAbrirDialogoEditar(false)}
        materiaSeleccionada={materiaSeleccionada}
        onSuccess={onEditarSuccess}
      />
      <DialogoEliminarMateria
        open={abrirDialogoEliminar}
        onClose={() => setAbrirDialogoEliminar(false)}
        materiaSeleccionada={materiaSeleccionada}
        onSuccess={onEliminarSuccess}
      />
    </div>
  );
}
