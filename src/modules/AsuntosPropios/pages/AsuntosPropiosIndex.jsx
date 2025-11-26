import { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { DialogoInsertarAsunto } from "../components/DialogoInsertarAsunto";
import { DialogoEditarAsunto } from "../components/DialogoEditarAsunto";

import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";

import { useReservasUid } from "@/hooks/Reservas/useReservasUid";
import { useAsuntosUid } from "@/hooks/Asuntos/useAsuntosUid";
import { useExtraescolaresUid } from "@/hooks/Extraescolares/useExtraescolaresUid";
import { useEstancias } from "@/hooks/Estancias/useEstancias";
import { useAsuntosMes } from "@/hooks/Asuntos/useAsuntosMes";

import { CalendarioAsuntos } from "../components/CalendarioAsuntos";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

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

  const [maxConcurrentes, setMaxConcurrentes] = useState(2);
  const [reloadPanel, setReloadPanel] = useState(0);
  const [rangosBloqueados, setRangosBloqueados] = useState([]);

  // ===== Hooks de PanelReservas =====
  const { data: reservasEstancias } = useReservasUid(uid);
  const { data: asuntosPropios } = useAsuntosUid(uid);
  const { data: extraescolares } = useExtraescolaresUid(uid);
  const { data: estancias } = useEstancias();
  const { data: periodos } = usePeriodosHorarios();

  // === Hook para asuntos del mes ===
  const { data: asuntosPropiosMes = [], refetch: refetchAsuntosMes } =
    useAsuntosMes(
      currentYear,
      currentMonth + 1 // el hook espera mes 1-12
    );

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

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    fetch(`${API_URL}/db/restricciones/asuntos/rangos`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setRangosBloqueados(data.rangos || []))
      .catch((err) =>
        console.error("Error obteniendo rangos bloqueados:", err)
      );
  }, []);

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
    refetchAsuntosMes(); // actualizamos el mes usando el hook
    recargarPanel(); // recargamos el panel
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CalendarioAsuntos
          currentMonth={currentMonth}
          currentYear={currentYear}
          todayStr={todayStr}
          selectedDate={selectedDate}
          asuntosPorDia={asuntosPorDia}
          asuntosPropiosUsuario={asuntosPropiosUsuario}
          rangosBloqueados={rangosBloqueados}
          maxConcurrentes={maxConcurrentes}
          onDiaClick={handleDiaClick}
          onMonthChange={({ newMonth, newYear }) => {
            setCurrentMonth(newMonth);
            setCurrentYear(newYear);
          }}
        />

        {/* Panel Reservas */}
        <div className="h-full">
          <PanelReservas
            uid={uid}
            reservasEstancias={reservasEstancias || []}
            asuntosPropios={asuntosPropios || []}
            extraescolares={extraescolares || []}
            estancias={estancias || []}
            periodos={periodos || []}
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
