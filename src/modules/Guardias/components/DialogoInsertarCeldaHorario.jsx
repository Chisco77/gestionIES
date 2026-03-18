import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { SelectorField } from "@/modules/Comunes/SelectorField";

import { getCursoActual } from "@/utils/fechasHoras";

export function DialogoInsertarCeldaHorario({
  open,
  onClose,
  usuarioSeleccionado,
  periodo,
  dia,
  estancias = [],
  cursos = [],
  materias = [],
  periodos = [],
  onGuardar,
}) {
  const [tipo, setTipo] = useState("");
  const [materia, setMateria] = useState(null);
  const [grupo, setGrupo] = useState(null);
  const [estancia, setEstancia] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const periodoObj = periodos.find((p) => p.nombre === periodo);

  const diasMap = {
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
  };

  const esLibre =
    tipo === "guardia" || tipo === "tutores" || tipo === "departamento";

  const handleGuardar = async () => {
    try {
      if (!tipo) return toast.error("Debes seleccionar un tipo");

      const cursoActual = getCursoActual();

      const body = {
        uid: usuarioSeleccionado.uid,
        dia_semana: diasMap[dia],
        idperiodo: periodoObj?.id,
        tipo,
        gidnumber: esLibre ? null : grupo?.id || null,
        idmateria: esLibre ? null : materia?.id || null,
        idestancia: esLibre ? null : estancia?.id || null,
        curso_academico: cursoActual.label,
      };

      const res = await fetch(`${API_URL}/db/horario-profesorado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Error al insertar");

      toast.success("Celda insertada");

      // Accedemos a data.fila que es donde el backend envía el objeto recién creado
      onGuardar?.({
        id: data.fila.id, // 🔥 CAMBIO AQUÍ: antes era data.id
        tipo,
        materia:
          tipo === "tutores"
            ? "Reunión de Tutores"
            : tipo === "departamento"
              ? "Reunión de Departamento"
              : tipo === "guardia"
                ? "Guardia"
                : materia?.label || "",
        grupo: esLibre ? "" : grupo?.label || "",
        estancia: esLibre ? null : estancia?.raw || null,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al insertar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="p-0 max-w-6xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-blue-600 text-white py-3 px-6 text-center">
          <DialogTitle>Nueva sesión</DialogTitle>
          <p className="text-blue-200 text-sm">
            {dia} • {periodo}
          </p>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6">
          {/* 🔥 SELECT TIPO */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Tipo
            </label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[180px]">
                {" "}
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lectiva">Lectiva</SelectItem>
                <SelectItem value="guardia">Guardia</SelectItem>
                <SelectItem value="tutores">Reunión de Tutores</SelectItem>
                <SelectItem value="departamento">
                  Reunión de Departamento
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 🔥 CAMPOS */}
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
              emptyText="No se encontró"
              disabled={esLibre}
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
              emptyText="No se encontró"
              disabled={esLibre}
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
              emptyText="No se encontró"
              disabled={esLibre}
            />
          </div>
        </div>

        <DialogFooter className="p-6">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} className="bg-blue-600">
            Insertar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
