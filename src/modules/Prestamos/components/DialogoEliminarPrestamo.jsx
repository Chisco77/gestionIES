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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import { useState } from "react";

export function DialogoEliminarPrestamo({
  open,
  onClose,
  alumnoSeleccionado,
  onSuccess,
}) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const eliminarPrestamo = async () => {
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
        } catch {}
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

  const handleEliminar = () => {
    if (!alumnoSeleccionado) {
      toast.error("No se ha seleccionado ningún préstamo.");
      return;
    }

    // ⚠️ Si hay documento → mostrar alerta
    if (alumnoSeleccionado.doc_compromiso !== 0) {
      setMostrarAlerta(true);
      return;
    }

    // ✅ Eliminación directa
    eliminarPrestamo();
  };

  const getEstadoTexto = () => {
    if (alumnoSeleccionado?.doc_compromiso === 1) return "entregado";
    if (alumnoSeleccionado?.doc_compromiso === 2) return "recibido";
    return "";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose} modal={true}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="p-0 overflow-hidden rounded-lg"
        >
          <DialogHeader className="bg-red-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
            <DialogTitle className="text-lg font-semibold text-center leading-snug">
              ¿Eliminar préstamo?
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-gray-700 mb-4 space-y-2 px-6 pt-4">
            <div className="text-red-600 font-semibold mt-2">
              Esta acción eliminará permanentemente el préstamo de{" "}
              {alumnoSeleccionado?.nombreUsuario}
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

      {/* ⚠️ ALERTA EXTRA */}
      <AlertDialog open={mostrarAlerta} onOpenChange={setMostrarAlerta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atención</AlertDialogTitle>
            <AlertDialogDescription>
              El préstamo de {alumnoSeleccionado?.nombreUsuario} tiene un
              documento de compromiso en estado <b>{getEstadoTexto()}</b>.
              <br />
              <br />
              Si continúas, se eliminará igualmente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setMostrarAlerta(false);
                eliminarPrestamo();
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
