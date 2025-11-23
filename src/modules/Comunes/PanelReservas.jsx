import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Trash2 } from "lucide-react";
import { DialogoEditarAsunto } from "../AsuntosPropios/components/DialogoEditarAsunto";
import { DialogoEliminarAsunto } from "../AsuntosPropios/components/DialogoEliminarAsunto";
import { DialogoEditarReserva } from "../ReservasEstancias/components/DialogoEditarReserva";
import { DialogoEliminarReserva } from "../ReservasEstancias/components/DialogoEliminarReserva";
import { DialogoEditarExtraescolar } from "../Extraescolares/components/DialogoEditarExtraescolar";
import { DialogoEliminarExtraescolar } from "../Extraescolares/components/DialogoEliminarExtraescolar";
import { useDepartamentosLdap } from "@/hooks/useDepartamentosLdap";
import { useCursosLdap } from "@/hooks/useCursosLdap";
import { useReservasUid } from "@/hooks/Reservas/useReservasUid";
import { useAsuntosUid } from "@/hooks/Asuntos/useAsuntosUid";
import { useExtraescolaresUid } from "@/hooks/Extraescolares/useExtraescolaresUid";
import { useEstancias } from "@/hooks/Estancias/useEstancias";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { toast } from "sonner"; // asegúrate de tenerlo importado

export function PanelReservas({ uid, loading = false }) {
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

  const [extraescolarSeleccionada, setExtraescolarSeleccionada] =
    useState(null);
  const [dialogoEditarExtraAbierto, setDialogoEditarExtraAbierto] =
    useState(false);
  const [extraescolarAEliminar, setExtraescolarAEliminar] = useState(null);
  const [dialogoEliminarExtraAbierto, setDialogoEliminarExtraAbierto] =
    useState(false);

  // ===== Handlers de selección =====
  const handleClickReserva = (reserva) => {
    setReservaSeleccionada(reserva);
    setDialogoEditarAbierto(true);
  };
  const handleEliminarReserva = (reserva) => {
    setReservaAEliminar(reserva);
    setDialogoEliminarAbierto(true);
  };

  const handleClickAsunto = (asunto) => {
    setAsuntoSeleccionado(asunto);
    setDialogoEditarAsuntoAbierto(true);
  };

  const handleEliminarAsunto = (asunto) => {
    if (asunto.estado === 1) {
      toast.warning(
        "No se puede eliminar un asunto propio que ha sido aceptado."
      );
      return; // no abrir el diálogo
    }

    setAsuntoAEliminar(asunto);
    setDialogoEliminarAsuntoAbierto(true);
  };

  const handleClickExtraescolar = (actividad) => {
    setExtraescolarSeleccionada(actividad);
    setDialogoEditarExtraAbierto(true);
  };
  const handleEliminarExtraescolar = (actividad) => {
    if (actividad.estado == 1) {
      toast.warning(
        "No se puede eliminar una actividad extraescolar que ha sido aceptada."
      );
      return; // no abrir el diálogo
    }
    setExtraescolarAEliminar(actividad);
    setDialogoEliminarExtraAbierto(true);
  };

  const { data: departamentos = [] } = useDepartamentosLdap();
  const { data: cursos = [] } = useCursosLdap();
  const { data: estancias = [] } = useEstancias();
  const { data: periodos = [] } = usePeriodosHorarios();

  const { data: reservas = [] } = useReservasUid(uid);
  const { data: asuntos = [] } = useAsuntosUid(uid);
  const { data: extraescolares = [] } = useExtraescolaresUid(uid);

  // ===== Renderizados =====
  const renderReservas = () => {
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

  const renderAsuntosPropios = () => {
    if (!asuntos.length)
      return (
        <p className="text-gray-500 text-center">No hay asuntos propios</p>
      );

    const estadoMap = {
      0: { text: "Pendiente", color: "text-yellow-600 bg-yellow-100" },
      1: { text: "Aceptado", color: "text-green-600 bg-green-100" },
      2: { text: "Rechazado", color: "text-red-600 bg-red-100" },
    };

    return asuntos.map((a, i) => {
      const fechaStr = new Date(a.fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const estado = estadoMap[a.estado] ?? { text: "—", color: "" };

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
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500">{fechaStr}</p>
            <span
              className={
                "px-2 py-1 rounded-lg text-xs font-medium " + estado.color
              }
            >
              {estado.text}
            </span>
          </div>
        </Card>
      );
    });
  };

  const renderActividadesExtraescolares = () => {
    if (!extraescolares.length)
      return <p className="text-gray-500 text-center">No hay actividades</p>;

    const estadoMap = {
      0: { text: "Pendiente", color: "text-yellow-600 bg-yellow-100" },
      1: { text: "Confirmada", color: "text-green-600 bg-green-100" },
      2: { text: "Cancelada", color: "text-red-600 bg-red-100" },
    };

    return extraescolares.map((a, i) => {
      const fechaStr = new Date(a.fecha_inicio).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const estado = estadoMap[a.estado] ?? { text: "—", color: "" };

      return (
        <Card
          key={i}
          className="border shadow-sm rounded-xl p-2 bg-white cursor-pointer hover:bg-blue-50 transition-colors relative"
          onClick={() => handleClickExtraescolar(a)}
        >
          <div className="flex items-center justify-between gap-2">
            <p
              className="font-semibold text-blue-600 truncate max-w-[80%]"
              title={a.titulo || "Sin título"}
            >
              {a.titulo}
            </p>
            <button
              type="button"
              className="text-red-500 hover:text-red-700 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleEliminarExtraescolar(a);
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500">{fechaStr}</p>
            <span
              className={
                "px-2 py-1 rounded-lg text-xs font-medium " + estado.color
              }
            >
              {estado.text}
            </span>
          </div>
        </Card>
      );
    });
  };

  if (loading) {
    return (
      <Card className="shadow-lg rounded-2xl h-[350px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-2xl h-[350px] flex flex-col">
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
              {renderReservas()}
            </TabsContent>

            <TabsContent
              value="asuntos"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {renderAsuntosPropios()}
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
          }}
        />
      )}

      {/* === Diálogos de asuntos propios === */}
      {asuntoSeleccionado && (
        <DialogoEditarAsunto
          asunto={asuntoSeleccionado}
          open={dialogoEditarAsuntoAbierto}
          onClose={() => setDialogoEditarAsuntoAbierto(false)}
        />
      )}

      {asuntoAEliminar && (
        <DialogoEliminarAsunto
          asunto={asuntoAEliminar}
          open={dialogoEliminarAsuntoAbierto}
          onOpenChange={setDialogoEliminarAsuntoAbierto}
          onDeleteSuccess={() => {
            setAsuntoAEliminar(null);
          }}
        />
      )}

      {extraescolarSeleccionada && (
        <DialogoEditarExtraescolar
          actividad={extraescolarSeleccionada} // <-- CORRECTO
          open={dialogoEditarExtraAbierto}
          onClose={() => setDialogoEditarExtraAbierto(false)}
          periodos={periodos}
          departamentos={departamentos}
          cursos={cursos}
        />
      )}

      {extraescolarAEliminar && (
        <DialogoEliminarExtraescolar
          actividad={extraescolarAEliminar}
          open={dialogoEliminarExtraAbierto}
          onOpenChange={setDialogoEliminarExtraAbierto}
          onDeleteSuccess={() => {
            setExtraescolarAEliminar(null);
          }}
        />
      )}
    </Card>
  );
}
