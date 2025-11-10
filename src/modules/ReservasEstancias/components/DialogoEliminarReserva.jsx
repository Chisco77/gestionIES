/**
 * DialogoEliminarReserva.jsx - Componente de diálogo para eliminar una reserva
 *
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Componente que renderiza un diálogo para confirmar la eliminación de una reserva.
 * - Muestra un mensaje de advertencia indicando que la acción no se puede deshacer.
 * - Gestiona la eliminación mediante una llamada fetch al backend.
 * - Notifica al usuario del éxito o error mediante toast.
 *
 * Props:
 * - open: boolean, controla si el diálogo está abierto.
 * - onOpenChange: función que se ejecuta al cerrar/abrir el diálogo.
 * - reserva: objeto con los datos de la reserva a eliminar.
 * - estancias: array de estancias disponibles.
 * - periodos: array de periodos disponibles.
 * - onDeleteSuccess: función opcional que se llama después de una eliminación exitosa.
 *
 * Dependencias:
 * - React
 * - @/components/ui/dialog
 * - @/components/ui/button
 * - sonner (toast)
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

export function DialogoEliminarReserva({
  open,
  onOpenChange,
  reserva,
  estancias,
  periodos,
  onDeleteSuccess,
}) {
  if (!reserva) return null;

  const estancia = estancias.find(
    (e) => parseInt(e.id) === parseInt(reserva.idestancia)
  );
  const periodoInicio = periodos.find(
    (p) => parseInt(p.id) === parseInt(reserva.idperiodo_inicio)
  );
  const periodoFin = periodos.find(
    (p) => parseInt(p.id) === parseInt(reserva.idperiodo_fin)
  );
  const API_URL = import.meta.env.VITE_API_URL;

  const handleEliminar = async () => {
    try {
      const res = await fetch(
        `${API_URL}/db/reservas-estancias/${reserva.id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) throw new Error("Error al eliminar la reserva");

      toast.success("Reserva eliminada correctamente");
      onDeleteSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo eliminar la reserva");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        {/* ENCABEZADO ROJO */}
        <DialogHeader className="bg-red-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Eliminar Reserva
          </DialogTitle>
        </DialogHeader>

        {/* CUERPO CON MARGENES */}
        <div className="text-sm text-gray-700 mb-4 space-y-2 px-6 pt-4">
          <div>
            <span className="font-medium">Fecha:</span>{" "}
            {new Date(reserva.fecha).toLocaleDateString("es-ES")}
          </div>
          <div>
            <span className="font-medium">Estancia:</span>{" "}
            {estancia?.descripcion || "Desconocida"}
          </div>
          {periodoInicio && periodoFin && (
            <div>
              <span className="font-medium">Horario:</span>{" "}
              {periodoInicio.nombre} ({periodoInicio.inicio} – {periodoFin.fin})
            </div>
          )}
          <div className="text-red-600 font-semibold mt-2">
            Esta acción no se puede deshacer.
          </div>
        </div>

        {/* PIE CON BOTONES */}
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleEliminar}
          >
            Eliminar
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
