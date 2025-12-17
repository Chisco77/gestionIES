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
import { useAuth } from "@/context/AuthContext";

export function DialogoEliminarPermiso({ open, onOpenChange, permiso, onDeleteSuccess }) {
  if (!permiso) return null;

  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // --------------------------
  // Mutation con React Query
  // --------------------------
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/db/permisos/${permiso.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar el permiso");
      return true;
    },
    onSuccess: () => {
      toast.success("Permiso eliminado correctamente");

      // Actualizar PanelReservas
      queryClient.invalidateQueries(["panel", "permisos", user.uid]);

      // Actualizar calendario (usePermisosMes)
      const fechaObj = new Date(permiso.fecha);
      const month = fechaObj.getMonth();
      const year = fechaObj.getFullYear();
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
      queryClient.invalidateQueries({ queryKey: ["permisosMes", start, end] });

      onDeleteSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "No se pudo eliminar el permiso");
    },
  });

  const handleEliminar = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        {/* ENCABEZADO ROJO */}
        <DialogHeader className="bg-red-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Eliminar Permiso
          </DialogTitle>
        </DialogHeader>

        {/* CUERPO CON MARGENES */}
        <div className="text-sm text-gray-700 mb-4 space-y-2 px-6 pt-4">
          <div>
            <span className="font-medium">Fecha:</span>{" "}
            {new Date(permiso.fecha).toLocaleDateString("es-ES")}
          </div>
          <div>
            <span className="font-medium">Descripción:</span>{" "}
            {permiso.descripcion || "Sin descripción"}
          </div>
          <div className="text-red-600 font-semibold mt-2">
            Esta acción no se puede deshacer.
          </div>
        </div>

        {/* PIE CON BOTONES */}
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleEliminar}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
