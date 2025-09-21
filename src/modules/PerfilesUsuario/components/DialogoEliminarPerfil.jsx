import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DialogoEliminarPerfil({ open, onClose, perfilSeleccionado, onSuccess }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const handleEliminar = async () => {
    if (!perfilSeleccionado) return;

    try {
      const res = await fetch(`${API_URL}/db/perfiles/${perfilSeleccionado.uid}`, {
        method: "DELETE",
        credentials: "include",
      });

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
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>¿Eliminar perfil?</DialogTitle>
        </DialogHeader>
        <p className="text-sm">Esta acción no se puede deshacer.</p>
        <DialogFooter>
          <Button variant="destructive" onClick={handleEliminar}>
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
