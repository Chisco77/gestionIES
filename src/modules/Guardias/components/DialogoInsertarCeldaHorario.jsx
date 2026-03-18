import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  // --- CAMBIO: Ahora es un array ---
  const [gruposSeleccionados, setGruposSeleccionados] = useState([]);
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

  // --- LÓGICA MULTI-GRUPO ---
  const agregarGrupo = (grupo) => {
    if (!grupo) return;
    if (gruposSeleccionados.find((g) => g.id === grupo.id)) {
      toast.info("El grupo ya está en la lista");
      return;
    }
    setGruposSeleccionados([...gruposSeleccionados, grupo]);
  };

  const eliminarGrupo = (id) => {
    setGruposSeleccionados(gruposSeleccionados.filter((g) => g.id !== id));
  };

  const handleGuardar = async () => {
    try {
      if (!tipo) return toast.error("Debes seleccionar un tipo");

      // Validación: si es lectiva, debe haber al menos un grupo
      if (!esLibre && gruposSeleccionados.length === 0) {
        return toast.error("Debes seleccionar al menos un grupo");
      }

      const cursoActual = getCursoActual();

      const body = {
        uid: usuarioSeleccionado.uid,
        dia_semana: diasMap[dia],
        idperiodo: periodoObj?.id,
        tipo,
        // 🔥 Enviamos el ARRAY de IDs de los grupos seleccionados
        gidnumber: esLibre ? null : gruposSeleccionados.map((g) => g.id),
        idmateria: esLibre ? null : materia?.id || null,
        idestancia: esLibre ? null : estancia?.id || null,
        curso_academico: cursoActual.label,
      };

      // ✅ USAMOS TU RUTA ORIGINAL
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

      // Enviamos la información al padre para actualizar la tabla sin recargar
      onGuardar?.({
        id: data.fila.id,
        tipo,
        idmateria: esLibre ? null : materia?.id, // 🔥 Añadimos esto
        materia: esLibre
          ? tipo === "tutores"
            ? "Reunión de Tutores"
            : tipo === "departamento"
              ? "Reunión de Departamento"
              : "Guardia"
          : materia?.label || "",
        grupo: esLibre
          ? ""
          : gruposSeleccionados.map((g) => g.label).join(", "),
        gidnumber: esLibre ? null : gruposSeleccionados.map((g) => g.id),
        estancia: esLibre ? null : estancia?.raw || null, // Enviamos el objeto raw del aula
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
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Tipo
            </label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[200px]">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <SelectorField
              label="Materia"
              value={materia}
              options={materias.map((m) => ({ id: m.id, label: m.nombre }))}
              onSelect={setMateria}
              disabled={esLibre}
            />

            {/* SECCIÓN MULTI-GRUPO */}
            <div className="flex flex-col gap-2">
              <SelectorField
                label="Añadir Grupo"
                value={null}
                options={cursos.map((c) => ({ id: c.gid, label: c.nombre }))}
                onSelect={agregarGrupo}
                disabled={esLibre}
                placeholder="Buscar y añadir..."
              />
              <div className="flex flex-wrap gap-2 mt-1 min-h-[42px] p-2 border rounded-md bg-slate-50">
                {gruposSeleccionados.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">
                    Ningún grupo seleccionado
                  </span>
                )}
                {gruposSeleccionados.map((g) => (
                  <Badge
                    key={g.id}
                    variant="secondary"
                    className="pl-2 pr-1 py-1 flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200"
                  >
                    {g.label}
                    <button
                      onClick={() => eliminarGrupo(g.id)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

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
          <Button onClick={handleGuardar} className="bg-blue-600">
            Insertar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
