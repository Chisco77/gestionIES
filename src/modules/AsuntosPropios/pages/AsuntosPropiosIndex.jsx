import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { DialogoInsertarAsunto } from "../components/DialogoInsertarAsunto";
import { DialogoEditarAsunto } from "../components/DialogoEditarAsunto";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function AsuntosPropiosIndex() {
  const { user } = useAuth();
  const uid = user?.username;
  const todayStr = formatDateKey(new Date());

  const [fechaHora, setFechaHora] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(fechaHora.getMonth());
  const [currentYear, setCurrentYear] = useState(fechaHora.getFullYear());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));

  const [abrirDialogo, setAbrirDialogo] = useState(false);
  const [abrirDialogoEdicion, setAbrirDialogoEdicion] = useState(false);
  const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);

  const [asuntosPropiosMes, setAsuntosPropiosMes] = useState([]);
  const [maxConcurrentes, setMaxConcurrentes] = useState(2);

  const [reloadPanel, setReloadPanel] = useState(0);
  const [rangosBloqueados, setRangosBloqueados] = useState([]);

  // Convertir Date a string YYYY-MM-DD
  const formatKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isRangoBloqueado = (date) => {
    const fechaStr = formatKey(new Date(date));
    return rangosBloqueados.some(
      (r) => fechaStr >= r.inicio && fechaStr <= r.fin
    );
  };

  // --- Función para recargar PanelReservas ---
  const recargarPanel = () => setReloadPanel((r) => r + 1);



  // --- Cálculo calendario ---
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

  // --- Fetch rangos bloqueados ---
  const fetchRangosBloqueados = async () => {
    try {
      const res = await fetch(`${API_BASE}/restricciones/asuntos/rangos`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al cargar rangos bloqueados");
      const data = await res.json();
      setRangosBloqueados(data.rangos || []);
    } catch (err) {
      console.error(err);
      setRangosBloqueados([]);
    }
  };

  // --- Fetch asuntos del mes ---
  const fetchAsuntos = async () => {
    try {
      const inicio = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-01`;
      const fin = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(daysInMonth).padStart(2, "0")}`;

      const res = await fetch(
        `${API_BASE}/asuntos-propios?fecha_inicio=${inicio}&fecha_fin=${fin}`
      );
      const data = await res.json();
      setAsuntosPropiosMes(data.asuntos || []);

      // Restricción concurrentes
      const resRestricciones = await fetch(`${API_BASE}/restricciones/asuntos`);
      const dataRestr = await resRestricciones.json();

      const concurrentes =
        dataRestr?.restricciones?.concurrentes !== undefined
          ? dataRestr.restricciones.concurrentes
          : 2;

      setMaxConcurrentes(concurrentes);
    } catch (err) {
      console.error("Error cargando asuntos propios:", err);
    }
  };

  useEffect(() => {
    fetchAsuntos();
    fetchRangosBloqueados();
  }, [currentMonth, currentYear]);

  // --- Derivados ---
  const asuntosPorDia = {};
  const asuntosPropiosUsuario = {};
  asuntosPropiosMes.forEach((a) => {
    const fechaObj = new Date(a.fecha);
    const fecha = formatDateKey(fechaObj);
    asuntosPorDia[fecha] = (asuntosPorDia[fecha] || 0) + 1;
    if (a.uid === uid) asuntosPropiosUsuario[fecha] = a;
  });

  // --- Handlers calendario ---
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

  const handleDiaClick = (dateKey) => {
    const bloqueado = (asuntosPorDia[dateKey] || 0) >= maxConcurrentes;
    if (bloqueado) return;

    const asuntoExistente = asuntosPropiosUsuario[dateKey];
    setSelectedDate(dateKey);

    if (asuntoExistente) {
      setAsuntoSeleccionado(asuntoExistente);
      setAbrirDialogoEdicion(true);
    } else {
      setAbrirDialogo(true);
    }
  };

  // --- onSuccess para diálogos ---
  const onSuccess = () => {
    fetchAsuntos();
    recargarPanel();
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendario */}
        <Card className="shadow-lg rounded-2xl flex flex-col h-[300px]">
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
                        const isSelected = dateKey === selectedDate;
                        const numAsuntos = asuntosPorDia[dateKey] || 0;
                        const isWeekend =
                          dateObj.getDay() === 0 || dateObj.getDay() === 6;
                        const rangoDelDia = rangosBloqueados.find(
                          (r) => dateKey >= r.inicio && dateKey <= r.fin
                        );
                        const motivoRango = rangoDelDia?.motivo || "";
                        const rangoBloqueado = !!rangoDelDia;
                        const bloqueado =
                          numAsuntos >= maxConcurrentes ||
                          rangoBloqueado ||
                          isWeekend;
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
                                  onClick={() =>
                                    !bloqueado && handleDiaClick(dateKey)
                                  }
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
              {/* Leyenda + Switch */}
              <div className="mt-4 flex justify-center items-center text-sm">
                {/* Leyenda */}
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
            </div>
          </CardContent>
        </Card>

        {/* Panel de asuntos */}
        <div className="h-full">
          <PanelReservas
            uid={uid}
            reloadKey={reloadPanel}
            onReservaModificada={fetchAsuntos}
          />
        </div>
      </div>

      {/* Diálogos */}
      {abrirDialogo && (
        <DialogoInsertarAsunto
          open={abrirDialogo}
          onClose={() => setAbrirDialogo(false)}
          fecha={selectedDate}
          onSuccess={onSuccess}
        />
      )}
      {abrirDialogoEdicion && asuntoSeleccionado && (
        <DialogoEditarAsunto
          open={abrirDialogoEdicion}
          onClose={() => setAbrirDialogoEdicion(false)}
          asunto={asuntoSeleccionado}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
