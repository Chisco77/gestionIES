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

/*import { useState } from "react";

import { PanelReservasDirectiva } from "@/modules/PanelReservasDirectiva/pages/PanelReservasDirectiva";
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { useAuth } from "@/context/AuthContext";

import { CalendarioDirectiva } from "../components/CalendarioDirectiva";
import { useOutletContext } from "react-router-dom"; // ✅ IMPORT NECESARIO

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
    formatDateKey(new Date())
  );
  const { tabActivo, setTabActivo } = useOutletContext(); // ✅ aquí recibimos el estado compartido

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CalendarioDirectiva
          selectedDate={fechaSeleccionada}
          onSelectDate={(dateKey) => setFechaSeleccionada(dateKey)}
          disableInsert={true}
        />

        <PanelReservas uid={uid} />
      </div>

      <div className="mt-2 space-y-8">
        <PanelReservasDirectiva
          user={user}
          fecha={fechaSeleccionada}
          tabActivo={tabActivo}
          setTabActivo={setTabActivo}
        />
      </div>
    </div>
  );
}
*/
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Calendar, UserCircle } from "lucide-react";

import { PanelReservasDirectiva } from "@/modules/PanelReservasDirectiva/pages/PanelReservasDirectiva";
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { useAuth } from "@/context/AuthContext";
import { CalendarioDirectiva } from "../components/CalendarioDirectiva";
import { useOutletContext } from "react-router-dom";
import { PanelContadoresUsuario } from "@/modules/Comunes/PanelContadoresUsuario";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function DashboardDirectiva() {
  const { user } = useAuth();
  const uid = user?.username;

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    formatDateKey(new Date())
  );

  // Recibimos el estado compartido del layout para las tablas de gestión
  const { tabActivo, setTabActivo } = useOutletContext();

  return (
    <div className="p-6 bg-slate-50/30 min-h-screen">
      <Tabs defaultValue="gestion" className="space-y-6">
        {/* Selector de Pestañas Corregido y Unificado */}
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-2 w-full max-w-md h-9 p-1 bg-slate-100 border border-slate-200/60 shadow-3xs rounded-xl">
            <TabsTrigger
              value="gestion"
              className="flex items-center justify-center gap-2 h-full text-xs font-semibold rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500 data-[state=active]:text-slate-900" />
              Gestión del Centro
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              className="flex items-center justify-center gap-2 h-full text-xs font-semibold rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs transition-all"
            >
              <UserCircle className="w-3.5 h-3.5 text-slate-500 data-[state=active]:text-slate-900" />
              Mi Actividad Personal
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- PESTAÑA 1: GESTIÓN INTEGRADA (Calendario + Tablas Ligadas) --- */}
        <TabsContent
          value="gestion"
          className="space-y-6 animate-in fade-in duration-200 outline-none"
        >
          {/* Bloque Superior: El Calendario Directivo */}
          <CalendarioDirectiva
            selectedDate={fechaSeleccionada}
            onSelectDate={(dateKey) => setFechaSeleccionada(dateKey)}
            disableInsert={true}
          />

          {/* Bloque Inferior: Panel de Reservas de la Directiva */}
          <PanelReservasDirectiva
            user={user}
            fecha={fechaSeleccionada}
            tabActivo={tabActivo}
            setTabActivo={setTabActivo}
          />
        </TabsContent>

        {/* --- PESTAÑA 2: MIS COSAS --- */}
        <TabsContent
          value="personal"
          className="space-y-4 animate-in fade-in duration-200 outline-none"
        >
          <div className="p-2 h-[350px]" >
            <PanelReservas uid={uid} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider ml-1">
              Resumen de actividad
            </h3>
            <Card className="p-4 border-slate-200 shadow-sm bg-white/50">
              <PanelContadoresUsuario uid={uid} />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
