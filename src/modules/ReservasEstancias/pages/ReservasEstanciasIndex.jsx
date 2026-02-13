/**
 * Componente: ReservasEstanciasIndex
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Este componente gestiona la vista principal de reservas de estancias,
 * mostrando un calendario, el panel de reservas del usuario y un grid con
 * las reservas de cada estancia para el día seleccionado.
 *
 * Funcionalidades principales:
 *   - Calendario interactivo de reservas con selección de fecha.
 *   - Panel de reservas filtrado por el usuario logueado.
 *   - Grid de reservas por estancia, permitiendo editar reservas futuras.
 *   - Validación de permisos: solo se pueden modificar reservas propias y futuras.
 *
 * Estados internos:
 *   - fechaHora: Date → fecha y hora actual usada para inicializar estados.
 *   - selectedDate: string → fecha seleccionada en formato YYYY-MM-DD.
 *   - currentMonth: number → mes actual mostrado en el calendario.
 *   - currentYear: number → año actual mostrado en el calendario.
 *   - periodosDB: array → periodos de reservas obtenidos de la base de datos.
 *
 * Funciones auxiliares:
 *   - formatDateKey(date): string → formatea un objeto Date a 'YYYY-MM-DD'.
 *   - esReservaFutura(fecha, horaFin): boolean → determina si una reserva
 *       aún no ha finalizado comparando con la fecha y hora actuales.
 *   - handleEditarReserva(reserva): void → valida permisos y reserva futura,
 *       y abre el diálogo de edición si es posible.
 *   - handleDiaClick(dateKey, estanciaId, periodoId): void → selecciona fecha y
 *       celda de reserva para posibles acciones en el grid.
 *
 * Componentes usados:
 *   - CalendarioReservas → calendario visual de reservas.
 *   - PanelReservas → panel de reservas filtrado por usuario.
 *   - GridReservasEstancias → grid de reservas por estancia, interactivo.
 *   - toast (sonner) → notificaciones de error o éxito.
 *
 * Librerías:
 *   - React: useState
 *   - Contexto de autenticación: useAuth
 */

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
