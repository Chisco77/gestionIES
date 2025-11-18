import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DialogoEditarPerfil({
  open,
  onClose,
  perfilSeleccionado,
  onSuccess,
}) {
  const [perfil, setPerfil] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const opcionesPerfiles = [
    "administrador",
    "directiva",
    "educadora",
    "extraescolares",
    "ordenanza",
    "profesor",
  ];

  useEffect(() => {
    if (perfilSeleccionado) {
      setPerfil(perfilSeleccionado.perfil || "");
    }
  }, [perfilSeleccionado]);

  const handleEditar = async () => {
    if (!perfilSeleccionado) return;

    try {
      const res = await fetch(
        `${API_URL}/db/perfiles/${perfilSeleccionado.uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ perfil }),
        }
      );

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
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="p-0 overflow-hidden rounded-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar Perfil del usuario
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4 p-6">
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
        </div>
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={handleEditar}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
