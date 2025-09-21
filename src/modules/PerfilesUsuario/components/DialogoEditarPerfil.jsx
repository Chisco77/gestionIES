import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DialogoEditarPerfil({ open, onClose, perfilSeleccionado, onSuccess }) {
  const [perfil, setPerfil] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const opcionesPerfiles = [
    "administrador",
    "directiva",
    "profesor",
    "educadora",
    "ordenanza",
  ];

  useEffect(() => {
    if (perfilSeleccionado) {
      setPerfil(perfilSeleccionado.perfil || "");
    }
  }, [perfilSeleccionado]);

  const handleEditar = async () => {
    if (!perfilSeleccionado) return;

    try {
      const res = await fetch(`${API_URL}/db/perfiles/${perfilSeleccionado.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ perfil }),
      });

      if (!res.ok) throw new Error("Error al modificar perfil");

      toast.success("Perfil modificado");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al modificar perfil");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>

        <Select value={perfil} onValueChange={setPerfil}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un perfil" />
          </SelectTrigger>
          <SelectContent>
            {opcionesPerfiles.map((p) => (
              <SelectItem key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter className="mt-4">
          <Button onClick={handleEditar}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
