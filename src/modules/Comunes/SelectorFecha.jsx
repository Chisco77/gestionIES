import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Selector de fecha con manejo seguro para backend
 * @param {string} label - Texto de la etiqueta
 * @param {Date} fecha - Fecha seleccionada
 * @param {function} setFecha - Función que recibe el Date seleccionado
 * @param {function} setFechaStr - Opcional: función que recibe string seguro para backend "YYYY-MM-DD 00:00:00"
 * @param {Date} minDate - Fecha mínima seleccionable
 */
export function SelectorFecha({ label, fecha, setFecha, setFechaStr, minDate }) {
  const handleSelect = (date) => {
    if (!date) return;
    setFecha(date);

    // Formato seguro para backend: "YYYY-MM-DD 00:00:00"
    if (setFechaStr) {
      const fechaSegura = `${format(date, "yyyy-MM-dd")} 00:00:00`;
      setFechaStr(fechaSegura);
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            {format(fecha, "dd/MM/yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Calendar
            mode="single"
            selected={fecha}
            onSelect={handleSelect}
            locale={es}
            minDate={minDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}