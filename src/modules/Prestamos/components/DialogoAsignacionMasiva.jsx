import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function DialogoAsignacionMasiva({ open, onClose, onSuccess }) {
  const [cursos, setCursos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [libros, setLibros] = useState([]);
  const [alumnos, setAlumnos] = useState([]);

  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");

  const [librosSeleccionados, setLibrosSeleccionados] = useState([]);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);

  const [paso, setPaso] = useState(1);

  useEffect(() => {
    if (open) {
      setCursoSeleccionado("");
      setGrupoSeleccionado("");
      setLibrosSeleccionados([]);
      setAlumnosSeleccionados([]);
      setLibros([]);
      setAlumnos([]);
      setPaso(1);
    }
  }, [open]);

  useEffect(() => {
    fetch("http://localhost:5000/api/db/cursos", { credentials: "include" })
      .then((res) => res.json())
      .then(setCursos)
      .catch(() => toast.error("Error al obtener cursos"));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/ldap/grupos", { credentials: "include" })
      .then((res) => res.json())
      .then(setGrupos)
      .catch(() => toast.error("Error al obtener grupos"));
  }, []);

  useEffect(() => {
    if (cursoSeleccionado) {
      fetch(`http://localhost:5000/api/db/libros?curso=${cursoSeleccionado}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then(setLibros)
        .catch(() => toast.error("Error al obtener libros"));
    } else {
      setLibros([]);
      setLibrosSeleccionados([]);
    }
  }, [cursoSeleccionado]);

  useEffect(() => {
    if (grupoSeleccionado) {
      fetch(
        `http://localhost:5000/api/ldap/usuariosPorGrupo?grupo=${grupoSeleccionado}`,
        { credentials: "include" }
      )
        .then((res) => res.json())
        .then(setAlumnos)
        .catch(() => toast.error("Error al obtener alumnos"));
    } else {
      setAlumnos([]);
      setAlumnosSeleccionados([]);
    }
  }, [grupoSeleccionado]);

  const toggleSeleccionarTodosLibros = () => {
    if (librosSeleccionados.length === libros.length) {
      setLibrosSeleccionados([]);
    } else {
      setLibrosSeleccionados(libros.map((l) => l.id));
    }
  };

  const toggleSeleccionarTodosAlumnos = () => {
    if (alumnosSeleccionados.length === alumnos.length) {
      setAlumnosSeleccionados([]);
    } else {
      setAlumnosSeleccionados(alumnos.map((a) => a.uid));
    }
  };

  const handleAsignar = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/db/prestamos/insertarMasivo",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alumnos: alumnosSeleccionados,
            libros: librosSeleccionados,
          }),
        }
      );

      if (!res.ok) throw new Error("Falló la asignación");

      toast.success("Préstamos asignados correctamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Error al asignar préstamos");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Asignación masiva de libros</DialogTitle>
        </DialogHeader>

        {/* Paso 1: Curso y Libros */}
        {paso === 1 && (
          <div>
            <label className="block mb-2 font-semibold text-sm">Curso</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={cursoSeleccionado}
              onChange={(e) => {
                setCursoSeleccionado(e.target.value);
                setLibrosSeleccionados([]);
              }}
            >
              <option value="">Seleccionar curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.curso}
                </option>
              ))}
            </select>

            {/* Lista libros aparece solo si hay curso seleccionado */}
            {cursoSeleccionado && (
              <>
                <div className="flex items-center justify-between mt-4 mb-2">
                  <h3 className="text-base font-semibold">Libros</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleSeleccionarTodosLibros}
                    className="flex items-center space-x-1"
                  >
                    {librosSeleccionados.length === libros.length ? (
                      <>
                        <X className="w-4 h-4" />
                        <span>Deseleccionar todos</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Seleccionar todos</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="max-h-64 overflow-auto border border-gray-200 rounded-md p-3 shadow-sm">
                  {libros.length === 0 && (
                    <p className="text-xs italic text-gray-500">No hay libros</p>
                  )}
                  {libros.map((libro) => (
                    <div
                      key={libro.id}
                      className="flex items-center space-x-2 py-1"
                    >
                      <Checkbox
                        id={`libro-${libro.id}`}
                        checked={librosSeleccionados.includes(libro.id)}
                        onCheckedChange={(checked) => {
                          setLibrosSeleccionados((prev) =>
                            checked
                              ? [...prev, libro.id]
                              : prev.filter((id) => id !== libro.id)
                          );
                        }}
                      />
                      <label
                        htmlFor={`libro-${libro.id}`}
                        className="text-sm select-none cursor-pointer"
                      >
                        {libro.libro}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                disabled={librosSeleccionados.length === 0}
                onClick={() => setPaso(2)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Paso 2: Grupo y Alumnos */}
        {paso === 2 && (
          <div>
            <label className="block mb-2 font-semibold text-sm">Grupo</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={grupoSeleccionado}
              onChange={(e) => {
                setGrupoSeleccionado(e.target.value);
                setAlumnosSeleccionados([]);
              }}
            >
              <option value="">Seleccionar grupo</option>
              {grupos.map((g) => (
                <option key={g.cn} value={g.cn}>
                  {g.cn}
                </option>
              ))}
            </select>

            {/* Lista alumnos aparece solo si hay grupo seleccionado */}
            {grupoSeleccionado && (
              <>
                <div className="flex items-center justify-between mt-4 mb-2">
                  <h3 className="text-base font-semibold">Alumnos</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleSeleccionarTodosAlumnos}
                    className="flex items-center space-x-1"
                  >
                    {alumnosSeleccionados.length === alumnos.length ? (
                      <>
                        <X className="w-4 h-4" />
                        <span>Deseleccionar todos</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Seleccionar todos</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="max-h-64 overflow-auto border border-gray-200 rounded-md p-3 shadow-sm">
                  {alumnos.length === 0 && (
                    <p className="text-xs italic text-gray-500">No hay alumnos</p>
                  )}
                  {alumnos.map((a) => (
                    <div
                      key={a.uid}
                      className="flex items-center space-x-2 py-1"
                    >
                      <Checkbox
                        id={`alumno-${a.uid}`}
                        checked={alumnosSeleccionados.includes(a.uid)}
                        onCheckedChange={(checked) => {
                          setAlumnosSeleccionados((prev) =>
                            checked
                              ? [...prev, a.uid]
                              : prev.filter((uid) => uid !== a.uid)
                          );
                        }}
                      />
                      <label
                        htmlFor={`alumno-${a.uid}`}
                        className="text-sm select-none cursor-pointer"
                      >
                        {a.sn}, {a.givenName} ({a.uid})
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setPaso(1)}>
                Anterior
              </Button>
              <Button
                disabled={alumnosSeleccionados.length === 0}
                onClick={handleAsignar}
              >
                Asignar préstamos
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
