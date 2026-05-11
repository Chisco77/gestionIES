import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function DialogoEliminarSustitucion({
  open,
  onOpenChange,
  sustitucion,
}) {
  const queryClient = useQueryClient();

  const handleEliminar = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/db/sustituciones/${sustitucion.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Error al eliminar");

      toast.success("Registro de sustitución eliminado");
      queryClient.invalidateQueries({ queryKey: ["sustituciones"] });
      await queryClient.invalidateQueries({
        queryKey: ["horario-profesorado"],
      });
      onOpenChange(false);
    } catch (err) {
      toast.error("No se pudo eliminar el registro");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onInteractOutside={(e) => e.preventDefault()} >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            ¿Eliminar registro de sustitución?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-900">
              <p className="font-semibold underline">
                ¡CUIDADO! Acción destructiva
              </p>
              <p className="text-xs mt-1">
                Esta acción es irreversible y borra completamente el registro de
                la base de datos.
              </p>
            </div>

            <div className="text-sm text-slate-600 space-y-2">
              <p>Se realizarán los siguientes procesos:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Eliminación del registro histórico de la sustitución.</li>
                <li>
                  <span className="font-bold text-red-600">
                    Borrado total del horario
                  </span>{" "}
                  que el sustituto había heredado del titular.
                </li>
              </ul>
            </div>

            <div className="bg-slate-100 p-3 rounded-md border border-slate-200">
              <p className="text-xs">
                <strong>¿Cuándo usar esto?</strong> Solo para corregir{" "}
                <strong>errores administrativos</strong> (ej. te equivocaste de
                profesor al crear la sustitución).
              </p>
              <p className="text-xs mt-2 italic">
                <strong>Nota:</strong> Si el profesor titular se ha
                reincorporado,
                <strong> NO uses este botón</strong>. Usa el botón de{" "}
                <span className="text-amber-600 font-bold uppercase">
                  Finalizar
                </span>{" "}
                (icono de la puerta) para mantener el histórico.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleEliminar}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar permanentemente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
