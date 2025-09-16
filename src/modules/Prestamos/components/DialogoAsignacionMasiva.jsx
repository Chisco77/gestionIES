/**
 * Componente: DialogoAsignacionMasiva
 *
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Este componente muestra un diálogo para la asignación masiva de libros a alumnos de un grupo.
 * Permite seleccionar primero el curso y los libros disponibles, y luego seleccionar el grupo y los alumnos que recibirán los préstamos.
 * Al finalizar, se pueden asignar los préstamos y generar un informe PDF de los préstamos que no se pudieron insertar.
 *
 * Props:
 *   - open: boolean → controla si el diálogo está abierto.
 *   - onClose: function → callback para cerrar el diálogo.
 *   - onSuccess: function → callback que se ejecuta cuando la asignación masiva se completa correctamente.
 *
 * Estados internos principales:
 *   - cursos: array → lista de cursos obtenidos desde la API.
 *   - grupos: array → lista de grupos escolares obtenidos desde LDAP.
 *   - libros: array → libros disponibles del curso seleccionado.
 *   - alumnos: array → alumnos del grupo seleccionado.
 *   - cursoSeleccionado, grupoSeleccionado: string → curso y grupo actualmente seleccionados.
 *   - librosSeleccionados, alumnosSeleccionados: array → IDs de libros y uids de alumnos seleccionados.
 *   - paso: number → controla la navegación entre pasos (1: curso/libros, 2: grupo/alumnos).
 *   - descartes: array → almacena préstamos que no se pudieron asignar.
 *   - mostrarInforme: boolean → controla la visualización del bloque de informe PDF.
 *
 * Librerías/componentes usados:
 *   - React: useState, useEffect para estado y efectos.
 *   - Dialog/DialogContent/DialogHeader/DialogTitle/DialogFooter: componentes de diálogo UI.
 *   - Button, Checkbox: componentes UI para acciones y selección.
 *   - toast (sonner): para notificaciones de error o éxito.
 *   - Check, X (lucide-react): iconos para selección/deselección masiva.
 *   - jsPDF: para generar informes PDF de préstamos omitidos.
 *
 * Flujo de uso:
 *   1. Usuario abre el diálogo (open=true).
 *   2. Se cargan cursos y grupos.
 *   3. Paso 1: Usuario selecciona curso y libros a asignar.
 *   4. Paso 2: Usuario selecciona grupo y alumnos para las asignaciones de libros.
 *   5. Usuario confirma la asignación:
 *       - Se envía petición POST al backend con libros y alumnos seleccionados.
 *       - Se procesan descartes y se almacena información para generar informe PDF si corresponde.
 *   6. Se muestra informe de asignaciones omitidas y opción de descargar PDF.
 *   7. Se ejecutan callbacks onSuccess y onClose según corresponda.
 *
 *
 *
 *
 * Notas:
 *
 *  Este componente crea un registro en la tabla prestamos por cada alumno. Está pensado para ejecutarse al inicio de cada
 *  curso. Este registro se marca con el atributo iniciocurso a true.
 */

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
import jsPDF from "jspdf";

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

  const [descartes, setDescartes] = useState([]);
  const [mostrarInforme, setMostrarInforme] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados iniciales en la carga del formulario
  useEffect(() => {
    if (open) {
      setCursoSeleccionado("");
      setGrupoSeleccionado("");
      setLibrosSeleccionados([]);
      setAlumnosSeleccionados([]);
      setLibros([]);
      setAlumnos([]);
      setPaso(1);
      setDescartes([]); // limpiar informe
      setMostrarInforme(false); // ocultar informe
    }
  }, [open]);

  useEffect(() => {
    fetch(`${API_URL}/db/cursos`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) =>
        setCursos(data.sort((a, b) => a.curso.localeCompare(b.curso)))
      )
      .catch(() => toast.error("Error al obtener cursos"));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/ldap/grupos?groupType=school_class`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setGrupos(data.sort((a, b) => a.cn.localeCompare(b.cn))))
      .catch(() => toast.error("Error al obtener grupos"));
  }, []);

  useEffect(() => {
    if (cursoSeleccionado) {
      setLibros([]);
      setLibrosSeleccionados([]);
      fetch(`${API_URL}/db/libros?curso=${cursoSeleccionado}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) =>
          setLibros(data.sort((a, b) => a.libro.localeCompare(b.libro)))
        )
        .catch(() => toast.error("Error al obtener libros"));
    } else {
      setLibros([]);
      setLibrosSeleccionados([]);
    }
  }, [cursoSeleccionado]);

  useEffect(() => {
    if (grupoSeleccionado) {
      fetch(`${API_URL}/ldap/usuariosPorGrupo?grupo=${grupoSeleccionado}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) =>
          setAlumnos(
            data.sort((a, b) => {
              const apellidos = a.sn.localeCompare(b.sn);
              if (apellidos !== 0) return apellidos;
              return a.givenName.localeCompare(b.givenName);
            })
          )
        )
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

  const generarInformePDF = () => {
    const doc = new jsPDF();
    const margenIzquierdo = 10;
    const margenDerecho = 200;
    const altoLinea = 7;
    const margenSuperior = 20;
    const margenInferior = 15; // margen para pie página

    let y = margenSuperior;

    // Fecha y hora actual
    const fecha = new Date();
    const fechaTexto = fecha.toLocaleDateString();
    const horaTexto = fecha.toLocaleTimeString();
    const fechaHora = `Generado el ${fechaTexto} ${horaTexto}`;

    doc.setFontSize(14);
    doc.text("Informe de préstamos omitidos", margenIzquierdo, y);
    doc.setFontSize(10);
    doc.text(fechaHora, margenDerecho, y, { align: "right" });

    y += 4;
    doc.setLineWidth(0.5);
    doc.line(margenIzquierdo, y, margenDerecho, y);
    y += altoLinea;

    // Agrupar descartes por alumno
    const agrupados = {};
    descartes.forEach((item) => {
      if (!agrupados[item.alumno]) {
        agrupados[item.alumno] = [];
      }
      agrupados[item.alumno].push(item.libro);
    });

    // Guardamos las posiciones donde debemos poner el pie de página luego
    const paginas = [];

    // Función para dibujar pie de página
    function dibujarPiePagina(pageNum, totalPages) {
      const yPie = 285; // posición fija vertical para la línea y texto pie
      doc.setLineWidth(0.5);
      doc.line(margenIzquierdo, yPie, margenDerecho, yPie);
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      const textoPie = `Página ${pageNum} de ${totalPages}`;
      doc.text(textoPie, margenDerecho, yPie + 4, { align: "right" });
    }

    // Añadimos contenido alumno a alumno, gestionando salto de página
    Object.entries(agrupados).forEach(([alumno, libros], index, arr) => {
      const alturaNecesaria = altoLinea * (libros.length + 1) + 3; // libros + título + espacio extra

      if (y + alturaNecesaria > 280 - margenInferior) {
        paginas.push(doc.internal.getCurrentPageInfo().pageNumber);
        doc.addPage();
        y = margenSuperior;
      }

      doc.setFont(undefined, "bold");
      doc.text(`Alumno: ${alumno}`, margenIzquierdo, y);
      y += altoLinea;

      doc.setFont(undefined, "normal");
      libros.forEach((libro) => {
        doc.text(`- ${libro}`, margenIzquierdo + 5, y);
        y += altoLinea;
      });

      y += 3;
    });

    // Añadimos la última página también a la lista
    paginas.push(doc.internal.getCurrentPageInfo().pageNumber);

    // Ahora añadimos el pie de página a cada página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      dibujarPiePagina(i, totalPages);
    }

    doc.save("prestamos_omitidos.pdf");
  };

  const handleAsignar = async () => {
    try {
      const res = await fetch(`${API_URL}/db/prestamos/asignarLibrosMasivo`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alumnos: alumnosSeleccionados,
          libros: librosSeleccionados,
        }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Falló la asignación");

      toast.success(`Se insertaron ${json.insertados.length} préstamos.`);

      if (json.descartados?.length > 0) {
        const mapaAlumnos = Object.fromEntries(
          alumnos.map((a) => [a.uid, `${a.givenName} ${a.sn}`])
        );
        const mapaLibros = Object.fromEntries(
          libros.map((l) => [l.id, l.libro])
        );

        const enriquecidos = json.descartados.map((d) => {
          return {
            alumno: mapaAlumnos[d.uidalumno] || d.uidalumno,
            uid: d.uidalumno,
            libro: d.idlibro
              ? mapaLibros[d.idlibro] || `ID ${d.idlibro}`
              : d.motivo,
          };
        });

        setDescartes(enriquecidos);
        setMostrarInforme(true);
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      toast.error("Error al asignar préstamos");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-3xl"
      >
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
                    <p className="text-xs italic text-gray-500">
                      No hay libros
                    </p>
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
                    <p className="text-xs italic text-gray-500">
                      No hay alumnos
                    </p>
                  )}

                  {alumnos.map((a, index) => {
                    return (
                      <div
                        key={a.uid}
                        className="flex items-center space-x-2 py-1"
                      >
                        <Checkbox
                          id={`alumno-${a.uid}`}
                          checked={alumnosSeleccionados.includes(a.uid)}
                          onCheckedChange={(checked) =>
                            setAlumnosSeleccionados((prev) =>
                              checked
                                ? [...prev, a.uid]
                                : prev.filter((uid) => uid !== a.uid)
                            )
                          }
                        />
                        <label
                          htmlFor={`alumno-${a.uid}`}
                          className="text-sm select-none cursor-pointer"
                        >
                          {a.sn}, {a.givenName} ({a.uid}){" "}
                        </label>
                      </div>
                    );
                  })}
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
        {mostrarInforme && (
          <div className="mt-4 border-t pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Algunos préstamos no se insertaron porque ya existían. Puedes
              descargar el informe.
            </p>
            <Button onClick={generarInformePDF}>Descargar informe PDF</Button>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarInforme(false);
                onSuccess?.();
                onClose();
              }}
            >
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
