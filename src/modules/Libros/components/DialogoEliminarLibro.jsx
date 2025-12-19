/**
 * DialogoEliminarLibro.jsx - Componente de diálogo para eliminar un libro
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
 * Componente que renderiza un diálogo para confirmar la eliminación de un libro.
 * - Muestra un mensaje de advertencia indicando que la acción no se puede deshacer.
 * - Gestiona la eliminación mediante una llamada fetch al backend.
 * - Notifica al usuario del éxito o error mediante toast.
 *
 * Props:
 * - open: boolean, controla si el diálogo está abierto.
 * - onClose: función que se ejecuta al cerrar el diálogo.
 * - libroSeleccionado: objeto con los datos del libro a eliminar (id, libro, idcurso).
 * - onSuccess: función opcional que se llama después de una eliminación exitosa.
 *
 * Dependencias:
 * - React
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

export function DialogoEliminarLibro({
  open,
  onClose,
  libroSeleccionado,
  onSuccess,
}) {
  if (!libroSeleccionado) return null;

  const API_URL = import.meta.env.VITE_API_URL;
  const handleEliminar = async () => {
    try {
      const res = await fetch(`${API_URL}/db/libros/${libroSeleccionado.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        // Intentamos leer el mensaje que manda el backend
        let errorMsg = "Error al eliminar libro";
        try {
          const data = await res.json();
          if (data?.message) errorMsg = data.message;
        } catch {
          // si no se puede parsear JSON, dejamos el mensaje genérico
        }
        throw new Error(errorMsg);
      }

      toast.success("Libro eliminado");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al eliminar libro");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-red-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Eliminar Libro
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700 mb-4 space-y-2 px-6 pt-4">
          <div>
            <span className="font-medium">Libro:</span>{" "}
            {libroSeleccionado.libro}
          </div>

          <div className="text-red-600 font-semibold mt-2">
            Esta acción no se puede deshacer.
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleEliminar}
          >
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
