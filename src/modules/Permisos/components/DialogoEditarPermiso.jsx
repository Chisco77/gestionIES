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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { MAPEO_TIPOS_PERMISOS } from "@/utils/mapeoTiposPermisos";

export function DialogoEditarPermiso({ open, onClose, permiso, onSuccess }) {
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && permiso) {
      setDescripcion(permiso.descripcion || "");
      setTipo(permiso.tipo?.toString() || null); // tipo como string para RadioGroup
    }
  }, [open, permiso]);

  // --------------------------
  // Mutation con React Query
  // --------------------------
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${API_URL}/db/permisos/${permiso.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.ok)
        throw new Error(result.error || "Error actualizando permiso");
      return result.permiso;
    },
    onSuccess: () => {
      toast.success("Permiso actualizado correctamente");

      queryClient.invalidateQueries(["panel", "permisos", user.username]);

      const fechaObj = new Date(permiso.fecha);
      const month = fechaObj.getMonth();
      const year = fechaObj.getFullYear();
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
      queryClient.invalidateQueries({ queryKey: ["permisosMes", start, end] });

      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Error al actualizar permiso");
    },
  });

  const handleGuardar = () => {
    if (!descripcion.trim()) {
      toast.error("La descripción no puede estar vacía");
      return;
    }
    if (!tipo) {
      toast.error("Debe seleccionar un tipo de permiso");
      return;
    }
    mutation.mutate({ descripcion, tipo: Number(tipo), uid: user.username });
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
            Editar Permiso (
            {new Date(permiso?.fecha).toLocaleDateString("es-ES")})
          </DialogTitle>
        </DialogHeader>

        {/* CUERPO */}
        <div className="flex flex-col space-y-6 p-6">
          {/* Descripción */}
          <div>
            <Label
              htmlFor="descripcion"
              className="mb-2 block text-sm font-medium"
            >
              Descripción
            </Label>
            <Input
              id="descripcion"
              placeholder="Descripción del permiso"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {/* Tipo de permiso */}
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Tipo de permiso
            </Label>
            <div className="border rounded-md p-2 hover:bg-gray-50">
              <RadioGroup
                value={tipo}
                onValueChange={setTipo}
                className="space-y-3"
              >
                {Object.entries(MAPEO_TIPOS_PERMISOS)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([key, label]) => (
                    <div key={key} className="flex items-start space-x-2">
                      <RadioGroupItem
                        value={key}
                        id={`tipo-${key}`}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={`tipo-${key}`}
                        className="text-sm cursor-pointer leading-tight"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
              </RadioGroup>
            </div>
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
