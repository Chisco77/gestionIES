/**
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * DIÁLOGO ELIMINAR CELDA DE HORARIO
 *
 * Componente encargado de confirmar y ejecutar la eliminación
 * de una sesión concreta del horario de un profesor.
 *
 * FUNCIONALIDAD
 * - Muestra confirmación antes de eliminar
 * - Ejecuta DELETE contra el backend
 * - Notifica resultado mediante toast
 * - Notifica al componente padre para refrescar datos
 *
 * NOTAS
 * - Requiere que se pase una celda válida con su id
 * - Evita renderizado si no existe celda seleccionada
 * - Acción irreversible
 *
 * ------------------------------------------------------------
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import { toast } from "sonner";

export function DialogoEliminarCeldaHorario({
  open,
  onClose,
  celda,
  onEliminar,
}) {
  const API_URL = import.meta.env.VITE_API_URL;

  const handleEliminar = async () => {
    console.log("Eliminando ID:", celda.id); // Si aquí sale "undefined", el problema es el paso de datos anterior
    try {
      const res = await fetch(`${API_URL}/db/horario-profesorado/${celda.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al eliminar");

      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      toast.success("Celda eliminada");

      onEliminar?.();

      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al eliminar");
    }
  };

  if (!celda) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar esta sesión?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer.
            <br />
            {celda.materia && <strong>{celda.materia}</strong>}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleEliminar}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
