import { useEffect, useState } from "react";

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
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { useAuth } from "@/context/AuthContext";

import { CalendarioDirectiva } from "../components/CalendarioDirectiva";

// Para evitar problemas con el tiempo UTC
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function DashboardAdmin() {
  const [fechaHora, setFechaHora] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [currentMonth, setCurrentMonth] = useState(fechaHora.getMonth());
  const [currentYear, setCurrentYear] = useState(fechaHora.getFullYear());
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // Estado para modal de denegación
  const [denegarAbierto, setDenegarAbierto] = useState(false);
  const [motivoDenegacion, setMotivoDenegacion] = useState("");
  const [solicitudActual, setSolicitudActual] = useState(null);

  const { user } = useAuth();
  const uid = user?.username;

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

  const handleDenegar = (solicitud) => {
    setSolicitudActual(solicitud);
    setMotivoDenegacion("");
    setDenegarAbierto(true);
  };

  const confirmarDenegacion = () => {
    setDenegarAbierto(false);
  };
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    formatDateKey(new Date())
  );

  return (
    <div className="p-4">
      {/* Grid con calendario y detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendario */}
        <CalendarioDirectiva
          selectedDate={fechaSeleccionada}
          onSelectDate={(dateKey) => setFechaSeleccionada(dateKey)}
          disableInsert={true}
        />

        {/* Detalles del día. Si detecto cambio dentro del PanelReservas, notifico para recargar PanelReservasDirectiva y tener datos actualizados.*/}
        <PanelReservas uid={uid} />
      </div>

      {/* Tablas de peticiones pendientes */}
      <div className="mt-2 space-y-8">
        {/* */}
        <PanelReservasDirectiva user={user} fecha={fechaSeleccionada} />
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
