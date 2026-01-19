/**
 * DialogoEliminarAutorizacion.jsx
 * Diálogo de confirmación para eliminar una autorización especial
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

export function DialogoEliminarAutorizacion({
  open,
  onOpenChange,
  autorizacion,
  nombreProfesor,
  onDeleteSuccess,
}) {
  if (!autorizacion) return null;

  const API_URL = import.meta.env.VITE_API_URL;

  const fechaStr = new Date(autorizacion.fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleEliminar = async () => {
    try {
      const res = await fetch(
        `${API_URL}/db/asuntos-permitidos/${autorizacion.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Error al eliminar la autorización");

      toast.success("Autorización eliminada correctamente");
      onDeleteSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo eliminar la autorización");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-red-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center">
            Eliminar autorización
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 space-y-2 text-sm text-gray-700">
          <div>
            <span className="font-medium">Profesor:</span> {nombreProfesor}
          </div>

          <div>
            <span className="font-medium">Fecha:</span> {fechaStr}
          </div>

          <div className="text-red-600 font-semibold mt-3">
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
