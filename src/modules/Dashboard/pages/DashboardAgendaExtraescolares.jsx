/**
 * DashboardProfesor.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Componente que renderiza dashboard de inicio para usuarios con perfil profesor.
 *       Muestra calendario a la izquierda, panel de reservas del usuario a la derecha y
 *       tabla con detalles de actividades extraescolares en la parte inferior.
 *
 */

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { TablaExtraescolares } from "@/modules/Extraescolares/components/TablaExtraescolares";

import { Card } from "@/components/ui/card";
import { CalendarioAgendaExtraescolares } from "../components/CalendarioAgendaExtraescolares";
import { GraduationCap } from "lucide-react";

// Para evitar problemas con el tiempo UTC
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function DashboardAgendaExtraescolares() {
  const { user } = useAuth();
  const uid = user?.username;

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    formatDateKey(new Date())
  );

  return (
    <div className="p-4 space-y-6">
      {/* 1. Grid Principal */}
      <div className="flex justify-center w-full mt-6">
        <div className="w-full max-w-[700px]">
          <CalendarioAgendaExtraescolares
            selectedDate={fechaSeleccionada}
            onSelectDate={(dateKey) => setFechaSeleccionada(dateKey)}
            disableInsert={true}
          />
        </div>
      </div>
      {/* Indicador de interacción */}
      <div className="flex justify-center mt-2 mb-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm text-[10px] text-slate-500 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></div>
          <span>
            Haz clic en cualquier fecha para consultar el detalle de la agenda del día
          </span>
        </div>
      </div>
      {/* 2. Tabla de extraescolares */}
      <Card className="shadow-md rounded-2xl flex flex-col mt-6 border border-slate-200 bg-white overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200/60 flex items-center justify-center gap-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Agenda de extraescolares
          </h2>
          <span className="text-[11px] font-medium text-slate-500 bg-white px-3 py-1 rounded-md border shadow-sm">
            {new Date(fechaSeleccionada).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="p-1">
          <TablaExtraescolares user={user} fecha={fechaSeleccionada} />
        </div>
      </Card>
    </div>
  );
}
