import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/db`
  : "/db";

export function DialogoSMTP({ open, onClose }) {
  const queryClient = useQueryClient();
  const [emailOrigen, setEmailOrigen] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [registroSMTP, setRegistroSMTP] = useState(null);

  // --- Obtener configuración SMTP existente ---
  const { data } = useQuery({
    queryKey: ["smtp-config"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/avisos/smtp?modulo=smtp`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al cargar SMTP");
      return res.json();
    },
    enabled: open,
  });

  useEffect(() => {
    if (open && data?.length > 0) {
      const registro = data[0];
      setRegistroSMTP(registro);
      setEmailOrigen(registro.emails?.[0] || "");
      setAppPassword(registro.app_password || "");
    }
    if (open && (!data || data.length === 0)) {
      setRegistroSMTP(null);
      setEmailOrigen("");
      setAppPassword("");
    }
  }, [open, data]);

  // --- Mutación insertar ---
  const insertMutation = useMutation({
    mutationFn: async ({ emails, app_password }) => {
      const res = await fetch(`${API_BASE}/avisos/smtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          modulo: "smtp",
          emails,
          app_password,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar SMTP");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Configuración SMTP creada");
      queryClient.invalidateQueries({ queryKey: ["smtp-config"] });
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  // --- Mutación actualizar ---
  const updateMutation = useMutation({
    mutationFn: async ({ id, emails, app_password }) => {
      const res = await fetch(`${API_BASE}/avisos/smtp/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          modulo: "smtp",
          emails,
          app_password,
        }),
      });
      if (!res.ok) throw new Error("Error al actualizar SMTP");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Configuración SMTP actualizada");
      queryClient.invalidateQueries({ queryKey: ["smtp-config"] });
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!emailOrigen.trim()) {
      return toast.error("El email es obligatorio");
    }

    if (!appPassword.trim()) {
      return toast.error("La clave de aplicación es obligatoria");
    }

    const emailsArray = [emailOrigen.trim()];

    if (registroSMTP) {
      updateMutation.mutate({
        id: registroSMTP.id,
        emails: emailsArray,
        app_password: appPassword,
      });
    } else {
      insertMutation.mutate({
        emails: emailsArray,
        app_password: appPassword,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Configuración SMTP
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium">Email de origen</label>
            <Input
              value={emailOrigen}
              onChange={(e) => setEmailOrigen(e.target.value)}
              placeholder="ejemplo@dominio.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">App Password</label>
            <Input
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              placeholder="Clave de aplicación"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={insertMutation.isLoading || updateMutation.isLoading}
          >
            {insertMutation.isLoading || updateMutation.isLoading
              ? "Guardando..."
              : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
