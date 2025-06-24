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
import { toast } from "sonner";

export function DialogoInsertarLibro({ open, onClose, cursos, onSuccess }) {
  const [libro, setLibro] = useState("");
  const [idcurso, setIdcurso] = useState("");

  const handleGuardar = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/db/libros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ libro, idcurso }),
      });

      if (!res.ok) throw new Error("Error al insertar");

      toast.success("Libro insertado correctamente");
      setLibro("");
      setIdcurso("");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Error al insertar libro");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Insertar libro</DialogTitle>
        </DialogHeader>
        <select
          value={idcurso}
          onChange={(e) => setIdcurso(e.target.value)}
          className="border p-2 rounded w-full text-sm"
        >
          <option value="">Seleccionar curso</option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.curso}
            </option>
          ))}
        </select>
        <Input
          placeholder="Nombre del libro"
          value={libro}
          onChange={(e) => setLibro(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
