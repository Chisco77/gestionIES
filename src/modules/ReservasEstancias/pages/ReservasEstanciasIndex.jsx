import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DialogoInsertarReserva } from "../components/DialogoInsertarReserva";
import { useAuth } from "@/context/AuthContext";

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
  
  // 🟢 ESTADO GLOBAL 1: Estancias (para el Card de Reservas Futuras)
  const [todasLasEstancias, setTodasLasEstancias] = useState([]); 
  // 🟢 ESTADO GLOBAL 2: Periodos (para el Card de Reservas Futuras)
  const [todosLosPeriodos, setTodosLosPeriodos] = useState([]); 
  
  // ESTADOS PARA EL GRID DEL DÍA SELECCIONADO
  const [estanciasDelGrid, setEstanciasDelGrid] = useState([]);
  const [periodosDB, setPeriodosDB] = useState([]); // Periodos del día (para el Grid y Diálogo)
  const [reservas, setReservas] = useState([]); 
  
  // ESTADO PARA EL CARD DE RESERVAS FUTURAS
  const [reservasFuturas, setReservasFuturas] = useState([]);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";
  const todayStr = formatDateKey(new Date());
  const { user } = useAuth();
  const uid = user?.username;

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. 🟢 Cargar TODAS las estancias (Estado Global)
  useEffect(() => {
    const fetchTodasEstancias = async () => {
      try {
        const res = await fetch(`${API_BASE}/estancias`, {
          credentials: "include",
        });
        
        if (!res.ok) {
            console.error(`Error ${res.status} al obtener todas las estancias.`);
            throw new Error("Error al obtener todas las estancias");
        }
        
        const data = await res.json();
        const rawEstancias = data.estancias || data; 
        
        // Convertimos ID a entero para búsqueda segura
        const estanciasData = Array.isArray(rawEstancias) 
            ? rawEstancias.map((e) => ({ ...e, tipo: e.tipoestancia, id: parseInt(e.id) })) 
            : []; 

        setTodasLasEstancias(estanciasData);
        console.log(`[DEBUG] 1. Carga Global Estancias: ${estanciasData.length} estancias cargadas.`);
      } catch (err) {
        console.error("[DEBUG] 1. Error de red/API en Carga Global Estancias:", err);
        setTodasLasEstancias([]);
      }
    };
    fetchTodasEstancias();
  }, [API_BASE]);
  
  // 1.5. 🟢 Cargar TODOS los periodos (Estado Global)
  useEffect(() => {
    const fetchTodosPeriodos = async () => {
        try {
            const res = await fetch(`${API_BASE}/periodos-horarios`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Error al obtener todos los periodos");
            const data = await res.json();
            
            // Convertimos ID a entero para búsqueda segura
            const periodosData = data.periodos?.map(p => ({...p, id: parseInt(p.id)})) || []; 
            setTodosLosPeriodos(periodosData);
            console.log(`[DEBUG] 1.5. Carga Global Periodos: ${periodosData.length} periodos cargados.`);
        } catch (err) {
            console.error("[DEBUG] 1.5. Error de red/API en Carga Global Periodos:", err);
            setTodosLosPeriodos([]);
        }
    };
    fetchTodosPeriodos();
  }, [API_BASE]);


  // 2. Fetch reservas para el grid diario (Carga datos específicos del Grid)
  const fetchReservasDia = async (fecha, tipo) => {
    console.log(`[DEBUG] 2. Fetch Reservas Dia: Llamada para Fecha=${fecha}, Tipo=${tipo}`);
    
    if (!tipo) {
      // 🚨 CORRECCIÓN: Usar la lista global para que el Grid siempre pinte los nombres.
      setPeriodosDB(todosLosPeriodos); 
      setReservas([]);
      setEstanciasDelGrid([]);
      console.log("[DEBUG] 2. Fetch Reservas Dia: Tipo vacío. Estableciendo periodos globales.");
      return;
    }
    
    try {
      const res = await fetch(
        `${API_BASE}/reservas-estancias/filtradas?fecha=${fecha}&tipoestancia=${tipo}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Error al obtener reservas del día");
      const data = await res.json();
      
      if (data.ok) {
        // 🚨 CORRECCIÓN: Si la API no devuelve periodos, usamos los globales
        const periodosCargados = data.periodos?.map(p => ({...p, id: parseInt(p.id)})) || todosLosPeriodos;
        setPeriodosDB(periodosCargados); 
        
        setReservas(data.reservas || []);
        
        const estanciasData = data.estancias?.map((e) => ({ ...e, tipo: e.tipoestancia })) || [];
        setEstanciasDelGrid(estanciasData); 
        
        console.log(`[DEBUG] 2. Fetch Reservas Dia: Éxito. Periodos: ${periodosCargados.length}, Reservas: ${data.reservas?.length}, Estancias para Grid: ${estanciasData.length}.`);
        
      } else {
        console.log("[DEBUG] 2. Fetch Reservas Dia: Respuesta OK=false. Usando periodos globales.");
        setPeriodosDB(todosLosPeriodos); 
        setReservas([]);
        setEstanciasDelGrid([]);
      }
    } catch (err) {
      console.error("[DEBUG] 2. Fetch Reservas Dia: Error de red/API", err);
      setPeriodosDB(todosLosPeriodos); 
      setReservas([]);
      setEstanciasDelGrid([]);
    }
  };

  // 3. Fetch reservas futuras del usuario (NO TOCAN EL ESTADO DEL GRID)
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
      console.log(`[DEBUG] 3. Fetch Reservas Futuras: ${reservasData.length} reservas encontradas.`);
    } catch (err) {
      console.error(err);
      setReservasFuturas([]);
    }
  };

  // 4. Disparar Fetches cuando cambian dependencias
  useEffect(() => {
    // Aseguramos que los periodos globales se han cargado antes de llamar al Fetch del Día
    if (todosLosPeriodos.length > 0 || tipoEstancia === "") {
        fetchReservasDia(selectedDate, tipoEstancia);
    }
  }, [selectedDate, tipoEstancia, todosLosPeriodos]); // Añadimos todosLosPeriodos como dependencia

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
      setCeldaSeleccionada({ estanciaId, periodoId });
      setAbrirDialogo(true);
    }
  };

  const buildGridData = () => {
    const grid = periodosDB.map((p) => {
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
    return grid;
  };

  const gridData = buildGridData();

  const onInsertarSuccess = () => {
    fetchReservasDia(selectedDate, tipoEstancia);
    fetchReservasFuturas();
  };

  // ********** RENDERIZADO JSX COMPLETO **********

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-blue-400 text-center mb-8">
        {fechaHora.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}{" "}
        -{" "}
        {fechaHora.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Calendario */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
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
          <CardContent>
            <table className="w-full border-collapse text-center">
              <thead>
                <tr>
                  {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                    <th key={d} className="p-2 font-medium">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, i) => (
                  <tr key={i}>
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
                          className={`p-2 cursor-pointer relative rounded-lg transition 
                          ${isToday ? "bg-blue-200 border-2 border-blue-400" : ""}
                          ${isSelected ? "bg-gray-200" : ""}`}
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
          </CardContent>
        </Card>

        {/* 2. Mis reservas futuras (Usa todosLosPeriodos) */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-center text-xl font-semibold text-blue-600">
              Mis reservas futuras
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {reservasFuturas.length > 0 ? (
              reservasFuturas.map((r, i) => {
                // Buscamos en todasLasEstancias
                const estancia = todasLasEstancias.find(
                  (e) => parseInt(e.id) === parseInt(r.idestancia)
                );
                
                // 🟢 CLAVE: Buscamos en todosLosPeriodos (estado global)
                const periodoInicio = todosLosPeriodos.find(
                  (p) => p.id === parseInt(r.idperiodo_inicio)
                );
                const periodoFin = todosLosPeriodos.find(
                  (p) => p.id === parseInt(r.idperiodo_fin)
                );
                
                const fecha = new Date(r.fecha);
                const fechaStr = fecha.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });

                return (
                  <Card
                    key={i}
                    className="border shadow-md rounded-xl p-4 bg-white cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => console.log("Editar reserva:", r)}
                  >
                    <p className="font-semibold text-blue-600">
                      {estancia?.descripcion || "Estancia desconocida"}
                    </p>
                    <p>
                      {/* Usamos el nombre si existe, sino el ID */}
                      {periodoInicio?.nombre || r.idperiodo_inicio} a{" "}
                      {periodoFin?.nombre || r.idperiodo_fin}
                    </p>
                    <p className="text-gray-500">{fechaStr}</p>
                  </Card>
                );
              })
            ) : (
              <p>No tienes reservas futuras</p>
            )}
          </CardContent>
        </Card>

        {/* 3. Grid de reservas */}
        <div className="mt-10 w-full md:col-span-2">
          <Card className="shadow-lg rounded-2xl w-full">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-center text-xl font-semibold text-blue-600">
                Reservas por Estancia -{" "}
                {new Date(selectedDate).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="max-w-sm">
                <label className="text-sm font-medium">Tipo de Estancia</label>
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

              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-center text-sm table-fixed">
                  <thead>
                    <tr>
                      <th className="p-2 font-semibold border bg-gray-50 w-32">
                        Periodo
                      </th>
                      {estanciasDelGrid.map((e) => (
                        <th
                          key={e.id}
                          className="p-2 font-semibold border bg-gray-50"
                          style={{
                            width: `${100 / estanciasDelGrid.length}%`,
                          }}
                        >
                          {e.descripcion}
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
                                className={`p-2 border ${
                                  reserva.uid === uid
                                    ? "bg-green-200"
                                    : "bg-yellow-200"
                                }`}
                                rowSpan={rowspan}
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
                          ) {
                            return null;
                          }

                          return (
                            <td
                              key={e.id}
                              className="p-2 border bg-blue-200 cursor-pointer hover:bg-blue-300"
                              onClick={() =>
                                handleDiaClick(
                                  selectedDate,
                                  e.id,
                                  rowData.periodoId
                                )
                              }
                            >
                              Libre
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
        // Pasamos periodosDB, que ahora siempre contiene los nombres cargados
        periodos={periodosDB} 
      />
    </div>
  );
}