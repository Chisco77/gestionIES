import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export function DialogoEliminarAusencia({ open, onOpenChange, ausencia, onDeleteSuccess }) {
  if (!ausencia) return null;

  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/db/ausencias/${ausencia.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar la ausencia");
      return true;
    },
    onSuccess: () => {
      toast.success("Ausencia eliminada correctamente");
      onDeleteSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="p-0 overflow-hidden rounded-lg">
        <DialogHeader className="bg-red-600 text-white py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center">
            Eliminar Registro de Ausencia
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-700 space-y-3 px-6 pt-4 pb-2">
          <p>¿Estás seguro de que deseas eliminar la siguiente ausencia manual?</p>
          
          <div className="bg-gray-50 p-3 rounded border">
            <div><span className="font-bold">Profesor:</span> {ausencia.nombreProfesor}</div>
            <div><span className="font-bold">Fecha:</span> {new Date(ausencia.fecha_inicio).toLocaleDateString("es-ES")}</div>
            <div><span className="font-bold">Motivo:</span> {ausencia.descripcion || ausencia.tipo_ausencia}</div>
          </div>

          <div className="text-red-600 text-xs font-bold uppercase tracking-wider">
            ⚠️ Atención: Esta acción es irreversible.
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => mutation.mutate()}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Eliminando..." : "Confirmar Eliminación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}