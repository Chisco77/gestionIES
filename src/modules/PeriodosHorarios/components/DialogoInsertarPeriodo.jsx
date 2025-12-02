import { useState } from "react";
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

export function DialogoInsertarPeriodo({ open, onClose, onSuccess }) {
  const [nombre, setNombre] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  
  const API_URL = import.meta.env.VITE_API_URL;

  const handleGuardar = async () => {
    if (!nombre || !inicio || !fin) {
      toast.error("Todos los campos (Nombre, Inicio, Fin) son obligatorios");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/periodos-horarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nombre, inicio, fin }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Error al insertar periodo");

      toast.success("Periodo creado correctamente");
      
      // Resetear campos
      setNombre("");
      setInicio("");
      setFin("");
      
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al insertar periodo");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="p-0 overflow-hidden rounded-lg sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center">
            Añadir Nuevo Periodo
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 px-6">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nombre" className="text-right">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: 1ª Hora"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inicio" className="text-right">Inicio</Label>
            <Input
              id="inicio"
              type="time"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fin" className="text-right">Fin</Label>
            <Input
              id="fin"
              type="time"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={handleGuardar}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}