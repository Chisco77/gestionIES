import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Presta libros a un usuario alumno o profesor.
export function DialogoAsignarLibros({
  open,
  onClose,
  onSuccess,
  uidsConPrestamo = [],
  esAlumno = true, // por defecto, el usuario es un alumno
}) {
  // Datos y estados
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");

  const [alumnos, setAlumnos] = useState([]);
  const [filtroAlumno, setFiltroAlumno] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");

  const [libros, setLibros] = useState([]);
  const [librosSeleccionados, setLibrosSeleccionados] = useState([]);

  const [paso, setPaso] = useState(1);
  const API_URL = import.meta.env.VITE_API_URL;

  // Al abrir el diálogo reseteamos estados
  useEffect(() => {
    if (open) {
      setGrupoSeleccionado("");
      setAlumnos([]);
      setFiltroAlumno("");
      setAlumnoSeleccionado(null);
      setCursoSeleccionado("");
      setLibros([]);
      setLibrosSeleccionados([]);
      setPaso(1);
    }
  }, [open]);

  // Cargar grupos al montar
  useEffect(() => {
    const tipoGrupo = esAlumno ? "school_class" : "school_department";
    fetch(`${API_URL}/ldap/grupos?groupType=${tipoGrupo}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        // Ordenar alfabéticamente por cn
        const ordenados = data.sort((a, b) => a.cn.localeCompare(b.cn));
        setGrupos(ordenados);
      })
      .catch(() => toast.error("Error al obtener grupos"));
  }, []);

  // Cuando cambia grupo, cargar alumnos del grupo. filtrar aquellos que ya tienen prestamo
  useEffect(() => {
    if (grupoSeleccionado) {
      fetch(`${API_URL}/ldap/usuariosPorGrupo?grupo=${grupoSeleccionado}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          // Filtramos alumnos ya con asignaciones si no son de inicio curso.
          const filtrados = data.filter((a) => {
            const prestamo = uidsConPrestamo.find((p) => p.uid === a.uid);

            if (!prestamo) return true; // no tiene préstamo → incluir
            if (prestamo.iniciocurso) return true; // tiene préstamo pero es de inicio de curso → incluir
            return false; // tiene préstamo y no es de inicio de curso → excluir
          });

          // Ordenamos por apellido y nombre
          const ordenados = filtrados.sort((a, b) => {
            if (a.sn === b.sn) return a.givenName.localeCompare(b.givenName);
            return a.sn.localeCompare(b.sn);
          });

          setAlumnos(ordenados);
        })
        .catch(() => toast.error("Error al obtener alumnos"));
    } else {
      setAlumnos([]);
      setAlumnoSeleccionado(null);
    }
  }, [grupoSeleccionado, uidsConPrestamo]);

  // Cuando cambia curso o alumno, cargar libros disponibles

  useEffect(() => {
    if (cursoSeleccionado && alumnoSeleccionado) {
      fetch(
        `${API_URL}/db/libros/disponibles/${cursoSeleccionado}/${alumnoSeleccionado}`,
        {
          credentials: "include",
        }
      )
        .then((res) => res.json())
        .then(setLibros)
        .catch(() => toast.error("Error al obtener libros disponibles"));
    } else {
      setLibros([]);
      setLibrosSeleccionados([]);
    }
  }, [cursoSeleccionado, alumnoSeleccionado]);

  // Cargar cursos al montar
  useEffect(() => {
    fetch(`${API_URL}/db/cursos`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        // Ordenar por nombre de curso
        const ordenados = data.sort((a, b) => a.curso.localeCompare(b.curso));
        setCursos(ordenados);
      })
      .catch(() => toast.error("Error al obtener cursos"));
  }, []);

  // Filtrado de alumnos según input
  const alumnosFiltrados = alumnos.filter((a) => {
    const busqueda = filtroAlumno.toLowerCase();
    return (
      a.sn.toLowerCase().includes(busqueda) ||
      a.givenName.toLowerCase().includes(busqueda) ||
      a.uid.toLowerCase().includes(busqueda)
    );
  });

  // Selección de alumno (solo uno)
  const seleccionarAlumno = (uid) => {
    setAlumnoSeleccionado((prev) => (prev === uid ? null : uid));
  };

  // Selección múltiple libros con resaltado
  const toggleLibroSeleccionado = (id) => {
    setLibrosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Enviar préstamo
  const handlePrestar = async () => {
    if (!alumnoSeleccionado) {
      toast.error("Selecciona un alumno");
      return;
    }
    if (librosSeleccionados.length === 0) {
      toast.error("Selecciona al menos un libro");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/prestamos/asignarUsuario`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: alumnoSeleccionado,
          libros: librosSeleccionados,
          esAlumno,
        }),
      });

      if (!res.ok) throw new Error("Error al prestar libros");

      toast.success("Libros prestados correctamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Error al prestar libros");
      console.error(error);
    }
  };
  console.log("Libros disponibles:", libros);
  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>Prestar libros a un alumno</DialogTitle>
        </DialogHeader>

        {/* Paso 1: Grupo y alumno */}
        {paso === 1 && (
          <div>
            <label className="block mb-2 font-semibold text-sm">Grupo</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={grupoSeleccionado}
              onChange={(e) => setGrupoSeleccionado(e.target.value)}
            >
              <option value="">Seleccionar grupo</option>
              {grupos.map((g) => (
                <option key={g.cn} value={g.cn}>
                  {g.cn}
                </option>
              ))}
            </select>

            {grupoSeleccionado && (
              <>
                <label className="block mt-4 mb-2 font-semibold text-sm">
                  Filtrar alumno
                </label>
                <Input
                  type="text"
                  placeholder="Buscar por apellido, nombre o uid"
                  value={filtroAlumno}
                  onChange={(e) => setFiltroAlumno(e.target.value)}
                />

                <div className="max-h-64 overflow-auto border border-gray-200 rounded-md p-3 shadow-sm mt-2">
                  {alumnosFiltrados.length === 0 && (
                    <p className="text-xs italic text-gray-500">
                      No hay alumnos
                    </p>
                  )}
                  {alumnosFiltrados.map((a) => (
                    <div
                      key={a.uid}
                      onClick={() => seleccionarAlumno(a.uid)}
                      className={`cursor-pointer p-2 rounded-md mb-1 select-none
                        ${
                          alumnoSeleccionado === a.uid
                            ? "bg-green-200"
                            : "hover:bg-gray-100"
                        }
                      `}
                    >
                      {a.sn}, {a.givenName} ({a.uid})
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button disabled={!alumnoSeleccionado} onClick={() => setPaso(2)}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Paso 2: Curso y libros */}
        {paso === 2 && (
          <div>
            <label className="block mb-2 font-semibold text-sm">Curso</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={cursoSeleccionado}
              onChange={(e) => setCursoSeleccionado(e.target.value)}
            >
              <option value="">Seleccionar curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.curso}
                </option>
              ))}
            </select>

            {cursoSeleccionado && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-72 overflow-auto">
                {libros.length === 0 && (
                  <p className="text-xs italic text-gray-500">No hay libros</p>
                )}
                {libros.map((libro) => {
                  const seleccionado = librosSeleccionados.includes(libro.id);
                  return (
                    <div
                      key={libro.id}
                      onClick={() => toggleLibroSeleccionado(libro.id)}
                      className={`p-4 rounded-md cursor-pointer border
                        ${seleccionado ? "bg-green-200 border-green-600" : "border-gray-300 hover:border-gray-600"}
                      `}
                    >
                      {libro.libro}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setPaso(1)}>
                Anterior
              </Button>
              <Button
                disabled={librosSeleccionados.length === 0}
                onClick={handlePrestar}
              >
                Prestar libros
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
