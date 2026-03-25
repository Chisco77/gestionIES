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
import { textoTipoPermiso } from "@/utils/mapeoTiposPermisos";
import { getIconoTipo } from "@/utils/iconosTiposPermisos";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";

export function DialogoConfirmacion({
  open,
  setOpen,
  asunto,
  accion,
  onSuccess,
}) {
  const esAceptar = accion === "aceptar";
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: periodos } = usePeriodosHorarios();

  // ===============================
  // MUTATION
  // ===============================
  const mutation = useMutation({
    mutationFn: async (id) => {
      const nuevoEstado = esAceptar ? 1 : 2;

      const res = await fetch(`${API_URL}/db/permisos/estado/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error actualizando estado");
      return data;
    },
    onSuccess: () => {
      if (!asunto) return;

      const profesorCompleto = `${asunto.nombreProfesor || ""} ${
        asunto.apellidosProfesor || ""
      }`.trim();

      const esAsuntoPropio = asunto.tipo === 13;
      const textoTipo = esAsuntoPropio ? "asunto propio" : "permiso";

      toast.success(
        esAceptar
          ? `Petición de ${textoTipo} de ${profesorCompleto} ACEPTADA`
          : `${textoTipo} rechazado correctamente`
      );

      // Invalidar queries para refrescar la interfaz
      queryClient.invalidateQueries(["asuntosPropios", "todos"]);
      queryClient.invalidateQueries(["asuntosPropios", user.uid]);
      queryClient.invalidateQueries(["notificacionesDirectiva"]);

      const fechaObj = new Date(asunto.fecha);
      const month = fechaObj.getMonth();
      const year = fechaObj.getFullYear();

      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(
        year,
        month + 1,
        0
      ).getDate()}`;

      queryClient.invalidateQueries({
        queryKey: ["asuntosMes", start, end],
      });

      setOpen(false);
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "No se pudo actualizar el estado");
    },
  });

  // ===============================
  // GUARD CLAUSE
  // ===============================
  if (!asunto) return null;

  // ===============================
  // DATOS DERIVADOS
  // ===============================
  const esAsuntoPropio = asunto.tipo === 13;
  const textoTipo = esAsuntoPropio ? "asunto propio" : "permiso";
  const textoTipoLargo = textoTipoPermiso(asunto.tipo);

  const nombreProfesor = asunto.nombreProfesor || "";
  const apellidosProfesor = asunto.apellidosProfesor || "";
  const profesorCompleto = `${nombreProfesor} ${apellidosProfesor}`.trim();

  // --- LÓGICA DE FECHA / RANGO ---
  const fInicio = new Date(asunto.fecha);
  const fFin = asunto.fecha_fin ? new Date(asunto.fecha_fin) : null;
  const opcionesFormato = { day: "2-digit", month: "2-digit", year: "numeric" };

  let fechaMostrar = fInicio.toLocaleDateString("es-ES", opcionesFormato);

  // Si existe fecha_fin y es un día diferente al de inicio
  if (fFin && fInicio.toDateString() !== fFin.toDateString()) {
    fechaMostrar = `Del ${fechaMostrar} al ${fFin.toLocaleDateString("es-ES", opcionesFormato)}`;
  }
  // -------------------------------

  const Icono = getIconoTipo(asunto.tipo);

  // ===============================
  // HORARIO
  // ===============================
  const periodoInicio = periodos?.find((p) => p.id === asunto.idperiodo_inicio);
  const periodoFin = periodos?.find((p) => p.id === asunto.idperiodo_fin);

  let textoHorario = "No especificado";

  if (asunto.dia_completo) {
    textoHorario = "Jornada completa";
  } else if (periodoInicio) {
    if (periodoFin && periodoInicio.id !== periodoFin.id) {
      textoHorario = `De ${periodoInicio.nombre} a ${periodoFin.nombre}`;
    } else {
      textoHorario = periodoInicio.nombre;
    }
  }

  // ===============================
  // RENDER
  // ===============================
  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader
          className={`${
            esAceptar ? "bg-green-500" : "bg-red-600"
          } text-white rounded-t-lg flex items-center justify-center py-3 px-6`}
        >
          <DialogTitle className="text-lg font-semibold text-center">
            {esAceptar ? "Confirmar aceptación" : "Confirmar rechazo"}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-700 px-6 pt-5 pb-4 space-y-4">
          <p className="font-medium">
            {esAceptar
              ? `¿Desea aceptar este ${textoTipo}?`
              : `¿Desea rechazar este ${textoTipo}?`}
          </p>

          <div className="border rounded-md bg-gray-50 p-3 space-y-1">
            {profesorCompleto && (
              <p>
                <strong>Profesor:</strong> {profesorCompleto}
              </p>
            )}

            <p>
              <strong>Fecha:</strong> {fechaMostrar}
            </p>

            <p>
              <strong>Horario:</strong> {textoHorario}
            </p>

            <div className="flex items-center gap-2">
              <strong>Tipo:</strong>
              <Icono className="w-4 h-4 text-gray-600" />
              <span>{textoTipoLargo}</span>
            </div>

            {asunto.descripcion && (
              <p>
                <strong>Descripción:</strong> {asunto.descripcion}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-3 bg-gray-50 flex gap-2">
          <Button
            onClick={() => mutation.mutate(asunto.id)}
            className={
              esAceptar
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-600 hover:bg-red-700"
            }
            disabled={mutation.isPending}
          >
            {mutation.isPending
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
