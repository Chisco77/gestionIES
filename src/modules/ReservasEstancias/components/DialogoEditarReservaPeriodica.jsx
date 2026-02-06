/**
 * DialogoEditarReservaPeriodica.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Permite editar reservas periódicas de aulas.
 *
 *
 * Flujo
 *  Se obtiene el padre existente
 *  Se eliminan SOLO los hijos futuros
 *  Los hijos pasados se respetan siempre
 *  Se actualiza el PADRE periodos, fecha_hasta, descripción, frecuencia, días, etc.
 *  Se regeneran fechas desde hoy
 *
 * Nunca se tocan reservas pasadas.
 * Se detectan colisiones igual que en creación. Se insertan solo los hijos libres. Los conflictos se omiten
 *
 * Filosofía
 *  No se modifican reservas pasadas.
 *  Se redefinen reseras futuras.
 *  No se borran datos históricos
 *
 */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfesoresLdap } from "@/hooks/useProfesoresLdap";

import { DialogoConfirmacionReservaPeriodica } from "./DialogoConfirmacionReservaPeriodica";
import { DialogoResumenReservaPeriodica } from "./DialogoResumenReservaPeriodica";

export function DialogoEditarReservaPeriodica({
  open,
  onClose,
  fecha,
  reserva, // objeto con la reserva periódica a editar
  periodos,
  onSuccess,
}) {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  const [resumen, setResumen] = useState(null); // resultado de la mutación

  // Estados básicos de la reserva
  const [descripcion, setDescripcion] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");

  // Estados de periodicidad
  const [tipoRepeticion, setTipoRepeticion] = useState("diaria"); // diaria / semanal
  const [diasSemana, setDiasSemana] = useState([]);
  const [fechaLimite, setFechaLimite] = useState("");

  // Estados de profesor
  const [profesorSeleccionado, setProfesorSeleccionado] = useState("");
  const [busquedaProfesor, setBusquedaProfesor] = useState("");

  const [openConfirm, setOpenConfirm] = useState(false);

  // Obtener profesores con hook
  const {
    data: profesores = [],
    isLoading: loadingProfesores,
    error: errorProfesores,
  } = useProfesoresLdap();

  // Inicializar estados al abrir con los datos de la reserva
  useEffect(() => {
    if (!open || !reserva) return;

    // Descripción
    setDescripcion(reserva.descripcion_reserva || "");

    // Periodos
    setInicio(reserva.idperiodo_inicio?.toString() || "");
    setFin(reserva.idperiodo_fin?.toString() || "");

    // Periodicidad
    setTipoRepeticion(reserva.frecuencia || "diaria");

    // Días de la semana (de números a nombres)
    const MAPA_DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie"];
    setDiasSemana(
      reserva.dias_semana?.map((d) => MAPA_DIAS[d]).filter(Boolean) || []
    );

    // Fecha límite (solo YYYY-MM-DD)
    setFechaLimite(reserva.fecha_hasta?.slice(0, 10) || "");

    // Profesor
    setProfesorSeleccionado(reserva.profesor || "");
    setBusquedaProfesor("");
  }, [open, reserva]);

  // Filtrado de profesores según búsqueda
  const profesoresFiltrados = profesores.filter((p) => {
    const nombreCompleto =
      `${p.givenName ?? ""} ${p.sn ?? ""} ${p.uid}`.toLowerCase();
    return nombreCompleto.includes(busquedaProfesor.toLowerCase());
  });
  const profesorObj = profesores.find((p) => p.uid === profesorSeleccionado);

  const toggleDiaSemana = (dia) => {
    setDiasSemana((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const validarReservaPeriodica = () => {
    if (!inicio || !fin) throw new Error("Selecciona periodo de inicio y fin");
    if (parseInt(fin) < parseInt(inicio))
      throw new Error("El periodo final no puede ser anterior al inicial");
    if (!profesorSeleccionado) throw new Error("Selecciona un profesor");
    if (!user?.username) throw new Error("Usuario no autenticado");
    if (tipoRepeticion === "semanal" && diasSemana.length === 0)
      throw new Error("Selecciona al menos un día de la semana");
    if (fechaLimite < fecha)
      throw new Error(
        "La fecha límite no puede ser anterior a la fecha de la reserva"
      );
  };

  // Mutation para actualizar reserva periódica
  const mutation = useMutation({
    mutationFn: async () => {
      validarReservaPeriodica();
      // Mapear nombres de días a números
      const MAPA_DIAS = { Lun: 0, Mar: 1, Mié: 2, Jue: 3, Vie: 4 };
      const diasSemanaInt =
        tipoRepeticion === "semanal"
          ? diasSemana.map((d) => MAPA_DIAS[d]).filter((n) => n !== undefined)
          : [];

      const payload = {
        profesor: profesorSeleccionado,
        idperiodo_inicio: parseInt(inicio),
        idperiodo_fin: parseInt(fin),
        fecha_desde: reserva.fecha_desde,
        fecha_hasta: fechaLimite,
        descripcion_reserva: descripcion,
        frecuencia: tipoRepeticion,
        dias_semana: diasSemanaInt,
      };

      const res = await fetch(
        `${API_URL}/db/reservas-estancias/repeticion/${reserva.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al actualizar reserva periódica");
      return data;
    },

    onSuccess: (data) => {
      // Guardamos el resumen para el diálogo informativo
      setResumen(data);

      // Invalidamos los hooks para refrescar grid y listas
      queryClient.invalidateQueries(["reservas", "dia", fecha]); // refresca grid del día
      queryClient.invalidateQueries(["reservas", "uid", user.username]); // refresca panel del usuario
      queryClient.invalidateQueries(["reservasPeriodicasTodas"]);
    },

    onError: (err) => {
      toast.error(err.message || "Error al actualizar reserva periódica");
    },
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onClose} modal={true}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="p-0 overflow-hidden rounded-lg"
        >
          <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
            <DialogTitle className="text-lg font-semibold text-center leading-snug">
              Editar reserva periódica (
              {new Date(reserva?.fecha_desde).toLocaleDateString("es-ES")}) –{" "}
              <span className="font-bold">{reserva?.descripcion_estancia}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-4 p-6">
            {profesorObj && (
              <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                <span className="font-medium">Profesor actual:</span>{" "}
                {profesorObj.givenName} {profesorObj.sn} ({profesorObj.uid})
              </div>
            )}
            {/* Profesor */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Reserva para:</label>

              <Input
                placeholder="Buscar por nombre, apellidos o UID"
                value={busquedaProfesor}
                onChange={(e) => setBusquedaProfesor(e.target.value)}
                className="mb-2"
              />

              <div className="max-h-48 overflow-y-auto border rounded p-2">
                {loadingProfesores && (
                  <p className="text-sm text-muted-foreground">
                    Cargando profesores...
                  </p>
                )}

                {errorProfesores && (
                  <p className="text-sm text-red-500">
                    Error al cargar profesores
                  </p>
                )}

                {!loadingProfesores &&
                  !errorProfesores &&
                  profesoresFiltrados.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No se encontraron profesores
                    </p>
                  )}

                {!loadingProfesores &&
                  profesoresFiltrados.map((p) => (
                    <label
                      key={p.uid}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="profesor"
                        value={p.uid}
                        checked={profesorSeleccionado === p.uid}
                        onChange={() => setProfesorSeleccionado(p.uid)}
                      />
                      <span>
                        {p.givenName} {p.sn} ({p.uid})
                      </span>
                    </label>
                  ))}
              </div>
            </div>

            {/* Periodos */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Periodo Inicio
                </label>
                <Select value={inicio} onValueChange={setInicio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nombre} ({p.inicio} - {p.fin})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Periodo Fin
                </label>
                <Select value={fin} onValueChange={setFin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nombre} ({p.inicio} - {p.fin})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Descripción
              </label>
              <Input
                placeholder="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            {/* Periodicidad */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Periodicidad</label>
              <Select value={tipoRepeticion} onValueChange={setTipoRepeticion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo de repetición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diaria">Diaria</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                </SelectContent>
              </Select>

              {tipoRepeticion === "semanal" && (
                <div className="flex gap-2 flex-wrap">
                  {["Lun", "Mar", "Mié", "Jue", "Vie"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDiaSemana(d)}
                      className={`px-2 py-1 border rounded ${
                        diasSemana.includes(d)
                          ? "bg-blue-500 text-white"
                          : "bg-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha límite
                </label>
                <Input
                  type="date"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50">
            <Button
              variant="outline"
              onClick={() => {
                try {
                  validarReservaPeriodica(); // ✅ validación previa
                  setOpenConfirm(true); // abrir diálogo solo si todo ok
                } catch (err) {
                  toast.error(err.message);
                }
              }}
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DialogoConfirmacionReservaPeriodica
        open={openConfirm}
        onOpenChange={setOpenConfirm} // ✅ Aquí sí funciona
        datosReserva={{
          aula: reserva?.descripcion_estancia,
          tipoRepeticion,
          diasSemana,
          periodoInicio: inicio,
          periodoFin: fin,
          fechaInicio: reserva?.fecha_desde,
          fechaLimite,
          descripcion,
          profesor: profesorObj
            ? `${profesorObj.givenName} ${profesorObj.sn}`
            : "",
          periodos,
        }}
        modo="edicion"
        onConfirm={() => mutation.mutate()}
      />

      <DialogoResumenReservaPeriodica
        open={!!resumen}
        setOpen={(val) => {
          if (!val) {
            setResumen(null); // reset resumen al cerrar
            queryClient.invalidateQueries(["reservas-periodicas-directiva"]);
            onClose?.();
          }
        }}
        resumen={resumen}
      />
    </>
  );
}
