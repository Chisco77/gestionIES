import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DialogoEliminarAsunto({ open, onOpenChange, asunto, onDeleteSuccess }) {
  if (!asunto) return null;

  const API_URL = import.meta.env.VITE_API_URL;

  const handleEliminar = async () => {
    try {
      const res = await fetch(`${API_URL}/db/asuntos-propios/${asunto.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar el asunto propio");

      toast.success("Asunto propio eliminado correctamente");
      onDeleteSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo eliminar el asunto propio");
    }
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
            Eliminar Asunto Propio
          </DialogTitle>
        </DialogHeader>

        {/* CUERPO CON MARGENES */}
        <div className="text-sm text-gray-700 mb-4 space-y-2 px-6 pt-4">
          <div>
            <span className="font-medium">Fecha:</span>{" "}
            {new Date(asunto.fecha).toLocaleDateString("es-ES")}
          </div>
          <div>
            <span className="font-medium">Descripción:</span>{" "}
            {asunto.descripcion || "Sin descripción"}
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
