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
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function SelectorField({
  label,
  value,
  options = [],
  onSelect,
  placeholder = "Seleccionar...",
  emptyText = "No se encontraron resultados",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
        {label}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-12 text-base font-normal border-gray-200 hover:bg-blue-50 hover:border-blue-200"
            disabled={disabled}
          >
            <span className="truncate">
              {value?.label ? (
                value.label
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[300px] p-0"
          onWheel={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder={`Buscar ${label?.toLowerCase()}...`} />
            {/* Aplicamos el scroll y la altura máxima  */}
            <CommandList className="max-h-60 overflow-y-auto overflow-x-hidden">
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    value={opt.label}
                    onSelect={() => {
                      onSelect(opt);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === opt.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
