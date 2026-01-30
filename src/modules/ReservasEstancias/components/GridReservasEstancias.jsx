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
import { toast } from "sonner";

import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { useEstancias } from "@/hooks/Estancias/useEstancias";
import { useReservasDelDia } from "@/hooks/Reservas/useReservasDelDia";

import { DialogoInsertarReserva } from "../components/DialogoInsertarReserva";
import { DialogoEditarReserva } from "../components/DialogoEditarReserva";
import { DialogoPlanoEstancia } from "../components/DialogoPlanoEstancia";
import { DialogoInsertarReservaPeriodica } from "./DialogoInsertarReservaPeriodica";

import { useAuth } from "@/context/AuthContext";

export function GridReservasEstancias({
  uid,
  esReservaFutura,
  fechaSeleccionada,
}) {
  const { user } = useAuth();
  const esDirectiva = user?.perfil === "directiva";
  const { data: periodosDB = [] } = usePeriodosHorarios();
  const { data: estancias = [] } = useEstancias();

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

  const [abrirDialogoPeriodico, setAbrirDialogoPeriodico] = useState(false);
  const [estanciaParaProgramar, setEstanciaParaProgramar] = useState(null);

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

  return (
    <Card className="shadow-lg rounded-2xl w-full">
      <CardHeader className="py-1 px-3 border-b">
        <CardTitle className="text-center text-sm font-semibold">
          <h2 className="text-base font-semibold mb-0.5">
            Reservas del día{" "}
            {new Date(selectedDate).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="max-w-sm mx-auto mt-1">
            <label className="text-xs font-medium">Tipo de Estancia</label>
            <select
              value={tipoEstancia}
              onChange={(e) => setTipoEstancia(e.target.value)}
              className="border p-1 rounded w-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Seleccionar tipo de estancia</option>
              <option value="Aula Polivalente">Aula Polivalente</option>
              <option value="Infolab">Infolab</option>
              <option value="Laboratorio">Laboratorio</option>
              <option value="Optativa">Optativa</option>
            </select>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {estanciasDelGrid.length === 0 ? (
          <div className="p-4 text-center text-gray-600">
            No hay estancias reservables disponibles para el tipo seleccionado.
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
                      title={`Ver plano de ${e.descripcion} - ${e.numero_ordenadores} ordenadores`}
                    >
                      <div className="relative w-full">
                        {/* CONTENIDO TEXTO */}
                        <div className="flex items-center justify-center gap-2 pr-8 overflow-hidden">
                          <MapPin
                            size={18}
                            className="shrink-0 text-gray-500 hover:text-blue-600 transition-colors"
                          />
                          <span className="truncate whitespace-nowrap">
                            {e.descripcion} ({e.numero_ordenadores})
                          </span>
                        </div>

                        {/* BOTÓN DERECHA */}
                        {esDirectiva && (
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setEstanciaParaProgramar(e);
                              setAbrirDialogoPeriodico(true);
                            }}
                            title="Programar reservas periódicas"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition"
                          >
                            <Repeat2 size={18} />
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
                    <td className="p-2 border font-medium bg-gray-50 w-32">
                      {
                        periodosDB.find((p) => p.id === rowData.periodoId)
                          ?.nombre
                      }
                    </td>

                    {estanciasDelGrid.map((e) => {
                      const reserva = rowData.row[e.id];
                      const periodoActual = periodosDB.find(
                        (p) => p.id === rowData.periodoId
                      );
                      const horaFin = periodoActual?.fin;
                      const esFutura = esReservaFutura(selectedDate, horaFin);

                      if (
                        reserva &&
                        parseInt(reserva.idperiodo_inicio) === rowData.periodoId
                      ) {
                        const rowspan =
                          parseInt(reserva.idperiodo_fin) -
                          parseInt(reserva.idperiodo_inicio) +
                          1;
                        return (
                          <td
                            key={e.id}
                            rowSpan={rowspan}
                            className={`p-2 border cursor-pointer transition ${reserva.uid === uid ? "bg-green-200 hover:bg-green-300" : "bg-yellow-200 hover:bg-yellow-300"}`}
                            onClick={() => handleEditarReserva(reserva)}
                          >
                            {reserva.uid === uid
                              ? "Mi reserva"
                              : (reserva.nombre || "Ocupado").slice(0, 23)}
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
                          className={`p-2 border text-gray-700 transition ${esFutura ? "bg-blue-200 cursor-pointer hover:bg-blue-300" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                          onClick={() => {
                            if (!esFutura) {
                              toast.error(
                                "No puedes crear reservas en periodos pasados."
                              );
                              return;
                            }
                            handleDiaClick(e.id, rowData.periodoId);
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
    </Card>
  );
}
