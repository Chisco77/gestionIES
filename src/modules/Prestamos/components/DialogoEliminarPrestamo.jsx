/**
 * DialogoEliminarPrestamo.jsx - Diálogo de confirmación para eliminar un préstamo
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
 * un préstamo de la base de datos (cabecera + items).
 *
 * Props:
 * - open: boolean, controla la visibilidad del diálogo.
 * - onClose: función que cierra el diálogo.
 * - alumnoSeleccionado: objeto con info del préstamo (id_prestamo, nombreUsuario).
 * - onSuccess: callback opcional que se ejecuta tras la eliminación con éxito.
 *
 * Funcionalidad:
 * - Envía una petición POST a `/db/prestamos/eliminar` con idprestamo.
 * - Si la eliminación es exitosa:
 *   - Muestra una notificación de éxito.
 *   - Ejecuta el callback `onSuccess`.
 *   - Cierra el diálogo.
 * - Si ocurre un error:
 *   - Intenta leer el mensaje del backend.
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

export function DialogoEliminarPrestamo({
  open,
  onClose,
  alumnoSeleccionado,
  onSuccess,
}) {
  const API_URL = import.meta.env.VITE_API_URL;

  const handleEliminar = async () => {
    if (!alumnoSeleccionado) {
      toast.error("No se ha seleccionado ningún préstamo.");
      return;
    }

    if (alumnoSeleccionado.doc_compromiso !== 0) {
      toast.error(
        `No se puede eliminar el préstamo de ${alumnoSeleccionado.nombreUsuario} porque tiene un documento de compromiso entregado.`
      );
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/prestamos/eliminar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idprestamo: alumnoSeleccionado.id_prestamo }),
      });

      if (!res.ok) {
        let errorMsg = "Error al eliminar préstamo";
        try {
          const data = await res.json();
          if (data?.error) errorMsg = data.error;
        } catch {
          // si la respuesta no es JSON, dejamos el mensaje genérico
        }
        throw new Error(errorMsg);
      }

      toast.success("Préstamo eliminado correctamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al eliminar préstamo");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>¿Eliminar préstamo?</DialogTitle>
        </DialogHeader>
        <p className="text-sm">
          Esta acción eliminará permanentemente el préstamo de{" "}
          <span className="font-semibold">
            {alumnoSeleccionado?.nombreUsuario}
          </span>
          .
        </p>
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
