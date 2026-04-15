import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react"; // Importamos icono para borrar
import { Badge } from "@/components/ui/badge"; // Badge de Shadcn
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
  const [gruposSeleccionados, setGruposSeleccionados] = useState([]); // Array de objetos {id, label}
  const [estancia, setEstancia] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // DialogoEditarCeldaHorario.jsx
  useEffect(() => {
    if (!open || !celdaActual || !materias.length || !cursos.length) return;

    setTipo(celdaActual.tipo || "");

    // Materia
    const mFound = materias.find(
      (m) => String(m.id) === String(celdaActual.idmateria)
    );
    setMateria(mFound ? { id: mFound.id, label: mFound.nombre } : null);

    // Grupos
    const ids = Array.isArray(celdaActual.gidnumber)
      ? celdaActual.gidnumber
      : [];
    const seleccionados = cursos
      .filter((c) => ids.map(Number).includes(Number(c.gid)))
      .map((c) => ({ id: c.gid, label: c.nombre }));
    setGruposSeleccionados(seleccionados);

    // Estancia
    const idABuscar = celdaActual.estancia?.id || celdaActual.idestancia;
    const eFound = estancias.find((e) => String(e.id) === String(idABuscar));
    setEstancia(
      eFound ? { id: eFound.id, label: eFound.descripcion, raw: eFound } : null
    );
  }, [open, celdaActual, estancias, materias, cursos]);

  const esLibre =
    tipo === "guardia" || tipo === "tutores" || tipo === "departamento";

  // --- LÓGICA MULTI-GRUPO ---
  const agregarGrupo = (grupo) => {
    if (!grupo) return;
    // Evitar duplicados en la lista visual
    if (gruposSeleccionados.find((g) => g.id === grupo.id)) {
      toast.info("El grupo ya está seleccionado");
      return;
    }
    setGruposSeleccionados([...gruposSeleccionados, grupo]);
  };

  const eliminarGrupo = (id) => {
    setGruposSeleccionados(gruposSeleccionados.filter((g) => g.id !== id));
  };
  const handleGuardar = async () => {
    try {
      // 1. Extraemos el curso de celdaActual.
      // Si por alguna razón es nulo (porque en la DB estaba nulo o se perdió en el mapeo),
      // usamos un valor por defecto para que la base de datos NO rechace el UPDATE.
      const cursoParaEnviar = celdaActual.curso_academico || "2025-2026";

      // 2. Construimos el body asegurándonos de incluir TODOS los campos necesarios
      const body = {
        uid: celdaActual.uid,
        dia_semana: celdaActual.dia_semana,
        idperiodo: celdaActual.idperiodo,
        tipo,
        // Grupos y materia según el tipo de sesión
        gidnumber:
          tipo === "tutores" || tipo === "departamento" || tipo === "guardia"
            ? null
            : gruposSeleccionados.map((g) => g.id),
        idmateria:
          tipo === "tutores" || tipo === "departamento" || tipo === "guardia"
            ? null
            : materia?.id || null,
        idestancia: estancia?.id || null,
        // AQUÍ ESTÁ LA CLAVE:
        curso_academico: cursoParaEnviar,
      };

      // 3. Ejecutamos la petición al backend
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
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Error al actualizar");

      toast.success("Celda actualizada");

      // 4. Devolvemos el objeto actualizado al padre
      // Usamos el spread de celdaActual para NO PERDER el curso_academico original
      // ni otros metadatos (como el ID del registro)
      onGuardar?.({
        ...celdaActual,
        curso_academico: cursoParaEnviar, // Lo aseguramos también en el estado local
        tipo,
        materia:
          tipo === "tutores"
            ? "Reunión de Tutores"
            : tipo === "departamento"
              ? "Reunión de Departamento"
              : tipo === "guardia"
                ? "Guardia"
                : materia?.label || "",
        grupo:
          tipo === "tutores" || tipo === "departamento" || tipo === "guardia"
            ? ""
            : gruposSeleccionados.map((g) => g.label).join(", "),
        gidnumber:
          tipo === "tutores" || tipo === "departamento" || tipo === "guardia"
            ? null
            : gruposSeleccionados.map((g) => g.id),
        estancia: estancia?.raw || null,
      });

      onClose();
    } catch (err) {
      console.error("Error al guardar:", err);
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
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo..." />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <SelectorField
              label="Materia"
              value={materia}
              options={materias.map((m) => ({ id: m.id, label: m.nombre }))}
              onSelect={setMateria}
              disabled={esLibre}
            />

            {/* SECCIÓN DE GRUPOS */}
            <div className="flex flex-col gap-2">
              <SelectorField
                label="Añadir Grupo"
                value={null} // Siempre null para que actúe como "buscador"
                options={cursos.map((c) => ({ id: c.gid, label: c.nombre }))}
                onSelect={agregarGrupo}
                disabled={esLibre}
                placeholder="Buscar y añadir..."
              />
              {/* Visualización de grupos seleccionados */}
              <div className="flex flex-wrap gap-2 mt-1 min-h-[40px] p-2 border rounded-md bg-slate-50">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarGrupo(g.id);
                      }}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <SelectorField
              label="Aula/Ubicación"
              value={estancia}
              options={estancias.map((e) => ({
                id: e.id,
                label: e.descripcion,
                raw: e,
              }))}
              onSelect={setEstancia}
              disabled={false}
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
