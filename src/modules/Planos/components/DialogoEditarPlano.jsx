/**
 * DialogoEditarPlano.jsx
 * ------------------------------------------------------------
 * Componente para editar los atributos label y orden de un plano.
 * ------------------------------------------------------------
 */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Hash, Type, Edit3 } from "lucide-react";

export function DialogoEditarPlano({ open, onOpenChange, plano, onSuccess }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    label: "",
    orden: 0,
  });

  // Sincronizar datos cuando se abre el diálogo con un plano
  useEffect(() => {
    if (open && plano) {
      setFormData({
        label: plano.label || "",
        orden: plano.orden || 0,
      });
    }
  }, [open, plano]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "orden" ? parseInt(value) || 0 : value,
    }));
  };

  const editarMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${API_BASE}/planos/${plano.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar el plano");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Plano actualizado con éxito");
      queryClient.invalidateQueries(["planos-centro"]);
      if (onSuccess) onSuccess();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    if (!formData.label.trim())
      return toast.error("La etiqueta es obligatoria");
    editarMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg max-w-md flex flex-col border-none shadow-2xl"
      >
        <DialogHeader className="bg-green-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <div className="flex items-center gap-3">
            <Edit3 className="w-6 h-6 text-green-300" />
            <DialogTitle className="text-xl font-bold">
              Editar Plano
            </DialogTitle>
          </div>
        </DialogHeader>

        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="py-6 px-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 text-green-600" /> Nombre
                </Label>
                <Input
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  placeholder="Ej: Planta Baja"
                  className="h-11 focus-visible:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-green-600" /> Orden
                </Label>
                <Input
                  name="orden"
                  type="number"
                  value={formData.orden}
                  onChange={handleChange}
                  className="h-11 focus-visible:ring-green-500"
                />
                <p className="text-[11px] text-slate-500 italic leading-tight pl-1">
                  Cambia la posición de este plano en la interfaz.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="px-8 py-4 bg-slate-50 border-t gap-3 rounded-b-lg">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={editarMutation.isLoading}
            className="bg-green-600 hover:bg-green-700 min-w-[120px]"
          >
            {editarMutation.isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
