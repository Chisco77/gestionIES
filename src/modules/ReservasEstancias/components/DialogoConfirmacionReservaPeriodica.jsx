/**
 * DialogoConfirmacionReservaPeriodica.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Muestra un diálogo de confirmación antes de insertar o editar
 * una reserva periódica de estancias.
 * Incluye información resumida de la reserva: estancia, profesor,
 * descripción, repetición, horarios y fechas.
 * Permite confirmar o cancelar la acción, y actualiza la cache de
 * React Query tras la confirmación.
 *
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DialogoConfirmacionReservaPeriodica({
  open,
  onOpenChange,
  datosReserva, // { aula, tipoRepeticion, diasSemana, periodoInicio, periodoFin, fechaInicio, fechaLimite, descripcion, profesor, uid, periodos }
  onConfirm,
  modo = "insercion", // "insercion" o "edicion"
}) {
  if (!datosReserva) return null;

  const {
    aula,
    tipoRepeticion,
    diasSemana = [],
    periodoInicio,
    periodoFin,
    fechaInicio,
    fechaLimite,
    descripcion = "",
    profesor,
    uid,
    periodos,
  } = datosReserva;

  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Mapear periodos
  const pInicio = periodos?.find((p) => Number(p.id) === Number(periodoInicio));
  const pFin = periodos?.find((p) => Number(p.id) === Number(periodoFin));

  // Texto repetición
  const textoRepeticion =
    tipoRepeticion === "diaria"
      ? "Todos los días"
      : diasSemana
          .map((d) => {
            const diasMap = {
              Lun: "Lunes",
              Mar: "Martes",
              Mié: "Miércoles",
              Jue: "Jueves",
              Vie: "Viernes",
              Sáb: "Sábado",
              Dom: "Domingo",
            };
            return diasMap[d] ?? d;
          })
          .join(", ");

  // Header dinámico según modo
  const tituloDialogo =
    modo === "edicion"
      ? "Confirmación de modificación de reserva periódica"
      : "Confirmación inserción de reserva periódica";

  const colorHeader = modo === "edicion" ? "bg-green-500" : "bg-blue-500";

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    toast.success(
      modo === "edicion"
        ? "Reserva periódica modificada correctamente"
        : "Reserva periódica confirmada"
    );
    queryClient.invalidateQueries(["reservasPeriodicasTodas"]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modalmodal={true}>
      <DialogContent  onInteractOutside={(e) => e.preventDefault()} className="p-0 overflow-hidden rounded-lg">
        {/* HEADER */}
        <DialogHeader
          className={`${colorHeader} text-white rounded-t-lg py-3 px-6 text-center`}
        >
          <DialogTitle className="text-lg font-semibold">
            {tituloDialogo}
          </DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="px-6 py-4 text-sm space-y-2 text-gray-700">
          <div>
            <span className="font-medium">Estancia:</span> {aula || "—"}
          </div>

          {descripcion && (
            <div>
              <span className="font-medium">Descripción:</span> {descripcion}
            </div>
          )}

          {profesor && (
            <div>
              <span className="font-medium">Profesor:</span> {profesor}{" "}
            </div>
          )}

          <div>
            <span className="font-medium">Repetición:</span> {textoRepeticion}
          </div>

          <div>
            <span className="font-medium">Horario:</span>{" "}
            {pInicio?.nombre ?? periodoInicio} – {pFin?.nombre ?? periodoFin}
          </div>

          <div>
            <span className="font-medium">Desde:</span>{" "}
            {new Date(fechaInicio).toLocaleDateString("es-ES")}{" "}
            <span className="font-medium">Hasta:</span>{" "}
            {new Date(fechaLimite).toLocaleDateString("es-ES")}
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 bg-gray-50 flex gap-2">
          <Button
            variant="destructive"
            className={`${modo === "edicion" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
