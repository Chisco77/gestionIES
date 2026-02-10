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
    <div className="p-4">
      {/* Grid con calendario y detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendario */}

        <CalendarioProfesor
          selectedDate={fechaSeleccionada}
          onSelectDate={(dateKey) => setFechaSeleccionada(dateKey)}
          disableInsert={true}
        />

        {/* Detalles del día */}
        <PanelReservas uid={uid} />
      </div>

      {/* Card de la tabla de extraescolares */}
      <Card className="shadow-lg rounded-2xl flex flex-col p-2 mt-6">
        <div className="px-4 py-2 border-b">
          <h2 className="text-lg font-semibold text-center">
            Agenda de extraescolares del {" "}
            {new Date(fechaSeleccionada).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </h2>
        </div>
        <TablaExtraescolares user={user} fecha={fechaSeleccionada} />
      </Card>
    </div>
  );
}
