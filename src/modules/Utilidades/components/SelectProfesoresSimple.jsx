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
import { useProfesoresActivos } from "@/hooks/useProfesoresActivos";

export function SelectProfesoresSimple({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const { data: profesores = [], isLoading } = useProfesoresActivos();

  // Encontrar el profesor seleccionado para mostrar su nombre en el botón
  const seleccionado = profesores.find((p) => p.uid === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between font-normal"
        >
          {seleccionado
            ? `${seleccionado.sn}, ${seleccionado.givenName}`
            : isLoading 
              ? "Cargando profesores..." 
              : "Seleccionar profesor..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Buscar por nombre o apellidos..." />
          <CommandEmpty>No se han encontrado resultados.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {profesores.map((p) => (
              <CommandItem
                key={p.uid}
                // El valor de búsqueda combina apellidos y nombre
                value={`${p.sn} ${p.givenName}`}
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
                {p.sn}, {p.givenName}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}