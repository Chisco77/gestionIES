// src/modules/Extraescolares/components/CalendarioExtraescolares.jsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useExtraescolaresUid } from "@/hooks/Extraescolares/useExtraescolaresUid";
import { DialogoInsertarExtraescolar } from "./DialogoInsertarExtraescolar";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
export function CalendarioExtraescolares({
  uid,
  onSelectDate,
  disableInsert = false,
}) {
  const todayStr = formatDateKey(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const { data: extraescolares } = useExtraescolaresUid(uid);
  const { data: periodos } = usePeriodosHorarios();

  const [dialogoInsertarAbierto, setDialogoInsertarAbierto] = useState(false);
  const [fechaInsertar, setFechaInsertar] = useState(null);

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

  const extraescolaresPorDia = {};
  (extraescolares || []).forEach((a) => {
    const fechaObj = new Date(a.fecha_inicio);
    const fecha = formatDateKey(fechaObj);
    extraescolaresPorDia[fecha] = (extraescolaresPorDia[fecha] || 0) + 1;
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) setCurrentYear((y) => y - 1);
    setCurrentMonth((m) => (m === 0 ? 11 : m - 1));
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) setCurrentYear((y) => y + 1);
    setCurrentMonth((m) => (m === 11 ? 0 : m + 1));
  };

  const handleDiaClick = (d) => {
    if (!d) return;
    const dateKey = formatDateKey(new Date(currentYear, currentMonth, d));

    if (!disableInsert) {
      setFechaInsertar(dateKey);
      setDialogoInsertarAbierto(true);
    }

    // Llamamos al callback para notificar al padre aunque disableInsert sea true
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
                    const esHoy = dateKey === todayStr;
                    return (
                      <td
                        key={j}
                        onClick={() => handleDiaClick(d)}
                        className={`p-1 rounded-lg cursor-pointer transition-all
                          ${numExtra ? "bg-purple-100" : ""}
                          ${esHoy ? "border-2 border-purple-300" : "border border-transparent"}
                          hover:bg-purple-200`}
                      >
                        {d}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {dialogoInsertarAbierto && !disableInsert && (
        <DialogoInsertarExtraescolar
          open={dialogoInsertarAbierto}
          onClose={() => setDialogoInsertarAbierto(false)}
          fechaSeleccionada={fechaInsertar}
          periodos={periodos}
        />
      )}
    </>
  );
}
