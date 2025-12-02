import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DialogoEliminarPeriodo({
  open,
  onClose,
  periodoSeleccionado,
  onSuccess,
}) {
  // CORRECCIÓN: Se reemplaza import.meta.env por una URL estática/placeholder
  // En tu entorno real de desarrollo, deberías usar tu variable de entorno VITE_API_URL
  const API_URL = "/api";

  const handleEliminar = async () => {
    if (!periodoSeleccionado) return;

    try {
      const res = await fetch(
        `${API_URL}/db/periodos-horarios/${periodoSeleccionado.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al eliminar periodo");
      }

      toast.success("Periodo eliminado");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al eliminar periodo");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="p-0 overflow-hidden rounded-lg sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-red-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center">
            Eliminar Periodo
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700 mb-4 space-y-2 px-6 pt-6">
          <p>
            ¿Estás seguro de que deseas eliminar el periodo{" "}
            <span className="font-bold">{periodoSeleccionado?.nombre}</span>?
          </p>
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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}