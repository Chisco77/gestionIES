import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
} from "lucide-react";

import { useExtraescolaresAll } from "@/hooks/Extraescolares/useExtraescolaresAll";
import { usePermisosTodos } from "@/hooks/Permisos/usePermisosTodos";

// Tus hooks para alimentar el diálogo de edición
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { useCursosLdap } from "@/hooks/useCursosLdap";
import { useDepartamentosLdap } from "@/hooks/useDepartamentosLdap";

// Diálogo de detalle/edición
import { DialogoEditarExtraescolar } from "@/modules/Extraescolares/components/DialogoEditarExtraescolar";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Modificado para obtener únicamente de Lunes a Viernes (5 días)
const getDaysOfWeekLectivos = (startDate) => {
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }
  return days;
};

export function CalendarioDirectiva({ onSelectDate, disableInsert = false }) {
  const todayStr = formatDateKey(new Date());

  const [referenceDate, setReferenceDate] = useState(new Date());
  const [vista, setVista] = useState("mes");

  // Estados para controlar la apertura del diálogo de edición de extraescolares
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const currentMonth = referenceDate.getMonth();
  const currentYear = referenceDate.getFullYear();

  // Llamadas a hooks de datos
  const { data: extraescolares = [] } = useExtraescolaresAll();
  const { data: permisos = [] } = usePermisosTodos();
  const { data: periodos = [] } = usePeriodosHorarios();
  const { data: cursos = [] } = useCursosLdap();
  const { data: departamentos = [] } = useDepartamentosLdap();

  const [fechaInsertar, setFechaInsertar] = useState(null);

  const periodosMap = useMemo(() => {
    const map = {};
    periodos.forEach((p) => {
      map[p.id] = p.nombre;
    });
    return map;
  }, [periodos]);

  // --- Generar semanas del mes (Original) ---
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

  // --- Días de la semana actual (Filtrado solo laborables) ---
  const diasSemana = useMemo(() => {
    const start = getStartOfWeek(referenceDate);
    return getDaysOfWeekLectivos(start);
  }, [referenceDate]);

  // --- Extraescolares por día ---
  const extraescolaresPorDia = useMemo(() => {
    const map = {};
    extraescolares.forEach((a) => {
      const inicio = new Date(a.fecha_inicio);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(a.fecha_fin);
      fin.setHours(0, 0, 0, 0);

      let d = new Date(inicio);
      while (d <= fin) {
        const fecha = formatDateKey(d);
        if (!map[fecha]) map[fecha] = [];
        map[fecha].push(a);
        d.setDate(d.getDate() + 1);
      }
    });
    return map;
  }, [extraescolares]);

  // --- Permisos por día (Original) ---
  const permisosPorDia = useMemo(() => {
    const map = {};
    permisos.forEach((p) => {
      const inicio = new Date(p.fecha_inicio || p.fecha);
      const fin = new Date(p.fecha_fin || p.fecha_inicio || p.fecha);
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(0, 0, 0, 0);

      let d = new Date(inicio);
      while (d <= fin) {
        const fecha = formatDateKey(d);
        map[fecha] = (map[fecha] || 0) + 1;
        d.setDate(d.getDate() + 1);
      }
    });
    return map;
  }, [permisos]);

  // --- Navegación ---
  const handlePrev = () => {
    setReferenceDate((prev) => {
      const nextDate = new Date(prev);
      if (vista === "mes") {
        nextDate.setMonth(nextDate.getMonth() - 1);
      } else {
        nextDate.setDate(nextDate.getDate() - 7);
      }
      return nextDate;
    });
  };

  const handleNext = () => {
    setReferenceDate((prev) => {
      const nextDate = new Date(prev);
      if (vista === "mes") {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else {
        nextDate.setDate(nextDate.getDate() + 7);
      }
      return nextDate;
    });
  };

  const handleDiaClick = (d) => {
    if (!d) return;

    const dateObj =
      d instanceof Date ? d : new Date(currentYear, currentMonth, d);
    const dateKey = formatDateKey(dateObj);

    if (!disableInsert) {
      setFechaInsertar(dateKey);
    }

    if (onSelectDate) onSelectDate(dateKey);
  };

  // Click directo en la píldora de la actividad semanal
  const handleActividadClick = (e, actividad) => {
    e.stopPropagation(); // ⚡ CRUCIAL
    setEditItem(actividad);
    setEditOpen(true);
  };

  const renderCabeceraTitulo = () => {
    if (vista === "mes") {
      return referenceDate.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
    } else {
      const start = diasSemana[0];
      const end = diasSemana[4]; // Viernes es el índice 4 ahora
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} de ${start.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`;
      }
      return `${start.getDate()} ${start.toLocaleDateString("es-ES", { month: "short" })} - ${end.getDate()} ${end.toLocaleDateString("es-ES", { month: "short", year: "numeric" })}`;
    }
  };

  return (
    <>
      <Card className="shadow-md rounded-xl flex flex-col h-[350px] relative bg-white border border-slate-200">
        {/* Cabecera */}
        <CardHeader className="relative flex flex-row items-center justify-center py-3 px-6 bg-slate-50/80 border-b border-slate-200/60 flex-shrink-0">
          {/* LEYENDA INTEGRADA EN LA IZQUIERDA */}
          <div className="absolute left-6 hidden sm:flex items-center gap-4 text-[10px] font-semibold text-slate-500 z-10">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-green-50 border border-green-200 rounded-xs"></div>
              <span>Permisos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-purple-50 border border-purple-200 rounded-xs"></div>
              <span>Extraescolares</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-diagonal-extra-asuntos border border-slate-300 rounded-xs"></div>
              <span>Ambos</span>
            </div>
          </div>

          {/* Navegador central del mes/semana */}
          <div className="flex items-center gap-2 z-10 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <CardTitle className="capitalize text-xs font-bold text-slate-700 min-w-[120px] text-center tracking-tight">
              {renderCabeceraTitulo()}
            </CardTitle>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Switcher de vista estilo Shadcn Tabs */}
          <div className="absolute right-6 flex bg-slate-200/60 p-0.5 rounded-lg text-[11px] font-semibold z-10 border border-slate-200/40">
            <button
              onClick={() => setVista("mes")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                vista === "mes"
                  ? "bg-white shadow-xs text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Vista Mensual
            </button>
            <button
              onClick={() => setVista("semana")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                vista === "semana"
                  ? "bg-white shadow-xs text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              Vista Semanal
            </button>
          </div>
        </CardHeader>

        {/* El contenido ahora aprovecha todo el espacio inferior sin el footer */}
        <CardContent className="p-3 flex-grow flex items-start justify-center overflow-auto bg-white rounded-b-xl">
          {vista === "mes" ? (
            /* --- VISTA MENSUAL --- */
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
                      if (!d) return <td key={j} className="p-1"></td>;

                      const dateKey = formatDateKey(
                        new Date(currentYear, currentMonth, d)
                      );

                      const actividades = extraescolaresPorDia[dateKey] || [];
                      const numExtra = actividades.length;
                      const numAsuntos = permisosPorDia[dateKey] || 0;
                      const esHoy = dateKey === todayStr;

                      return (
                        <td key={j} className="p-0.5">
                          <div
                            onClick={() => handleDiaClick(d)}
                            className={`
                              w-full aspect-square max-h-[36px] flex items-center justify-center rounded-lg cursor-pointer text-xs transition-all text-slate-700 relative mx-auto
                              ${
                                numExtra && numAsuntos
                                  ? "bg-diagonal-extra-asuntos"
                                  : numExtra
                                    ? "bg-purple-50 border border-purple-100/70 text-purple-950"
                                    : numAsuntos
                                      ? "bg-green-50 border border-green-100/70 text-green-950"
                                      : "hover:bg-slate-50"
                              }
                              ${esHoy ? "ring-2 ring-slate-800 ring-offset-1 bg-slate-100 z-20" : ""}
                            `}
                          >
                            <span
                              className={`
                                relative z-10 flex items-center justify-center w-6 h-6 rounded-md font-semibold text-[11px] transition-all
                                ${numExtra || numAsuntos ? "bg-white/85 shadow-2xs text-slate-900" : "text-slate-700"}
                                ${esHoy ? "font-bold text-slate-900" : ""}
                              `}
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
          ) : (
            /* --- VISTA SEMANAL LECTIVA (Grid de 5 columnas sin Sáb ni Dom) --- */
            <div className="grid grid-cols-5 gap-1.5 h-full w-full overflow-hidden text-slate-700">
              {diasSemana.map((dateObj, index) => {
                const dateKey = formatDateKey(dateObj);
                const actividades = extraescolaresPorDia[dateKey] || [];
                const esHoy = dateKey === todayStr;

                const nombreDia = dateObj.toLocaleDateString("es-ES", {
                  weekday: "short",
                });
                const numeroDia = dateObj.getDate();

                return (
                  <div
                    key={index}
                    onClick={() => handleDiaClick(dateObj)}
                    className={`
                      flex flex-col border rounded-xl p-1.5 cursor-pointer transition-all h-full overflow-hidden
                      ${esHoy ? "border-green-300 bg-green-50/10 shadow-xs" : "border-slate-100 bg-white hover:bg-slate-50/50"}
                    `}
                  >
                    {/* Encabezado del Día */}
                    <div className="flex flex-col items-center pb-1.5 border-b border-slate-100 flex-shrink-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {nombreDia}
                      </span>
                      <span
                        className={`text-xs font-bold mt-0.5 w-5 h-5 flex items-center justify-center rounded-md ${
                          esHoy
                            ? "bg-green-600 text-white shadow-xs"
                            : "text-slate-700 bg-slate-50 border border-slate-200/50"
                        }`}
                      >
                        {numeroDia}
                      </span>
                    </div>

                    {/* Listado de Actividades Suavizado y Elegante */}
                    <div className="flex-grow flex flex-col gap-1 mt-2 overflow-y-auto pr-0.5 scrollbar-none">
                      {actividades.length === 0 ? (
                        <span className="text-[9px] text-slate-300 text-center italic mt-3">
                          —
                        </span>
                      ) : (
                        actividades.map((act, actIdx) => {
                          const tienePeriodos =
                            act.idperiodo_inicio && act.idperiodo_fin;
                          const textoPeriodo = tienePeriodos
                            ? `${periodosMap[act.idperiodo_inicio] || "Ini"} - ${periodosMap[act.idperiodo_fin] || "Fin"}`
                            : "Todo el día";

                          return (
                            <div
                              key={actIdx}
                              onClick={(e) => handleActividadClick(e, act)}
                              className="border-l-[3px] border-purple-200 bg-slate-50 border-y border-r border-slate-200/60 p-1 pl-1.5 text-left flex-shrink-0 rounded-r-md hover:bg-slate-100/80 transition-colors"
                            >
                              <p
                                className="text-[9px] font-semibold text-slate-800 truncate leading-tight"
                                title={act.titulo || act.nombre}
                              >
                                {act.titulo || act.nombre || "Extraescolar"}
                              </p>
                              <p className="text-[8px] text-slate-400 font-medium truncate mt-0.5 tracking-tight">
                                {textoPeriodo}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- DIÁLOGO DE EDICIÓN --- */}
      {editOpen && editItem && (
        <DialogoEditarExtraescolar
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditItem(null);
          }}
          actividad={editItem}
          periodos={periodos}
          departamentos={departamentos}
          cursos={cursos}
        />
      )}
    </>
  );
}
