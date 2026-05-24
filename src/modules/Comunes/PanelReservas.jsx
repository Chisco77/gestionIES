/**
 * PanelReservas.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Componente con tabs para mostrar reservas de aulas, actividades extraescolares, asuntos propios
 *           y permisos de un usuario (recibido como prop, uid)
 *
 *
 */
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Trash2, CalendarIcon } from "lucide-react";
import { DialogoEditarAsunto } from "../AsuntosPropios/components/DialogoEditarAsunto";
import { DialogoEliminarAsunto } from "../AsuntosPropios/components/DialogoEliminarAsunto";
import { DialogoEditarReserva } from "../ReservasEstancias/components/DialogoEditarReserva";
import { DialogoEliminarReserva } from "../ReservasEstancias/components/DialogoEliminarReserva";
import { DialogoEditarExtraescolar } from "../Extraescolares/components/DialogoEditarExtraescolar";
import { DialogoEliminarExtraescolar } from "../Extraescolares/components/DialogoEliminarExtraescolar";
import { useDepartamentosLdap } from "@/hooks/useDepartamentosLdap";
import { useCursosLdap } from "@/hooks/useCursosLdap";
import { useReservasUid } from "@/hooks/Reservas/useReservasUid";
import { usePermisosUid } from "@/hooks/Permisos/usePermisosUid";
import { useExtraescolaresUid } from "@/hooks/Extraescolares/useExtraescolaresUid";
import { useEstancias } from "@/hooks/Estancias/useEstancias";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { toast } from "sonner";
import { generatePermisosPdf } from "@/Informes/permisos";
import { useAuth } from "@/context/AuthContext";
import { DialogoEliminarPermiso } from "../Permisos/components/DialogoEliminarPermiso";
import { DialogoEditarPermiso } from "../Permisos/components/DialogoEditarPermiso";
import { DialogoEditarFormacion } from "../Formacion/components/DialogoEditarFormacion";
import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PanelReservas({ uid, loading = false }) {
  // ===== Selección y diálogos =====
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [tabActual, setTabActual] = useState("estancias");

  const [dialogoEditarAbierto, setDialogoEditarAbierto] = useState(false);
  const [reservaAEliminar, setReservaAEliminar] = useState(null);
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);

  const [permisoSeleccionado, setPermisoSeleccionado] = useState(null);
  const [dialogoEditarPermisoAbierto, setDialogoEditarPermisoAbierto] =
    useState(false);
  const [permisoAEliminar, setPermisoAEliminar] = useState(null);
  const [dialogoEliminarPermisoAbierto, setDialogoEliminarPermisoAbierto] =
    useState(false);

  const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);
  const [dialogoEditarAsuntoAbierto, setDialogoEditarAsuntoAbierto] =
    useState(false);
  const [asuntoAEliminar, setAsuntoAEliminar] = useState(null);
  const [dialogoEliminarAbiertoAsunto, setDialogoEliminarAsuntoAbierto] =
    useState(false);

  const [extraescolarSeleccionada, setExtraescolarSeleccionada] =
    useState(null);
  const [dialogoEditarExtraAbierto, setDialogoEditarExtraAbierto] =
    useState(false);
  const [extraescolarAEliminar, setExtraescolarAEliminar] = useState(null);
  const [dialogoEliminarExtraAbierto, setDialogoEliminarExtraAbierto] =
    useState(false);

  const [dialogoEditarFormacionAbierto, setDialogoEditarFormacionAbierto] =
    useState(false);

  // ===== Carga de datos =====
  const { data: departamentos = [] } = useDepartamentosLdap();
  const { data: cursos = [] } = useCursosLdap();
  const { data: estancias = [] } = useEstancias();
  const { data: periodos = [] } = usePeriodosHorarios();

  const { data: reservas = [] } = useReservasUid(uid);
  const { data: asuntos = [] } = usePermisosUid(uid);
  const { data: extraescolares = [] } = useExtraescolaresUid(uid);
  const { data: configuracion } = useConfiguracionCentro();

  const { user } = useAuth();

  const estanciasMap = useMemo(() => {
    const map = new Map();
    estancias.forEach((e) => map.set(e.id.toString(), e));
    return map;
  }, [estancias]);

  const periodosMap = useMemo(() => {
    const map = new Map();
    periodos.forEach((p) => map.set(p.id.toString(), p));
    return map;
  }, [periodos]);

  // ===== Handlers =====
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
        "No se puede eliminar un asunto propio que ha sido aceptado.",
      );
      return;
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
        "No se puede eliminar una actividad extraescolar que ha sido aceptada.",
      );
      return;
    }
    setExtraescolarAEliminar(actividad);
    setDialogoEliminarExtraAbierto(true);
  };

  const handleClickPermiso = (permiso) => {
    setPermisoSeleccionado(permiso);

    if (permiso.tipo === 10) {
      // Si es especial de formación, abrimos el diálogo de formación
      setDialogoEditarFormacionAbierto(true);
    } else {
      // Si no, el de permiso estándar
      setDialogoEditarPermisoAbierto(true);
    }
  };

  const handleEliminarPermiso = (permiso) => {
    if (permiso.estado === 1) {
      toast.warning("No se puede eliminar un permiso que ha sido aceptado.");
      return;
    }
    setPermisoAEliminar(permiso);
    setDialogoEliminarPermisoAbierto(true);
  };

  const handleGenerarPdfAsunto = async (asunto) => {
    try {
      const res = await fetch(`/api/db/empleados/${user.username}`);
      if (!res.ok) throw new Error("Error obteniendo empleado");
      let empleado = await res.json();
      empleado = {
        ...empleado,
        givenName: user.givenName || user.ldap?.givenName,
        sn: user.sn || user.ldap?.sn,
        nombre_completo: `${user.givenName || user.ldap?.givenName} ${user.sn || user.ldap?.sn}`,
      };
      await generatePermisosPdf({
        empleado,
        permiso: asunto,
        periodos,
        directora: configuracion?.directora,
      });
    } catch (err) {
      console.error("Error generando PDF:", err);
      toast.error("No se pudo generar el PDF");
    }
  };

  const estadoMap = {
    0: { text: "Pendiente", color: "text-yellow-600 bg-yellow-100" },
    1: { text: "Aceptado", color: "text-green-600 bg-green-100" },
    2: { text: "Rechazado", color: "text-red-600 bg-red-100" },
  };

  // ===== Renders de Contenido =====
  const renderReservasAulas = () => {
    return reservas.map((r) => {
      const estancia = estanciasMap.get(r.idestancia.toString());
      const periodoInicio = periodosMap.get(r.idperiodo_inicio.toString());
      const periodoFin = periodosMap.get(r.idperiodo_fin.toString());
      const fechaStr = new Date(r.fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const textoDescripcion =
        [estancia?.descripcion, r.descripcion || r.titulo]
          .filter(Boolean)
          .join(" - ") || "Sin descripción";

      return (
        <Card
          key={r.id}
          className="flex flex-col justify-between border border-slate-200/70 shadow-3xs rounded-xl p-2.5 bg-white cursor-pointer hover:bg-slate-50/40 hover:border-slate-300 transition-all h-auto min-h-[105px]"
          onClick={() => handleClickReserva(r)}
        >
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <p
                className="font-semibold text-blue-600 text-xs leading-tight line-clamp-2"
                title={textoDescripcion}
              >
                {textoDescripcion}
              </p>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEliminarReserva(r);
                }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Trash2 className="w-3.5 h-3.5" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-red-600 text-white text-[10px]">
                      Eliminar reserva
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </button>
            </div>
            <div className="mt-2 space-y-0.5">
              <p className="text-[11px] text-slate-600 font-semibold">
                {periodoInicio?.nombre} a {periodoFin?.nombre}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {fechaStr}
              </p>
            </div>
          </div>
        </Card>
      );
    });
  };

  const renderAsuntosPropios = () => {
    const asuntosPropios = asuntos.filter((a) => a.tipo === 13);

    if (!asuntosPropios.length)
      return (
        <div className="flex-1 flex flex-col overflow-hidden p-3 min-h-0">
          <div className="text-center p-6 border border-dashed rounded-xl bg-slate-50/50 w-full">
            <CalendarIcon className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              No has solicitado asuntos propios
            </h3>
          </div>
        </div>
      );

    return asuntosPropios.map((a, i) => {
      const fechaStr = new Date(a.fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const estado = estadoMap[a.estado] ?? { text: "—", color: "" };

      return (
        <Card
          key={i}
          className="border border-slate-200/70 shadow-3xs rounded-xl p-2.5 bg-white cursor-pointer hover:bg-slate-50/50 hover:border-slate-300 transition-all h-auto flex flex-col justify-between"
          onClick={() => handleClickAsunto(a)}
        >
          <div className="flex items-start justify-between gap-2">
            <p
              className="font-semibold text-blue-600 text-xs truncate max-w-[80%]"
              title={a.descripcion || a.titulo || "Sin título"}
            >
              {a.descripcion || a.titulo || "Sin título"}
            </p>
            <button
              type="button"
              className="text-red-500 hover:text-red-700 flex-shrink-0 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleEliminarAsunto(a);
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Trash2 className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-600 text-white text-[10px]">
                    Eliminar asunto
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <p className="text-[11px] text-gray-500">{fechaStr}</p>
              <span
                className={
                  "px-2 py-0.5 rounded-lg text-xs font-medium " + estado.color
                }
              >
                {estado.text}
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs font-bold bg-red-50 px-1.5 py-0.5 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerarPdfAsunto(a);
                    }}
                  >
                    PDF
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1DA1F2] text-white text-[10px]">
                  Generar PDF solicitud
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Card>
      );
    });
  };

  const renderPermisos = () => {
    const permisos = asuntos.filter((a) => a.tipo !== 13);

    if (!permisos.length)
      return (
        <div className="flex-1 flex flex-col overflow-hidden p-3 min-h-0">
          <div className="text-center p-6 border border-dashed rounded-xl bg-slate-50/50 w-full">
            <CalendarIcon className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              No has solicitado permisos / actividades formativas
            </h3>
          </div>
        </div>
      );

    const textoPeriodo = (permiso) => {
      if (permiso.dia_completo) return "Día completo";
      const inicio = periodos.find((p) => p.id === permiso.idperiodo_inicio);
      const fin = periodos.find((p) => p.id === permiso.idperiodo_fin);
      if (!inicio || !fin) return "";
      return inicio.id === fin.id
        ? inicio.nombre
        : `Desde ${inicio.nombre} hasta ${fin.nombre}`;
    };

    return permisos.map((a, i) => {
      const fInicio = new Date(a.fecha);
      const fFin = a.fecha_fin ? new Date(a.fecha_fin) : null;
      let textoFechaFinal = "";
      const esDistintoDia =
        fFin && fInicio.toDateString() !== fFin.toDateString();

      if (esDistintoDia) {
        const mismoAnio = fInicio.getFullYear() === fFin.getFullYear();
        const inicioStr = fInicio.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          ...(mismoAnio ? {} : { year: "numeric" }),
        });
        const finStr = fFin.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        textoFechaFinal = `${inicioStr} a ${finStr}`;
      } else {
        textoFechaFinal = fInicio.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      const estado = estadoMap[a.estado] ?? { text: "—", color: "" };

      return (
        <Card
          key={i}
          className="border border-slate-200/70 shadow-3xs rounded-xl p-2.5 bg-white cursor-pointer hover:bg-slate-50/50 hover:border-slate-300 transition-all h-auto flex flex-col justify-between"
          onClick={() => handleClickPermiso(a)}
        >
          <div className="flex items-start justify-between gap-2">
            <p
              className="font-semibold text-blue-600 text-xs truncate max-w-[80%]"
              title={a.descripcion || a.titulo || "Sin título"}
            >
              {a.descripcion || a.titulo || "Sin título"}
            </p>
            <button
              type="button"
              className="text-red-500 hover:text-red-700 flex-shrink-0 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleEliminarPermiso(a);
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Trash2 className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-600 text-white text-[10px]">
                    Eliminar permiso
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex flex-col gap-0.5">
              <p className="text-gray-500 text-xs font-medium">
                {textoFechaFinal}
              </p>
              <p className="text-gray-400 text-[11px] line-clamp-1">
                {textoPeriodo(a)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className={
                  "px-2 py-0.5 rounded-lg text-xs font-medium " + estado.color
                }
              >
                {estado.text}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 text-xs font-bold bg-red-50 px-1.5 py-0.5 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerarPdfAsunto(a);
                      }}
                    >
                      PDF
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1DA1F2] text-white text-[10px]">
                    Generar PDF solicitud
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Card>
      );
    });
  };

  const renderActividadesExtraescolares = () => {
    if (!extraescolares.length)
      return (
        <div className="flex-1 flex flex-col overflow-hidden p-3 min-h-0">
          <div className="text-center p-6 border border-dashed rounded-xl bg-slate-50/50 w-full">
            <CalendarIcon className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              No participas en u organizas extraescolares
            </h3>
          </div>
        </div>
      );

    const estadoMapExtra = {
      0: { text: "Pendiente", color: "text-yellow-600 bg-yellow-100" },
      1: { text: "Aceptada", color: "text-green-600 bg-green-100" },
      2: { text: "Rechazada", color: "text-red-600 bg-red-100" },
    };

    return extraescolares.map((a, i) => {
      const fechaStr = new Date(a.fecha_inicio).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const estado = estadoMapExtra[a.estado] ?? { text: "—", color: "" };

      return (
        <Card
          key={i}
          className="border border-slate-200/70 shadow-3xs rounded-xl p-2.5 bg-white cursor-pointer hover:bg-slate-50/50 hover:border-slate-300 transition-all h-auto flex flex-col justify-between"
          onClick={() => handleClickExtraescolar(a)}
        >
          <div className="flex items-start justify-between gap-2">
            <p
              className="font-semibold text-blue-600 text-xs truncate max-w-[80%]"
              title={a.titulo || "Sin título"}
            >
              {a.titulo}
            </p>
            <button
              type="button"
              className="text-red-500 hover:text-red-700 flex-shrink-0 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleEliminarExtraescolar(a);
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Trash2 className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-600 text-white text-[10px]">
                    Eliminar actividad
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[11px] text-gray-500">{fechaStr}</p>
            <span
              className={
                "px-2 py-0.5 rounded-lg text-xs font-medium " + estado.color
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
      <Card className="border-slate-200 shadow-3xs rounded-xl h-[360px] flex items-center justify-center bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </Card>
    );
  }

  return (
    <div className="space-y-4 flex flex-col h-full overflow-hidden">
      {/* ─── CONTENEDOR PRINCIPAL ─── */}
      <Card className="border border-slate-200 shadow-md rounded-xl flex-1 flex flex-col min-h-0 bg-white overflow-hidden">
        <Tabs
          value={tabActual}
          onValueChange={setTabActual}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Cabecera integrada con las Pestañas */}
          <div className="px-3 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between flex-shrink-0">
            {/* Pestañas a la izquierda */}
            <TabsList className="h-8 p-0.5 bg-slate-100 border border-slate-200/60 shadow-inner rounded-lg flex w-auto">
              {["estancias", "actividades", "asuntos", "permisos"].map(
                (val) => (
                  <TabsTrigger
                    key={val}
                    value={val}
                    className="h-full text-[12px] font-semibold px-3 rounded-md text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all capitalize"
                  >
                    {val === "estancias" ? "Mis Reservas" : val}
                  </TabsTrigger>
                ),
              )}
            </TabsList>

            {/* Título a la derecha */}
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">
              Detalle de actividad personal
            </h2>
          </div>

          {/* Contenido envuelto dentro del Tabs */}
          <CardContent className="flex-1 flex flex-col overflow-hidden p-3 min-h-0">
            <div className="flex-1 min-h-0">
              <TabsContent
                value="estancias"
                className="m-0 border-none outline-none focus-visible:ring-0 h-full"
              >
                {!reservas.length ? (
                  <div className="h-full flex items-center justify-center py-6">
                    <div className="text-center p-6 border border-dashed rounded-xl bg-slate-50/50 w-full">
                      <CalendarIcon className="mx-auto h-8 w-8 text-slate-300" />
                      <h3 className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        No tienes reservas activas
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 content-start scrollbar-none">
                    {renderReservasAulas()}
                  </div>
                )}
              </TabsContent>

              {["actividades", "asuntos", "permisos"].map((tab) => {
                const isEmpty =
                  (tab === "actividades" && !extraescolares.length) ||
                  (tab === "asuntos" &&
                    !asuntos.filter((a) => a.tipo === 13).length) ||
                  (tab === "permisos" &&
                    !asuntos.filter((a) => a.tipo !== 13).length);
                return (
                  <TabsContent
                    key={tab}
                    value={tab}
                    className="m-0 border-none outline-none h-full"
                  >
                    <div
                      className={
                        isEmpty
                          ? "h-full flex items-center justify-center py-6"
                          : "h-full overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-3 gap-3 content-start scrollbar-none"
                      }
                    >
                      {tab === "actividades" &&
                        renderActividadesExtraescolares()}
                      {tab === "asuntos" && renderAsuntosPropios()}
                      {tab === "permisos" && renderPermisos()}
                    </div>
                  </TabsContent>
                );
              })}
            </div>
          </CardContent>
        </Tabs>
      </Card>

      {/* ─── MODALES DE INTERACCIÓN ─── */}
      {reservaSeleccionada && (
        <DialogoEditarReserva
          reserva={reservaSeleccionada}
          open={dialogoEditarAbierto}
          onClose={() => setDialogoEditarAbierto(false)}
          periodos={periodos}
          descripcionEstancia={
            estancias.find(
              (e) =>
                parseInt(e.id) === parseInt(reservaSeleccionada.idestancia),
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
          open={dialogoEliminarAbiertoAsunto}
          onOpenChange={setDialogoEliminarAbiertoAsunto}
          onDeleteSuccess={() => {
            setAsuntoAEliminar(null);
          }}
        />
      )}
      {extraescolarSeleccionada && (
        <DialogoEditarExtraescolar
          actividad={extraescolarSeleccionada}
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
      {permisoSeleccionado && (
        <DialogoEditarPermiso
          permiso={permisoSeleccionado}
          open={dialogoEditarPermisoAbierto}
          periodos_horarios={periodos}
          onClose={() => setDialogoEditarPermisoAbierto(false)}
        />
      )}
      {permisoAEliminar && (
        <DialogoEliminarPermiso
          permiso={permisoAEliminar}
          open={dialogoEliminarPermisoAbierto}
          onOpenChange={setDialogoEliminarPermisoAbierto}
          onDeleteSuccess={() => {
            setPermisoAEliminar(null);
          }}
        />
      )}

      {permisoSeleccionado && permisoSeleccionado.tipo === 10 && (
        <DialogoEditarFormacion
          permiso={permisoSeleccionado}
          open={dialogoEditarFormacionAbierto}
          periodos_horarios={periodos}
          onClose={() => setDialogoEditarFormacionAbierto(false)}
        />
      )}
    </div>
  );
}
