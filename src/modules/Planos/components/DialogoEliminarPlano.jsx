import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";

export function DialogoEliminarPlano({
  open,
  onClose, // El padre le pasa onClose={() => setAbrirDialogoEliminar(false)}
  planoSeleccionado,
  onSuccess,
}) {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE}/planos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      // 1. Si la respuesta no es OK, intentamos leer el error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar el plano");
      }

      // 2. Si es un 204 (No Content) o el body está vacío, NO llamamos a .json()
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return null;
      }

      // 3. Solo parseamos si hay contenido
      return response.json().catch(() => null);
    },
    onSuccess: () => {
      toast.success("Plano eliminado correctamente");
      queryClient.invalidateQueries(["planos-centro"]);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      // Si el error era "Unexpected token...", aquí lo capturamos
      console.error("Error en el borrado:", error);
      toast.error(error.message);
    },
  });

  const handleConfirmar = () => {
    if (!planoSeleccionado?.id) return;
    mutation.mutate(planoSeleccionado.id);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-red-600 text-xl font-bold">
              ¿Eliminar Plano?
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-600">
            Vas a eliminar el plano <strong>{planoSeleccionado?.label}</strong>.
            Esta acción no se puede deshacer y **fallará si existen estancias**
            vinculadas a este plano (por integridad de la base de datos).
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="bg-slate-50 p-4 -mx-6 -mb-6 mt-4 rounded-b-lg gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmar}
            disabled={mutation.isPending}
            className="min-w-[140px]"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Confirmar Eliminación"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
