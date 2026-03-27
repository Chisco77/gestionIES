import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";

export function DialogoConfirmacionExtraescolar({
  open,
  setOpen,
  actividad,
  accion, // "aceptar" o "rechazar"
  onSuccess,
}) {
  if (!actividad) return null;
  console.log("Actividad: ", actividad);
  const esAceptar = accion === "aceptar";
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Formato de fechas
  const fechaInicioLocal = actividad.fecha_inicio
    ? new Date(actividad.fecha_inicio).toLocaleDateString("es-ES")
    : "";
  const fechaFinLocal = actividad.fecha_fin
    ? new Date(actividad.fecha_fin).toLocaleDateString("es-ES")
    : "";

  // Profesor organizador y Participantes
  const profesorOrganizador = actividad.nombreProfesor || "";
  const nombresParticipantes = actividad.responsables
    ?.map((r) => r.nombre)
    .join(", ");

  // Lógica de Periodos (para complementarias)
  const mostrarPeriodos =
    actividad.tipo === "complementaria" && actividad.periodo_inicio_nombre;
  const textoPeriodos =
    actividad.periodo_inicio_nombre === actividad.periodo_fin_nombre
      ? `Durante la ${actividad.periodo_inicio_nombre}`
      : `Desde ${actividad.periodo_inicio_nombre} hasta ${actividad.periodo_fin_nombre}`;

  const mutation = useMutation({
    mutationFn: async () => {
      const nuevoEstado = esAceptar ? 1 : 2;
      const res = await fetch(
        `${API_URL}/db/extraescolares/${actividad.id}/estado`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error actualizando estado");
      return data;
    },
    onSuccess: () => {
      toast.success(
        esAceptar
          ? "Actividad aceptada correctamente"
          : "Actividad rechazada correctamente"
      );

      queryClient.invalidateQueries(["extraescolares"]);
      queryClient.invalidateQueries(["extraescolaresMes"]);
      queryClient.invalidateQueries(["notificacionesDirectiva"]);

      setOpen(false);
      onSuccess?.();
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "No se pudo actualizar el estado");
    },
  });

  const handleConfirm = () => mutation.mutate();

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg max-w-lg"
      >
        <DialogHeader
          className={`${
            esAceptar ? "bg-green-600" : "bg-red-600"
          } text-white flex items-center justify-center py-4 px-6`}
        >
          <DialogTitle className="text-xl font-bold text-center leading-snug">
            {esAceptar ? "Confirmar Aceptación" : "Confirmar Rechazo"}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-700 px-8 py-6 space-y-5">
          {/* Pregunta */}
          <p className="text-base font-medium text-gray-900">
            {esAceptar
              ? "¿Desea autorizar esta actividad?"
              : "¿Desea rechazar esta solicitud de actividad?"}
          </p>

          {/* Información de la actividad */}
          <div className="border rounded-lg bg-slate-50 p-4 space-y-2 shadow-sm">
            <p>
              <strong className="text-gray-900">Actividad:</strong>{" "}
              {actividad.titulo}
            </p>

            <p>
              <strong className="text-gray-900">Fecha:</strong>{" "}
              {fechaInicioLocal}
              {fechaFinLocal !== fechaInicioLocal && ` al ${fechaFinLocal}`}
            </p>

            {/* INFO DE PERIODOS LECTIVOS */}
            {mostrarPeriodos && (
              <div className="flex items-center gap-2 text-blue-700 font-medium py-1">
                <Clock className="w-4 h-4" />
                <span>{textoPeriodos}</span>
              </div>
            )}

            <p>
              <strong className="text-gray-900">Organizador:</strong>{" "}
              {profesorOrganizador}
            </p>

            {nombresParticipantes && (
              <p>
                <strong className="text-gray-900">Participantes:</strong>{" "}
                {nombresParticipantes}
              </p>
            )}

            <p>
              <strong className="text-gray-900">Ubicación:</strong>{" "}
              {actividad.ubicacion}
            </p>
          </div>

          {/* Resaltado de Ausencias / Guardias (Solo si se va a aceptar) */}
          {esAceptar && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                actividad.genera_ausencias
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              {actividad.genera_ausencias ? (
                <>
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Genera guardias</p>
                    <p className="text-xs opacity-90">
                      Se crearán automáticamente las ausencias para los{" "}
                      {actividad.responsables?.length} profesores participantes.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Sin guardias</p>
                    <p className="text-xs opacity-90">
                      Esta actividad NO generará ausencias en el sistema de
                      profesorado.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-100 flex gap-3 sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-gray-600"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className={`${
              esAceptar
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white font-bold min-w-[120px]`}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading
              ? "Procesando..."
              : esAceptar
                ? "Aceptar Actividad"
                : "Confirmar Rechazo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
