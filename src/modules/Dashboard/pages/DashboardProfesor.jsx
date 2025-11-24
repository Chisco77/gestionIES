import { useEffect, useState } from "react";
import { PanelReservas } from "../../Comunes/PanelReservas";
import { CalendarioExtraescolares } from "@/modules/Extraescolares/components/CalendarioExtraescolares";
import { useAuth } from "@/context/AuthContext";
import { TablaExtraescolares } from "@/modules/Extraescolares/components/TablaExtraescolares";

import {
  Card,
} from "@/components/ui/card";

// Para evitar problemas con el tiempo UTC
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function DashboardProfesor() {
  const [fechaHora, setFechaHora] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(fechaHora.getMonth());
  const [currentYear, setCurrentYear] = useState(fechaHora.getFullYear());
  const { user } = useAuth();
  const uid = user?.username;

  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [mostrarTodas, setMostrarTodas] = useState(false);

  const todayStr = formatDateKey(new Date());

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

  return (
    <div className="p-4">
      {/* Grid con calendario y detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendario */}
        <CalendarioExtraescolares uid={uid} />

        {/* Detalles del día */}
        <PanelReservas uid={uid} />
      </div>
      <Card className="shadow-lg rounded-2xl flex flex-col p-2">
        <TablaExtraescolares user={user} />
      </Card>
    </div>
  );
}
