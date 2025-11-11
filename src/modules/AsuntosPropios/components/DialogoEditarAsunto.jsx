import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function DialogoEditarAsunto({ open, onClose, asunto, onSuccess }) {
  const [descripcion, setDescripcion] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();

  useEffect(() => {
    if (open && asunto) {
      setDescripcion(asunto.descripcion || "");
    }
  }, [open, asunto]);

  const handleGuardar = async () => {
    if (!descripcion.trim()) {
      toast.error("La descripción no puede estar vacía");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/asuntos-propios/${asunto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          descripcion,
          uid: user.username,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error desconocido al actualizar asunto propio");
        return;
      }

      toast.success("Asunto propio actualizado correctamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al actualizar asunto propio");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        {/* ENCABEZADO */}
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar Asunto Propio ({new Date(asunto?.fecha).toLocaleDateString("es-ES")})
          </DialogTitle>
        </DialogHeader>

        {/* CUERPO */}
        <div className="flex flex-col space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Input
              placeholder="Descripción del asunto propio"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        {/* PIE */}
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button onClick={handleGuardar}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
