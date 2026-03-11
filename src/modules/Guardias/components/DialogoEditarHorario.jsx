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

export function DialogoEditarHorario({
  open,
  onClose,
  usuarioSeleccionado,
  empleadoSeleccionado,
  esAlumno = false,
}) {
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  const API_URL = import.meta.env.VITE_API_URL;

  // Periodos horarios
  const { data: periodos = [], isLoading: loadingPeriodos } =
    usePeriodosHorarios();

  // Horario del profesor
  const [horario, setHorario] = useState([]);

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
              fila[dia] = celdaData
                ? `${celdaData.materia_nombre}\n${celdaData.grupo}`
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
                {horario.map((fila, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 font-semibold w-24 truncate rounded-l-md">
                      {fila.periodo}
                    </td>
                    {dias.map((dia, diaIdx) => {
                      const [materia, grupo] = fila[dia]?.split("\n") || [
                        "",
                        "",
                      ];
                      return (
                        <td
                          key={dia}
                          className={`border border-gray-300 px-2 py-1 max-w-[160px] w-1/5 rounded-md ${
                            fila[dia] ? "bg-blue-100 text-blue-800" : ""
                          }`}
                          title={fila[dia] || ""}
                        >
                          {fila[dia] ? (
                            <div className="flex flex-col">
                              {materia && (
                                <div className="line-clamp-2">{materia}</div>
                              )}
                              {grupo && (
                                <div className="font-semibold text-sm truncate">
                                  {grupo}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
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
    </Dialog>
  );
}
