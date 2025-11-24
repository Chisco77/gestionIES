/**
 * DialogoEditarAviso.jsx - Diálogo para editar un aviso existente
 */

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/db`
  : "/db";

export function DialogoEditarAviso({ open, onClose, avisoSeleccionado }) {
  const [modulo, setModulo] = useState("");
  const [emails, setEmails] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    if (avisoSeleccionado) {
      setModulo(avisoSeleccionado.modulo || "");
      setEmails(avisoSeleccionado.emails?.join(", ") || "");
    }
  }, [avisoSeleccionado]);

  const mutation = useMutation(
    async ({ id, modulo, emails }) => {
      const res = await fetch(`${API_BASE}/avisos/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modulo, emails }),
      });
      if (!res.ok) throw new Error("Error al actualizar aviso");
      return res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["avisos"]);
        onClose();
      },
    }
  );

  const handleSubmit = () => {
    if (!modulo.trim()) {
      alert("El módulo es obligatorio");
      return;
    }
    const emailsArray = emails.split(",").map((e) => e.trim()).filter(Boolean);

    mutation.mutate({ id: avisoSeleccionado.id, modulo, emails: emailsArray });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Aviso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium">Módulo</label>
            <Input value={modulo} onChange={(e) => setModulo(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium">Emails (separados por coma)</label>
            <Input value={emails} onChange={(e) => setEmails(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={mutation.isLoading}>
            {mutation.isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
