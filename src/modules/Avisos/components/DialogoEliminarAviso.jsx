import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/db`
  : "/db";

export function DialogoEliminarAviso({ open, onClose, avisoSeleccionado }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/avisos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar aviso");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Aviso eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["avisos"] });
      onClose();
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Error al eliminar aviso");
    },
  });

  const handleEliminar = () => {
    if (!avisoSeleccionado) return;
    mutation.mutate(avisoSeleccionado.id);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Aviso</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          ¿Seguro que deseas eliminar el aviso del módulo{" "}
          <strong>{avisoSeleccionado?.modulo}</strong>?
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            variant="destructive"
            onClick={handleEliminar}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
