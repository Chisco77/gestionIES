// src/components/extraescolares/CalendarioExtraescolares.jsx
/*import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useExtraescolaresAll } from "@/hooks/Extraescolares/useExtraescolaresAll";
import { DialogoInsertarExtraescolar } from "./DialogoInsertarExtraescolar";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function CalendarioExtraescolares({
  onSelectDate,
  disableInsert = false,
}) {
  const todayStr = formatDateKey(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const { data: extraescolares = [] } = useExtraescolaresAll();
  const { data: periodos } = usePeriodosHorarios();

  const [dialogoInsertarAbierto, setDialogoInsertarAbierto] = useState(false);
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

  // --- Extraescolares por día considerando rango de fechas ---
  const extraescolaresPorDia = {};
  (extraescolares || [])
    .filter((a) => a.estado === 1) // solo activas
    .forEach((a) => {
      const fechaInicio = new Date(a.fecha_inicio);
      const fechaFin = new Date(a.fecha_fin);
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(0, 0, 0, 0);

      let d = new Date(fechaInicio);
      while (d <= fechaFin) {
        const fechaKey = formatDateKey(d);
        extraescolaresPorDia[fechaKey] =
          (extraescolaresPorDia[fechaKey] || 0) + 1;
        d.setDate(d.getDate() + 1);
      }
    });

  // --- Navegación entre meses ---
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

    if (dateKey < todayStr) return; // bloquear días pasados

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

                    const dateObj = new Date(currentYear, currentMonth, d);
                    const dateKey = formatDateKey(dateObj);
                    const numExtra = extraescolaresPorDia[dateKey] || 0;
                    const esHoy = dateKey === todayStr;
                    const isDisabled = dateKey < todayStr;

                    return (
                      <td
                        key={j}
                        onClick={() => !isDisabled && handleDiaClick(d)}
                        className={`
                          p-1 rounded-lg text-center transition-all
                          ${numExtra ? "bg-purple-100" : ""}
                          ${esHoy ? "border-2 border-purple-300" : "border border-transparent"}
                          ${isDisabled ? "text-gray-400 cursor-not-allowed" : "cursor-pointer hover:bg-purple-200"}
                        `}
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

        <div className="mt-4 mb-4 flex justify-center items-center text-sm">
          <div className="flex gap-6">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-purple-100 rounded"></div>
              Día con actividades Extraescolares
            </div>
          </div>
        </div>
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
*/

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useExtraescolaresAll } from "@/hooks/Extraescolares/useExtraescolaresAll";
import { DialogoInsertarExtraescolar } from "./DialogoInsertarExtraescolar";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function CalendarioExtraescolares({
  onSelectDate,
  disableInsert = false,
}) {
  const todayStr = formatDateKey(new Date());
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [dialogoInsertarAbierto, setDialogoInsertarAbierto] = useState(false);
  const [fechaInsertar, setFechaInsertar] = useState(null);

  const { data: extraescolares = [] } = useExtraescolaresAll();
  const { data: periodos } = usePeriodosHorarios();

  const currentMonth = referenceDate.getMonth();
  const currentYear = referenceDate.getFullYear();

  const extraescolaresPorDia = useMemo(() => {
    const map = {};
    (extraescolares || [])
      .filter((a) => a.estado === 1)
      .forEach((a) => {
        let d = new Date(a.fecha_inicio);
        const end = new Date(a.fecha_fin);
        while (d <= end) {
          const key = formatDateKey(d);
          map[key] = (map[key] || 0) + 1;
          d.setDate(d.getDate() + 1);
        }
      });
    return map;
  }, [extraescolares]);

  const weeks = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const startDay = (firstDay + 6) % 7;
    const generatedWeeks = [];
    let day = 1 - startDay;
    while (day <= daysInMonth) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(day > 0 && day <= daysInMonth ? day : null);
        day++;
      }
      generatedWeeks.push(week);
    }
    return generatedWeeks;
  }, [currentYear, currentMonth]);

  const handleDiaClick = (d) => {
    if (!d) return;
    const dateKey = formatDateKey(new Date(currentYear, currentMonth, d));
    if (dateKey < todayStr) return;
    if (!disableInsert) {
      setFechaInsertar(dateKey);
      setDialogoInsertarAbierto(true);
    }
    onSelectDate?.(dateKey);
  };

  return (
    <>
      <Card className="shadow-md rounded-xl flex flex-col h-[350px] relative bg-white border border-slate-200">
        {/* Cabecera uniforme con leyenda */}
        <CardHeader className="relative flex flex-row items-center justify-center py-3 px-6 bg-slate-50/80 border-b border-slate-200/60 flex-shrink-0">
          <div className="absolute left-6 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 z-10">
            <div className="w-3 h-3 bg-purple-50 border border-purple-200 rounded-sm"></div>
            <span>Extraescolares</span>
          </div>

          <div className="flex items-center gap-2 z-10 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() =>
                setReferenceDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
                )
              }
              className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <CardTitle className="capitalize text-xs font-bold text-slate-700 min-w-[120px] text-center tracking-tight">
              {referenceDate.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
            <button
              onClick={() =>
                setReferenceDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
                )
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

                    const dateKey = formatDateKey(
                      new Date(currentYear, currentMonth, d)
                    );
                    const numExtra = extraescolaresPorDia[dateKey] > 0;
                    const esHoy = dateKey === todayStr;
                    const isDisabled = dateKey < todayStr;

                    return (
                      <td key={j} className="p-0.5">
                        <div
                          onClick={() => !isDisabled && handleDiaClick(d)}
                          className={`
                            w-full aspect-square max-h-[36px] flex items-center justify-center rounded-lg cursor-pointer text-xs transition-all text-slate-700 relative mx-auto
                            ${numExtra ? "bg-purple-50 border border-purple-200/60 text-purple-900" : "hover:bg-slate-50"}
                            ${esHoy ? "ring-2 ring-slate-800 ring-offset-1 bg-slate-100" : ""}
                            ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}
                          `}
                        >
                          <span className="relative z-10">{d}</span>
                        </div>
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
