/**
 * GridReservasEstancias.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Permite realizar reservas de aulas. Para directiva, aparece botón junto al nombre del aula para permitir
 *     reservas periódicas (suponemos que la directiva, a inicio de curso, organiza ocupación de aulas)
 *
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Repeat2 } from "lucide-react";

import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { useEstancias } from "@/hooks/Estancias/useEstancias";
import { useReservasDelDia } from "@/hooks/Reservas/useReservasDelDia";
import { useReservasPeriodicasTodas } from "@/hooks/Reservas/userReservasPeriodicasTodas";

import { DialogoInsertarReserva } from "../components/DialogoInsertarReserva";
import { DialogoEditarReserva } from "../components/DialogoEditarReserva";
import { DialogoPlanoEstancia } from "../components/DialogoPlanoEstancia";
import { DialogoInsertarReservaPeriodica } from "./DialogoInsertarReservaPeriodica";
import { DialogoEditarReservaPeriodica } from "./DialogoEditarReservaPeriodica";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Printer, FileText, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/AuthContext";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { generateCalendarioOcupacionPorEstancia } from "@/Informes/reservas";
import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";
import { resolverRutaLogo } from "@/Informes/utils";

export function GridReservasEstancias({
  uid,
  esReservaFutura,
  fechaSeleccionada,
}) {
  const { user } = useAuth();
  const esDirectiva = user?.perfil === "directiva";
  const { data: periodosDB = [] } = usePeriodosHorarios();
  const { data: estancias = [] } = useEstancias();
  const { data: reservasPeriodicas = [] } = useReservasPeriodicasTodas();

  const [tipoEstancia, setTipoEstancia] = useState("");
  const [gridData, setGridData] = useState([]);
  const [estanciasDelGrid, setEstanciasDelGrid] = useState([]);

  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [abrirDialogo, setAbrirDialogo] = useState(false);
  const [abrirDialogoEditar, setAbrirDialogoEditar] = useState(false);
  const [abrirPlano, setAbrirPlano] = useState(false);
  const [estanciaSeleccionadaPlano, setEstanciaSeleccionadaPlano] =
    useState(null);

  // Para reservas periodicas
  const [abrirDialogoPeriodico, setAbrirDialogoPeriodico] = useState(false);
  const [estanciaParaProgramar, setEstanciaParaProgramar] = useState(null);
  // Estados para reservas periódicas
  const [
    abrirDialogoEditarReservaPeriodica,
    setAbrirDialogoEditarReservaPeriodica,
  ] = useState(false);
  const [reservaEditarPeriodica, setReservaEditarPeriodica] = useState(null);

  const { data: centro } = useConfiguracionCentro(); // Traemos los datos del centro
  const urlLogoParaInformes = resolverRutaLogo(centro?.logoCentroUrl);

  // Handler para abrir el diálogo de edición de reserva periódica
  const handleEditarReservaPeriodica = (reserva) => {
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

    const estancia = estancias.find(
      (e) => e.id === parseInt(reserva.idestancia)
    );
    setReservaEditarPeriodica({
      ...reserva,
      descripcionEstancia: estancia?.descripcion || "",
    });
    setAbrirDialogoEditarReservaPeriodica(true);
  };

  const selectedDate = fechaSeleccionada;

  const { data: reservasDelDia } = useReservasDelDia(
    selectedDate,
    tipoEstancia
  );

  // Filtrar estancias según tipo seleccionado
  useEffect(() => {
    if (!reservasDelDia?.estancias) {
      setEstanciasDelGrid([]);
      return;
    }
    const filtradas = reservasDelDia.estancias.filter(
      (e) => !tipoEstancia || e.tipo === tipoEstancia
    );
    setEstanciasDelGrid(filtradas);
  }, [reservasDelDia, tipoEstancia]);

  // Generar gridData
  useEffect(() => {
    if (!reservasDelDia) return;
    const newGridData = (
      reservasDelDia.periodos.length ? reservasDelDia.periodos : periodosDB
    ).map((p) => {
      const row = {};
      estanciasDelGrid.forEach((e) => {
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
  }, [reservasDelDia, estanciasDelGrid, periodosDB]);

  // Handlers
  const handleEditarReserva = (reserva) => {
    if (!esDirectiva && reserva.uid !== uid) {
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
    const estancia = estancias.find(
      (e) => e.id === parseInt(reserva.idestancia)
    );
    setReservaSeleccionada({
      ...reserva,
      descripcionEstancia: estancia?.descripcion || "",
    });
    setAbrirDialogoEditar(true);
  };

  const handleDiaClick = (estanciaId, periodoId) => {
    const periodo = periodosDB.find((p) => p.id === periodoId);
    const estancia = estancias.find((e) => e.id === parseInt(estanciaId));
    setCeldaSeleccionada({
      estanciaId,
      descripcionEstancia: estancia?.descripcion || "",
      periodoId,
      inicioId: periodo?.id,
      finId: periodo?.id,
    });
    setAbrirDialogo(true);
  };

  const handleGenerarCalendarioOcupacionPorEstancia = async () => {
    try {
      if (!tipoEstancia) {
        toast.info("Selecciona un tipo de estancia.");
        return;
      }

      if (!fechaSeleccionada) {
        toast.error("No hay fecha seleccionada.");
        return;
      }

      // --- Parseamos fechaSeleccionada ---
      const [year, month, day] = fechaSeleccionada.split("-").map(Number);
      const primerDiaMes = new Date(year, month - 1, 1);
      const ultimoDiaMes = new Date(year, month, 0);

      const fechaDesde = `${year}-${String(month).padStart(2, "0")}-01`;
      const fechaHasta = `${year}-${String(month).padStart(2, "0")}-${ultimoDiaMes.getDate()}`;

      // --- Filtrar estancias del tipo seleccionado ---
      const estanciasDelGrid = estancias.filter(
        (e) => e.tipoestancia === tipoEstancia && e.reservable === true
      );

      if (!estanciasDelGrid.length) {
        toast.info("No hay estancias de ese tipo.");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL;
      const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

      // --- Preparamos lista de IDs separados por coma ---
      const idEstanciasParam = estanciasDelGrid.map((e) => e.id).join(",");

      const res = await fetch(
        `${API_BASE}/reservas-estancias?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&idestancia=${idEstanciasParam}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (!res.ok || !data.ok) {
        toast.error("Error obteniendo reservas.");
        return;
      }

      // --- Asociamos reservas a cada estancia ---
      const resultados = estanciasDelGrid.map((estancia) => ({
        estancia,
        reservas: data.reservas.filter(
          (r) => Number(r.idestancia) === estancia.id
        ),
      }));

      generateCalendarioOcupacionPorEstancia(
        resultados,
        periodosDB,
        {
          tipoEstancia,
          desde: fechaDesde,
          hasta: fechaHasta,
        },
        urlLogoParaInformes
      );
    } catch (err) {
      console.error(err);
      toast.error("Error generando el informe.");
    }
  };

  return (
    <Card className="shadow-md rounded-xl w-full border border-slate-200">
      <CardHeader className="py-3 px-6 bg-slate-50/80 border-b border-slate-200/60">
        <CardTitle className="text-sm font-bold text-slate-700 tracking-tight flex flex-col items-center gap-3">
          <h2 className="text-base font-semibold">
            Reservas del día{" "}
            {new Date(selectedDate).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </h2>

          <div className="flex items-center justify-between w-full mt-2">
            {/* Espaciador invisible para balancear con el botón de la derecha */}
            <div className="w-8" />

            {/* Bloque centrado: Label + Select */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">
                Estancia:
              </label>
              <Select value={tipoEstancia} onValueChange={setTipoEstancia}>
                <SelectTrigger className="h-8 w-[200px] text-xs">
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aula Polivalente">
                    Aula Polivalente
                  </SelectItem>
                  <SelectItem value="Armario">Armario</SelectItem>
                  <SelectItem value="Infolab">Infolab</SelectItem>
                  <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                  <SelectItem value="Optativa">Optativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Menú impresora a la derecha */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-slate-500"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleGenerarCalendarioOcupacionPorEstancia}
                >
                  <FileText className="mr-2 h-4 w-4 text-red-500" />
                  Calendario Mensual de Reservas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3">
        {estanciasDelGrid.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No hay estancias reservables disponibles para el tipo seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto w-full rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-center text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-2 font-bold text-slate-500 border-b w-24">
                    Periodo
                  </th>
                  {estanciasDelGrid.map((e) => (
                    <th
                      key={e.id}
                      className="p-2 font-bold text-slate-600 border-b border-l cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => {
                        setEstanciaSeleccionadaPlano(e);
                        setAbrirPlano(true);
                      }}
                    >
                      <div className="relative flex items-center justify-center gap-1.5 px-6 truncate">
                        <MapPin size={14} className="shrink-0" />
                        {e.descripcion} ({e.numero_ordenadores})
                        {esDirectiva && (
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setEstanciaParaProgramar(e);
                              setAbrirDialogoPeriodico(true);
                            }}
                            className="absolute right-0 p-1 rounded-md text-slate-400 hover:text-blue-600"
                          >
                            <Repeat2 size={14} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridData.map((rowData) => (
                  <tr key={rowData.periodoId}>
                    <td className="p-2 border-b font-medium text-slate-600 bg-slate-50/50">
                      {
                        periodosDB.find((p) => p.id === rowData.periodoId)
                          ?.nombre
                      }
                    </td>
                    {estanciasDelGrid.map((e) => {
                      const reserva = rowData.row[e.id];
                      const esFutura = esReservaFutura(
                        selectedDate,
                        periodosDB.find((p) => p.id === rowData.periodoId)?.fin
                      );
                      if (
                        reserva &&
                        parseInt(reserva.idperiodo_inicio) === rowData.periodoId
                      ) {
                        return (
                          <td
                            key={e.id}
                            rowSpan={
                              parseInt(reserva.idperiodo_fin) -
                              parseInt(reserva.idperiodo_inicio) +
                              1
                            }
                            className={`p-2 border-b border-l cursor-pointer transition ${reserva.uid === uid ? "bg-green-100 hover:bg-green-200" : "bg-yellow-100 hover:bg-yellow-200"}`}
                            onClick={() => handleEditarReserva(reserva)}
                          >
                            <div className="flex items-center justify-center w-full">
                              <span className="truncate">
                                {reserva.descripcion || "Reserva"}
                              </span>
                            </div>
                          </td>
                        );
                      }
                      if (
                        reserva &&
                        parseInt(reserva.idperiodo_inicio) < rowData.periodoId
                      )
                        return null;
                      return (
                        <td
                          key={e.id}
                          className={`p-2 border-b border-l transition ${esFutura ? "bg-white hover:bg-slate-50 cursor-pointer" : "bg-slate-50 text-slate-300"}`}
                          onClick={() =>
                            esFutura
                              ? handleDiaClick(e.id, rowData.periodoId)
                              : toast.error(
                                  "No puedes crear reservas en periodos pasados."
                                )
                          }
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

      {/* Diálogos */}
      <DialogoInsertarReserva
        open={abrirDialogo}
        onClose={() => {
          setAbrirDialogo(false);
          setCeldaSeleccionada(null);
        }}
        fecha={selectedDate}
        idestancia={celdaSeleccionada?.estanciaId}
        descripcionEstancia={celdaSeleccionada?.descripcionEstancia}
        periodos={periodosDB}
        inicioSeleccionado={celdaSeleccionada?.inicioId}
        finSeleccionado={celdaSeleccionada?.finId}
        estancias={estancias}
      />

      <DialogoPlanoEstancia
        open={abrirPlano}
        onClose={() => setAbrirPlano(false)}
        estancia={estanciaSeleccionadaPlano}
      />

      {reservaSeleccionada && (
        <DialogoEditarReserva
          reserva={reservaSeleccionada}
          descripcionEstancia={reservaSeleccionada.descripcionEstancia}
          open={abrirDialogoEditar}
          onClose={() => {
            setAbrirDialogoEditar(false);
            setReservaSeleccionada(null);
          }}
          periodos={periodosDB}
        />
      )}

      {estanciaParaProgramar && (
        <DialogoInsertarReservaPeriodica
          open={abrirDialogoPeriodico}
          onClose={() => {
            setAbrirDialogoPeriodico(false);
            setEstanciaParaProgramar(null);
          }}
          fecha={selectedDate}
          idestancia={estanciaParaProgramar.id}
          descripcionEstancia={estanciaParaProgramar.descripcion}
          periodos={periodosDB}
        />
      )}

      {reservaEditarPeriodica && (
        <DialogoEditarReservaPeriodica
          open={abrirDialogoEditarReservaPeriodica}
          onClose={() => {
            setAbrirDialogoEditarReservaPeriodica(false);
            setReservaEditarPeriodica(null);
          }}
          fecha={selectedDate}
          reserva={reservaEditarPeriodica}
          periodos={periodosDB}
        />
      )}
    </Card>
  );
}
