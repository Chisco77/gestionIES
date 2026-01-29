/**
 * DashboardDirectiva.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Componente que renderiza dashboard de inicio para usuarios con perfil directiva.
 *       Muestra calendario interactivo (al pinchar en un dia, se actualiza componente PanelReservasDirectiva),
 *       panel de reservas del usuario a la derecha y panel de reservas de directiva en la zona inferior, que
 *       permite a la directiva gestionar permisos y actividades extraescolares, que requieren de aprobación.
 *
 */

import { useState } from "react";

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

export function DashboardDirectiva() {
  const [fechaHora, setFechaHora] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(fechaHora.getMonth());
  const [currentYear, setCurrentYear] = useState(fechaHora.getFullYear());


  const { user } = useAuth();
  const uid = user?.username;

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


  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    formatDateKey(new Date()),
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
    </div>
  );
}
