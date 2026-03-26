import { useState } from "react";
import { columnsAusencias } from "../components/columns-ausencias";
import { TablaAusencias } from "../components/TablaAusencias";
import { useAusencias } from "@/hooks/useAusencias";
import {
  Loader,
  Plus,
  Pencil,
  Trash2,
  CalendarOff,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { getCursoActual } from "@/utils/fechasHoras";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { DialogoSeleccionarFechaParte } from "../components/DialogoSeleccionarFechaParte";
import { generarParteDiarioAusencias } from "@/Informes/horarios";
import { format } from "date-fns";
import { toast } from "sonner";

export function AusenciasIndex() {
  const [abrirDialogoFecha, setAbrirDialogoFecha] = useState(false);

  const { data: ausencias, isLoading, error } = useAusencias();
  const { data: periodos } = usePeriodosHorarios();

  const handleInsertar = () => alert("Nueva ausencia: No implementado");
  const handleEditar = (sel) => alert(`Editando ID: ${sel.id}`);
  const handleEliminar = (sel) => alert(`Eliminando ID: ${sel.id}`);

  const handleConfirmarGenerarPdf = async (fechaSeleccionada) => {
    const curso = getCursoActual(fechaSeleccionada).label;
    const diaSemana = fechaSeleccionada.getDay();

    // 1. Filtramos ausencias de esa fecha (comparación inclusiva según tu nueva lógica SQL)
    const fechaFormateada = format(fechaSeleccionada, "yyyy-MM-dd");
    const ausenciasDia = (ausencias || []).filter((a) => {
      // Si tienes fecha_inicio y fecha_fin en el objeto 'a'
      return (
        fechaFormateada >= a.fecha_inicio &&
        fechaFormateada <= (a.fecha_fin || a.fecha_inicio)
      );
    });

    if (ausenciasDia.length === 0) {
      toast.info("No hay ausencias registradas para la fecha seleccionada.");
      return;
    }

    const uids = [...new Set(ausenciasDia.map((a) => a.uid_profesor))];

    try {
      const params = new URLSearchParams();
      uids.forEach((id) => params.append("uid", id));
      params.append("curso_academico", curso);
      params.append("dia_semana", diaSemana);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/db/horario-profesorado/enriquecido?${params.toString()}`,
        { credentials: "include" }
      );

      const data = await res.json();
      const horarios = data.horario || [];

      // 2. Construcción de los datos cruzando Ausencia + Horario Lectivo
      const datosInforme = periodos.map((p) => {
        // Filtramos las ausencias que ocurren en este periodo horario 'p'
        const filasFiltradas = ausenciasDia
          .map((a) => {
            // Buscamos si el profesor tiene clase LECTIVA en este periodo 'p'
            const h = horarios.find(
              (slot) =>
                slot.uid === a.uid_profesor &&
                String(slot.idperiodo) === String(p.id) &&
                slot.tipo === "lectiva" // <-- FILTRO CRÍTICO: Solo horas lectivas
            );

            // Si el profesor no tiene clase lectiva en esta hora, devolvemos null
            if (!h) return null;

            // Si tiene clase lectiva, devolvemos los datos para la fila
            return {
              profesor: a.nombreProfesor,
              asignatura: h.materia_nombre || h.materia || "---",
              curso: h.grupo || "---",
              observaciones: a.observaciones || "",
            };
          })
          .filter((fila) => fila !== null); // Eliminamos los huecos donde el profe no tiene clase

        return {
          horaLabel: p.nombre,
          filas: filasFiltradas,
        };
      });

      await generarParteDiarioAusencias(datosInforme, fechaSeleccionada);
      toast.success("Parte de ausencias generado con éxito");
    } catch (err) {
      console.error(err);
      toast.error("Error al obtener datos del horario");
    }
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarOff className="text-primary" /> Gestión de Ausencias
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-10 border rounded-lg bg-red-50">
          ❌ Error al cargar datos: {error.message}
        </div>
      ) : (
        <TablaAusencias
          columns={columnsAusencias}
          data={ausencias || []}
          informes={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Printer className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setAbrirDialogoFecha(true)}>
                  <CalendarOff className="mr-2 h-4 w-4" />
                  Parte de Ausencias
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          acciones={(seleccionado) => (
            <>
              <Button variant="outline" size="icon" onClick={handleInsertar}>
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
        />
      )}

      {/* DIÁLOGO FUERA DEL MENÚ */}
      <DialogoSeleccionarFechaParte
        open={abrirDialogoFecha}
        onOpenChange={setAbrirDialogoFecha}
        onConfirmar={handleConfirmarGenerarPdf}
      />
    </div>
  );
}
