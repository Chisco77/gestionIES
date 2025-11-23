import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

// Este componente no contiene lógica, solo renderiza el Grid.
// Toda la lógica viene desde ReservasEstanciasIndex.
export function GridReservasEstancias({
  tipoEstancia,
  setTipoEstancia,
  estanciasDelGrid,
  gridData,
  periodosDB,
  selectedDate,
  handleEditarReserva,
  handleDiaClick,
  setEstanciaSeleccionadaPlano,
  setAbrirPlano,
  uid,
  esReservaFutura,
  fechaSeleccionada,
}) {
  return (
    <Card className="shadow-lg rounded-2xl w-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-center text-sm font-semibold">
          <h2 className="text-lg font-semibold mb-2">
            Reservas del día {fechaSeleccionada}
          </h2>
          <div className="max-w-sm mx-auto">
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
                      title={`Ver plano de ${e.descripcion}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>
                          {e.descripcion + " (" + e.numero_ordenadores + ")"}
                        </span>
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
                        parseInt(reserva.idperiodo_inicio) < rowData.periodoId
                      )
                        return null;

                      const periodoActual = periodosDB.find(
                        (p) => p.id === rowData.periodoId
                      );
                      const horaFin = periodoActual?.fin;

                      const esFutura = esReservaFutura(selectedDate, horaFin);

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
  );
}
