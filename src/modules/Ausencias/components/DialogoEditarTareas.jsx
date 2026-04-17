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
import { Calendar, Clock, BookOpen, Info } from "lucide-react";
import { toast } from "sonner";
import { format, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function DialogoEditarTareas({ open, onClose, ausencia, onSuccess }) {
  const [tareas, setTareas] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      setTareas(ausencia?.observaciones_guardia || "");
    }
  }, [ausencia, open]);

  /**
   * Genera el texto de la fecha manejando rangos
   */
  const getTextoFechas = () => {
    if (!ausencia?.fecha_inicio) return "";

    const inicio = parseISO(ausencia.fecha_inicio);

    // Si no hay fecha_fin o son el mismo día
    if (
      !ausencia.fecha_fin ||
      isSameDay(inicio, parseISO(ausencia.fecha_fin))
    ) {
      return format(inicio, "PPP", { locale: es });
    }

    const fin = parseISO(ausencia.fecha_fin);

    // Si los meses son distintos: "Del 28 de may. al 2 de jun. de 2026"
    if (inicio.getMonth() !== fin.getMonth()) {
      return `Del ${format(inicio, "d 'de' MMM", { locale: es })} al ${format(fin, "d 'de' MMM 'de' yyyy", { locale: es })}`;
    }

    // Si es el mismo mes: "Del 12 al 19 de abril de 2026"
    return `Del ${format(inicio, "d", { locale: es })} al ${format(fin, "d 'de' MMMM 'de' yyyy", { locale: es })}`;
  };

  /**
   * Genera el texto de las horas/periodos
   */
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

  // Verificamos si es una ausencia de varios días para el estilo visual
  const esRangoLargo =
    ausencia?.fecha_fin &&
    !isSameDay(parseISO(ausencia.fecha_inicio), parseISO(ausencia.fecha_fin));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[550px] border-t-4 border-t-indigo-600"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Tareas para la Guardia
          </DialogTitle>

          {ausencia && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                {/* Badge de Fecha con estilo condicional si es un rango largo */}
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1.5 py-1 px-2.5 font-medium transition-colors ${
                    esRangoLargo
                      ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <Calendar
                    className={`w-3.5 h-3.5 ${esRangoLargo ? "text-amber-500" : "text-indigo-500"}`}
                  />
                  {getTextoFechas()}
                </Badge>

                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 py-1 px-2.5 bg-slate-50 border-slate-200 text-slate-700 font-medium"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {getTextoPeriodos()}
                </Badge>

                <Badge className="bg-indigo-100 text-indigo-700 border-none capitalize">
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
              Esta información la verá el profesorado de guardia{" "}
              {esRangoLargo
                ? "durante todos los días de tu ausencia."
                : "en el panel de guardias."}
            </p>
          </div>

          <Textarea
            value={tareas}
            onChange={(e) => setTareas(e.target.value)}
            placeholder="Ej: Abrir el Aula Virtual, realizar el cuestionario de la Unidad 3..."
            className="min-h-[200px] text-sm focus-visible:ring-indigo-500 border-slate-200 shadow-inner bg-white/50"
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-sm"
          >
            {enviando ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
