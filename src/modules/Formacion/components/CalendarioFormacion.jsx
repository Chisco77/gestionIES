import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarioFormacion({
  currentMonth,
  currentYear,
  todayStr,
  permisosUsuario = {},
  onDiaClick,
  onMonthChange,
}) {

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startDay = (firstDay + 6) % 7;

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

  const isDateInPermisos = (dateObj) => {
    const d = new Date(dateObj);
    d.setHours(0, 0, 0, 0);

    // 'permisosUsuario' es ahora el array 'asuntosPropiosMes'
    return permisosUsuario.some((permiso) => {
      // Si tu objeto tiene 'fecha_inicio' úsalo, si no, usa 'fecha'
      const inicio = new Date(permiso.fecha_inicio || permiso.fecha);
      const fin = new Date(
        permiso.fecha_fin || permiso.fecha_inicio || permiso.fecha
      );

      inicio.setHours(0, 0, 0, 0);
      fin.setHours(0, 0, 0, 0);

      return d >= inicio && d <= fin;
    });
  };

  const formatDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <Card className="shadow-md rounded-xl flex flex-col h-[350px] relative bg-white border border-slate-200">
      {/* Cabecera uniforme */}
      <CardHeader className="relative flex flex-row items-center justify-center py-3 px-6 bg-slate-50/80 border-b border-slate-200/60 flex-shrink-0">
        <div className="absolute left-6 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 z-10">
          <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded-sm"></div>
          <span>Asistencia a formación</span>
        </div>

        <div className="flex items-center gap-2 z-10 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
          <button
            onClick={() =>
              onMonthChange({
                newMonth: currentMonth === 0 ? 11 : currentMonth - 1,
                newYear: currentMonth === 0 ? currentYear - 1 : currentYear,
              })
            }
            className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <CardTitle className="capitalize text-xs font-bold text-slate-700 min-w-[120px] text-center tracking-tight">
            {new Date(currentYear, currentMonth).toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </CardTitle>
          <button
            onClick={() =>
              onMonthChange({
                newMonth: currentMonth === 11 ? 0 : currentMonth + 1,
                newYear: currentMonth === 11 ? currentYear + 1 : currentYear,
              })
            }
            className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-3 flex-grow flex items-start justify-center overflow-auto bg-white rounded-b-xl">
        <table className="w-full border-collapse text-center align-top table-fixed h-full">
          <thead>
            <tr>
              {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                <th
                  key={d}
                  className="pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, i) => (
              <tr key={i}>
                {week.map((d, j) => {
                  if (!d) return <td key={j} className="p-0.5"></td>;

                  const dateObj = new Date(currentYear, currentMonth, d);
                  const dateKey = formatDateKey(dateObj);
                  const isToday = dateKey === todayStr;
                  const hasPermiso = isDateInPermisos(dateObj);

                  return (
                    <TooltipProvider key={j}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <td className="p-0.5">
                            <div
                              onClick={() => onDiaClick(dateKey)}
                              // Cambia border-yellow-200/60 por border-yellow-300 para marcar mejor el contorno
                              className={`
  w-full aspect-square max-h-[36px] flex items-center justify-center rounded-lg cursor-pointer text-xs transition-all relative mx-auto
  ${hasPermiso ? "!bg-yellow-100 !border-yellow-200 font-bold" : "hover:bg-slate-50"}
  ${isToday ? "ring-2 ring-slate-800 ring-offset-1 z-10" : ""}
`}
                            >
                              <span className="relative z-10">{d}</span>
                            </div>
                          </td>
                        </TooltipTrigger>
                        {hasPermiso && (
                          <TooltipContent className="bg-slate-800 text-white text-xs p-2">
                            Permiso solicitado
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
      </CardContent>
    </Card>
  );
}
