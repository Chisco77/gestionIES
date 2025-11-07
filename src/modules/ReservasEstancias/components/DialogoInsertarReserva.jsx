import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function DialogoInsertarReserva({
  open,
  onClose,
  fecha,
  onSuccess,
  periodos,
  idestancia,
}) {
  const [descripcion, setDescripcion] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();

  useEffect(() => {
    // Reset al abrir
    if (open) {
      setDescripcion("");
      setInicio("");
      setFin("");
    }
  }, [open]);

  const handleGuardar = async () => {
    if (!inicio || !fin) {
      toast.error("Selecciona periodo de inicio y fin");
      return;
    }
    if (parseInt(fin) < parseInt(inicio)) {
      toast.error("El periodo final no puede ser anterior al inicial");
      return;
    }
    if (!user?.username) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/reservas-estancias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          idestancia,
          idperiodo_inicio: parseInt(inicio),
          idperiodo_fin: parseInt(fin),
          uid: user.username,
          fecha,
          descripcion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Mostramos el mensaje que envía el backend
        toast.error(data.error || "Error desconocido al insertar reserva");
        return;
      }

      toast.success("Reserva insertada correctamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al insertar reserva");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            Nueva Reserva ({new Date(fecha).toLocaleDateString("es-ES")})
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 mt-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Periodo Inicio
              </label>
              <Select value={inicio} onValueChange={setInicio}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar inicio" />
                </SelectTrigger>
                <SelectContent>
                  {periodos?.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre} ({p.inicio} - {p.fin})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Periodo Fin
              </label>
              <Select value={fin} onValueChange={setFin}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fin" />
                </SelectTrigger>
                <SelectContent>
                  {periodos?.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre} ({p.inicio} - {p.fin})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <Input
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
