/**
 * DialogoEditarTareas.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Componente de diálogo para la gestión de tareas/instrucciones
 *     asociadas a una ausencia.
 * 
 * Permite añadir o editar las indicaciones para el profesorado
 * de guardia, actualizando la información en el backend.
 *
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, Info, User } from "lucide-react"; // Añadido User
import { toast } from "sonner";
import { format, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function DialogoEditarTareas({ open, onClose, ausencia, onSuccess }) {
  const [tareas, setTareas] = useState("");
  const [enviando, setEnviando] = useState(false);

  console.log ("Ausencia: ", ausencia);

  useEffect(() => {
    if (open) {
      setTareas(ausencia?.observaciones_guardia || "");
    }
  }, [ausencia, open]);

  const getTextoFechas = () => {
    if (!ausencia?.fecha_inicio) return "";

    const inicio = parseISO(ausencia.fecha_inicio);

    if (
      !ausencia.fecha_fin ||
      isSameDay(inicio, parseISO(ausencia.fecha_fin))
    ) {
      return format(inicio, "PPP", { locale: es });
    }

    const fin = parseISO(ausencia.fecha_fin);

    if (inicio.getMonth() !== fin.getMonth()) {
      return `Del ${format(inicio, "d 'de' MMM", { locale: es })} al ${format(fin, "d 'de' MMM 'de' yyyy", { locale: es })}`;
    }

    return `Del ${format(inicio, "d", { locale: es })} al ${format(fin, "d 'de' MMMM 'de' yyyy", { locale: es })}`;
  };

  const getTextoPeriodos = () => {
    if (!ausencia) return "";
    if (!ausencia.idperiodo_inicio && !ausencia.idperiodo_fin) {
      return "Día Completo";
    }
    const inicio =
      ausencia.periodo_inicio?.nombre || `${ausencia.idperiodo_inicio}ª H`;
    const fin = ausencia.periodo_fin?.nombre || `${ausencia.idperiodo_fin}ª H`;

    return inicio === fin ? inicio : `${inicio} a ${fin}`;
  };

  const handleGuardar = async () => {
    if (!ausencia?.id) return;
    setEnviando(true);
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const res = await fetch(`${API_URL}/db/ausencias/${ausencia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ observaciones_guardia: tareas }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      toast.success("Instrucciones guardadas correctamente");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const esRangoLargo =
    ausencia?.fecha_fin &&
    !isSameDay(parseISO(ausencia.fecha_inicio), parseISO(ausencia.fecha_fin));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[550px] border-t-4 border-t-blue-500"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-4">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Tareas para la Guardia
            </DialogTitle>
          </div>

          {ausencia && (
            <div className="space-y-3">
              {/* --- NOMBRE DEL PROFESOR --- */}
              <div className="flex items-center gap-2 text-slate-900 bg-slate-100/50 p-2 rounded-lg border border-slate-200/60">
                <div className="bg-white p-1.5 rounded-full shadow-sm">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                <span className="font-bold text-sm">
                  Profesor/a:{" "}
                  <span className="text-blue-700">
                    {ausencia.nombreProfesor || ausencia.uid_profesor}
                  </span>
                </span>
              </div>

              {/* Fila: Fecha y Periodos */}
              <div className="flex flex-wrap gap-2 items-center">
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1.5 py-1 px-2.5 font-medium transition-colors ${
                    esRangoLargo
                      ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <Calendar
                    className={`w-3.5 h-3.5 ${esRangoLargo ? "text-amber-500" : "text-blue-500"}`}
                  />
                  {getTextoFechas()}
                </Badge>

                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 py-1 px-2.5 bg-slate-50 border-slate-200 text-slate-700 font-medium"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {getTextoPeriodos()}
                </Badge>

                <Badge className="bg-blue-100 text-blue-700 border-none capitalize">
                  {ausencia.tipo_ausencia}
                </Badge>
              </div>

              {/* Motivo de la ausencia */}
              {ausencia.descripcion && (
                <div className="flex items-start gap-2 p-2.5 bg-amber-50/50 border border-amber-100 rounded-md">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-amber-800 font-medium leading-tight">
                    Motivo:{" "}
                    <span className="font-normal">{ausencia.descripcion}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="py-2 space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">
              ¿Qué deben hacer los alumnos?
            </label>
            <p className="text-[12px] text-muted-foreground">
              Esta información será visible para los compañeros que cubran la
              guardia.
            </p>
          </div>

          <Textarea
            value={tareas}
            onChange={(e) => setTareas(e.target.value)}
            placeholder="Ej: Realizar los ejercicios de la página 42 del libro de texto..."
            className="min-h-[200px] text-sm focus-visible:ring-blue-500 border-slate-200 shadow-inner bg-white/50"
          />
        </div>

        <DialogFooter className="pt-2 border-t mt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={enviando}
            className="text-slate-500"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={enviando}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-sm"
          >
            {enviando ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
