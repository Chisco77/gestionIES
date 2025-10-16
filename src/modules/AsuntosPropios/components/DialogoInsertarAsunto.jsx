import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function DialogoInsertarAsunto({ open, onClose, fecha, onSuccess, uid }) {
  const [descripcion, setDescripcion] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const handleGuardar = async () => {
    if (!descripcion) {
      toast.error("Introduce una descripción");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/asuntos-propios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          uid,
          descripcion,
          fecha,
        }),
      });

      if (!res.ok) throw new Error("Error al insertar asunto propio");

      toast.success("Asunto propio insertado correctamente");
      setDescripcion("");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Error al insertar asunto propio");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Nuevo Asunto Propio ({new Date(fecha).toLocaleDateString("es-ES")})</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
