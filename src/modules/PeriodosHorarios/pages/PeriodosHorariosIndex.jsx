import { useEffect, useState } from "react";
import { TablaPeriodosHorarios } from "../components/TablaPeriodosHorarios";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DialogoInsertarPeriodo } from "../components/DialogoInsertarPeriodo";
import { DialogoEditarPeriodo } from "../components/DialogoEditarPeriodo";
import { DialogoEliminarPeriodo } from "../components/DialogoEliminarPeriodo";
import { columnsPeriodos } from "../components/columnsPeriodos"; // columnas para periodos
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PeriodosHorariosIndex() {
  const [periodos, setPeriodos] = useState([]);
  const [periodosFiltrados, setPeriodosFiltrados] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [abrirInsertar, setAbrirInsertar] = useState(false);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirEliminar, setAbrirEliminar] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Obtener todos los periodos
  const fetchPeriodos = async () => {
    try {
      const res = await fetch(`${API_URL}/db/periodos-horarios`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.ok) {
        setPeriodos(data.periodos);
      } else {
        console.error("Error en respuesta:", data.error);
        setPeriodos([]);
      }
    } catch (error) {
      console.error("❌ Error al obtener periodos:", error);
      setPeriodos([]);
    }
  };

  useEffect(() => {
    fetchPeriodos();
  }, []);

  const handleEditar = (periodo) => {
    if (!periodo) {
      alert("Selecciona un periodo para editar.");
      return;
    }
    setPeriodoSeleccionado(periodo);
    setAbrirEditar(true);
  };

  const handleEliminar = (periodo) => {
    if (!periodo) {
      alert("Selecciona un periodo para eliminar.");
      return;
    }
    setPeriodoSeleccionado(periodo);
    setAbrirEliminar(true);
  };

  const onSuccess = () => {
    fetchPeriodos();
    setAbrirInsertar(false);
    setAbrirEditar(false);
    setAbrirEliminar(false);
    setPeriodoSeleccionado(null);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaPeriodosHorarios
        columns={columnsPeriodos}
        data={periodos}
        onFilteredChange={(filtrados) => setPeriodosFiltrados(filtrados)}
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
                  <p>Añadir nuevo periodo</p>
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
                  <p>Editar periodo seleccionado</p>
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
                  <p>Eliminar periodo seleccionado</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      />

      <DialogoInsertarPeriodo
        open={abrirInsertar}
        onClose={() => setAbrirInsertar(false)}
        onSuccess={onSuccess}
      />

      <DialogoEditarPeriodo
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        periodoSeleccionado={periodoSeleccionado}
        onSuccess={onSuccess}
      />

      <DialogoEliminarPeriodo
        open={abrirEliminar}
        onClose={() => setAbrirEliminar(false)}
        periodoSeleccionado={periodoSeleccionado}
        onSuccess={onSuccess}
      />
    </div>
  );
}
