import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
// Importamos DialogClose para referencia, aunque lo eliminamos del uso para simplificar
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

export function DialogoEditarReserva({
  open,
  onClose,
  reserva,
  onSuccess,
  periodos,
  descripcionEstancia = "",
}) {
  const [descripcion, setDescripcion] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();

  // 🟦 Cargar datos de la reserva al abrir el diálogo
  useEffect(() => {
    if (open && reserva) {
      setDescripcion(reserva.descripcion || "");
      setInicio(reserva.idperiodo_inicio?.toString() || "");
      setFin(reserva.idperiodo_fin?.toString() || "");
    }
  }, [open, reserva]);

  const handleGuardar = async () => {
    // ... (Lógica de guardado sin cambios)
    if (!inicio || !fin) {
      toast.error("Selecciona periodo de inicio y fin");
      return;
    }
    if (parseInt(fin) < parseInt(inicio)) {
      toast.error("El periodo final no puede ser anterior al inicial");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/db/reservas-estancias/${reserva.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            idperiodo_inicio: parseInt(inicio),
            idperiodo_fin: parseInt(fin),
            descripcion,
            uid: user.username,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // Aquí usamos el mensaje enviado por el backend
        toast.error(data.error || "Error desconocido al actualizar reserva");
        return;
      }

      toast.success("Reserva actualizada correctamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al actualizar reserva");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      {/* QUITAMOS EL P-0 para que la "X" negra tenga espacio y se vea correctamente */}
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        
        {/* 🛑 CAMBIO CLAVE: Cambiamos 'rounded-t-lg' a 'rounded-tl-lg rounded-tr-none' y añadimos 'pr-10' para dejar espacio. */}
        <DialogHeader className="bg-blue-400 text-white rounded-tl-lg rounded-tr-none flex items-center justify-center relative py-3 pr-10 pl-6">
          <DialogTitle className="text-lg font-semibold text-center">
            Editar Reserva (
            {new Date(reserva?.fecha).toLocaleDateString("es-ES")}) –{" "}
            <span className="font-bold">{descripcionEstancia}</span>
          </DialogTitle>
          {/* 🛑 ELIMINAMOS ESTE BOTÓN: Dejamos que la 'X' negra nativa funcione como el único botón de cierre */}
          {/* Si quieres que tu X blanca sea el cierre:
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-200"
          >
            ×
          </button>
          */}
        </DialogHeader>

        {/* Mantenemos el padding por defecto del DialogContent para el contenido, pero añadimos mt-2 para espacio */}
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
          <Button onClick={handleGuardar}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}