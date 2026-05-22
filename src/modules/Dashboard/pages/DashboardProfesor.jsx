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
import { PanelReservas } from "../../Comunes/PanelReservas";
import { useAuth } from "@/context/AuthContext";
import { TablaExtraescolares } from "@/modules/Extraescolares/components/TablaExtraescolares";

import { Card } from "@/components/ui/card";
import { CalendarioProfesor } from "../components/CalendarioProfesor";
import { PanelContadoresUsuario } from "@/modules/Comunes/PanelContadoresUsuario";

// Para evitar problemas con el tiempo UTC
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function DashboardProfesor() {
  const { user } = useAuth();
  const uid = user?.username;

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    formatDateKey(new Date())
  );

  return (
    <div className="p-4 space-y-6">
      {" "}
      {/* Añadido space-y para separar bloques */}
      {/* 1. Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[350px]">
        <div className="h-full">
          <CalendarioProfesor
            selectedDate={fechaSeleccionada}
            onSelectDate={(dateKey) => setFechaSeleccionada(dateKey)}
            disableInsert={true}
          />
        </div>
        <div className="h-full overflow-hidden">
          <PanelReservas uid={uid} />
        </div>
      </div>
      {/* 2. Sección Contadores Integrada */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider ml-1">
          Resumen de actividad
        </h3>
        <Card className="p-4 border-slate-200 shadow-sm bg-white/50">
          <PanelContadoresUsuario uid={uid} />
        </Card>
      </div>
      {/* 3. Opcional la tabla de extraescolares */}
      {/* <TablaExtraescolares uid={uid} /> */}
    </div>
  );
}
