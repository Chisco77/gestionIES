import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PanelReservasDirectiva } from "@/modules/PanelReservasDirectiva/pages/PanelReservasDirectiva";
import { RelojPeriodo } from "@/modules/Utilidades/components/RelojPeriodo";
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { useAuth } from "@/context/AuthContext";

// Para evitar problemas con el tiempo UTC
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function DashboardDirectiva() {
  const [fechaHora, setFechaHora] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [currentMonth, setCurrentMonth] = useState(fechaHora.getMonth());
  const [currentYear, setCurrentYear] = useState(fechaHora.getFullYear());
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // Estado para modal de denegación
  const [denegarAbierto, setDenegarAbierto] = useState(false);
  const [motivoDenegacion, setMotivoDenegacion] = useState("");
  const [solicitudActual, setSolicitudActual] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);
  const [periodosDB, setPeriodosDB] = useState([]);
  const [todosLosPeriodos, setTodosLosPeriodos] = useState([]);

  const { user } = useAuth();
  const uid = user?.username;

  // --- Cargar todos los periodos ---
  useEffect(() => {
    const fetchTodosPeriodos = async () => {
      try {
        const res = await fetch(`${API_BASE}/periodos-horarios`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error al obtener todos los periodos");
        const data = await res.json();
        const periodosData =
          data.periodos?.map((p) => ({ ...p, id: parseInt(p.id) })) || [];
        setTodosLosPeriodos(periodosData);
        setPeriodosDB(periodosData);
      } catch (err) {
        console.error("[DEBUG] Error en carga de periodos:", err);
        setTodosLosPeriodos([]);
        setPeriodosDB([]);
      }
    };
    fetchTodosPeriodos();
  }, []);

  // --- Actualizar hora cada segundo ---
  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = formatDateKey(new Date());

  // Datos de ejemplo
  const reservas = {
    [formatDateKey(new Date(2025, 9, 1))]: {
      aulas: ["Aula 101", "Aula 205"],
      armarios: ["Armario 3"],
      asuntos: false,
    },
    [formatDateKey(new Date(2025, 9, 2))]: {
      aulas: [],
      armarios: ["Armario 5"],
      asuntos: true,
    },
    [formatDateKey(new Date(2025, 9, 5))]: {
      aulas: ["Aula 110"],
      armarios: [],
      asuntos: false,
    },
  };

  // Datos de ejemplo para tablas
  const asuntosPendientes = [
    { id: 1, profesor: "María López", fechaInicio: "2025-10-10", dias: 2 },
    { id: 2, profesor: "Juan Pérez", fechaInicio: "2025-10-15", dias: 1 },
  ];

  const extraescolaresPendientes = [
    {
      id: 1,
      profesor: "Ana García",
      fechaInicio: "2025-11-02",
      dias: 3,
      fechaFin: "2025-11-04",
    },
    {
      id: 2,
      profesor: "Carlos Ruiz",
      fechaInicio: "2025-11-20",
      dias: 2,
      fechaFin: "2025-11-21",
    },
  ];

  const getDateKey = (y, m, d) => formatDateKey(new Date(y, m, d));

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=domingo
  const startDay = (firstDay + 6) % 7; // ajustar para que empiece en lunes

  const weeks = [];
  let day = 1 - startDay;

  while (day <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      if (day > 0 && day <= daysInMonth) {
        week.push(day);
      } else {
        week.push(null);
      }
      day++;
    }
    weeks.push(week);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const selectedInfo = reservas[selectedDate] || {
    aulas: [],
    armarios: [],
    asuntos: false,
  };

  const handleDenegar = (solicitud) => {
    setSolicitudActual(solicitud);
    setMotivoDenegacion("");
    setDenegarAbierto(true);
  };

  const confirmarDenegacion = () => {
    console.log("Denegada:", solicitudActual, "Motivo:", motivoDenegacion);
    setDenegarAbierto(false);
  };

  return (
    <div className="p-4">
      {/* Encabezado reloj */}
      <div className="mb-1">
        <RelojPeriodo periodos={periodosDB} />
      </div>

      {/* Grid con calendario y detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        const dateKey = getDateKey(
                          currentYear,
                          currentMonth,
                          d
                        );
                        const info = reservas[dateKey] || {};
                        const isToday = dateKey === todayStr;
                        const isSelected = dateKey === selectedDate;
                        return (
                          <td
                            key={j}
                            className={`relative p-1 rounded-lg transition-all align-top ${
                              isToday ? "border-2 border-blue-400" : ""
                            } ${isSelected ? "bg-gray-200" : ""} ${
                              info.asuntos ? "bg-red-200" : ""
                            }`}
                            onClick={() => setSelectedDate(dateKey)}
                          >
                            {d}
                            {/* Marcadores */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1">
                              {info.aulas && info.aulas.length > 0 && (
                                <div className="w-6 h-1 bg-green-500 rounded"></div>
                              )}
                              {info.armarios && info.armarios.length > 0 && (
                                <div className="w-6 h-1 bg-blue-500 rounded"></div>
                              )}
                            </div>
                          </td>
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

        {/* Detalles del día */}
        <PanelReservas
          uid={uid}
          onClickReserva={(r) => console.log("Editar reserva:", r)}
        />
      </div>

      {/* Tablas de peticiones pendientes */}
      <div className="mt-2 space-y-8">
        {/* Se pasa `reloadKey` a PanelReservasDirectiva */}
        <PanelReservasDirectiva reloadKey={reloadKey} />
      </div>

      {/* Modal de denegación */}
      <Dialog open={denegarAbierto} onOpenChange={setDenegarAbierto}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Motivo de la denegación</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Escribe aquí el motivo..."
            value={motivoDenegacion}
            onChange={(e) => setMotivoDenegacion(e.target.value)}
          />
          <DialogFooter className="mt-4">
            <Button
              variant="secondary"
              onClick={() => setDenegarAbierto(false)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmarDenegacion}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
