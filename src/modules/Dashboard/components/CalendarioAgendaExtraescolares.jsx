import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useExtraescolaresAll } from "@/hooks/Extraescolares/useExtraescolaresAll";
import { usePermisosUid } from "@/hooks/Permisos/usePermisosUid";
import { useAuth } from "@/context/AuthContext";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function CalendarioAgendaExtraescolares({
  onSelectDate,
  disableInsert = false,
}) {
  const { user } = useAuth();
  const uid = user?.username;
  const todayStr = formatDateKey(new Date());

  const [referenceDate, setReferenceDate] = useState(new Date());
  const currentMonth = referenceDate.getMonth();
  const currentYear = referenceDate.getFullYear();

  const { data: extraescolares = [] } = useExtraescolaresAll();
  const { data: asuntos = [] } = usePermisosUid(uid);

  // --- Generar semanas del mes ---
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

  // --- Datos procesados ---
  const extraescolaresPorDia = useMemo(() => {
    const map = {};
    extraescolares
      .filter((a) => a.estado === 1)
      .forEach((a) => {
        const inicio = new Date(a.fecha_inicio);
        const fin = new Date(a.fecha_fin);
        for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
          map[formatDateKey(d)] = true;
        }
      });
    return map;
  }, [extraescolares]);

  const asuntosPorDia = useMemo(() => {
    const map = {};
    asuntos.forEach((a) => {
      map[formatDateKey(new Date(a.fecha))] = true;
    });
    return map;
  }, [asuntos]);

  const handlePrev = () =>
    setReferenceDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNext = () =>
    setReferenceDate(new Date(currentYear, currentMonth + 1, 1));

  return (
    <Card className="shadow-md rounded-xl flex flex-col h-[350px] relative bg-white border border-slate-200">
      {/* Cabecera */}
      <CardHeader className="flex flex-row items-center justify-between py-3 px-6 bg-slate-50/80 border-b border-slate-200/60 flex-shrink-0">
        <button
          onClick={handlePrev}
          className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <CardTitle className="text-xs font-bold text-slate-700 capitalize tracking-tight">
          {referenceDate.toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          })}
        </CardTitle>
        <button
          onClick={handleNext}
          className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </CardHeader>

      {/* Cuerpo */}
      <CardContent className="p-3 flex-grow flex items-start justify-center overflow-auto bg-white rounded-b-xl">
        <table className="w-full border-collapse text-center table-fixed">
          <thead>
            <tr>
              {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                <th
                  key={d}
                  className="pb-2 text-[10px] font-bold uppercase text-slate-400"
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
                  if (!d) return <td key={j} className="p-1"></td>;
                  const dateKey = formatDateKey(
                    new Date(currentYear, currentMonth, d)
                  );
                  const esHoy = dateKey === todayStr;
                  const tieneExtra = extraescolaresPorDia[dateKey];
                  const tieneAsunto = asuntosPorDia[dateKey];

                  return (
                    <td key={j} className="p-0.5">
                      <div
                        onClick={() => onSelectDate?.(dateKey)}
                        className={`w-full aspect-square max-h-[36px] flex items-center justify-center rounded-lg cursor-pointer transition-all relative overflow-hidden ${
                          tieneExtra && tieneAsunto
                            ? "bg-diagonal-extra-asuntos border border-slate-300"
                            : tieneExtra
                              ? "bg-purple-100 border border-purple-100 text-purple-950"
                              : tieneAsunto
                                ? "bg-green-50 border border-green-100 text-green-950"
                                : "hover:bg-slate-50"
                        } ${esHoy ? "ring-2 ring-slate-800 ring-offset-1 bg-slate-100" : ""}`}
                      >
                        <span
                          className={`relative z-10 text-[11px] ${
                            tieneExtra && tieneAsunto
                              ? "text-slate-900"
                              : esHoy
                                ? "text-slate-900"
                                : "text-slate-700"
                          }`}
                        >
                          {d}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>

      {/* Leyenda ajustada */}
      <div className="py-2 px-4 border-t border-slate-100 text-[9px] font-semibold text-slate-500 flex justify-center gap-3 bg-slate-50/50 rounded-b-xl">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-green-50 border border-green-200 rounded-xs"></div>{" "}
          Permisos
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-purple-100 border border-purple-200 rounded-xs"></div>{" "}
          Extraescolares
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-diagonal-extra-asuntos border border-slate-300 rounded-xs"></div>{" "}
          Ambos
        </div>
      </div>
    </Card>
  );
}
