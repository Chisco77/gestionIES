import { useState } from "react";
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
  setOpen,
  datosReserva, // objeto con { aula, tipoRepeticion, diasSemana, periodoInicio, periodoFin, fechaInicio, fechaLimite, descripcion }
  onConfirm,
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
  } = datosReserva;

  const textoRepeticion =
    tipoRepeticion === "diaria"
      ? "todos los días"
      : `los días ${diasSemana.join(", ")}`;

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Confirmación de reserva periódica
          </DialogTitle>
        </DialogHeader>

        <div className="border rounded-md bg-gray-50 p-3 space-y-1">
          {datosReserva.profesor && (
            <p>
              <strong>Profesor:</strong> {datosReserva.profesor}
            </p>
          )}

          <p>
            <strong>Repetición:</strong>{" "}
            {datosReserva.tipoRepeticion === "diaria"
              ? "Todos los días"
              : datosReserva.diasSemana
                  .map((d) => {
                    const diasMap = {
                      Lun: "Lunes",
                      Mar: "Martes",
                      Mié: "Miércoles",
                      Jue: "Jueves",
                      Vie: "Viernes",
                    };
                    return diasMap[d] || d;
                  })
                  .join(", ")}
          </p>

          <p>
            <strong>Periodo:</strong>{" "}
            {`${datosReserva.periodos?.find((p) => p.id === parseInt(datosReserva.periodoInicio))?.nombre || datosReserva.periodoInicio} → ${
              datosReserva.periodos?.find(
                (p) => p.id === parseInt(datosReserva.periodoFin),
              )?.nombre || datosReserva.periodoFin
            }`}
          </p>

          <p>
            <strong>Desde:</strong>{" "}
            {new Date(datosReserva.fechaInicio).toLocaleDateString("es-ES")}{" "}
            <strong>Hasta:</strong>{" "}
            {new Date(datosReserva.fechaLimite).toLocaleDateString("es-ES")}
          </p>

          {datosReserva.descripcion && (
            <p>
              <strong>Descripción:</strong> {datosReserva.descripcion}
            </p>
          )}
        </div>

        <DialogFooter className="px-6 py-3 bg-gray-50 flex gap-2">
          <Button
            onClick={() => {
              onConfirm?.();
              setOpen(false);
            }}
          >
            Confirmar
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
