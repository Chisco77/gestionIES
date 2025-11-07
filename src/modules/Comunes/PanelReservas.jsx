import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DialogoEditarReserva } from "../ReservasEstancias/components/DialogoEditarReserva";
import { Loader2, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function PanelReservas({
  uid,
  reloadKey,
  onClickReserva,
  onReservaModificada,
}) {
  const [reservasEstancias, setReservasEstancias] = useState([]);
  const [asuntosPropios, setAsuntosPropios] = useState([]);
  const [actividadesExtraescolares, setActividadesExtraescolares] = useState(
    []
  );
  const [estancias, setEstancias] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Estados para el diálogo
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  // 🔹 Función de carga de datos
  const fetchDatosPanel = useCallback(async () => {
    if (!uid) return;
    setLoading(true);

    try {
      const resReservas = await fetch(`${API_BASE}/panel/reservas?uid=${uid}`, {
        credentials: "include",
      });
      if (!resReservas.ok)
        throw new Error("Error al obtener reservas del panel");
      const dataReservas = await resReservas.json();

      const resEstancias = await fetch(`${API_BASE}/estancias`, {
        credentials: "include",
      });
      if (!resEstancias.ok) throw new Error("Error al obtener estancias");
      const dataEstancias = await resEstancias.json();

      const resPeriodos = await fetch(`${API_BASE}/periodos-horarios`, {
        credentials: "include",
      });
      if (!resPeriodos.ok) throw new Error("Error al obtener periodos");
      const dataPeriodos = await resPeriodos.json();

      setReservasEstancias(dataReservas.reservasEstancias || []);
      setAsuntosPropios(dataReservas.asuntosPropios || []);
      setActividadesExtraescolares(
        dataReservas.actividadesExtraescolares || []
      );
      setEstancias(Array.isArray(dataEstancias) ? dataEstancias : []);
      setPeriodos(dataPeriodos?.periodos ?? []);
    } catch (error) {
      console.error("Error al cargar datos del panel de reservas:", error);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchDatosPanel();
  }, [fetchDatosPanel, reloadKey]);

  const handleClickCard = (reserva) => {
    setReservaSeleccionada(reserva);
    setDialogoAbierto(true);
    onClickReserva?.(reserva);
  };

  const renderReservas = (reservas) => {
    if (reservas.length === 0)
      return <p className="text-gray-500 text-center">No hay elementos</p>;

    return reservas.map((r, i) => {
      const estancia = estancias.find(
        (e) => parseInt(e.id) === parseInt(r.idestancia)
      );
      const periodoInicio = periodos.find(
        (p) => p.id === parseInt(r.idperiodo_inicio)
      );
      const periodoFin = periodos.find(
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
          className="border shadow-sm rounded-xl p-4 bg-white cursor-pointer hover:bg-blue-50 transition-colors relative"
          onClick={() => handleClickCard(r)}
        >
          <button
            type="button"
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation(); /* acción futura */
            }}
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <p className="font-semibold text-blue-600">
            {estancia?.descripcion || r.titulo || "Sin descripción"}
          </p>
          <p>
            {periodoInicio?.nombre || r.idperiodo_inicio} a{" "}
            {periodoFin?.nombre || r.idperiodo_fin}
          </p>
          <p className="text-gray-500">{fechaStr}</p>
        </Card>
      );
    });
  };

  if (loading) {
    return (
      <Card className="shadow-lg rounded-2xl h-[400px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg rounded-2xl h-[400px] flex flex-col">
        <CardHeader className="border-b pb-2">
          <CardTitle className="text-center text-xl font-semibold text-blue-600">
            Mis próximas actividades
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            defaultValue="estancias"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="estancias">Estancias</TabsTrigger>
              <TabsTrigger value="asuntos">Asuntos propios</TabsTrigger>
              <TabsTrigger value="actividades">Extraescolares</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <TabsContent value="estancias" className="mt-0">
                {renderReservas(reservasEstancias)}
              </TabsContent>
              <TabsContent value="asuntos" className="mt-0">
                {renderReservas(asuntosPropios)}
              </TabsContent>
              <TabsContent value="actividades" className="mt-0">
                {renderReservas(actividadesExtraescolares)}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogo de edición */}
      {reservaSeleccionada && (
        <DialogoEditarReserva
          reserva={reservaSeleccionada}
          open={dialogoAbierto}
          onClose={() => setDialogoAbierto(false)}
          onSuccess={() => {
            fetchDatosPanel(); // recargar panel
            onReservaModificada?.(); // avisar al padre que recargue grid
          }}
          periodos={periodos}
          descripcionEstancia={
            estancias.find(
              (e) => parseInt(e.id) === parseInt(reservaSeleccionada.idestancia)
            )?.descripcion || ""
          }
        />
      )}
    </>
  );
}
