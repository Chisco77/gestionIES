/**
 * DialogoInsertarAviso.jsx - Diálogo para insertar un nuevo aviso
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/db`
  : "/db";

export function DialogoInsertarAviso({ open, onClose }) {
  const [modulo, setModulo] = useState("");
  const [emails, setEmails] = useState("");

  const queryClient = useQueryClient();

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insertar Aviso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium">Módulo</label>
            <Input
              value={modulo}
              onChange={(e) => setModulo(e.target.value)}
              placeholder="Ej: extraescolares"
            />
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

        <DialogFooter>
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
