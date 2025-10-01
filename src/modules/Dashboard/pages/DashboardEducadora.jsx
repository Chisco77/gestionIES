import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Para evitar problemas con el tiempo UTC
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function DashboardEducadora() {
  const [fechaHora, setFechaHora] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [currentMonth, setCurrentMonth] = useState(fechaHora.getMonth());
  const [currentYear, setCurrentYear] = useState(fechaHora.getFullYear());

  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [mostrarTodas, setMostrarTodas] = useState(false);

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

  return (
    <div className="p-6">
      {/* Encabezado con hora y fecha */}
      <h1 className="text-4xl font-bold text-blue-400 text-center mb-8">
        {fechaHora.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}{" "}
        -{" "}
        {fechaHora.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </h1>

      {/* Grid con calendario y detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendario */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
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
          <CardContent>
            <table className="w-full border-collapse text-center">
              <thead>
                <tr>
                  {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                    <th key={d} className="p-2 font-medium">
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
                      const dateKey = getDateKey(currentYear, currentMonth, d);
                      const info = reservas[dateKey] || {};
                      const isToday = dateKey === todayStr;
                      const isSelected = dateKey === selectedDate;
                      return (
                        <td
                          key={j}
                          className={`p-2 cursor-pointer relative rounded-lg transition ${
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
            <div className="mt-4 flex justify-between items-center text-sm">
              {/* Leyenda */}
              <div className="flex gap-6">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1 bg-green-500 rounded"></div> Aula
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1 bg-blue-500 rounded"></div> Armario
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-200 rounded"></div> Asuntos
                  propios
                </div>
              </div>

              {/* Interruptor */}
              <div className="flex items-center gap-2">
                <Label htmlFor="switch-reservas" className="text-sm">
                  Mostrar todas las reservas
                </Label>
                <Switch
                  id="switch-reservas"
                  checked={mostrarTodas}
                  onCheckedChange={setMostrarTodas}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles del día */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-center text-xl font-semibold text-blue-600">
              {new Date(selectedDate).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-center">
            <p>
              <strong>Aulas reservadas:</strong>{" "}
              {selectedInfo.aulas.length > 0
                ? selectedInfo.aulas.join(", ")
                : "Ninguna"}
            </p>
            <p>
              <strong>Armarios reservados:</strong>{" "}
              {selectedInfo.armarios.length > 0
                ? selectedInfo.armarios.join(", ")
                : "Ninguno"}
            </p>
            <p>
              <strong>Asuntos propios:</strong>{" "}
              {selectedInfo.asuntos ? "Sí" : "No"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
