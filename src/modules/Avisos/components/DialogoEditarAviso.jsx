/**
 * DialogoEditarAviso.jsx - Diálogo para editar un aviso existente
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/db`
  : "/db";

export function DialogoEditarAviso({ open, onClose, avisoSeleccionado }) {
  const [modulo, setModulo] = useState("");
  const [emails, setEmails] = useState("");
  const [avisarProfesores, setAvisarProfesores] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (avisoSeleccionado) {
      setModulo(avisoSeleccionado.modulo || "");
      setEmails(avisoSeleccionado.emails?.join(", ") || "");
      setAvisarProfesores(!!avisoSeleccionado.avisar_profesores);
    }
  }, [avisoSeleccionado]);

  const mutation = useMutation({
    mutationFn: async ({ id, modulo, emails, avisar_profesores }) => {
      const res = await fetch(`${API_BASE}/avisos/${id}`, {
        // ID en la URL
        method: "PUT", // PUT explícito
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ modulo, emails, avisar_profesores }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar aviso");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Operación realizada correctamente");
      queryClient.invalidateQueries({ queryKey: ["avisos"] });
      onClose();
    },
    onError: (err) => {
      // 3. error
      toast.error(err.message);
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

    mutation.mutate({
      id: avisoSeleccionado.id,
      modulo,
      emails: emailsArray,
      avisar_profesores: avisarProfesores,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg border-none"
      >
        <DialogHeader className="bg-green-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar Aviso
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-6 p-6">
          <div>
            <label className="block text-sm font-medium mb-2">Módulo</label>
            <Select value={modulo} onValueChange={setModulo} disabled>
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
            <span className="text-xs text-muted-foreground">
              Lista de emails de miembros de la directiva o responsables que
              recibirián notificaciones relacionadas con este elemento.
            </span>
            <Input value={emails} onChange={(e) => setEmails(e.target.value)} />
          </div>

          <div className="flex items-center justify-between space-x-2 border p-3 rounded-md bg-gray-50">
            <div className="flex flex-col space-y-0.5">
              <Label className="text-sm font-medium">
                Notificar automáticamente
              </Label>
              <span className="text-xs text-muted-foreground">
                Si está activado, se enviarán notificaciones a los profesores
                implicados en este tipo de actividad.
              </span>
            </div>
            <Switch
              checked={avisarProfesores}
              onCheckedChange={setAvisarProfesores}
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
