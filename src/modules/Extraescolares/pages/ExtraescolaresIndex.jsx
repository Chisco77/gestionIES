import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PanelReservas } from "@/modules/Comunes/PanelReservas";
import { TablaExtraescolares } from "../components/TablaExtraescolares";
import { toast } from "sonner";
import { DialogoInsertarExtraescolar } from "../components/DialogoInsertarExtraescolar";
import { DialogoEditarExtraescolar } from "../components/DialogoEditarExtraescolar";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

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

  const [extraescolares, setExtraescolares] = useState([]);
  // señales para recarga de panel de reservas y tabla de extraescolares
  const [reloadTabla, setReloadTabla] = useState(0);
  const [reloadPanel, setReloadPanel] = useState(0);

  const recargarTabla = () => setReloadTabla((r) => r + 1);
  const recargarPanelReservas = () => setReloadPanel((r) => r + 1);

  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  // --- Calendario dinámico ---
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startDay = (firstDay + 6) % 7; // lunes=0
  const weeks = [];

  // carga de datos en este componente, el padre.
  const [periodos, setPeriodos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const handleEditar = (item) => {
    console.log("🟢 Editar actividad seleccionada:", item);
    console.log("🟢 Periodos disponibles:", periodos);
    console.log("🟢 Departamentos disponibles:", departamentos);
    console.log("🟢 Cursos disponibles:", cursos);
    setEditItem(item);
    setEditOpen(true);
  };

  let day = 1 - startDay;
  while (day <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day > 0 && day <= daysInMonth ? day : null);
      day++;
    }
    weeks.push(week);
  }

  // --- Fetch extraescolares ---
  const fetchExtraescolares = async () => {
    try {
      const res = await fetch(`${API_BASE}/extraescolares/enriquecidos`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error cargando extraescolares");
      const data = await res.json();
      setExtraescolares(data.extraescolares || []);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando actividades extraescolares");
    }
  };

  const recargarPanel = () => setReloadPanel((r) => r + 1);

  // --- Calendario derivado ---
  const extraescolaresPorDia = {};
  extraescolares.forEach((a) => {
    const fechaObj = new Date(a.fecha_inicio);
    const fecha = formatDateKey(fechaObj);
    extraescolaresPorDia[fecha] = (extraescolaresPorDia[fecha] || 0) + 1;
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

  const handleDiaClick = (dateKey) => {
    setSelectedDate(dateKey);
    setDialogoAbierto(true);
  };

  useEffect(() => {
    fetchExtraescolares();
  }, []);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    // Cargar departamentos
    fetch(`${API_URL}/ldap/grupos?groupType=school_department`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) =>
        setDepartamentos(
          data
            .map((d) => ({ gidNumber: d.gidNumber, nombre: d.cn }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
        )
      )
      .catch(() => setDepartamentos([]));

    // Cargar cursos
    fetch(`${API_URL}/ldap/grupos?groupType=school_class`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) =>
        setCursos(
          data
            .map((c) => ({ gid: c.gidNumber, nombre: c.cn }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
        )
      )
      .catch(() => setCursos([]));
  }, []);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    const fetchPeriodos = async () => {
      const res = await fetch(`${API_BASE}/periodos-horarios`, {
        credentials: "include",
      });
      const data = await res.json();
      setPeriodos(
        (data.periodos || []).map((p) => ({
          id: Number(p.id),
          nombre: p.nombre,
        }))
      );
    };
    fetchPeriodos();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendario */}
        <Card className="shadow-lg rounded-2xl flex flex-col h-[350px]">
          <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
            <button onClick={handlePrevMonth}>
              <ChevronLeft className="w-6 h-6" />
            </button>
            <CardTitle>
              {new Date(currentYear, currentMonth).toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
            <button onClick={handleNextMonth}>
              <ChevronRight className="w-6 h-6" />
            </button>
          </CardHeader>
          <CardContent className="p-2 flex-grow flex items-start justify-center overflow-auto">
            <div className="w-full">
              <table className="w-full border-collapse text-center align-top">
                <thead>
                  <tr>
                    {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                      <th key={d} className="p-1 font-medium">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="align-top">
                  {weeks.map((week, i) => (
                    <tr key={i}>
                      {week.map((d, j) => {
                        if (!d) return <td key={j} className="p-2"></td>;
                        const dateObj = new Date(currentYear, currentMonth, d);
                        const dateKey = formatDateKey(dateObj);
                        const numExtra = extraescolaresPorDia[dateKey] || 0;
                        const esHoy = dateKey === todayStr;

                        return (
                          <td
                            key={j}
                            onClick={() => handleDiaClick(dateKey)}
                            className={`
    p-1 rounded-lg cursor-pointer transition-all
    ${numExtra ? "bg-green-100" : ""}
    ${esHoy ? "border-2 border-purple-300" : "border border-transparent"}
    hover:bg-purple-200
  `}
                          >
                            {d}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Panel Reservas */}
        <div className="h-full">
          <PanelReservas
            uid={uid}
            reloadKey={reloadPanel}
            onReservaModificada={fetchExtraescolares}
          />
        </div>
      </div>

      <TablaExtraescolares
        data={extraescolares}
        user={user}
        onEditar={handleEditar}
        onCambio={() => {
          fetchExtraescolares();
          recargarTabla();
        }}
      />

      {dialogoAbierto && periodos && periodos.length > 0 && (
        <DialogoInsertarExtraescolar
          open={dialogoAbierto}
          onClose={() => setDialogoAbierto(false)}
          onGuardado={(actividad) => {
            fetchExtraescolares(); // recarga tabla
            recargarPanelReservas(); // recarga panel
          }}
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
          onGuardado={(actividad) => {
            fetchExtraescolares(); // recarga tabla
            recargarPanelReservas(); // recarga panel
          }}
        />
      )}
    </div>
  );
}
