import {  useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { PanelReservas } from "../../Comunes/PanelReservas";
import { toast } from "sonner";


import { CalendarioReservas } from "../components/CalendarioReservas";
import { GridReservasEstancias } from "../components/GridReservasEstancias";

// Formato de fecha YYYY-MM-DD
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Función para determinar si la reserva es futura
const esReservaFutura = (fecha, horaFin = "23:59") => {
  const now = new Date();
  const [hh, mm] = horaFin.split(":").map(Number);
  const reservaDate = new Date(fecha);
  reservaDate.setHours(hh, mm, 0, 0);
  return reservaDate >= now;
};

export function ReservasEstanciasIndex() {
  const [fechaHora] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [currentMonth, setCurrentMonth] = useState(fechaHora.getMonth());
  const [currentYear, setCurrentYear] = useState(fechaHora.getFullYear());


  const [periodosDB, setPeriodosDB] = useState([]);

    useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";
  const { user } = useAuth();
  const uid = user?.username;

  // ===== Handler edición =====
  const handleEditarReserva = (reserva) => {
    if (reserva.uid !== uid) {
      toast.error("Solo puedes modificar tus propias reservas.");
      return;
    }

    const periodoFin = periodosDB.find(
      (p) => parseInt(p.id) === parseInt(reserva.idperiodo_fin)
    );
    const horaFin = periodoFin?.fin;

    if (!horaFin || !esReservaFutura(reserva.fecha, horaFin)) {
      toast.error("No puedes modificar reservas ya finalizadas.");
      return;
    }

    setReservaSeleccionada(reserva);
    setAbrirDialogoEditar(true);
  };

  // ===== Calendar helpers =====
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


  const handleDiaClick = (dateKey, estanciaId, periodoId) => {
    setSelectedDate(dateKey);
    if (estanciaId && periodoId) {
      const periodo = periodosDB.find((p) => p.id === periodoId);
      setCeldaSeleccionada({
        estanciaId,
        periodoId,
        inicioId: periodo?.id,
        finId: periodo?.id,
      });
      setAbrirDialogo(true);
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CalendarioReservas
          selectedDate={selectedDate}
          onSelectDate={(dateKey) => setSelectedDate(dateKey)}
          uid={uid}
        />

        <div className="h-full">
          <PanelReservas uid={uid} />
        </div>

        {/* Grid de reservas del día */}
        <div className="mt-2 w-full md:col-span-2">
          <GridReservasEstancias
            uid={uid}
            selectedDate={selectedDate}
            esReservaFutura={esReservaFutura}
            fechaSeleccionada={selectedDate}
            handleEditarReserva={handleEditarReserva}
            handleDiaClick={handleDiaClick}
          />
        </div>
      </div>
    </div>
  );
}
