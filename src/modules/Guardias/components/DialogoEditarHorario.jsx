/**
 * DialogoEditarHorario.jsx
 *
 * ------------------------------------------------------------
 * Componente que muestra un cuadro de diálogo para visualizar/editar
 * el horario de un profesor.
 *
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { Loader } from "lucide-react";
import { getHoraActualMadrid } from "@/utils/fechasHoras";
import { getDiaSemanaMadrid } from "@/utils/fechasHoras";
import { MapPin } from "lucide-react";
import { DialogoPlanoEstancia } from "@/modules/ReservasEstancias/components/DialogoPlanoEstancia";
import { useEstancias } from "@/hooks/Estancias/useEstancias";

import { useAuth } from "@/context/AuthContext";
import { useMaterias } from "@/hooks/useMaterias";
import { useCursosLdap } from "@/hooks/useCursosLdap";
import { DialogoEditarCeldaHorario } from "./DialogoEditarCeldaHorario";
import { DialogoInsertarCeldaHorario } from "./DialogoInsertarCeldaHorario";
import { DialogoEliminarCeldaHorario } from "./DialogoEliminarCeldaHorario";

import { Pencil, Trash2, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DialogoEditarHorario({
  open,
  onClose,
  usuarioSeleccionado,
  empleadoSeleccionado,
  esAlumno = false,
}) {
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const [horaActual, setHoraActual] = useState(getHoraActualMadrid());
  const [diaActual, setDiaActual] = useState(getDiaSemanaMadrid());
  const [openPlano, setOpenPlano] = useState(false);
  const [estanciaSeleccionada, setEstanciaSeleccionada] = useState(null);

  const { user } = useAuth();
  const { data: materias = [] } = useMaterias();
  const { data: cursos = [] } = useCursosLdap();

  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
  const [openCelda, setOpenCelda] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);

  const [openCeldaInsertar, setOpenCeldaInsertar] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);

  function esPeriodoActual(periodo) {
    if (!horaActual) return false;

    return horaActual >= periodo.inicio && horaActual <= periodo.fin;
  }

  const API_URL = import.meta.env.VITE_API_URL;

  // Periodos horarios
  const { data: periodos = [], isLoading: loadingPeriodos } =
    usePeriodosHorarios();

  // Importar estancias del hook
  const { data: estancias = [] } = useEstancias();

  // Horario del profesor
  const [horario, setHorario] = useState([]);

  // Actualizar día y hora
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(getHoraActualMadrid());
      setDiaActual(getDiaSemanaMadrid());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open && usuarioSeleccionado && periodos.length > 0) {
      // Inicializamos horario vacío
      const tablaVacia = periodos.map((periodo) => {
        const fila = { periodo: periodo.nombre };
        dias.forEach((dia) => (fila[dia] = null));
        return fila;
      });
      setHorario(tablaVacia);

      // Fetch horario real del profesor
      const fetchHorario = async () => {
        try {
          const params = new URLSearchParams({ uid: usuarioSeleccionado.uid });
          const res = await fetch(
            `${API_URL}/db/horario-profesorado/enriquecido?${params.toString()}`,
            { credentials: "include" }
          );
          if (!res.ok) throw new Error("Error obteniendo horario del profesor");
          const data = await res.json();
          console.log("Horario: ", data);

          // Llenamos la tabla
          const tabla = periodos.map((periodo) => {
            const fila = { periodo: periodo.nombre };
            dias.forEach((dia, index) => {
              // buscamos en data.horario por periodo y dia_semana
              const celdaData = data.horario.find(
                (h) =>
                  Number(h.idperiodo) === Number(periodo.id) &&
                  Number(h.dia_semana) === index + 1
              );
              // Guardamos materia, grupo y estancia en los datos de la celda
              fila[dia] = celdaData
                ? {
                    ...celdaData, // 🔥 IMPORTANTE: mantener toda la info original
                    materia: celdaData.materia_nombre,
                    grupo: celdaData.grupo,
                    estancia:
                      estancias.find(
                        (e) => e.descripcion === celdaData.estancia
                      ) || null,
                  }
                : null;
            });
            return fila;
          });

          setHorario(tabla);
        } catch (err) {
          console.error(err);
          alert("No se pudo cargar el horario del profesor");
        }
      };

      fetchHorario();
    }
  }, [open, usuarioSeleccionado, periodos]);

  // --- OPTIMIZACIÓN PUNTO 2: MEMOIZE DE LA TABLA ---
  const horarioProcesado = useMemo(() => {
    return horario.map((fila) => {
      // Buscamos el objeto periodo una sola vez por fila
      const periodoActualObj = periodos.find((p) => p.nombre === fila.periodo);

      // Calculamos si esta FILA coincide con la hora del reloj
      const esFilaActiva =
        periodoActualObj &&
        horaActual >= periodoActualObj.inicio &&
        horaActual <= periodoActualObj.fin;

      return {
        ...fila,
        meta: {
          esFilaActiva,
          periodoId: periodoActualObj?.id,
        },
      };
    });
  }, [horario, periodos, horaActual]);
  // 👆 Solo se recalcula si cambian los datos del horario o la hora del reloj

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg max-w-6xl w-full"
      >
        {/* ENCABEZADO */}
        <DialogHeader className="bg-blue-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Horario del profesor{" "}
            {usuarioSeleccionado
              ? `${usuarioSeleccionado.givenName} ${usuarioSeleccionado.sn}`
              : "Profesor"}
          </DialogTitle>
        </DialogHeader>

        {/* CUERPO */}
        <div className="p-4 overflow-auto max-h-[70vh]">
          {loadingPeriodos ? (
            <div className="flex justify-center py-12">
              <Loader className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : (
            <table className="w-full table-auto border-separate border-spacing-0 text-center">
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="border border-gray-300 px-2 py-1 w-24 rounded-tl-md">
                    Periodo
                  </th>
                  {dias.map((dia, idx) => (
                    <th
                      key={dia}
                      className={`border border-gray-300 px-2 py-1 max-w-[160px] w-1/5 truncate ${
                        idx === dias.length - 1 ? "rounded-tr-md" : ""
                      }`}
                    >
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horarioProcesado.map((fila, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1 font-semibold w-24 truncate rounded-l-md">
                        {fila.periodo}
                      </td>

                      {dias.map((dia) => {
                        // Usamos el cálculo optimizado del meta
                        const esActual =
                          fila.meta.esFilaActiva && diaActual === dia;
                        const celda = fila[dia];

                        // Definir colores según tipo
                        let bgColor = "";
                        let textColor = "";

                        if (esActual) {
                          bgColor =
                            "bg-yellow-200 animate-pulse border-2 border-yellow-500";
                        } else if (celda) {
                          switch (celda.tipo) {
                            case "tutores":
                            case "departamento":
                              bgColor = "bg-green-100";
                              textColor = "text-green-800";
                              break;
                            case "guardia":
                              bgColor = "bg-gray-200";
                              textColor = "text-gray-700";
                              break;
                            case "lectiva":
                            default:
                              bgColor = "bg-blue-100";
                              textColor = "text-blue-800";
                              break;
                          }
                        }

                        const materia = celda?.materia || "";
                        const grupo = celda?.grupo || "";
                        const estancia = celda?.estancia || null;

                        return (
                          <td
                            key={dia}
                            className={`border border-gray-300 px-2 py-1 max-w-[160px] w-1/5 rounded-md relative ${bgColor} ${textColor}`}
                          >
                            {/* Menú de tres puntitos */}
                            {(user.perfil === "directiva" ||
                              user.perfil === "admin") && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute bottom-1 right-1 p-1"
                                  >
                                    …
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!celda ? (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setCeldaSeleccionada(null);
                                        setDiaSeleccionado(dia);
                                        setPeriodoSeleccionado(fila.periodo);
                                        setOpenCeldaInsertar(true);
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-2" /> Insertar
                                    </DropdownMenuItem>
                                  ) : (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setCeldaSeleccionada(celda);
                                          setDiaSeleccionado(dia);
                                          setPeriodoSeleccionado(fila.periodo);
                                          setOpenCelda(true);
                                        }}
                                      >
                                        <Pencil className="w-4 h-4 mr-2" />{" "}
                                        Editar
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() => {
                                          setCeldaSeleccionada(celda);
                                          setDiaSeleccionado(dia);
                                          setPeriodoSeleccionado(fila.periodo);
                                          setOpenEliminar(true);
                                        }}
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />{" "}
                                        Eliminar
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}

                            {/* Contenido de la celda */}
                            {celda && (
                              <div className="flex flex-col items-center justify-center h-full">
                                {celda.tipo === "lectiva" && materia && (
                                  <div className="line-clamp-2">{materia}</div>
                                )}

                                {celda.tipo === "tutores" && (
                                  <div className="line-clamp-2 font-semibold text-center">
                                    Reunión de Tutores
                                  </div>
                                )}

                                {celda.tipo === "departamento" && (
                                  <div className="line-clamp-2 font-semibold text-center">
                                    Reunión de Departamento
                                  </div>
                                )}

                                {celda.tipo === "guardia" && (
                                  <div className="line-clamp-2 font-semibold text-center">
                                    Guardia
                                  </div>
                                )}

                                {grupo && (
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    {estancia && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="inline-flex items-center justify-center gap-1 p-1"
                                        onClick={() => {
                                          setEstanciaSeleccionada(estancia);
                                          setOpenPlano(true);
                                        }}
                                        title={`Ver ubicación de ${estancia.descripcion}`}
                                      >
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm truncate">
                                          {estancia.descripcion}
                                        </span>
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {/* LEYENDA DE COLORES */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-100 border border-gray-300 rounded-sm"></div>
              <span className="text-sm text-gray-700">Hora Lectiva</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 border border-gray-300 rounded-sm"></div>
              <span className="text-sm text-gray-700">
                Reunión de Tutores/Departamento
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded-sm"></div>
              <span className="text-sm text-gray-700">Guardia</span>
            </div>
          </div>
        </div>

        {/* PIE */}
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>

      {openPlano && (
        <DialogoPlanoEstancia
          open={openPlano}
          onClose={() => setOpenPlano(false)}
          estancia={estanciaSeleccionada}
        />
      )}

      {openCelda && (
        <DialogoEditarCeldaHorario
          open={openCelda}
          onClose={() => setOpenCelda(false)}
          celdaActual={celdaSeleccionada}
          periodo={periodoSeleccionado}
          dia={diaSeleccionado}
          estancias={estancias}
          cursos={cursos}
          materias={materias}
          onGuardar={(nuevaCelda) => {
            setHorario((prev) =>
              prev.map((fila) => {
                if (fila.periodo === periodoSeleccionado) {
                  return {
                    ...fila,
                    [diaSeleccionado]: {
                      ...fila[diaSeleccionado], // Copiamos lo que había (como uid, idperiodo, etc)
                      id: nuevaCelda.id, // Aseguramos que el ID se mantiene
                      tipo: nuevaCelda.tipo, // 🔥 IMPORTANTE: Si cambia de Guardia a Lectiva, esto actualiza el color
                      materia: nuevaCelda.materia,
                      grupo: nuevaCelda.grupo,
                      estancia: nuevaCelda.estancia,
                    },
                  };
                }
                return fila;
              })
            );
          }}
        />
      )}

      {openCeldaInsertar && (
        <DialogoInsertarCeldaHorario
          open={openCeldaInsertar}
          onClose={() => setOpenCeldaInsertar(false)}
          usuarioSeleccionado={usuarioSeleccionado}
          periodo={periodoSeleccionado}
          dia={diaSeleccionado}
          estancias={estancias}
          cursos={cursos}
          materias={materias}
          periodos={periodos}
          onGuardar={(nuevaCelda) => {
            setHorario((prev) =>
              prev.map((fila) => {
                if (fila.periodo === periodoSeleccionado) {
                  return {
                    ...fila,
                    [diaSeleccionado]: {
                      id: nuevaCelda.id, // 🔥 Guardamos el ID
                      tipo: nuevaCelda.tipo, // 🔥 Guardamos tipo
                      materia: nuevaCelda.materia, // 🔥 Texto fijo para guardia/tutores/depto
                      grupo: nuevaCelda.grupo || "",
                      estancia: nuevaCelda.estancia || null,
                    },
                  };
                }
                return fila;
              })
            );
          }}
        />
      )}

      {openEliminar && (
        <DialogoEliminarCeldaHorario
          open={openEliminar}
          onClose={() => setOpenEliminar(false)}
          celda={celdaSeleccionada}
          onEliminar={() => {
            setHorario((prev) =>
              prev.map((fila) => {
                if (fila.periodo === periodoSeleccionado) {
                  return {
                    ...fila,
                    [diaSeleccionado]: null, // 🔥 limpiar celda
                  };
                }
                return fila;
              })
            );
          }}
        />
      )}
    </Dialog>
  );
}
