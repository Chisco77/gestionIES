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
import { useActualizarReservaUid } from "@/hooks/Reservas/useMutacionesReservasUid";

export function DialogoEditarReserva({
  open,
  onClose,
  reserva,
  periodos,
  descripcionEstancia = "",
}) {
  const [descripcion, setDescripcion] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const { user } = useAuth();

  // Mutation para actualizar reserva
  const actualizarReserva = useActualizarReservaUid(user?.username);

  useEffect(() => {
    if (open && reserva) {
      console.log("DialogoEditarReserva abierto");
      console.log("Reserva recibida:", reserva);
      console.log("Periodos recibidos:", periodos);

      setDescripcion(reserva.descripcion || "");
      setInicio(reserva.idperiodo_inicio?.toString() || "");
      setFin(reserva.idperiodo_fin?.toString() || "");
    }
  }, [open, reserva, periodos]);

  const handleGuardar = () => {
    if (!inicio || !fin) {
      toast.error("Selecciona periodo de inicio y fin");
      return;
    }
    if (parseInt(fin) < parseInt(inicio)) {
      toast.error("El periodo final no puede ser anterior al inicial");
      return;
    }

    actualizarReserva.mutate(
      {
        id: reserva.id,
        datos: {
          idperiodo_inicio: parseInt(inicio),
          idperiodo_fin: parseInt(fin),
          descripcion,
          uid: user.username,
        },
      },
      {
        onSuccess: () => {
          toast.success("Reserva actualizada correctamente");
          onClose();
        },
        onError: (err) => {
          console.error(err);
          toast.error(err.message || "Error actualizando reserva");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar Reserva (
            {new Date(reserva?.fecha).toLocaleDateString("es-ES")}) –{" "}
            <span className="font-bold">{descripcionEstancia}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 p-6">
          <div className="flex gap-3">
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

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleGuardar}
            disabled={actualizarReserva.isLoading}
          >
            {actualizarReserva.isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
