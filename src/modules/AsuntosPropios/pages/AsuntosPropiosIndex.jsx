import { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { DialogoInsertarAsunto } from "../components/DialogoInsertarAsunto";
import { DialogoEditarAsunto } from "../components/DialogoEditarAsunto";

import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";

import { useReservasUid } from "@/hooks/Reservas/useReservasUid";
import { usePermisosUid } from "@/hooks/Permisos/usePermisosUid";
import { useExtraescolaresUid } from "@/hooks/Extraescolares/useExtraescolaresUid";
import { useEstancias } from "@/hooks/Estancias/useEstancias";
import { usePermisosMes } from "@/hooks/Permisos/usePermisosMes";
import { useRestriccionesAsuntos } from "@/hooks/useRestricciones";
import { useAsuntosPermitidosUid } from "@/hooks/useAsuntosPermitidosUid";

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

  const [reloadPanel, setReloadPanel] = useState(0);

  // ===== Hooks de PanelReservas =====
  const { data: reservasEstancias } = useReservasUid(uid);
  const { data: asuntosPropios } = usePermisosUid(uid);
  const { data: extraescolares } = useExtraescolaresUid(uid);
  const { data: estancias } = useEstancias();
  const { data: periodos } = usePeriodosHorarios();
  const { data: permisosEspeciales = [] } = useAsuntosPermitidosUid(uid);

  // filtrar solo asuntos propios
  const asuntosPropiosFiltrados = (asuntosPropios || []).filter(
    (a) => Number(a.tipo) === 13
  );

  // ===================== Restricciones desde el hook =====================
  const { data: restricciones = [] } = useRestriccionesAsuntos();

  // Obtener maxConcurrentes desde la fila "maximas_aceptadas"
  const maxConcurrentes =
    restricciones.find((r) => r.descripcion === "concurrentes")?.valor_num ?? 2; // valor por defecto: 2

  // Obtener rangos bloqueados desde "rangos_bloqueados"
  let rangosBloqueados =
    restricciones.find((r) => r.descripcion === "rangos_bloqueados")
      ?.rangos_bloqueados_json?.rango_bloqueado ?? [];

  // Normalizamos a array
  if (!Array.isArray(rangosBloqueados)) {
    try {
      rangosBloqueados =
        JSON.parse(rangosBloqueados || "[]")?.rango_bloqueado ?? [];
    } catch {
      rangosBloqueados = [];
    }
  }

  // === Hook para asuntos del mes ===
  const { data: asuntosPropiosMes = [], refetch: refetchAsuntosMes } =
    usePermisosMes(
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

  // --- Derivados (solo asuntos propios: tipo 13) ---
  const asuntosPorDia = {};

  const asuntosPropiosUsuario = {};

  (asuntosPropiosMes || [])
    .filter(
      (a) => Number(a.tipo) === 13 && Number(a.estado) !== 2 // EXCLUIR RECHAZADOS, no ocupan slot en maximo de peticiones por dia
    )
    .forEach((a) => {
      const fecha = formatDateKey(new Date(a.fecha));
      asuntosPorDia[fecha] = (asuntosPorDia[fecha] || 0) + 1;
      if (a.uid === uid) asuntosPropiosUsuario[fecha] = a;
    });

  // Permisos especiales (autorizaciones)
  const autorizacionesUsuario = {};
  permisosEspeciales.forEach((p) => {
    // Convertimos la fecha a local sin desfase de zona horaria
    const fechaObj = new Date(p.fecha);
    const yyyy = fechaObj.getFullYear();
    const mm = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const dd = String(fechaObj.getDate()).padStart(2, "0");
    const fecha = `${yyyy}-${mm}-${dd}`;

    // Guardamos la autorización en el objeto
    autorizacionesUsuario[fecha] = p;
  });

  // Log para depuración
  console.log(
    "Autorizaciones del usuario (fechas corregidas):",
    autorizacionesUsuario
  );

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
    const tieneAutorizacion = !!autorizacionesUsuario[dateKey]; // true si el usuario está autorizado
    const asuntoExistente = asuntosPropiosUsuario[dateKey]; // ya hay un asunto propio ese día

    // Bloqueado si no tiene autorización y se supera concurrencia
    const bloqueado =
      !tieneAutorizacion && (asuntosPorDia[dateKey] || 0) >= maxConcurrentes;

    if (bloqueado) return;

    setSelectedDate(dateKey);

    if (asuntoExistente) {
      setAsuntoSeleccionado(asuntoExistente);
      setAbrirDialogoEdicion(true);
    } else {
      setAbrirDialogo(true); // abre diálogo para nueva petición
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
          autorizacionesUsuario={autorizacionesUsuario}
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
            asuntosPropios={asuntosPropiosFiltrados || []}
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
