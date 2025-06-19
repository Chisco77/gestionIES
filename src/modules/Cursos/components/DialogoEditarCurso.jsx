import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DialogoEditarCurso({
  open,
  onClose,
  cursoSeleccionado,
  onSuccess,
}) {
  const [curso, setCurso] = useState("");

  // 👇 Este efecto actualiza el input cuando cambia el curso seleccionado
  useEffect(() => {
    if (cursoSeleccionado) {
      setCurso(cursoSeleccionado.curso || "");
    }
  }, [cursoSeleccionado]);

  const handleEditar = async () => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/db/cursos/${cursoSeleccionado.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ curso }),
      }
    );

    if (!res.ok) throw new Error("Error al modificar");

    toast.success("Curso modificado");
    await onSuccess?.(); // Esperamos recargar
    onClose();           // Y luego cerramos
  } catch (err) {
    toast.error("Error al modificar curso");
    console.error(err);
  }
};

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Editar curso</DialogTitle>
        </DialogHeader>
        <Input value={curso} onChange={(e) => setCurso(e.target.value)} />
        <DialogFooter>
          <Button onClick={handleEditar}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
