/**
 * CalendarioAsuntos.jsx
 *
 * Componente de calendario para visualizar y gestionar asuntos propios de un usuario.
 *
 * Props:
 * - currentMonth: number → mes actual mostrado (0-11).
 * - currentYear: number → año actual mostrado.
 * - todayStr: string → fecha de hoy en formato YYYY-MM-DD.
 * - selectedDate: string → fecha actualmente seleccionada.
 * - asuntosPorDia: object → conteo de asuntos por día { "YYYY-MM-DD": numeroAsuntos }.
 * - asuntosPropiosUsuario: object → asuntos propios del usuario { "YYYY-MM-DD": asunto }.
 * - autorizacionesUsuario: object → días con autorización especial del usuario { "YYYY-MM-DD": autorizacion }.
 * - rangosBloqueados: array → rangos de fechas bloqueadas [{ inicio, fin, motivo }].
 * - maxConcurrentes: number → máximo de asuntos permitidos por día sin autorización.
 * - onDiaClick: function → callback al hacer clic en un día habilitado, recibe dateKey.
 * - onMonthChange: function → callback al cambiar mes, recibe { newMonth, newYear }.
 *
 * Características:
 * - Muestra un calendario mensual con días de lunes a domingo.
 * - Indica días bloqueados, completos, parcialmente ocupados y asuntos propios.
 * - Considera fines de semana, rangos bloqueados y concurrencia máxima.
 * - Ignora restricciones si el usuario tiene autorización especial en un día.
 * - Navegación entre meses con botones prev/next, notificando al padre mediante callback.
 * - Tooltip opcional para mostrar motivo de bloqueo en días bloqueados.
 * - Visualización de badges indicando cantidad de asuntos en cada día.
 * - Leyenda explicativa de colores y estados al pie del calendario.
 *
 * Uso:
 * <CalendarioAsuntos
 *   currentMonth={mes}
 *   currentYear={año}
 *   todayStr={fechaHoy}
 *   selectedDate={fechaSeleccionada}
 *   asuntosPorDia={asuntosPorDia}
 *   asuntosPropiosUsuario={asuntosUsuario}
 *   autorizacionesUsuario={autorizaciones}
 *   rangosBloqueados={rangos}
 *   maxConcurrentes={max}
 *   onDiaClick={handleClickDia}
 *   onMonthChange={handleCambioMes}
 * />
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarioAsuntos({
  currentMonth,
  currentYear,
  todayStr,
  selectedDate,
  asuntosPorDia,
  asuntosPropiosUsuario,
  autorizacionesUsuario = {},
  rangosBloqueados,
  maxConcurrentes,
  onDiaClick,
  onMonthChange,
}) {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startDay = (firstDay + 6) % 7; // lunes=0

  const weeks = [];
  let day = 1 - startDay;
  while (day <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day > 0 && day <= daysInMonth ? day : null);
      day++;
    }
    weeks.push(week);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      onMonthChange({ newMonth: 11, newYear: currentYear - 1 });
    } else {
      onMonthChange({ newMonth: currentMonth - 1, newYear: currentYear });
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange({ newMonth: 0, newYear: currentYear + 1 });
    } else {
      onMonthChange({ newMonth: currentMonth + 1, newYear: currentYear });
    }
  };

  const formatDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <Card className="shadow-lg rounded-2xl flex flex-col h-[350px]">
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <button onClick={handlePrevMonth}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <CardTitle>
          {new Date(currentYear, currentMonth).toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          })}
        </CardTitle>
        <button onClick={handleNextMonth}>
          <ChevronRight className="w-6 h-6" />
        </button>
      </CardHeader>

      <CardContent className="p-2 flex-grow flex items-start justify-center overflow-auto">
        <div className="w-full">
          <table className="w-full border-collapse text-center align-top">
            <thead>
              <tr>
                {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                  <th key={d} className="p-1 font-medium">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="align-top">
              {weeks.map((week, i) => (
                <tr key={i}>
                  {week.map((d, j) => {
                    if (!d) return <td key={j} className="p-2"></td>;

                    const dateObj = new Date(currentYear, currentMonth, d);
                    const dateKey = formatDateKey(dateObj);
                    const isToday = dateKey === todayStr;
                    const numAsuntos = asuntosPorDia[dateKey] || 0;
                    const isWeekend =
                      dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    const rangoDelDia = rangosBloqueados.find(
                      (r) => dateKey >= r.inicio && dateKey <= r.fin
                    );
                    const motivoRango = rangoDelDia?.motivo || "";
                    const rangoBloqueado = !!rangoDelDia;
                    const isMine = !!asuntosPropiosUsuario[dateKey]; // solo asuntos propios confirmados

                    /*let bloqueado;

                    if (isMine) {
                      // Día autorizado: bloqueamos solo si se ha llegado al máximo de pticiones diarias.
                      bloqueado = numAsuntos > maxConcurrentes;
                    } else {
                      // Día normal: bloqueado si se supera concurrencia, rango bloqueado o fin de semana
                      bloqueado =
                        numAsuntos >= maxConcurrentes ||
                        rangoBloqueado ||
                        isWeekend;
                    }*/

                    const isAutorizado = !!autorizacionesUsuario[dateKey]; // el usuario tiene autorización para este día

                    let bloqueado;

                    if (isAutorizado) {
                      // Día autorizado: siempre clicable, ignoramos restricciones de rango, fin de semana o concurrencia
                      bloqueado = false;
                    } else {
                      // Día normal: bloqueado si se supera concurrencia, rango bloqueado o fin de semana
                      bloqueado =
                        numAsuntos >= maxConcurrentes ||
                        rangoBloqueado ||
                        isWeekend;
                    }

                    return (
                      <TooltipProvider key={j}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <td
                              className={`relative p-1 rounded-lg transition-all align-top
                                ${bloqueado ? "bg-red-100 text-gray-400 cursor-not-allowed" : "cursor-pointer hover:bg-green-50"}
                                ${isToday ? "border border-green-400" : ""}
                                ${isMine ? "bg-green-100" : ""}
                              `}
                              onClick={() => !bloqueado && onDiaClick(dateKey)}
                            >
                              <div className="relative flex items-center justify-center flex-col">
                                <span>{d}</span>
                                {numAsuntos > 0 && (
                                  <span
                                    className={`absolute right-1 flex items-center justify-center w-5 h-5 text-[0.7rem] text-white font-semibold rounded-full
                                      ${bloqueado ? "bg-red-500" : "bg-green-500"}`}
                                  >
                                    {numAsuntos}
                                  </span>
                                )}
                              </div>
                            </td>
                          </TooltipTrigger>
                          {bloqueado && motivoRango && (
                            <TooltipContent className="bg-red-100 text-black p-2 rounded-md">
                              {motivoRango}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <div className="mt-4 mb-4 flex justify-center items-center text-sm">
        <div className="flex gap-6">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            Mis asuntos propios
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-200 rounded"></div>
            Días bloqueados
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            Parcialmente ocupado
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            Completo
          </div>
        </div>
      </div>
    </Card>
  );
}
