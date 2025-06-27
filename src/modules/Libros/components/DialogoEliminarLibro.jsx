import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


export function DialogoEliminarLibro({
  open,
  onClose,
  libroSeleccionado,
  onSuccess,
}) {
  const handleEliminar = async () => {
    try {
      const res = await fetch(
        `/api/db/libros/${libroSeleccionado.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Error al eliminar");

      toast.success("Libro eliminado");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Error al eliminar libro");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>¿Eliminar libro?</DialogTitle>
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
