import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DialogoInsertarReserva } from "../components/DialogoInsertarReserva";

// Evitar problemas con UTC
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function ReservasEstanciasIndex({ uid }) {
  const [fechaHora, setFechaHora] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [currentMonth, setCurrentMonth] = useState(fechaHora.getMonth());
  const [currentYear, setCurrentYear] = useState(fechaHora.getFullYear());
  const [asuntos, setAsuntos] = useState({});
  const [abrirDialogo, setAbrirDialogo] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const todayStr = formatDateKey(new Date());
  const [tipoEstancia, setTipoEstancia] = useState("");
  // Temporal: estancias ejemplo
  const estancias = [
    { nombre: "Aula 1", tipo: "Aula" },
    { nombre: "Aula 2", tipo: "Aula" },
    { nombre: "Lab Física", tipo: "Laboratorio" },
    { nombre: "Lab Química", tipo: "Laboratorio" },
    { nombre: "Almacén General", tipo: "Almacen" },
  ];

  const estanciasFiltradas = tipoEstancia
    ? estancias.filter((e) => e.tipo === tipoEstancia)
    : [];

  const periodos = [
    "1ª Hora",
    "2ª Hora",
    "3ª Hora",
    "Recreo",
    "4ª Hora",
    "5ª Hora",
    "6ª Hora",
  ];

  // Actualizar hora
  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar asuntos propios del mes
  const fetchAsuntos = async () => {
    try {
      const res = await fetch(
        `${API_URL}/db/asuntos-propios?mes=${currentMonth + 1}&anio=${currentYear}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Error al obtener asuntos propios");
      const data = await res.json();
      const map = {};
      data.forEach((a) => {
        map[formatDateKey(new Date(a.fecha))] = a;
      });
      setAsuntos(map);
    } catch (err) {
      console.error(err);
      setAsuntos({});
    }
  };

  useEffect(() => {
    fetchAsuntos();
  }, [currentMonth, currentYear]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startDay = (firstDay + 6) % 7;

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

  const handleDiaClick = (dateKey) => {
    setSelectedDate(dateKey);
    setAbrirDialogo(true);
  };

  const onInsertarSuccess = () => fetchAsuntos();

  return (
    <div className="p-6">
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
                      const dateKey = formatDateKey(
                        new Date(currentYear, currentMonth, d)
                      );
                      const hasAsunto = !!asuntos[dateKey];
                      const isToday = dateKey === todayStr;
                      const isSelected = dateKey === selectedDate;
                      return (
                        <td
                          key={j}
                          className={`p-2 cursor-pointer relative rounded-lg transition 
                            ${isToday ? "bg-blue-200 border-2 border-blue-400" : ""}
                            ${isSelected ? "bg-gray-200" : ""}
                          `}
                          onClick={() => handleDiaClick(dateKey)}
                        >
                          {d}
                          {hasAsunto && (
                            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                              <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Detalles del día */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-center text-xl font-semibold text-blue-600">
              Mis reservas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-center">
            {asuntos[selectedDate] ? (
              <p>
                <strong>Descripción:</strong>{" "}
                {asuntos[selectedDate].descripcion}
              </p>
            ) : (
              <p>No hay asuntos propios</p>
            )}
          </CardContent>
        </Card>

        {/* Tabla de reservas por tipo de estancia */}
        {/* Tabla de reservas por tipo de estancia */}
        <div className="mt-10 w-full">
          <Card className="shadow-lg rounded-2xl w-full">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-center text-xl font-semibold text-blue-600">
                Reservas por Estancia
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Select Tipo de Estancia */}
              <div className="max-w-sm">
                <label className="text-sm font-medium">Tipo de Estancia</label>
                <select
                  value={tipoEstancia}
                  onChange={(e) => setTipoEstancia(e.target.value)}
                  className="border p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Almacen">Almacén</option>
                  <option value="Aula">Aula</option>
                  <option value="Departamento">Departamento</option>
                  <option value="Despacho">Despacho</option>
                  <option value="Infolab">Infolab</option>
                  <option value="Laboratorio">Laboratorio</option>
                  <option value="Otras">Otras</option>
                </select>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-center text-sm">
                  <thead>
                    <tr>
                      <th className="p-2 font-semibold border bg-gray-50">
                        Periodo
                      </th>
                      {estanciasFiltradas.map((e, idx) => (
                        <th
                          key={idx}
                          className="p-2 font-semibold border bg-gray-50"
                        >
                          {e.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periodos.map((p, i) => (
                      <tr key={i}>
                        <td className="p-2 border font-medium bg-gray-50 w-32">
                          {p}
                        </td>
                        {estanciasFiltradas.map((e, j) => (
                          <td key={j} className="p-2 border">
                            {/* Placeholder para estado reserva */}
                            <button className="text-xs px-2 py-1 bg-blue-200 rounded hover:bg-blue-300 transition">
                              Libre
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DialogoInsertarReserva
        open={abrirDialogo}
        onClose={() => setAbrirDialogo(false)}
        fecha={selectedDate}
        onSuccess={onInsertarSuccess}
        uid={uid}
      />
    </div>
  );
}
