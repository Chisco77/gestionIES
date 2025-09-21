import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function DialogoInsertarPerfil({ open, onClose, onSuccess }) {
  const [uid, setUid] = useState("");
  const [perfil, setPerfil] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const opcionesPerfiles = [
    "administrador",
    "directiva",
    "profesor",
    "educadora",
    "ordenanza",
  ];

  const handleGuardar = async () => {
    if (!uid || !perfil) {
      toast.error("UID y perfil son obligatorios");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/db/perfiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ uid, perfil }),
      });

      if (!res.ok) throw new Error("Error al insertar perfil");

      toast.success("Perfil insertado");
      setUid("");
      setPerfil("");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al insertar perfil");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Insertar perfil</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="mb-2"
        />

        <Select value={perfil} onValueChange={setPerfil}>
          <SelectTrigger className="w-full mb-2">
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

        <DialogFooter>
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
