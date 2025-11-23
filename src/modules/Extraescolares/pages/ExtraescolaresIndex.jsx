import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { TablaExtraescolares } from "../components/TablaExtraescolares";
import { toast } from "sonner";

import { useCursosLdap } from "@/hooks/useCursosLdap";
import { useDepartamentosLdap } from "@/hooks/useDepartamentosLdap";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";

import { useReservasUid } from "@/hooks/Reservas/useReservasUid";
import { useAsuntosUid } from "@/hooks/Asuntos/useAsuntosUid";
import { useExtraescolaresUid } from "@/hooks/Extraescolares/useExtraescolaresUid";
import { useExtraescolaresAll } from "@/hooks/Extraescolares/useExtraescolaresAll";

import { useEstancias } from "@/hooks/Estancias/useEstancias";

import { CalendarioExtraescolares } from "../components/CalendarioExtraescolares";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
// IMPORTANTE: solo mantienes DialogoInsertarExtraescolar
import { DialogoInsertarExtraescolar } from "../components/DialogoInsertarExtraescolar";

export function ExtraescolaresIndex() {
  const { user } = useAuth();
  const uid = user?.username;

  // Estado SOLO para insertar
  const [dialogoInsertarAbierto, setDialogoInsertarAbierto] = useState(false);
  const [fechaInsertar, setFechaInsertar] = useState(null);

  // Hooks
  const { data: departamentos } = useDepartamentosLdap();
  const { data: cursos } = useCursosLdap();
  const { data: periodos } = usePeriodosHorarios();
  const { data: extraescolares } = useExtraescolaresUid(uid);
  const { data: extraescolaresTodas } = useExtraescolaresAll();
  const { data: reservasEstancias } = useReservasUid(uid);
  const { data: asuntosPropios } = useAsuntosUid(uid);
  const { data: estancias } = useEstancias();

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CalendarioExtraescolares
          extraescolares={extraescolares || []}
          onSelectDate={(fecha) => {
            setFechaInsertar(fecha);
            setDialogoInsertarAbierto(true);
          }}
        />

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

      <Card className="shadow-lg rounded-2xl flex flex-col p-2">
        <CardHeader className="py-1">
          <CardTitle className="text-center text-lg font-semibold p-0">
            Actividades Extraescolares y Complementarias
          </CardTitle>
        </CardHeader>

        <TablaExtraescolares
          data={extraescolaresTodas || []}
          user={user}
          periodos={periodos}
          cursos={cursos}
          departamentos={departamentos}
        />
      </Card>

      {/* Diálogo Insertar */}
      {dialogoInsertarAbierto && (
        <DialogoInsertarExtraescolar
          open={dialogoInsertarAbierto}
          onClose={() => setDialogoInsertarAbierto(false)}
          fechaSeleccionada={fechaInsertar}
          periodos={periodos}
          cursos={cursos}
          departamentos={departamentos}
        />
      )}
    </div>
  );
}
