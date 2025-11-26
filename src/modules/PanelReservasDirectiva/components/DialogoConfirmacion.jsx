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

  const mutation = useMutation({
    mutationFn: async () => {
      const nuevoEstado = esAceptar ? 1 : 2;
      const res = await fetch(
        `${API_URL}/db/asuntos-propios/estado/${asunto.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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
          ? "Petición de asunto propio de " + asunto.uid + " ACEPTADA"
          : "Asunto rechazado correctamente"
      );

      // Actualizar panel del usuario
      //queryClient.invalidateQueries(["asuntosMes", user.username]);
      queryClient.invalidateQueries(["asuntosPropios", "todos"]);
      queryClient.invalidateQueries(["asuntosPropios", user.uid]);

      // Actualizar calendario (useAsuntosMes)
      const fechaObj = new Date(asunto.fecha);
      const month = fechaObj.getMonth();
      const year = fechaObj.getFullYear();
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
      queryClient.invalidateQueries({ queryKey: ["asuntosMes", start, end] });

      setOpen(false);
      onSuccess?.();
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "No se pudo actualizar el estado");
    },
  });

  const handleConfirm = () => mutation.mutate();

  if (!asunto) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader
          className={`${esAceptar ? "bg-blue-500" : "bg-red-600"} text-white rounded-t-lg flex items-center justify-center py-3 px-6`}
        >
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            {esAceptar ? "Confirmar aceptación" : "Confirmar rechazo"}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-700 space-y-4 px-6 pt-5 pb-2">
          {esAceptar
            ? "¿Desea aceptar este asunto propio?"
            : "¿Desea rechazar este asunto propio?"}
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
