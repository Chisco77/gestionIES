/**
 * CalendarioReservas.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Componente de calendario mensual que permite seleccionar días
 * para visualizar o gestionar reservas de un usuario específico.
 * 
 * Características principales:
 * - Navegación entre meses con botones de anterior/siguiente.
 * - Destaca el día actual y el día seleccionado.
 * - Deshabilita selección de días pasados.
 * - Integración con reservas del usuario para mostrar días reservados.
 *
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useReservasUid } from "@/hooks/Reservas/useReservasUid";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function CalendarioReservas({ selectedDate, onSelectDate, uid }) {
  const todayStr = formatDateKey(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const { data: reservasUsuario = [] } = useReservasUid(uid);

  const weeks = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const startDay = (firstDay + 6) % 7;
    const weeksArr = [];
    let day = 1 - startDay;

    while (day <= daysInMonth) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(day > 0 && day <= daysInMonth ? day : null);
        day++;
      }
      weeksArr.push(week);
    }
    return weeksArr;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const handleDiaClick = (d) => {
    if (!d) return;
    const dateKey = formatDateKey(new Date(currentYear, currentMonth, d));
    const isPast =
      new Date(dateKey + "T00:00:00") < new Date(todayStr + "T00:00:00");
    if (!isPast) onSelectDate?.(dateKey);
  };

  return (
    <Card className="shadow-lg rounded-2xl h-[350px] flex flex-col">
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

      <CardContent className="p-2 flex-grow flex items-start justify-center">
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
                <tr key={i} className="align-top">
                  {week.map((d, j) => {
                    if (!d) return <td key={j} className="p-2"></td>;

                    const dateObj = new Date(currentYear, currentMonth, d);
                    const dateKey = formatDateKey(dateObj);
                    const isToday = dateKey === todayStr;
                    const isSelected = dateKey === selectedDate;
                    const isPast = dateObj < new Date(todayStr + "T00:00:00");

                    return (
                      <td
                        key={j}
                        className={`p-1 relative rounded-lg transition
                          ${isPast ? "bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-blue-100"}
                          ${isToday ? "border-2 border-blue-400" : ""}
                          ${isSelected && !isPast ? "bg-blue-100" : ""}`}
                        onClick={() => handleDiaClick(d)}
                      >
                        {d}
                      </td>
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
