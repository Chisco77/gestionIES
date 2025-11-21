import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { TablaExtraescolares } from "../components/TablaExtraescolares";
import { toast } from "sonner";
import { DialogoInsertarExtraescolar } from "../components/DialogoInsertarExtraescolar";
import { DialogoEditarExtraescolar } from "../components/DialogoEditarExtraescolar";

import { useCursosLdap } from "@/hooks/useCursosLdap";
import { useDepartamentosLdap } from "@/hooks/useDepartamentosLdap";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";

import { useReservasUid } from "@/hooks/Reservas/useReservasUid";
import { useAsuntosUid } from "@/hooks/Asuntos/useAsuntosUid";
import { useExtraescolaresUid } from "@/hooks/Extraescolares/useExtraescolaresUid";
import { useEstancias } from "@/hooks/Estancias/useEstancias";

import { CalendarioExtraescolares } from "../components/CalendarioExtraescolares";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function ExtraescolaresIndex() {
  const { user } = useAuth();
  const uid = user?.username;
  const todayStr = formatDateKey(new Date());

  // Calendario
  const [fechaHora] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(fechaHora.getMonth());
  const [currentYear, setCurrentYear] = useState(fechaHora.getFullYear());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));

  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const handleEditar = (item) => {
    setEditItem(item);
    setEditOpen(true);
  };

  // ===== Hooks de LDAP =====
  const { data: departamentos } = useDepartamentosLdap();
  const { data: cursos } = useCursosLdap();
  const { data: periodos } = usePeriodosHorarios();

  // ===== Hooks de PanelReservas =====
  const { data: reservasEstancias } = useReservasUid(uid);
  const { data: asuntosPropios } = useAsuntosUid(uid);
  const { data: extraescolares } = useExtraescolaresUid(uid);
  const { data: estancias } = useEstancias();

  // ===== Calendario derivado =====
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

  const extraescolaresPorDia = {};
  (extraescolares || []).forEach((a) => {
    const fechaObj = new Date(a.fecha_inicio);
    const fecha = formatDateKey(fechaObj);
    extraescolaresPorDia[fecha] = (extraescolaresPorDia[fecha] || 0) + 1;
  });

  // ===== Handlers calendario =====
  const handlePrevMonth = () => {
    if (currentMonth === 0) setCurrentYear((y) => y - 1);
    setCurrentMonth((m) => (m === 0 ? 11 : m - 1));
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) setCurrentYear((y) => y + 1);
    setCurrentMonth((m) => (m === 11 ? 0 : m + 1));
  };
  const handleDiaClick = (dateKey) => {
    setSelectedDate(dateKey);
    setDialogoAbierto(true);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendario */}
        <CalendarioExtraescolares
          extraescolares={extraescolares || []}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setDialogoAbierto(true);
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

      {/* Tabla Extraescolares */}
      <Card className="shadow-lg rounded-2xl flex flex-col p-2">
        <CardHeader className="py-1">
          <CardTitle className="text-center text-lg font-semibold p-0">
            Actividades Extraescolares y Complementarias
          </CardTitle>
        </CardHeader>

        <TablaExtraescolares
          data={extraescolares || []}
          user={user}
          onEditar={handleEditar}
          onCambio={() => toast.success("Tabla actualizada")}
        />
      </Card>

      {/* Diálogos Insertar / Editar */}
      {dialogoAbierto && periodos && (
        <DialogoInsertarExtraescolar
          open={dialogoAbierto}
          onClose={() => setDialogoAbierto(false)}
          onGuardado={() => toast.success("Extraescolar guardada")}
          fechaSeleccionada={selectedDate}
          periodos={periodos}
        />
      )}

      {editItem && editOpen && periodos && departamentos && cursos && (
        <DialogoEditarExtraescolar
          open={editOpen}
          onClose={() => setEditOpen(false)}
          actividad={editItem}
          periodos={periodos}
          departamentos={departamentos}
          cursos={cursos}
          onGuardado={() => toast.success("Extraescolar actualizada")}
        />
      )}
    </div>
  );
}
