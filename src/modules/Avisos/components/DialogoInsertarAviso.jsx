/**
 * DialogoInsertarAviso.jsx - Diálogo para insertar un nuevo aviso
 */

import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/db`
  : "/db";

export function DialogoInsertarAviso({ open, onClose }) {
  const [modulo, setModulo] = useState("");
  const [emails, setEmails] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setModulo("");
      setEmails("");
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: async (newAviso) => {
      const res = await fetch(`${API_BASE}/avisos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newAviso),
      });
      if (!res.ok) throw new Error("Error al crear aviso");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Aviso creado correctamente");
      queryClient.invalidateQueries({ queryKey: ["avisos"] });
      onClose();
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Error al crear aviso");
    },
  });

  const handleSubmit = () => {
    if (!modulo.trim()) {
      alert("El módulo es obligatorio");
      return;
    }

    const emailsArray = emails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    mutation.mutate({ modulo, emails: emailsArray });
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Insertar Aviso
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium">Módulo</label>
            <Select value={modulo} onValueChange={setModulo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asuntos-propios">Asuntos Propios</SelectItem>
                <SelectItem value="extraescolares">Extraescolares</SelectItem>
                <SelectItem value="permisos">Permisos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Emails (separados por coma)
            </label>
            <Input
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="email1@dominio.com, email2@dominio.com"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isLoading}>
            {mutation.isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
