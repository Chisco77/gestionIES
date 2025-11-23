import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogoInsertarReserva } from "../components/DialogoInsertarReserva";
import { DialogoEditarReserva } from "../components/DialogoEditarReserva";
import { useAuth } from "@/context/AuthContext";
import { PanelReservas } from "../../Comunes/PanelReservas";
import { toast } from "sonner";
import { DialogoPlanoEstancia } from "../components/DialogoPlanoEstancia";
import { MapPin } from "lucide-react";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";

import { useReservasUid } from "@/hooks/Reservas/useReservasUid";
import { useAsuntosUid } from "@/hooks/Asuntos/useAsuntosUid";
import { useExtraescolaresUid } from "@/hooks/Extraescolares/useExtraescolaresUid";
import { useEstancias } from "@/hooks/Estancias/useEstancias";
import { useReservasDelDia } from "@/hooks/Reservas/useReservasDelDia";

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
  const [abrirDialogo, setAbrirDialogo] = useState(false);
  const [tipoEstancia, setTipoEstancia] = useState("");

  const [abrirDialogoEditar, setAbrirDialogoEditar] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const [todosLosPeriodos, setTodosLosPeriodos] = useState([]);
  const [estanciasDelGrid, setEstanciasDelGrid] = useState([]);
  const [periodosDB, setPeriodosDB] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
  const [reloadPanel, setReloadPanel] = useState(0);

  const [abrirPlano, setAbrirPlano] = useState(false);
  const [estanciaSeleccionadaPlano, setEstanciaSeleccionadaPlano] =
    useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";
  const { user } = useAuth();
  const uid = user?.username;

  // Hooks
  const { data: periodos } = usePeriodosHorarios();
  const { data: reservasUsuario } = useReservasUid(uid);
  const { data: asuntosPropios } = useAsuntosUid(uid);
  const { data: extraescolares } = useExtraescolaresUid(uid);
  const { data: estancias } = useEstancias();

  const { data: reservasDelDia } = useReservasDelDia(
    selectedDate,
    tipoEstancia
  );

  // Actualizamos gridData cuando cambian reservasDelDia o todosLosPeriodos
  useEffect(() => {
    if (!reservasDelDia) return;

    setEstanciasDelGrid(reservasDelDia.estancias || []);
    setPeriodosDB(
      reservasDelDia.periodos.length
        ? reservasDelDia.periodos
        : todosLosPeriodos
    );

    const newGridData = (
      reservasDelDia.periodos.length
        ? reservasDelDia.periodos
        : todosLosPeriodos
    ).map((p) => {
      const row = {};
      (reservasDelDia.estancias || []).forEach((e) => {
        const reserva = (reservasDelDia.reservas || []).find(
          (r) =>
            parseInt(r.idestancia) === e.id &&
            parseInt(r.idperiodo_inicio) <= p.id &&
            parseInt(r.idperiodo_fin) >= p.id
        );
        row[e.id] = reserva || null;
      });
      return { periodoId: p.id, row };
    });

    setGridData(newGridData);
  }, [reservasDelDia, todosLosPeriodos]);

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

  // ===== Fetch todos los periodos =====
  useEffect(() => {
    const fetchTodosPeriodos = async () => {
      try {
        const res = await fetch(`${API_BASE}/periodos-horarios`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error al obtener todos los periodos");
        const data = await res.json();
        const periodosData =
          data.periodos?.map((p) => ({ ...p, id: parseInt(p.id) })) || [];
        setTodosLosPeriodos(periodosData);
      } catch (err) {
        console.error("[DEBUG] Error en Carga Global Periodos:", err);
        setTodosLosPeriodos([]);
      }
    };
    fetchTodosPeriodos();
  }, [API_BASE]);

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

  const onInsertarSuccess = () => {
    setReloadPanel((v) => v + 1);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CalendarioReservas
          selectedDate={selectedDate}
          onSelectDate={(dateKey) => setSelectedDate(dateKey)}
        />

        <div className="h-full">
          <PanelReservas
            uid={uid}
            reservasEstancias={reservasUsuario || []}
            asuntosPropios={asuntosPropios || []}
            extraescolares={extraescolares || []}
            estancias={estancias || []}
            periodos={periodos || []}
          />
        </div>

        {/* Grid de reservas del día */}
        <div className="mt-2 w-full md:col-span-2">
          <GridReservasEstancias
            tipoEstancia={tipoEstancia}
            setTipoEstancia={setTipoEstancia}
            estanciasDelGrid={estanciasDelGrid}
            gridData={gridData}
            periodosDB={periodosDB}
            selectedDate={selectedDate}
            handleEditarReserva={handleEditarReserva}
            handleDiaClick={handleDiaClick}
            setEstanciaSeleccionadaPlano={setEstanciaSeleccionadaPlano}
            setAbrirPlano={setAbrirPlano}
            uid={uid}
            esReservaFutura={esReservaFutura}
            fechaSeleccionada={selectedDate}

          />
        </div>
      </div>

      <DialogoInsertarReserva
        open={abrirDialogo}
        onClose={() => {
          setAbrirDialogo(false);
          setCeldaSeleccionada(null);
        }}
        fecha={selectedDate}
        idestancia={celdaSeleccionada?.estanciaId}
        onSuccess={onInsertarSuccess}
        periodos={periodosDB}
        descripcionEstancia={
          estanciasDelGrid.find(
            (e) => e.id === parseInt(celdaSeleccionada?.estanciaId)
          )?.descripcion || ""
        }
        inicioSeleccionado={celdaSeleccionada?.inicioId}
        finSeleccionado={celdaSeleccionada?.finId}
      />

      <DialogoPlanoEstancia
        open={abrirPlano}
        onClose={() => setAbrirPlano(false)}
        estancia={estanciaSeleccionadaPlano}
      />

      {reservaSeleccionada && (
        <DialogoEditarReserva
          reserva={reservaSeleccionada}
          open={abrirDialogoEditar}
          onClose={() => {
            setAbrirDialogoEditar(false);
            setReservaSeleccionada(null);
          }}
          onSuccess={onInsertarSuccess}
          periodos={periodosDB}
          descripcionEstancia={
            estanciasDelGrid.find(
              (e) => e.id === parseInt(reservaSeleccionada?.idestancia)
            )?.descripcion || ""
          }
        />
      )}
    </div>
  );
}
