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

export function DialogoConfirmacionExtraescolar({
  open,
  setOpen,
  actividad,
  accion, // "aceptar" o "rechazar"
  onSuccess,
}) {
  if (!actividad) return null;

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

  // Profesor organizador
  const profesor = actividad.nombreProfesor || "";

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
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader
          className={`${
            esAceptar ? "bg-blue-500" : "bg-red-600"
          } text-white rounded-t-lg flex items-center justify-center py-3 px-6`}
        >
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            {esAceptar ? "Confirmar aceptación" : "Confirmar rechazo"}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-700 px-6 pt-5 pb-2 space-y-4">
          {/* Pregunta */}
          <p className="font-medium">
            {esAceptar
              ? "¿Desea aceptar esta actividad extraescolar?"
              : "¿Desea rechazar esta actividad extraescolar?"}
          </p>

          {/* Información de la actividad */}
          <div className="border rounded-md bg-gray-50 p-3 space-y-1">
            {actividad.nombre && (
              <p>
                <strong>Actividad:</strong> {actividad.nombre}
              </p>
            )}

            {fechaInicioLocal && (
              <p>
                <strong>Fecha inicio:</strong> {fechaInicioLocal}
              </p>
            )}

            {fechaFinLocal && (
              <p>
                <strong>Fecha fin:</strong> {fechaFinLocal}
              </p>
            )}

            {profesor && (
              <p>
                <strong>Profesor organizador:</strong> {profesor}
              </p>
            )}

            {actividad.ubicacion && (
              <p>
                <strong>Ubicación:</strong> {actividad.ubicacion}
              </p>
            )}

            {actividad.descripcion && (
              <p>
                <strong>Descripción:</strong> {actividad.descripcion}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 flex gap-2">
          <Button
            onClick={handleConfirm}
            className={
              esAceptar
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-red-600 hover:bg-red-700"
            }
            disabled={mutation.isLoading}
          >
            {mutation.isLoading
              ? esAceptar
                ? "Aceptando..."
                : "Rechazando..."
              : esAceptar
                ? "Aceptar"
                : "Rechazar"}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
