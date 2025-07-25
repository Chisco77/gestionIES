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


export function DialogoInsertarCurso({ open, onClose, onSuccess }) {
  const [curso, setCurso] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const handleGuardar = async () => {
    try {
       const res = await fetch(
        `${API_URL}/db/cursos`, {
      //const res = await fetch(`/api/db/cursos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ curso }),
      });

      if (!res.ok) throw new Error("Error al insertar");

      toast.success("Curso insertado correctamente");
      setCurso("");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Error al insertar curso");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Insertar curso</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Nombre del curso"
          value={curso}
          onChange={(e) => setCurso(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
