import { useState, useEffect } from "react";
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
  const [tipo, setTipo] = useState("");
  const [materia, setMateria] = useState(null);
  const [grupo, setGrupo] = useState(null);
  const [estancia, setEstancia] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (celdaActual && open) {
      setTipo(celdaActual.tipo || "");

      const materiaEncontrada = materias.find(
        (m) => String(m.id) === String(celdaActual.idmateria)
      );

      setMateria(
        materiaEncontrada
          ? { id: materiaEncontrada.id, label: materiaEncontrada.nombre }
          : null
      );

      const grupoEncontrado = cursos.find(
        (c) => String(c.gid) === String(celdaActual.gidnumber)
      );

      setGrupo(
        grupoEncontrado
          ? { id: grupoEncontrado.gid, label: grupoEncontrado.nombre }
          : null
      );

      setEstancia(
        celdaActual.estancia
          ? {
              id: celdaActual.estancia.id,
              label: celdaActual.estancia.descripcion,
              raw: celdaActual.estancia,
            }
          : null
      );
    }
  }, [celdaActual, open, materias, cursos]);

  const esLibre =
    tipo === "guardia" || tipo === "tutores" || tipo === "departamento";

  const handleGuardar = async () => {
    try {
      const body = {
        uid: celdaActual.uid,
        dia_semana: celdaActual.dia_semana,
        idperiodo: celdaActual.idperiodo,
        tipo,
        gidnumber: esLibre ? null : grupo?.id || null,
        idmateria: esLibre ? null : materia?.id || null,
        idestancia: esLibre ? null : estancia?.id || null,
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

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al actualizar");
      }

      toast.success("Celda actualizada");

      onGuardar?.({
        id: celdaActual.id, // 🔥 IMPRESCINDIBLE: Mantener el ID original
        tipo,
        materia: esLibre
          ? tipo === "tutores"
            ? "Reunión de Tutores"
            : tipo === "departamento"
              ? "Reunión de Departamento"
              : "Guardia"
          : materia?.label || "",
        grupo: esLibre ? "" : grupo?.label || "",
        estancia: esLibre ? null : estancia?.raw || null,
        // Mantén también los campos de BD por si acaso el padre los necesita
        uid: celdaActual.uid,
        dia_semana: celdaActual.dia_semana,
        idperiodo: celdaActual.idperiodo,
        curso_academico: celdaActual.curso_academico,
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
        className="p-0 max-w-6xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-green-600 text-white py-3 px-6 text-center">
          <DialogTitle>Editar sesión</DialogTitle>
          <p className="text-green-300 text-sm">
            {dia} • {periodo}
          </p>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6">
          {/* 🔥 SELECT TIPO */}
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

          {/* CAMPOS */}
          <div className="flex flex-col md:flex-row gap-6">
            <SelectorField
              label="Materia"
              value={materia}
              options={materias.map((m) => ({
                id: m.id,
                label: m.nombre,
              }))}
              onSelect={setMateria}
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
              disabled={esLibre}
            />
          </div>
        </div>

        <DialogFooter className="p-6">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} className="bg-green-600">
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
