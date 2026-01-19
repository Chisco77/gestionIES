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

  if (!asunto) return null;

  // Tipo dinámico
  const esAsuntoPropio = asunto.tipo === 13;
  const textoTipo = esAsuntoPropio ? "asunto propio" : "permiso"; // texto breve
  const textoTipoLargo = textoTipoPermiso(asunto.tipo); // texto largo del mapeo

  // Nombre del profesor (si existe)
  const nombreProfesor = asunto.nombreProfesor || "";
  const apellidosProfesor = asunto.apellidosProfesor || "";
  const profesorCompleto = `${nombreProfesor} ${apellidosProfesor}`.trim();

  // Formato de fecha
  const fechaLocal = new Date(asunto.fecha).toLocaleDateString("es-ES");

  // icono en funcion del tipo de permiso
  const Icono = getIconoTipo(asunto.tipo);

  const mutation = useMutation({
    mutationFn: async () => {
      const nuevoEstado = esAceptar ? 1 : 2;

      const res = await fetch(`${API_URL}/db/permisos/estado/${asunto.id}`, {
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
      toast.success(
        esAceptar
          ? `Petición de ${textoTipo} de ${profesorCompleto} ACEPTADA`
          : `${textoTipo} rechazado correctamente`
      );

      queryClient.invalidateQueries(["asuntosPropios", "todos"]);
      queryClient.invalidateQueries(["asuntosPropios", user.uid]);

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

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader
          className={`${esAceptar ? "bg-green-500" : "bg-red-600"} text-white rounded-t-lg flex items-center justify-center py-3 px-6`}
        >
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            {esAceptar ? "Confirmar aceptación" : "Confirmar rechazo"}
          </DialogTitle>
        </DialogHeader>

        {/* --- CUERPO DEL DIÁLOGO --- */}
        <div className="text-sm text-gray-700 px-6 pt-5 pb-4 space-y-4">
          {/* Pregunta dinámica */}
          <p className="font-medium">
            {esAceptar
              ? `¿Desea aceptar este ${textoTipo}?`
              : `¿Desea rechazar este ${textoTipo}?`}
          </p>

          {/* Información del permiso/asunto */}
          <div className="border rounded-md bg-gray-50 p-3 space-y-1">
            {profesorCompleto && (
              <p>
                <strong>Profesor:</strong> {profesorCompleto}
              </p>
            )}

            <p>
              <strong>Fecha:</strong> {fechaLocal}
            </p>

            <p className="flex items-center gap-2">
              <strong>Tipo:</strong>
              <Icono className="w-4 h-4 text-gray-600" />
              <span>{textoTipoLargo}</span>
            </p>

            {asunto.descripcion && (
              <p>
                <strong>Descripción:</strong> {asunto.descripcion}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-3 bg-gray-50 flex gap-2">
          <Button
            onClick={() => mutation.mutate()}
            className={
              esAceptar
                ? "bg-green-500 hover:bg-green-600"
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
