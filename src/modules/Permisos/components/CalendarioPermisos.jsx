import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarioPermisos({
  currentMonth,
  currentYear,
  todayStr,
  permisosUsuario,
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
                    const hasPermiso = !!permisosUsuario[dateKey];

                    return (
                      <TooltipProvider key={j}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <td
                              className={`relative p-2 rounded-lg transition-all align-top cursor-pointer
                                ${hasPermiso ? "bg-green-100" : "hover:bg-gray-100"}
                                ${isToday ? "border border-green-400" : ""}`}
                              onClick={() => onDiaClick(dateKey)} // clic activo siempre
                            >
                              <div className="flex items-center justify-center">
                                {d}
                              </div>
                            </td>
                          </TooltipTrigger>
                          {hasPermiso && (
                            <TooltipContent className="bg-green-100 text-black p-2 rounded-md">
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
        </div>
      </CardContent>
    </Card>
  );
}
