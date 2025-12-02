import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function DialogoEditarPeriodo({
  open,
  onClose,
  periodoSeleccionado,
  onSuccess,
}) {
  const [nombre, setNombre] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  
  // CORRECCIÓN: Se reemplaza import.meta.env por una URL estática/placeholder
  // En tu entorno real de desarrollo, deberías usar tu variable de entorno VITE_API_URL
  const API_URL = "/api"; 

  useEffect(() => {
    if (periodoSeleccionado) {
      setNombre(periodoSeleccionado.nombre || "");
      // Ajustar formato de hora si viene con segundos (HH:MM:SS -> HH:MM) para el input type="time"
      const horaInicio = periodoSeleccionado.inicio ? periodoSeleccionado.inicio.substring(0, 5) : "";
      const horaFin = periodoSeleccionado.fin ? periodoSeleccionado.fin.substring(0, 5) : "";
      
      setInicio(horaInicio);
      setFin(horaFin);
    }
  }, [periodoSeleccionado]);

  const handleEditar = async () => {
    if (!periodoSeleccionado) return;
    if (!nombre || !inicio || !fin) {
        toast.error("Todos los campos son obligatorios");
        return;
    }

    try {
      const res = await fetch(
        `${API_URL}/db/periodos-horarios/${periodoSeleccionado.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ nombre, inicio, fin }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Error al modificar periodo");

      toast.success("Periodo modificado correctamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al modificar periodo");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="p-0 overflow-hidden rounded-lg sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center">
            Editar Periodo Horario
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 px-6">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nombre-edit" className="text-right">Nombre</Label>
            <Input
              id="nombre-edit"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inicio-edit" className="text-right">Inicio</Label>
            <Input
              id="inicio-edit"
              type="time"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fin-edit" className="text-right">Fin</Label>
            <Input
              id="fin-edit"
              type="time"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button onClick={handleEditar}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}