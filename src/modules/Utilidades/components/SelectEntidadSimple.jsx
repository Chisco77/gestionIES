import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Un select buscador universal.
 * @param {string} value - El UID seleccionado actualmente.
 * @param {function} onChange - Función que recibe el UID seleccionado.
 * @param {Array} options - Lista de objetos con forma { uid, sn, givenName }.
 * @param {boolean} isLoading - Estado de carga opcional.
 * @param {string} placeholder - Texto a mostrar cuando no hay nada seleccionado.
 * @param {boolean} disabled - Para deshabilitar el control.
 */
export function SelectEntidadSimple({
  value,
  onChange,
  options = [],
  isLoading = false,
  placeholder = "Seleccionar...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  // Buscamos el elemento seleccionado en la lista que nos han pasado
  const seleccionado = options.find((p) => p.uid === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between font-normal bg-white"
        >
          {seleccionado
            ? `${seleccionado.sn}, ${seleccionado.givenName}`
            : isLoading
              ? "Cargando datos..."
              : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Buscar por nombre o apellidos..." />
          <CommandEmpty>No se han encontrado resultados.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {options.map((p) => (
              <CommandItem
                key={p.uid}
                // El valor de búsqueda combina apellidos y nombre
                value={`${p.sn} ${p.givenName} ${p.uid}`}
                onSelect={() => {
                  onChange(p.uid);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === p.uid ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {p.sn}, {p.givenName}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {p.uid}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
