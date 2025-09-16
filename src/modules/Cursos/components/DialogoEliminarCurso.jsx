/**
 * DialogoEliminarCurso.jsx - Diálogo de confirmación para eliminar un curso
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Componente que muestra un cuadro de diálogo de confirmación para eliminar
 * un curso seleccionado de la base de datos.
 *
 * Props:
 * - open: boolean, controla la visibilidad del diálogo.
 * - onClose: función que cierra el diálogo.
 * - cursoSeleccionado: objeto con la información del curso (id, curso).
 * - onSuccess: callback opcional que se ejecuta tras la eliminación con éxito.
 *
 * Funcionalidad:
 * - Envía una petición DELETE a la API para eliminar el curso seleccionado.
 * - Si la eliminación es exitosa:
 *   - Muestra una notificación de éxito.
 *   - Ejecuta el callback `onSuccess`.
 *   - Cierra el diálogo.
 * - Si ocurre un error:
 *   - Intenta leer el mensaje de error del backend.
 *   - Muestra una notificación con el error detectado.
 *
 * Dependencias:
 * - @/components/ui/dialog
 * - @/components/ui/button
 * - sonner (toast)
 *
  */


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DialogoEliminarCurso({
  open,
  onClose,
  cursoSeleccionado,
  onSuccess,
}) {
  const API_URL = import.meta.env.VITE_API_URL;

  const handleEliminar = async () => {
    try {
      const res = await fetch(
        `${API_URL}/db/cursos/${cursoSeleccionado.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        // Intentar leer mensaje del backend
        let errorMsg = "Error al eliminar curso";
        try {
          const data = await res.json();
          if (data?.message) errorMsg = data.message;
        } catch {
          // Si no es JSON, dejamos el mensaje genérico
        }
        throw new Error(errorMsg);
      }

      toast.success("Curso eliminado");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al eliminar curso");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>¿Eliminar curso?</DialogTitle>
        </DialogHeader>
        <p className="text-sm">Esta acción no se puede deshacer.</p>
        <DialogFooter>
          <Button variant="destructive" onClick={handleEliminar}>
            Eliminar
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
