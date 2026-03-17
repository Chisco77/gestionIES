import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { toast } from "sonner";

// Selector reutilizable
const SelectorField = ({
  label,
  value,
  options,
  onSelect,
  placeholder,
  emptyText,
}) => {
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
          >
            <span className="truncate">
              {value?.label || (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
            <CommandList>
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
};

export function DialogoEditarCeldaHorario({
  open,
  onClose,
  celdaActual,
  periodo,
  dia,
  estancias = [],
  cursos = [],
  materias = [],
  onGuardar,
}) {
  const [materia, setMateria] = useState(null);
  const [grupo, setGrupo] = useState(null);
  const [estancia, setEstancia] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  console.log ("Celda actual: ", celdaActual);
  // 🔄 Cargar datos o limpiar
useEffect(() => {
  if (celdaActual && open) {
    // 🔥 Materia por ID (directo, sin map innecesario)
    const materiaEncontrada = materias.find(
      (m) => String(m.id) === String(celdaActual.idmateria)
    );

    setMateria(
      materiaEncontrada
        ? { id: materiaEncontrada.id, label: materiaEncontrada.nombre }
        : null
    );

    // 🔥 Grupo por gidnumber
    const grupoEncontrado = cursos.find(
      (c) => String(c.gid) === String(celdaActual.gidnumber)
    );

    setGrupo(
      grupoEncontrado
        ? { id: grupoEncontrado.gid, label: grupoEncontrado.nombre }
        : null
    );

    // 🔥 Estancia ya viene prácticamente lista
    setEstancia(
      celdaActual.estancia
        ? {
            id: celdaActual.estancia.id,
            label: celdaActual.estancia.descripcion,
            raw: celdaActual.estancia,
          }
        : null
    );
  } else {
    setMateria(null);
    setGrupo(null);
    setEstancia(null);
  }
}, [celdaActual, open, materias, cursos]);

  // 💾 Guardar
  const handleGuardar = async () => {
    if (!celdaActual) return;
    console.log("id de la celda: ", celdaActual.id);
    try {
      const body = {
        uid: celdaActual.uid,
        dia_semana: celdaActual.dia_semana,
        idperiodo: celdaActual.idperiodo,
        tipo: celdaActual.tipo || null,
        gidnumber: grupo?.id || null,
        idmateria: materia?.id || null,
        idestancia: estancia?.id || null,
        curso_academico: celdaActual.curso_academico || null,
      };

      const res = await fetch(
        `${API_URL}/db/horario-profesorado/${celdaActual.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar la celda");

      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      toast.success("Celda actualizada");

      // 🔁 Actualizar padre (formato visual)
      onGuardar?.({
        materia: materia?.label || "",
        grupo: grupo?.label || "",
        estancia: estancia?.raw || null,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al guardar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg max-w-6xl w-full"
      >
        <DialogHeader className="bg-blue-600 text-white py-3 px-6 text-center">
          <div>
            <DialogTitle className="text-lg font-semibold">
              Editar sesión
            </DialogTitle>
            <p className="text-blue-300 text-sm uppercase tracking-widest">
              {dia} • {periodo}
            </p>
          </div>
        </DialogHeader>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <SelectorField
              label="Materia"
              value={materia}
              options={materias.map((m) => ({
                id: m.id,
                label: m.nombre,
              }))}
              onSelect={setMateria}
              placeholder="Seleccionar materia..."
              emptyText="No se encontró la materia"
            />

            <SelectorField
              label="Grupo"
              value={grupo}
              options={cursos.map((c) => ({
                id: c.gid,
                label: c.nombre,
              }))}
              onSelect={setGrupo}
              placeholder="Seleccionar grupo..."
              emptyText="No se encontró el grupo"
            />

            <SelectorField
              label="Aula"
              value={estancia}
              options={estancias.map((e) => ({
                id: e.id,
                label: e.descripcion,
                raw: e,
              }))}
              onSelect={setEstancia}
              placeholder="Seleccionar aula..."
              emptyText="No se encontró el aula"
            />
          </div>
        </div>

        <DialogFooter className="bg-gray-50 p-6 flex gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
