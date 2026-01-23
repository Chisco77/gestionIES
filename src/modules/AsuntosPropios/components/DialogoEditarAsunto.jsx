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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ResumenAsuntosDia } from "./ResumenAsuntosDia";

export function DialogoEditarAsunto({ open, onClose, asunto, onSuccess }) {
  const [descripcion, setDescripcion] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && asunto) {
      setDescripcion(asunto.descripcion || "");
    }
  }, [open, asunto]);

  // --------------------------
  // Mutation con React Query
  // --------------------------
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${API_URL}/db/permisos/${asunto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.ok)
        throw new Error(result.error || "Error actualizando asunto");
      return result.asunto;
    },
    onSuccess: () => {
      toast.success("Asunto propio actualizado correctamente");

      // 1️⃣ Actualizar PanelReservas
      queryClient.invalidateQueries(["asuntosPropios", user.username]);

      // 2️⃣ Actualizar calendario (usePermisosMes)
      const fechaObj = new Date(asunto.fecha);
      const month = fechaObj.getMonth();
      const year = fechaObj.getFullYear();
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
      queryClient.invalidateQueries({ queryKey: ["asuntosMes", start, end] });

      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Error al actualizar asunto propio");
    },
  });

  const handleGuardar = () => {
    if (!descripcion.trim()) {
      toast.error("La descripción no puede estar vacía");
      return;
    }
    if (!user?.username) {
      toast.error("Usuario no autenticado");
      return;
    }
    mutation.mutate({ descripcion, uid: user.username });
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
            Editar Asunto Propio (
            {new Date(asunto?.fecha).toLocaleDateString("es-ES")})
          </DialogTitle>
        </DialogHeader>

        {/* CUERPO */}
        <div className="flex flex-col space-y-4 p-6">
          {/* Resumen de asuntos del día */}
          <ResumenAsuntosDia fecha={asunto?.fecha} />
          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <Input
              placeholder="Descripción del asunto propio"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        {/* PIE */}
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleGuardar}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
