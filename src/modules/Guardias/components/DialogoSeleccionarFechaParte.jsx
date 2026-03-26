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

export function DialogoSeleccionarFechaParte({
  open,
  onOpenChange,
  onConfirmar,
}) {
  const [fecha, setFecha] = useState(new Date());
  const [generando, setGenerando] = useState(false);

  const handleGenerar = async () => {
    setGenerando(true);
    await onConfirmar(fecha);
    setGenerando(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg w-[400px]"
      >
        <DialogHeader className="bg-blue-600 text-white rounded-t-lg py-3 px-6">
          <DialogTitle className="text-center">
            Generar Parte de Faltas
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="flex flex-col space-y-2">
            <Label>Selecciona la fecha del informe</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !fecha && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fecha
                    ? format(fecha, "PPP", { locale: es })
                    : "Elegir fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={setFecha}
                  initialFocus
                  locale={es}
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
