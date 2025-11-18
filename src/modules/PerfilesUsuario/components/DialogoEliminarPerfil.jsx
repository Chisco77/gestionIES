import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DialogoEliminarPerfil({
  open,
  onClose,
  perfilSeleccionado,
  onSuccess,
}) {
  const API_URL = import.meta.env.VITE_API_URL;

  const handleEliminar = async () => {
    if (!perfilSeleccionado) return;

    try {
      const res = await fetch(
        `${API_URL}/db/perfiles/${perfilSeleccionado.uid}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        let errorMsg = "Error al eliminar perfil";
        try {
          const data = await res.json();
          if (data?.message) errorMsg = data.message;
        } catch {}
        throw new Error(errorMsg);
      }

      toast.success("Perfil eliminado");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al eliminar perfil");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="p-0 overflow-hidden rounded-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-red-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Eliminar Perfil de usuario
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700 mb-4 space-y-2 px-6 pt-4">
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
