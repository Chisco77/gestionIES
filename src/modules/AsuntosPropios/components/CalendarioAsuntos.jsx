// src/modules/Asuntos/CalendarioAsuntos.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarioAsuntos({
  currentMonth,
  currentYear,
  todayStr,
  selectedDate,
  asuntosPorDia,
  asuntosPropiosUsuario,
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
                  <th key={d} className="p-1 font-medium">{d}</th>
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
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    const rangoDelDia = rangosBloqueados.find(
                      (r) => dateKey >= r.inicio && dateKey <= r.fin
                    );
                    const motivoRango = rangoDelDia?.motivo || "";
                    const rangoBloqueado = !!rangoDelDia;
                    const bloqueado = numAsuntos >= maxConcurrentes || rangoBloqueado || isWeekend;
                    const isMine = !!asuntosPropiosUsuario[dateKey];

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
