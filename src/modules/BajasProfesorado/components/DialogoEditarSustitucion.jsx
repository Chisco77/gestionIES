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
import { Pencil } from "lucide-react";

export function DialogoEditarSustitucion({
  open,
  onOpenChange,
  sustitucion,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const [fechaInicio, setFechaInicio] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (open && sustitucion) {
      setFechaInicio(sustitucion.fecha_inicio);
      setObservaciones(sustitucion.observaciones || "");
    }
  }, [open, sustitucion]);

  const handleGuardar = async () => {
    try {
      setCargando(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/db/sustituciones/${sustitucion.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fecha_inicio: fechaInicio, // Enviamos los datos que permite el diálogo
            observaciones: observaciones,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al actualizar");
      }

      // 2. ÉXITO: Invalidamos la caché para refrescar la tabla automáticamente
      await queryClient.invalidateQueries({ queryKey: ["sustituciones"] });

      toast.success("Sustitución actualizada correctamente");

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Error en PATCH:", err);
      toast.error(err.message || "No se pudo editar el registro");
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
        <DialogHeader className="bg-green-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar Sustitución
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-6 p-6">
          <div className="space-y-4 py-4">
            <div className="bg-slate-100 p-3 rounded-md text-sm">
              <p>
                <strong>Titular:</strong> {sustitucion.nombreTitular}
              </p>
              <p>
                <strong>Sustituto:</strong> {sustitucion.nombreSustituto}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Fecha de Inicio</Label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Input
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleGuardar} disabled={cargando}>
            {cargando ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
