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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { getCursoActual } from "@/utils/fechasHoras";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { DialogoSeleccionarFechaParte } from "../components/DialogoSeleccionarFechaParte";
import { DialogoInsertarAusenciaManual } from "../components/DialogoInsertarAusenciaManual";
import { DialogoEditarAusenciaManual } from "../components/DialogoEditarAusenciaManual";
import { DialogoEliminarAusencia } from "../components/DialogoEliminarAusencia";
import { generarParteDiarioAusencias } from "@/Informes/horarios";
import { format } from "date-fns";
import { toast } from "sonner";
import { eachDayOfInterval } from "date-fns";

export function AusenciasIndex() {
  const [abrirDialogoFecha, setAbrirDialogoFecha] = useState(false);
  const [abrirInsertar, setAbrirInsertar] = useState(false);
  const [ausenciaSeleccionada, setAusenciaSeleccionada] = useState(null);
  const [abrirEliminar, setAbrirEliminar] = useState(false);
  const [abrirEditar, setAbrirEditar] = useState(false);

  // Usamos refetch para actualizar la tabla tras insertar
  const { data: ausencias, isLoading, error, refetch } = useAusencias();
  const { data: periodos = [] } = usePeriodosHorarios();

  const handleEditar = (sel) => {
    if (!sel) return;
    setAusenciaSeleccionada(sel);
    setAbrirEditar(true);
  };

  const handleEliminar = (sel) => {
    setAusenciaSeleccionada(sel);
    // setAbrirEliminar(true); // Cuando tengas el de eliminar listo
    alert(`Eliminando: ${sel.id}`);
  };

  const handleConfirmarGenerarPdf = async (fechaInicio, fechaFin) => {
    // 1. Generamos el array de todos los días incluidos en el rango
    const diasAProcesar = eachDayOfInterval({
      start: fechaInicio,
      end: fechaFin,
    });

    let generadosExitosos = 0;
    let diasSinAusencias = 0;

    // 2. Iteramos sobre cada día del rango
    for (const fechaSeleccionada of diasAProcesar) {
      const diaSemana = fechaSeleccionada.getDay();

      // Omitimos sábados (6) y domingos (0)
      if (diaSemana === 0 || diaSemana === 6) continue;

      const curso = getCursoActual(fechaSeleccionada).label;
      const fechaFormateada = format(fechaSeleccionada, "yyyy-MM-dd");

      // 3. Filtramos las ausencias que caen en este día específico
      const ausenciasDia = (ausencias || []).filter((a) => {
        return (
          fechaFormateada >= a.fecha_inicio &&
          fechaFormateada <= (a.fecha_fin || a.fecha_inicio)
        );
      });

      // Si no hay ausencias este día, pasamos al siguiente
      if (ausenciasDia.length === 0) {
        diasSinAusencias++;
        continue;
      }

      // 4. Obtenemos UIDs únicos para la consulta al horario
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

        // 5. Construimos los datos del informe para este día
        const datosInforme = periodos.map((p) => {
          const filasFiltradas = ausenciasDia
            .map((a) => {
              // Validación de rango horario (periodos)
              if (a.idperiodo_inicio && a.idperiodo_fin) {
                if (p.id < a.idperiodo_inicio || p.id > a.idperiodo_fin) {
                  return null;
                }
              }

              // Cruce con horario (Lectivas o Guardias)
              const h = horarios.find(
                (slot) =>
                  slot.uid === a.uid_profesor &&
                  String(slot.idperiodo) === String(p.id) &&
                  (slot.tipo === "lectiva" || slot.tipo === "guardia")
              );

              if (!h) return null;

              return {
                profesor: a.nombreProfesor,
                asignatura: h.materia_nombre || h.materia || "---",
                curso: h.grupo || "---",
                observaciones: a.observaciones || a.tipo_ausencia || "",
                tipo: h.tipo,
                estancia: h.estancia,
              };
            })
            .filter((fila) => fila !== null);

          return { horaLabel: p.nombre, filas: filasFiltradas };
        });

        // 6. Llamamos a la generación del PDF para este día concreto
        // Solo generamos si hay al menos una fila con datos en los periodos
        const tieneContenido = datosInforme.some((d) => d.filas.length > 0);

        if (tieneContenido) {
          await generarParteDiarioAusencias(datosInforme, fechaSeleccionada);
          generadosExitosos++;
        }
      } catch (err) {
        console.error(`Error procesando el día ${fechaFormateada}:`, err);
        toast.error(`Error al procesar el día ${fechaFormateada}`);
      }
    }

    // 7. Feedback final al usuario
    if (generadosExitosos > 0) {
      toast.success(
        `Proceso finalizado. ${generadosExitosos} partes de ausencias generados.`
      );
    } else if (diasSinAusencias > 0) {
      toast.info(
        "No se encontraron ausencias registradas para los días seleccionados."
      );
    }
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-10 border rounded-lg bg-red-50">
          ❌ Error: {error.message}
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
                  <CalendarOff className="mr-2 h-4 w-4" /> Parte de Ausencias
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          acciones={(seleccionado) => {
            // Comprobamos si es manual para habilitar/deshabilitar acciones
            const esManual =
              seleccionado &&
              !seleccionado.idpermiso &&
              !seleccionado.idextraescolar;
            return (
              <div className="flex gap-2 mt-2">
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
                    <TooltipContent className="bg-orange-600 text-white">
                      <p>Registrar ausencia imprevista</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* BOTÓN EDITAR (Solo si es manual) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditar(seleccionado)}
                        disabled={!esManual} // <--- Bloqueamos si es automática
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className={
                        esManual
                          ? "bg-blue-500 text-white"
                          : "bg-gray-400 text-white"
                      }
                    >
                      <p>
                        {esManual
                          ? "Editar registro manual"
                          : "No editable: Proviene de un Permiso/Extraescolar"}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  {/* BOTÓN ELIMINAR (solo si es manual) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setAusenciaSeleccionada(seleccionado);
                          setAbrirEliminar(true);
                        }}
                        disabled={!esManual}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className={esManual ? "bg-red-500" : "bg-gray-400"}
                    >
                      <p>
                        {esManual
                          ? "Eliminar registro"
                          : "No se puede eliminar: Vinculada a Permiso"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          }}
        />
      )}

      {/* Diálogo para Generar PDF */}
      <DialogoSeleccionarFechaParte
        open={abrirDialogoFecha}
        onOpenChange={setAbrirDialogoFecha}
        onConfirmar={handleConfirmarGenerarPdf}
      />

      {/* Diálogo para Insertar Ausencia Manual */}
      <DialogoInsertarAusenciaManual
        open={abrirInsertar}
        onClose={() => setAbrirInsertar(false)}
        fecha={new Date()} // Por defecto hoy, ya que es "última hora"
        periodos_horarios={periodos}
        onSuccess={refetch} // Asegúrate de llamar a refetch en el onSuccess de la mutación del diálogo
      />

      <DialogoEliminarAusencia
        open={abrirEliminar}
        onOpenChange={setAbrirEliminar}
        ausencia={ausenciaSeleccionada}
        onDeleteSuccess={refetch}
      />

      <DialogoEditarAusenciaManual
        open={abrirEditar}
        onClose={() => {
          setAbrirEditar(false);
          setAusenciaSeleccionada(null); // Limpiamos al cerrar
        }}
        ausencia={ausenciaSeleccionada}
        periodos_horarios={periodos}
      />
    </div>
  );
}
