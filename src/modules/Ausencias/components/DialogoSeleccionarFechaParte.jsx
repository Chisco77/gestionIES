/**
 * DialogoSeleccionarFechaParte.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Componente de diálogo para la selección de un rango de fechas
 *     para la generación de partes de ausencias.
 * 
 * Permite elegir un intervalo de fechas y lanzar el proceso de
 * generación de informes en PDF.
 *
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
import { Calendar } from "@/components/ui/calendar"; // Asumiendo que usas el Calendar de shadcn
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { addDays, isSameDay } from "date-fns"; // Útil para lógica de fechas

export function DialogoSeleccionarFechaParte({
  open,
  onOpenChange,
  onConfirmar,
}) {
  // Inicializamos con un rango (hoy hasta hoy)
  const [range, setRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [generando, setGenerando] = useState(false);

  const handleGenerar = async () => {
    if (!range?.from) return;

    try {
      setGenerando(true);
      const fechaFin = range.to || range.from;
      // Esperamos a que termine todo el proceso
      await onConfirmar(range.from, fechaFin);
    } catch (error) {
      console.error("Error en el proceso de generación:", error);
    } finally {
      // Pase lo que pase, quitamos el estado de carga y cerramos
      setGenerando(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg w-[420px]"
      >
        <DialogHeader className="bg-blue-600 text-white rounded-t-lg py-3 px-6">
          <DialogTitle className="text-center">
            Generar Partes de Ausencias
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="flex flex-col space-y-2">
            <Label>Selecciona el rango de fechas</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !range && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {range?.from ? (
                    range.to ? (
                      <>
                        {format(range.from, "dd LLL", { locale: es })} -{" "}
                        {format(range.to, "dd LLL", { locale: es })}
                      </>
                    ) : (
                      format(range.from, "PPP", { locale: es })
                    )
                  ) : (
                    <span>Seleccionar rango</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range" // <--- CAMBIO CLAVE
                  defaultMonth={range?.from}
                  selected={range}
                  onSelect={setRange}
                  locale={es}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGenerar} disabled={generando}>
            {generando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
