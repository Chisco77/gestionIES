/**
 * DialogoEliminarMateria.jsx - Diálogo de confirmación para eliminar una materia
 *
 * Autor: Francisco Damian Mendez Palma
 * Fecha: 2026
 *
 * Descripción:
 * Confirma y elimina la materia seleccionada de la base de datos.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DialogoEliminarMateria({
  open,
  onClose,
  materiaSeleccionada,
  onSuccess,
}) {
  if (!materiaSeleccionada) return null;
  const API_URL = import.meta.env.VITE_API_URL;

  const handleEliminar = async () => {
    try {
      const res = await fetch(
        `${API_URL}/db/materias/${materiaSeleccionada.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        let errorMsg = "Error al eliminar materia";
        try {
          const data = await res.json();
          if (data?.message) errorMsg = data.message;
        } catch {}
        throw new Error(errorMsg);
      }

      toast.success("Materia eliminada");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al eliminar materia");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-red-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Eliminar Materia
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700 mb-4 space-y-2 px-6 pt-4">
          <div>
            <span className="font-medium">Materia:</span>{" "}
            {materiaSeleccionada.nombre}
          </div>
          <div className="text-red-600 font-semibold mt-2">
            Esta acción no se puede deshacer.
          </div>
        </div>
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleEliminar}
          >
            Eliminar
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
