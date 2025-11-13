import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DialogoEliminarRango({
  open,
  onOpenChange,
  rango,
  onDeleteSuccess,
}) {
  if (!rango) return null;

  const API_URL = import.meta.env.VITE_API_URL;

  // Formateo de fechas
  const inicioStr = new Date(rango.inicio).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const finStr = new Date(rango.fin).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleEliminar = async () => {
    try {
      const res = await fetch(`${API_URL}/db/restricciones/asuntos/rangos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inicio: rango.inicio, fin: rango.fin }),
      });
      if (!res.ok) throw new Error("Error al eliminar el rango bloqueado");

      toast.success("Rango eliminado correctamente");
      onDeleteSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo eliminar el rango bloqueado");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-red-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Eliminar Rango Bloqueado
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-700 mb-4 space-y-2 px-6 pt-4">
          <div>
            <span className="font-medium">Inicio:</span> {inicioStr}
          </div>
          <div>
            <span className="font-medium">Fin:</span> {finStr}
          </div>

          {rango.motivo && (
            <div>
              <span className="font-medium">Motivo:</span> {rango.motivo}
            </div>
          )}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
