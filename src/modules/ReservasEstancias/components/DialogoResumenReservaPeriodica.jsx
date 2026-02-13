/**
 * DialogoResumenReservaPeriodica.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Muestra un diálogo resumen con el resultado de la creación o actualización
 * de reservas periódicas. Incluye totales de reservas insertadas, omitidas,
 * eliminadas y las fechas que no se pudieron reservar.
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

export function DialogoResumenReservaPeriodica({ open, setOpen, resumen }) {
  if (!resumen) return null;

  // Normalizamos la información
  const resumenNormalizado = {
    hijosEliminados: resumen.hijosEliminados ?? 0,
    insertadas: resumen.insertadas ?? resumen.creadas ?? 0,
    totalNuevas: resumen.totalNuevas ?? resumen.total ?? 0,
    omitidas: resumen.omitidas ?? resumen.conflictos ?? 0,
    fechasOmitidas: (
      resumen.fechasOmitidas ??
      resumen.fechas_omitidas ??
      []
    ).map(
      (f) => f.split("-").reverse().join("/") // yyyy-mm-dd → dd/mm/yyyy
    ),
  };

  const esActualizacion = resumen.hijosEliminados !== undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen} modalmodal={true}>
      <DialogContent className="p-0 overflow-hidden rounded-lg">
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            {esActualizacion
              ? "Resultado de la actualización"
              : "Resumen de la creación de reservas"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 bg-gray-50 space-y-2">
          {esActualizacion && (
            <p>
              <strong>Se eliminaron estas reservas futuras:</strong>{" "}
              {resumenNormalizado.hijosEliminados}
            </p>
          )}
          <p>
            <strong>Total de reservas consideradas:</strong>{" "}
            {resumenNormalizado.totalNuevas}
          </p>
          <p>
            <strong>Reservas insertadas:</strong>{" "}
            {resumenNormalizado.insertadas}
          </p>
          <p>
            <strong>Reservas omitidas por colisión:</strong>{" "}
            {resumenNormalizado.omitidas}
          </p>
          {resumenNormalizado.fechasOmitidas.length > 0 && (
            <p>
              <strong>Fechas omitidas:</strong>{" "}
              {resumenNormalizado.fechasOmitidas.join(", ")}
            </p>
          )}
        </div>

        <DialogFooter className="px-6 py-3 bg-gray-50 flex justify-end">
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
