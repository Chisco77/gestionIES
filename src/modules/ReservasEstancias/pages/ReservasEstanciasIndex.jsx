import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DialogoInsertarReserva } from "../components/DialogoInsertarReserva";
import { DialogoEditarReserva } from "../components/DialogoEditarReserva";
import { useAuth } from "@/context/AuthContext";
import { PanelReservas } from "../../Comunes/PanelReservas";
import { toast } from "sonner";
import { esReservaFutura } from "../../../utils/esReservaFutura";
import { DialogoPlanoEstancia } from "../components/DialogoPlanoEstancia";
import { MapPin } from "lucide-react";

// Formato de fecha YYYY-MM-DD
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function ReservasEstanciasIndex() {
  const [fechaHora, setFechaHora] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [currentMonth, setCurrentMonth] = useState(fechaHora.getMonth());
  const [currentYear, setCurrentYear] = useState(fechaHora.getFullYear());
  const [abrirDialogo, setAbrirDialogo] = useState(false);
  const [tipoEstancia, setTipoEstancia] = useState("");
  // Estados de diálogo edición
  const [abrirDialogoEditar, setAbrirDialogoEditar] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const [todosLosPeriodos, setTodosLosPeriodos] = useState([]);
  const [estanciasDelGrid, setEstanciasDelGrid] = useState([]);
  const [periodosDB, setPeriodosDB] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [reservasFuturas, setReservasFuturas] = useState([]);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
  const [reloadPanel, setReloadPanel] = useState(0);
  const [abrirPlano, setAbrirPlano] = useState(false);
  const [estanciaSeleccionadaPlano, setEstanciaSeleccionadaPlano] =
    useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";
  const todayStr = formatDateKey(new Date());
  const { user } = useAuth();
  const uid = user?.username;

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

  // Cargar TODOS los periodos
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

  // Fetch reservas para el grid diario
  const fetchReservasDia = async (fecha, tipo) => {
    if (!tipo) {
      setPeriodosDB(todosLosPeriodos);
      setReservas([]);
      setEstanciasDelGrid([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/reservas-estancias/filtradas?fecha=${fecha}&tipoestancia=${tipo}&reservable=true`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Error al obtener reservas del día");
      const data = await res.json();

      if (data.ok) {
        const periodosCargados =
          data.periodos?.map((p) => ({ ...p, id: parseInt(p.id) })) ||
          todosLosPeriodos;
        setPeriodosDB(periodosCargados);
        setReservas(data.reservas || []);
        const estanciasData =
          data.estancias?.map((e) => ({ ...e, tipo: e.tipoestancia })) || [];
        setEstanciasDelGrid(estanciasData);
      } else {
        setPeriodosDB(todosLosPeriodos);
        setReservas([]);
        setEstanciasDelGrid([]);
      }
    } catch (err) {
      console.error("[DEBUG] Error al obtener reservas del día:", err);
      setPeriodosDB(todosLosPeriodos);
      setReservas([]);
      setEstanciasDelGrid([]);
    }
  };

  const fetchReservasFuturas = async () => {
    if (!uid) return;
    try {
      const res = await fetch(
        `${API_BASE}/reservas-estancias/filtradas?desde=${todayStr}&uid=${uid}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Error al obtener reservas futuras");
      const data = await res.json();
      const reservasData = data.ok ? data.reservas : [];
      setReservasFuturas(reservasData);
    } catch (err) {
      console.error(err);
      setReservasFuturas([]);
    }
  };

  useEffect(() => {
    if (todosLosPeriodos.length > 0 || tipoEstancia === "") {
      fetchReservasDia(selectedDate, tipoEstancia);
    }
  }, [selectedDate, tipoEstancia, todosLosPeriodos]);

  useEffect(() => {
    fetchReservasFuturas();
  }, [uid]);

  // ********** LÓGICA DEL CALENDARIO Y GRID **********

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
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
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

  const buildGridData = () => {
    return periodosDB.map((p) => {
      const row = {};
      estanciasDelGrid.forEach((e) => {
        const reserva = reservas.find(
          (r) =>
            parseInt(r.idestancia) === e.id &&
            parseInt(r.idperiodo_inicio) <= p.id &&
            parseInt(r.idperiodo_fin) >= p.id
        );
        row[e.id] = reserva || null;
      });
      return { periodoId: p.id, row };
    });
  };

  const gridData = buildGridData();

  const onInsertarSuccess = () => {
    fetchReservasDia(selectedDate, tipoEstancia);
    fetchReservasFuturas();
    setReloadPanel((v) => v + 1);
  };

  return (
    <div className="p-4">


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendario */}
        <Card className="shadow-lg rounded-2xl h-[300px] flex flex-col">
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

          <CardContent className="p-2 flex-grow flex items-start justify-center">
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
                    <tr key={i} className="align-top">
                      {week.map((d, j) => {
                        if (!d) return <td key={j} className="p-2"></td>;
                        const dateKey = formatDateKey(
                          new Date(currentYear, currentMonth, d)
                        );
                        const isToday = dateKey === todayStr;
                        const isSelected = dateKey === selectedDate;
                        return (
                          <td
                            key={j}
                            className={`p-1 cursor-pointer relative rounded-lg transition
                    ${isToday ? "border-2 border-blue-400" : ""}
                    ${isSelected ? "bg-blue-100" : ""}`}
                            onClick={() => handleDiaClick(dateKey)}
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

        {/* Panel de reservas futuras */}
        <div className="h-full">
          <PanelReservas
            uid={uid}
            reloadKey={reloadPanel}
            onPanelCambiado={onInsertarSuccess}
          />
        </div>

        {/* GRID de reservas */}
        <div className="mt-2 w-full md:col-span-2">
          <Card className="shadow-lg rounded-2xl w-full">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-center text-sm font-semibold">
                <div className="max-w-sm">
                  <label className="text-sm font-medium">
                    Tipo de Estancia
                  </label>
                  <select
                    value={tipoEstancia}
                    onChange={(e) => setTipoEstancia(e.target.value)}
                    className="border p-2 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Almacen">Almacén</option>
                    <option value="Aula">Aula</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Despacho">Despacho</option>
                    <option value="Infolab">Infolab</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Otras">Otras</option>
                  </select>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {estanciasDelGrid.length === 0 ? (
                <div className="p-4 text-center text-gray-600">
                  No hay estancias reservables disponibles para el tipo
                  seleccionado.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-center text-sm table-fixed">
                    <thead>
                      <tr>
                        <th className="p-2 font-semibold border bg-gray-50 w-32 text-center">
                          Periodo
                        </th>
                        {estanciasDelGrid.map((e) => (
                          <th
                            key={e.id}
                            className="p-2 font-semibold border bg-gray-50 cursor-pointer hover:bg-blue-50 transition"
                            onClick={() => {
                              setEstanciaSeleccionadaPlano(e);
                              setAbrirPlano(true);
                            }}
                            title={`Ver plano de ${e.descripcion}`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span>{e.descripcion}</span>
                              <MapPin
                                size={18}
                                className="text-gray-500 hover:text-blue-600 transition-colors"
                              />
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gridData.map((rowData, i) => (
                        <tr key={i}>
                          <td className="p-2 border font-medium bg-gray-50 w-32">
                            {
                              periodosDB.find((p) => p.id === rowData.periodoId)
                                ?.nombre
                            }
                          </td>
                          {estanciasDelGrid.map((e) => {
                            const reserva = rowData.row[e.id];
                            if (
                              reserva &&
                              parseInt(reserva.idperiodo_inicio) ===
                                rowData.periodoId
                            ) {
                              const rowspan =
                                parseInt(reserva.idperiodo_fin) -
                                parseInt(reserva.idperiodo_inicio) +
                                1;
                              return (
                                <td
                                  key={e.id}
                                  rowSpan={rowspan}
                                  className={`p-2 border cursor-pointer transition ${
                                    reserva.uid === uid
                                      ? "bg-green-200 hover:bg-green-300"
                                      : "bg-yellow-200 hover:bg-yellow-300"
                                  }`}
                                  onClick={() => handleEditarReserva(reserva)}
                                >
                                  {reserva.uid === uid
                                    ? "Mi reserva"
                                    : reserva.nombre || "Ocupado"}
                                </td>
                              );
                            }

                            if (
                              reserva &&
                              parseInt(reserva.idperiodo_inicio) <
                                rowData.periodoId
                            )
                              return null;

                            const periodoActual = periodosDB.find(
                              (p) => p.id === rowData.periodoId
                            );
                            const horaFin = periodoActual?.fin;
                            const esFutura = esReservaFutura(
                              selectedDate,
                              horaFin
                            );

                            return (
                              <td
                                key={e.id}
                                className={`p-2 border text-gray-700 transition ${
                                  esFutura
                                    ? "bg-blue-200 cursor-pointer hover:bg-blue-300"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                                onClick={() => {
                                  if (!esFutura) {
                                    toast.error(
                                      "No puedes crear reservas en periodos pasados."
                                    );
                                    return;
                                  }
                                  handleDiaClick(
                                    selectedDate,
                                    e.id,
                                    rowData.periodoId
                                  );
                                }}
                              >
                                {esFutura ? "Libre" : ""}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo para insertar reserva */}
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

      {/* Diálogo para editar reserva */}
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
