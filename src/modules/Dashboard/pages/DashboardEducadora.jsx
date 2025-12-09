import { useEffect, useState } from "react";
import { PanelReservas } from "../../Comunes/PanelReservas";
import { CalendarioExtraescolares } from "@/modules/Extraescolares/components/CalendarioExtraescolares";
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

export function DashboardEducadora() {
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
            Actividades extraescolares del día{" "}
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
