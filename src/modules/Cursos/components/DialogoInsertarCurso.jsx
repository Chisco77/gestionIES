/**
 * DialogoInsertarCurso.jsx - Diálogo para crear un nuevo curso
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
 * Componente que muestra un cuadro de diálogo para insertar un curso
 * en la base de datos.
 *
 * Props:
 * - open: boolean, controla la visibilidad del diálogo.
 * - onClose: función que cierra el diálogo.
 * - onSuccess: callback opcional que se ejecuta tras la inserción exitosa.
 *
 * Estado interno:
 * - curso: string que almacena el nombre del curso a insertar.
 *
 * Funcionalidad:
 * - Permite al usuario escribir el nombre de un nuevo curso en un input.
 * - Envía una petición POST a la API para crear el curso.
 * - Si la operación es exitosa:
 *   - Muestra notificación de éxito.
 *   - Limpia el campo de entrada.
 *   - Ejecuta el callback `onSuccess`.
 *   - Cierra el diálogo.
 * - Si ocurre un error:
 *   - Muestra una notificación de error.
 *   - Loggea el error en consola.
 *
 * Dependencias:
 * - @/components/ui/dialog
 * - @/components/ui/button
 * - @/components/ui/input
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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";


export function DialogoInsertarCurso({ open, onClose, onSuccess }) {
  const [curso, setCurso] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const handleGuardar = async () => {
    try {
       const res = await fetch(
        `${API_URL}/db/cursos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ curso }),
      });

      if (!res.ok) throw new Error("Error al insertar");

      toast.success("Curso insertado correctamente");
      setCurso("");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Error al insertar curso");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Insertar curso</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Nombre del curso"
          value={curso}
          onChange={(e) => setCurso(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
