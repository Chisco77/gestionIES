/**
 * DialogoSeleccionarMes.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Adaptado para: Reporte Mensual de Ausencias
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MESES = [
  { id: 9, nombre: "Septiembre" },
  { id: 10, nombre: "Octubre" },
  { id: 11, nombre: "Noviembre" },
  { id: 12, nombre: "Diciembre" },
  { id: 1, nombre: "Enero" },
  { id: 2, nombre: "Febrero" },
  { id: 3, nombre: "Marzo" },
  { id: 4, nombre: "Abril" },
  { id: 5, nombre: "Mayo" },
  { id: 6, nombre: "Junio" },
];

export function DialogoSeleccionarMes({ open, onOpenChange, onConfirmar }) {
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
  const [generando, setGenerando] = useState(false);

  // Maneja la selección/deselección de meses
  const toggleMes = (mesId) => {
    setMesesSeleccionados((prev) =>
      prev.includes(mesId)
        ? prev.filter((id) => id !== mesId)
        : [...prev, mesId].sort((a, b) => {
            // Ordenar lógicamente por curso escolar (Septiembre a Junio)
            const orden = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
            return orden.indexOf(a) - orden.indexOf(b);
          })
    );
  };

  const handleGenerar = async () => {
    if (mesesSeleccionados.length === 0) return;

    try {
      setGenerando(true);
      // Enviamos el array de IDs de meses seleccionados
      await onConfirmar(mesesSeleccionados);
    } catch (error) {
      console.error("Error al generar el informe mensual:", error);
    } finally {
      setGenerando(false);
      onOpenChange(false);
      setMesesSeleccionados([]); // Limpiar selección tras cerrar
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg w-[400px]"
      >
        <DialogHeader className="bg-blue-700 text-white rounded-t-lg py-3 px-6">
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Informe Mensual de Ausencias
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="flex flex-col space-y-3">
            <Label className="text-sm font-semibold text-gray-600">
              Selecciona los meses a incluir:
            </Label>

            <ScrollArea className="h-[250px] border rounded-md p-4">
              <div className="grid grid-cols-1 gap-3">
                {MESES.map((mes) => (
                  <div
                    key={mes.id}
                    className="flex items-center space-x-3 space-y-0"
                  >
                    <Checkbox
                      id={`mes-${mes.id}`}
                      checked={mesesSeleccionados.includes(mes.id)}
                      onCheckedChange={() => toggleMes(mes.id)}
                    />
                    <label
                      htmlFor={`mes-${mes.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {mes.nombre}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {mesesSeleccionados.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {mesesSeleccionados.map((id) => (
                <Badge key={id} variant="secondary" className="text-[10px]">
                  {MESES.find((m) => m.id === id)?.nombre}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerar}
            disabled={generando || mesesSeleccionados.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {generando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generar Informe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
