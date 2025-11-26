// Muestra en el calendario TODAS las actividades extraescolares y TODOS los asuntos propios de todos los profesores

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useExtraescolaresAll } from "@/hooks/Extraescolares/useExtraescolaresAll";
import { useAsuntosTodos } from "@/hooks/Asuntos/useAsuntosTodos";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function CalendarioDirectiva({ onSelectDate, disableInsert = false }) {
  const todayStr = formatDateKey(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const { data: extraescolares = [] } = useExtraescolaresAll();
  const { data: asuntos = [] } = useAsuntosTodos();

  const [fechaInsertar, setFechaInsertar] = useState(null);

  // --- Generar semanas del mes ---
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startDay = (firstDay + 6) % 7; // lunes = 0
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

  // --- Extraescolares por día ---
  const extraescolaresPorDia = {};
  (extraescolares || []).forEach((a) => {
    const fechaObj = new Date(a.fecha_inicio);
    const fecha = formatDateKey(fechaObj);
    extraescolaresPorDia[fecha] = (extraescolaresPorDia[fecha] || 0) + 1;
  });

  // --- Asuntos propios por día ---
  const asuntosPorDia = {};
  (asuntos || []).forEach((a) => {
    const fechaObj = new Date(a.fecha);
    const fecha = formatDateKey(fechaObj);
    asuntosPorDia[fecha] = (asuntosPorDia[fecha] || 0) + 1;
  });

  // --- Navegación ---
  const handlePrevMonth = () => {
    if (currentMonth === 0) setCurrentYear((y) => y - 1);
    setCurrentMonth((m) => (m === 0 ? 11 : m - 1));
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) setCurrentYear((y) => y + 1);
    setCurrentMonth((m) => (m === 11 ? 0 : m + 1));
  };

  // --- Click en un día ---
  const handleDiaClick = (d) => {
    if (!d) return;
    const dateKey = formatDateKey(new Date(currentYear, currentMonth, d));

    if (!disableInsert) {
      setFechaInsertar(dateKey);
      setDialogoInsertarAbierto(true);
    }

    if (onSelectDate) onSelectDate(dateKey);
  };

  return (
    <>
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
            <tbody>
              {weeks.map((week, i) => (
                <tr key={i}>
                  {week.map((d, j) => {
                    if (!d) return <td key={j} className="p-2"></td>;

                    const dateKey = formatDateKey(
                      new Date(currentYear, currentMonth, d)
                    );

                    const numExtra = extraescolaresPorDia[dateKey] || 0;
                    const numAsuntos = asuntosPorDia[dateKey] || 0;
                    const esHoy = dateKey === todayStr;

                    return (
                      <td
                        key={j}
                        onClick={() => handleDiaClick(d)}
                        className={`
    p-1 rounded-lg cursor-pointer transition-all relative z-0

    ${
      numExtra && numAsuntos
        ? "bg-diagonal-extra-asuntos"
        : numExtra
          ? "bg-purple-100"
          : numAsuntos
            ? "bg-green-100"
            : ""
    }

    ${esHoy ? "border-2 border-purple-300" : "border border-transparent"}
    hover:bg-purple-200
  `}
                      >
                        <span className="relative z-10">{d}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
        <div className="mt-4 mb-4 flex justify-center items-center text-sm">
          <div className="flex gap-6">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              Asuntos Propios
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-purple-100 rounded"></div>
              Extraescolares
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-diagonal-extra-asuntos rounded"></div>
              Extraescolares y Asuntos Propios
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
