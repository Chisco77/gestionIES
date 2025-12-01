import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandItem, CommandGroup } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TimePicker({ value, onChange, label = "Hora" }) {
  const [open, setOpen] = useState(false);

  const horas = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  const minutos = ["00", "15", "30", "45"];

  const seleccionar = (h, m) => {
    const nueva = `${h}:${m}`;
    onChange(nueva);
    setOpen(false);
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            {value || label}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-52 p-0">
          <div className="flex">
            {/* Horas */}
            <ScrollArea className="h-48 w-1/2 border-r">
              <Command>
                <CommandGroup>
                  {horas.map((h) => (
                    <CommandItem
                      key={h}
                      onSelect={() => {
                        const m = value?.split(":")[1] || "00";
                        seleccionar(h, m);
                      }}
                    >
                      {h}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </ScrollArea>

            {/* Minutos */}
            <ScrollArea className="h-48 w-1/2">
              <Command>
                <CommandGroup>
                  {minutos.map((m) => (
                    <CommandItem
                      key={m}
                      onSelect={() => {
                        const h = value?.split(":")[0] || "00";
                        seleccionar(h, m);
                      }}
                    >
                      {m}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
