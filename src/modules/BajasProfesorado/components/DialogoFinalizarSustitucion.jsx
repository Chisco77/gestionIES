import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export function DialogoFinalizarSustitucion({
  open,
  onOpenChange,
  sustitucion,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [cargando, setCargando] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Resetear la fecha al día de hoy cada vez que se abre el diálogo
  useEffect(() => {
    if (open) {
      setFechaFin(new Date().toISOString().split("T")[0]);
    }
  }, [open]);

  const handleFinalizar = async () => {
    if (!fechaFin) return toast.error("La fecha de fin es obligatoria");

    setCargando(true);
    try {
      // 1. Registrar la fecha de fin en la tabla de sustituciones
      const resSust = await fetch(
        `${API_URL}/db/sustituciones/${sustitucion.id}/finalizar`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fecha_fin: fechaFin }),
        }
      );

      if (!resSust.ok) throw new Error("No se pudo actualizar la sustitución");

      // 2. Invalidar cachés para que la UI se actualice
      await queryClient.invalidateQueries({ queryKey: ["sustituciones"] });
      await queryClient.invalidateQueries({
        queryKey: ["horario-profesorado"],
      });

      toast.success(
        "Sustitución finalizada. El horario del sustituto ha sido liberado."
      );

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error en el proceso de finalización");
    } finally {
      setCargando(false);
    }
  };

  if (!sustitucion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg border-none"
      >
        <DialogHeader className="bg-amber-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar Sustitución
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-6 p-6">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg space-y-2 text-sm">
            <p className="text-amber-900 font-medium italic">
              Se registrará el retorno del titular:
            </p>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <span className="font-semibold">Titular:</span>
              <span>{sustitucion.nombreTitular}</span>
              <span className="font-semibold">Sustituto:</span>
              <span>{sustitucion.nombreSustituto}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="fecha_fin" className="text-base font-semibold">
              ¿Cuál es el último día de la sustitución?
            </Label>
            <Input
              id="fecha_fin"
              type="date"
              className="h-11 text-lg"
              value={fechaFin}
              min={sustitucion.fecha_inicio}
              onChange={(e) => setFechaFin(e.target.value)}
            />
            <p className="text-xs text-muted-foreground bg-slate-100 p-2 rounded">
              💡 <strong>Nota:</strong> Al confirmar, el sistema limpiará el
              horario del sustituto para el curso {sustitucion.curso_academico}.
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <DialogClose asChild>
            <Button variant="ghost" className="font-semibold">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleFinalizar}
            disabled={cargando}
            className="bg-amber-600 hover:bg-amber-700 px-6 font-bold"
          >
            {cargando ? "Procesando..." : "Finalizar Sustitución"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
