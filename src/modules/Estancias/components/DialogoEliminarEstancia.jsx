/**
 * DialogoEliminarEstancia.jsx
 * Diálogo de confirmación para eliminar una estancia
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
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
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function DialogoEliminarEstancia({
  open,
  onClose,
  estanciaSeleccionada,
  onSuccess,
}) {
  if (!estanciaSeleccionada) return null;

  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${API_URL}/db/planos/estancias/${estanciaSeleccionada.planta}/${estanciaSeleccionada.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Error al eliminar la estancia");
      }

      return true;
    },
    onSuccess: () => {
      toast.success(
        `Estancia "${estanciaSeleccionada.descripcion}" eliminada correctamente`
      );

      queryClient.invalidateQueries(["estancias"]);

      onSuccess?.();
      onClose(false);
    },
    onError: (err) => {
      toast.error(err.message || "No se pudo eliminar la estancia");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose} modal>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-red-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Eliminar Estancia
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-700 mb-4 space-y-2 px-6 pt-4">
          <div>
            <span className="font-medium">Código:</span>{" "}
            {estanciaSeleccionada.codigo}
          </div>
          <div>
            <span className="font-medium">Descripción:</span>{" "}
            {estanciaSeleccionada.descripcion}
          </div>
          <div className="text-red-600 font-semibold mt-2">
            Esta acción no se puede deshacer.
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => mutation.mutate()}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
