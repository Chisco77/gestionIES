/**
 * DialogoEditarReserva.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Muestra un diálogo para editar una reserva existente de una estancia.
 * Permite modificar el periodo de inicio y fin, así como la descripción,
 * y actualiza la reserva mediante React Query.
 *
 */

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
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const API_URL = import.meta.env.VITE_API_URL;

  const queryClient = useQueryClient();

  // Reset de estado al abrir
  useEffect(() => {
    if (open && reserva) {
      setDescripcion(reserva.descripcion || "");
      setInicio(reserva.idperiodo_inicio?.toString() || "");
      setFin(reserva.idperiodo_fin?.toString() || "");
    }
  }, [open, reserva]);

  // === MUTATION === (misma lógica que DialogoInsertarReserva)
  const mutation = useMutation({
    mutationFn: async () => {
      if (!inicio || !fin)
        throw new Error("Selecciona periodo de inicio y fin");

      if (parseInt(fin) < parseInt(inicio))
        throw new Error("El periodo final no puede ser anterior al inicial");

      const res = await fetch(`${API_URL}/db/reservas-estancias/${reserva.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          idperiodo_inicio: parseInt(inicio),
          idperiodo_fin: parseInt(fin),
          descripcion,
          uid: user.username,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error actualizando reserva");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Reserva actualizada correctamente");

      // Igual que en insertar
      queryClient.invalidateQueries(["reservas", "dia", reserva.fecha]); // refresca grid del día
      queryClient.invalidateQueries(["reservas", "uid", user.username]); // refresca panel del usuario

      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Error actualizando reserva");
    },
  });

  const handleGuardar = () => mutation.mutate();

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar Reserva ({new Date(reserva?.fecha).toLocaleDateString("es-ES")}) –{" "}
            <span className="font-bold">{descripcionEstancia}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 p-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Periodo Inicio</label>
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
              <label className="block text-sm font-medium mb-1">Periodo Fin</label>
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
            <label className="block text-sm font-medium mb-1">Descripción</label>
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
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
