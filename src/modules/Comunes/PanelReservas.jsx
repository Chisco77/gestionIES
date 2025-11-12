import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Trash2 } from "lucide-react";
import { DialogoEditarAsunto } from "../AsuntosPropios/components/DialogoEditarAsunto";
import { DialogoEliminarAsunto } from "../AsuntosPropios/components/DialogoEliminarAsunto";
import { DialogoEditarReserva } from "../ReservasEstancias/components/DialogoEditarReserva";
import { DialogoEliminarReserva } from "../ReservasEstancias/components/DialogoEliminarReserva";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function PanelReservas({ uid, reloadKey, onReservaModificada }) {
  const [loading, setLoading] = useState(true);

  const [reservasEstancias, setReservasEstancias] = useState([]);
  const [asuntosPropios, setAsuntosPropios] = useState([]);
  const [actividadesExtraescolares, setActividadesExtraescolares] = useState(
    []
  );
  const [estancias, setEstancias] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  // ===== Selección y diálogos =====
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [dialogoEditarAbierto, setDialogoEditarAbierto] = useState(false);
  const [reservaAEliminar, setReservaAEliminar] = useState(null);
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);

  const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);
  const [dialogoEditarAsuntoAbierto, setDialogoEditarAsuntoAbierto] =
    useState(false);
  const [asuntoAEliminar, setAsuntoAEliminar] = useState(null);
  const [dialogoEliminarAsuntoAbierto, setDialogoEliminarAsuntoAbierto] =
    useState(false);

  const fetchDatosPanel = useCallback(async () => {
    if (!uid) return;
    setLoading(true);

    try {
      // 🔹 1. Reservas de estancias
      const resReservas = await fetch(`${API_BASE}/panel/reservas?uid=${uid}`, {
        credentials: "include",
      });
      const dataReservas = await resReservas.json();

      // 🔹 2. Asuntos propios
      const resAsuntos = await fetch(`${API_BASE}/asuntos-propios?uid=${uid}`, {
        credentials: "include",
      });

      const text = await resAsuntos.text();
      let dataAsuntos = {}; // 👈 declarado fuera para que exista siempre
      try {
        dataAsuntos = JSON.parse(text);
      } catch (err) {
        console.error("Error parseando asuntos propios:", text, err);
      }

      // 🔹 3. Estancias y periodos
      const [resEstancias, resPeriodos] = await Promise.all([
        fetch(`${API_BASE}/estancias`, { credentials: "include" }),
        fetch(`${API_BASE}/periodos-horarios`, { credentials: "include" }),
      ]);
      const [dataEstancias, dataPeriodos] = await Promise.all([
        resEstancias.json(),
        resPeriodos.json(),
      ]);

      // 🔹 Guardar en estado
      setReservasEstancias(dataReservas.reservasEstancias || []);
      setAsuntosPropios(
        (dataAsuntos.asuntos || []).filter((a) => a.uid === uid)
      );
      setActividadesExtraescolares([]);
      setEstancias(Array.isArray(dataEstancias) ? dataEstancias : []);
      setPeriodos(dataPeriodos?.periodos ?? []);
    } catch (err) {
      console.error("Error cargando datos del panel de reservas:", err);
    } finally {
      setLoading(false);
    }
  }, [uid, API_BASE]);

  useEffect(() => {
    fetchDatosPanel();
  }, [fetchDatosPanel, reloadKey]);

  // ===== Handlers de reservas =====
  const handleClickReserva = (reserva) => {
    setReservaSeleccionada(reserva);
    setDialogoEditarAbierto(true);
  };

  const handleEliminarReserva = (reserva) => {
    setReservaAEliminar(reserva);
    setDialogoEliminarAbierto(true);
  };

  // ===== Handlers de asuntos propios =====
  const handleClickAsunto = (asunto) => {
    setAsuntoSeleccionado(asunto);
    setDialogoEditarAsuntoAbierto(true);
  };

  const handleEliminarAsunto = (asunto) => {
    setAsuntoAEliminar(asunto);
    setDialogoEliminarAsuntoAbierto(true);
  };

  // ===== Renderizados =====
  const renderReservas = (reservas) => {
    if (!reservas.length)
      return <p className="text-gray-500 text-center">No hay elementos</p>;

    return reservas.map((r, i) => {
      const estancia = estancias.find(
        (e) => parseInt(e.id) === parseInt(r.idestancia)
      );
      const periodoInicio = periodos.find(
        (p) => parseInt(p.id) === parseInt(r.idperiodo_inicio)
      );
      const periodoFin = periodos.find(
        (p) => parseInt(p.id) === parseInt(r.idperiodo_fin)
      );
      const fechaStr = new Date(r.fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return (
        <Card
          key={i}
          className="border shadow-sm rounded-xl p-2 bg-white cursor-pointer hover:bg-blue-50 transition-colors relative"
          onClick={() => handleClickReserva(r)}
        >
          <div className="flex items-center justify-between gap-2">
            <p
              className="font-semibold text-blue-600 truncate max-w-[80%]"
              title={estancia?.descripcion || r.titulo || "Sin descripción"}
            >
              {estancia?.descripcion || r.titulo || "Sin descripción"}
            </p>
            <button
              type="button"
              className="text-red-500 hover:text-red-700 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleEliminarReserva(r);
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <p>
            {periodoInicio?.nombre || r.idperiodo_inicio} a{" "}
            {periodoFin?.nombre || r.idperiodo_fin}
          </p>
          <p className="text-gray-500">{fechaStr}</p>
        </Card>
      );
    });
  };

  const renderAsuntosPropios = (asuntos) => {
    if (!asuntos.length)
      return (
        <p className="text-gray-500 text-center">No hay asuntos propios</p>
      );

    return asuntos.map((a, i) => {
      const fechaStr = new Date(a.fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return (
        <Card
          key={i}
          className="border shadow-sm rounded-xl p-2 bg-white cursor-pointer hover:bg-blue-50 transition-colors relative"
          onClick={() => handleClickAsunto(a)}
        >
          <div className="flex items-center justify-between gap-2">
            <p
              className="font-semibold text-blue-600 truncate max-w-[80%]"
              title={a.descripcion || a.titulo || "Sin título"}
            >
              {a.descripcion || a.titulo || "Sin título"}
            </p>
            <button
              type="button"
              className="text-red-500 hover:text-red-700 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleEliminarAsunto(a);
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-500">{fechaStr}</p>
        </Card>
      );
    });
  };

  const renderActividadesExtraescolares = () => (
    <p className="text-gray-500 text-center">
      No hay actividades extraescolares (pendiente backend)
    </p>
  );

  if (loading) {
    return (
      <Card className="shadow-lg rounded-2xl h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-2xl h-[300px] flex flex-col">
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <Tabs
          defaultValue="estancias"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-3 mb-2 mt-2">
            <TabsTrigger value="estancias">Mis Reservas</TabsTrigger>
            <TabsTrigger value="asuntos">Mis asuntos propios</TabsTrigger>
            <TabsTrigger value="actividades">Mis extraescolares</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2 mt-0">
            <TabsContent
              value="estancias"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {renderReservas(reservasEstancias)}
            </TabsContent>

            <TabsContent
              value="asuntos"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {renderAsuntosPropios(asuntosPropios)}
            </TabsContent>

            <TabsContent
              value="actividades"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {renderActividadesExtraescolares()}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>

      {/* === Diálogos de reservas === */}
      {reservaSeleccionada && (
        <DialogoEditarReserva
          reserva={reservaSeleccionada}
          open={dialogoEditarAbierto}
          onClose={() => setDialogoEditarAbierto(false)}
          onSuccess={() => {
            fetchDatosPanel(); // recarga datos dentro de PanelReservas
            onReservaModificada?.(); // notifica al padre para actualizar su grid
          }}
          periodos={periodos}
          descripcionEstancia={
            estancias.find(
              (e) => parseInt(e.id) === parseInt(reservaSeleccionada.idestancia)
            )?.descripcion || ""
          }
        />
      )}

      {reservaAEliminar && (
        <DialogoEliminarReserva
          reserva={reservaAEliminar}
          estancias={estancias}
          periodos={periodos}
          open={dialogoEliminarAbierto}
          onOpenChange={setDialogoEliminarAbierto}
          onDeleteSuccess={() => {
            setReservaAEliminar(null);
            fetchDatosPanel();
            onReservaModificada?.();
          }}
        />
      )}

      {/* === Diálogos de asuntos propios === */}
      {asuntoSeleccionado && (
        <DialogoEditarAsunto
          asunto={asuntoSeleccionado}
          open={dialogoEditarAsuntoAbierto}
          onClose={() => setDialogoEditarAsuntoAbierto(false)}
          onSuccess={() => {
            fetchDatosPanel(); // recarga interna del panel
            onReservaModificada?.(); // notifica al padre
          }}
        />
      )}

      {asuntoAEliminar && (
        <DialogoEliminarAsunto
          asunto={asuntoAEliminar}
          open={dialogoEliminarAsuntoAbierto}
          onOpenChange={setDialogoEliminarAsuntoAbierto}
          onDeleteSuccess={() => {
            setAsuntoAEliminar(null);
            fetchDatosPanel();
            onReservaModificada?.();
          }}
        />
      )}
    </Card>
  );
}
