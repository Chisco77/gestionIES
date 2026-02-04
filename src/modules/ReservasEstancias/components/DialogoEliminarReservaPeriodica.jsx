/**
 * DialogoEliminarReservaPeriodica.jsx
 *
 * Elimina una reserva periódica:
 *  - Borra el PADRE
 *  - Elimina SOLO reservas futuras
 *  - Nunca toca reservas pasadas
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export function DialogoEliminarReservaPeriodica({
  open,
  onOpenChange,
  reserva,
  periodos,
}) {
  if (!reserva) return null;

  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const periodoInicio = periodos?.find(
    (p) => Number(p.id) === Number(reserva.idperiodo_inicio)
  );
  const periodoFin = periodos?.find(
    (p) => Number(p.id) === Number(reserva.idperiodo_fin)
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${API_URL}/db/reservas-estancias/repeticion/${reserva.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data?.error || "Error al eliminar la reserva periódica"
        );

      return data;
    },

    onSuccess: () => {
      toast.success(`Reserva periódica eliminada correctamente`);

      queryClient.invalidateQueries(["reservasPeriodicasTodas"]);
      queryClient.invalidateQueries(["reservas", "uid", user?.username]);

      onOpenChange(false);
    },

    onError: (err) => {
      console.error(err);
      toast.error(err.message || "No se pudo eliminar la reserva periódica");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        {/* HEADER */}
        <DialogHeader className="bg-red-600 text-white rounded-t-lg py-3 px-6 text-center">
          <DialogTitle className="text-lg font-semibold">
            Eliminar reserva periódica
          </DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="px-6 py-4 text-sm space-y-2 text-gray-700">
          <div>
            <span className="font-medium">Estancia:</span>{" "}
            {reserva.descripcion_estancia}
          </div>

          <div>
            <span className="font-medium">Creada por:</span>{" "}
            {reserva.nombreCreador}{" "}
            <span className="text-xs text-muted-foreground">
              ({reserva.uid})
            </span>
          </div>

          <div>
            <span className="font-medium">Reserva para:</span>{" "}
            {reserva.nombreProfesor}{" "}
            <span className="text-xs text-muted-foreground">
              ({reserva.profesor})
            </span>
          </div>

          <div>
            <span className="font-medium">Horario:</span>{" "}
            {periodoInicio?.nombre ?? `Periodo ${reserva.idperiodo_inicio}`} –{" "}
            {periodoFin?.nombre ?? `Periodo ${reserva.idperiodo_fin}`}
          </div>

          <div>
            <span className="font-medium">Desde:</span>{" "}
            {new Date(reserva.fecha_desde).toLocaleDateString("es-ES")}
          </div>

          <div>
            <span className="font-medium">Hasta:</span>{" "}
            {new Date(reserva.fecha_hasta).toLocaleDateString("es-ES")}
          </div>

          <div className="pt-2 text-red-700 font-semibold text-xs">
            Esta acción eliminará solo las reservas futuras. Las reservas
            pasadas no se modificarán. Esta acción no se puede deshacer.
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => mutation.mutate()}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Eliminando..." : "Eliminar"}
          </Button>

          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
