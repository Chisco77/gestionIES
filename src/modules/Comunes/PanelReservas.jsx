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

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Trash2, File } from "lucide-react";
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
import { generatePermisosPdf } from "@/utils/Informes";
import { useAuth } from "@/context/AuthContext";
import { DialogoEliminarPermiso } from "../Permisos/components/DialogoEliminarPermiso";
import { DialogoEditarPermiso } from "../Permisos/components/DialogoEditarPermiso";
import { useMemo } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// virtualizar reservas de aulas, ya que diretiva puede tener miles
import { useVirtualizer } from "@tanstack/react-virtual"; 
import { useRef } from "react";

export function PanelReservas({ uid, loading = false }) {
  // ===== Selección y diálogos =====
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  // virtualización: contenedor reservas con scroll
  const parentRef = useRef();
  // estado para que se recarge bien la pestaña de reservas
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

  const handleClickPermiso = (permiso) => {
    setPermisoSeleccionado(permiso);
    setDialogoEditarPermisoAbierto(true);
  };

  const handleEliminarPermiso = (permiso) => {
    if (permiso.estado === 1) {
      toast.warning("No se puede eliminar un permiso que ha sido aceptado.");
      return;
    }
    setPermisoAEliminar(permiso);
    setDialogoEliminarPermisoAbierto(true);
  };

  const { data: departamentos = [] } = useDepartamentosLdap();
  const { data: cursos = [] } = useCursosLdap();
  const { data: estancias = [] } = useEstancias();
  const { data: periodos = [] } = usePeriodosHorarios();

  const { data: reservas = [] } = useReservasUid(uid);
  const { data: asuntos = [] } = usePermisosUid(uid);
  const { data: extraescolares = [] } = useExtraescolaresUid(uid);

  const { user } = useAuth();

  // Virtualización de reservas para optimización frontend.
  const columnCount = 2; // queremos dos columnas
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(reservas.length / columnCount), // filas virtuales
    getScrollElement: () => parentRef.current,
    estimateSize: () => 105, // altura aproximada de cada fila
    overscan: 5,
  });

  // Memos para estancias y periodos
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

  const handleGenerarPdfAsunto = async (asunto) => {
    try {
      // 1. Obtener empleado desde backend
      const res = await fetch(`/api/db/empleados/${user.username}`);
      if (!res.ok) throw new Error("Error obteniendo empleado");

      let empleado = await res.json();

      // 2. Enriquecer empleado con datos LDAP del usuario
      empleado = {
        ...empleado,
        givenName: user.givenName || user.ldap?.givenName,
        sn: user.sn || user.ldap?.sn,
        nombre_completo: `${user.givenName || user.ldap?.givenName} ${
          user.sn || user.ldap?.sn
        }`,
      };
      // 3. Generar PDF
      await generatePermisosPdf({
        empleado,
        permiso: asunto,
      });
    } catch (err) {
      console.error("Error generando PDF:", err);
      toast.error("No se pudo generar el PDF");
    }
  };

  // ===== Renderizados =====
  

  useEffect(() => {
    if (tabActual === "estancias") {
      rowVirtualizer.measure();
    }
  }, [tabActual, rowVirtualizer]);

  
  const renderAsuntosPropios = () => {
    const asuntosPropios = asuntos.filter((a) => a.tipo === 13);

    if (!asuntosPropios.length)
      return (
        <p className="text-gray-500 text-center">No hay asuntos propios</p>
      );

    const estadoMap = {
      0: { text: "Pendiente", color: "text-yellow-600 bg-yellow-100" },
      1: { text: "Aceptado", color: "text-green-600 bg-green-100" },
      2: { text: "Rechazado", color: "text-red-600 bg-red-100" },
    };

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
          className="border shadow-sm rounded-xl p-2 bg-white cursor-pointer hover:bg-blue-50 transition-colors relative"
          onClick={() => handleClickAsunto(a)}
        >
          {/* Cabecera: descripción y papelera */}
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Trash2 className="w-5 h-5" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-600 text-white rounded-lg shadow-md">
                    <p>Eliminar asunto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </button>
          </div>

          {/* Pie: fecha, estado y PDF a la derecha */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <p className="text-gray-500">{fechaStr}</p>
              <span
                className={
                  "px-2 py-1 rounded-lg text-xs font-medium " + estado.color
                }
              >
                {estado.text}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation(); // evita abrir el diálogo de edición
                        handleGenerarPdfAsunto(a);
                      }}
                    >
                      <span className="text-xs font-bold">PDF</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1DA1F2] text-white">
                    <p>Generar PDF solicitud</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Card>
      );
    });
  };

  const renderPermisos = () => {
    const permisos = asuntos.filter((a) => a.tipo !== 13);

    if (!permisos.length)
      return <p className="text-gray-500 text-center">No hay permisos</p>;

    const estadoMap = {
      0: { text: "Pendiente", color: "text-yellow-600 bg-yellow-100" },
      1: { text: "Aceptado", color: "text-green-600 bg-green-100" },
      2: { text: "Rechazado", color: "text-red-600 bg-red-100" },
    };

    return permisos.map((a, i) => {
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
          onClick={() => handleClickPermiso(a)}
        >
          {/* Cabecera: descripción y papelera */}
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
                handleEliminarPermiso(a);
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Trash2 className="w-5 h-5" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-600 text-white rounded-lg shadow-md">
                    <p>Eliminar permiso</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </button>
          </div>

          {/* Pie: fecha, estado y PDF a la derecha */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <p className="text-gray-500">{fechaStr}</p>
              <span
                className={
                  "px-2 py-1 rounded-lg text-xs font-medium " + estado.color
                }
              >
                {estado.text}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation(); // evita abrir el diálogo de edición
                        handleGenerarPdfAsunto(a);
                      }}
                    >
                      <span className="text-xs font-bold">PDF</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1DA1F2] text-white">
                    <p>Generar PDF solicitud</p>
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
      return <p className="text-gray-500 text-center">No hay actividades</p>;

    const estadoMap = {
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Trash2 className="w-5 h-5" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-600 text-white rounded-lg shadow-md">
                    <p>Eliminar actividad</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
          value={tabActual}
          onValueChange={setTabActual}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-4 mb-2 mt-2">
            <TabsTrigger value="estancias" className="relative">
              Mis Reservas
            </TabsTrigger>

            <TabsTrigger value="actividades" className="relative">
              Mis extraescolares
            </TabsTrigger>

            <TabsTrigger value="asuntos" className="relative">
              Mis asuntos propios
            </TabsTrigger>

            <TabsTrigger value="permisos" className="relative">
              Mis permisos
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-0 min-h-0">
            {" "}
            {/* TAB ESTANCIAS (Virtualizada) */}
            <TabsContent
              value="estancias"
              className="m-0 border-none outline-none focus-visible:ring-0"
            >
              <div
                ref={parentRef}
                className="h-[280px] w-full overflow-y-auto pr-2"
              >
                <div
                  style={{
                    height: `${rowVirtualizer.totalSize}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const startIndex = virtualRow.index * columnCount;
                    const items = reservas.slice(
                      startIndex,
                      startIndex + columnCount
                    );

                    return (
                      <div
                        key={virtualRow.index}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                          display: "flex",
                          gap: "0.5rem", // espacio entre columnas
                          paddingBottom: "4px", // espacio inferior entre filas
                        }}
                      >
                        {items.map((r) => {
                          const estancia = estanciasMap.get(
                            r.idestancia.toString()
                          );
                          const periodoInicio = periodosMap.get(
                            r.idperiodo_inicio.toString()
                          );
                          const periodoFin = periodosMap.get(
                            r.idperiodo_fin.toString()
                          );
                          const fechaStr = new Date(r.fecha).toLocaleDateString(
                            "es-ES",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          );

                          return (
                            <Card
                              key={r.id}
                              className="border shadow-sm rounded-xl p-2 bg-white cursor-pointer hover:bg-blue-50 transition-colors relative flex-1"
                              onClick={() => handleClickReserva(r)}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p
                                  className="font-semibold text-blue-600 truncate max-w-[80%]"
                                  title={
                                    estancia?.descripcion ||
                                    r.titulo ||
                                    "Sin descripción"
                                  }
                                >
                                  {estancia?.descripcion ||
                                    r.titulo ||
                                    "Sin descripción"}
                                </p>
                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEliminarReserva(r);
                                  }}
                                >
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Trash2 className="w-5 h-5" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-red-600 text-white rounded-lg shadow-md">
                                        <p>Eliminar reserva</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </button>
                              </div>
                              {/* Estructura de textos inferior igual al resto de tabs */}
                              <div className="mt-1">
                                <p className="text-gray-700">
                                  {periodoInicio?.nombre || r.idperiodo_inicio}{" "}
                                  a {periodoFin?.nombre || r.idperiodo_fin}
                                </p>
                                <p className="text-gray-500">
                                  {fechaStr}
                                </p>
                              </div>
                            </Card>
                          );
                        })}
                        {/* Si solo hay 1 elemento en una fila de 2, metemos un div vacío para mantener el tamaño */}
                        {items.length === 1 && <div className="flex-1" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            {/* RESTO DE TABS (No virtualizadas) */}
            {["actividades", "asuntos", "permisos"].map((tab) => (
              <TabsContent
                key={tab}
                value={tab}
                className="m-0 border-none outline-none"
              >
                <div className="h-[280px] overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
                  {tab === "actividades" && renderActividadesExtraescolares()}
                  {tab === "asuntos" && renderAsuntosPropios()}
                  {tab === "permisos" && renderPermisos()}
                </div>
              </TabsContent>
            ))}
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

      {/* === Diálogos de permisos === */}
      {permisoSeleccionado && (
        <DialogoEditarPermiso
          permiso={permisoSeleccionado}
          open={dialogoEditarPermisoAbierto}
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
    </Card>
  );
}
