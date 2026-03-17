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
import { useEffect, useState } from "react";
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

import { Pencil, Trash2 } from "lucide-react";

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
    }, 1000);

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
                {horario.map((fila, idx) => {
                  const periodoActual = periodos.find(
                    (p) => p.nombre === fila.periodo
                  );

                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1 font-semibold w-24 truncate rounded-l-md">
                        {fila.periodo}
                      </td>

                      {dias.map((dia, diaIdx) => {
                        const esActual =
                          periodoActual &&
                          esPeriodoActual(periodoActual) &&
                          diaActual === dia;

                        const materia = fila[dia]?.materia || "";
                        const grupo = fila[dia]?.grupo || "";
                        const estancia = fila[dia]?.estancia || null;

                        return (
                          <td
                            key={dia}
                            className={`border border-gray-300 px-2 py-1 max-w-[160px] w-1/5 rounded-md relative
    ${
      esActual
        ? "bg-yellow-200 animate-pulse border-2 border-yellow-500"
        : fila[dia]
          ? "bg-blue-100 text-blue-800"
          : ""
    }`}
                          >
                            {/* Menú de tres puntitos solo para admin/directiva */}
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
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setCeldaSeleccionada(fila[dia]);
                                      setDiaSeleccionado(dia);
                                      setPeriodoSeleccionado(fila.periodo);
                                      setOpenCelda(true);
                                    }}
                                  >
                                    <Pencil className="w-4 h-4 mr-2" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      console.log("Eliminar acción pendiente");
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}

                            {/* Contenido de la celda */}
                            {fila[dia] && (
                              <div className="flex flex-col">
                                {materia && (
                                  <div className="line-clamp-2">{materia}</div>
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
                      ...fila[diaSeleccionado], // 🔥 mantener datos originales
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
    </Dialog>
  );
}
