/**
 * DialogoEditarLibro.jsx - Componente de diálogo para editar un libro
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
 * Componente que renderiza un diálogo para editar la información de un libro.
 * - Permite modificar:
 *    - Nombre del libro.
 *    - Curso asociado al libro (selección desde un dropdown).
 * - Integra validación mínima y notificaciones con toast.
 *
 * Props:
 * - open: boolean, controla si el diálogo está abierto.
 * - onClose: función que se ejecuta al cerrar el diálogo.
 * - libroSeleccionado: objeto con los datos del libro a editar (id, libro, idcurso).
 * - cursos: array de cursos disponibles para seleccionar en el dropdown.
 * - onSuccess: función opcional que se llama después de una edición exitosa.
 *
 * Dependencias:
 * - React (useState, useEffect)
 * - @/components/ui/dialog
 * - @/components/ui/input
 * - @/components/ui/button
 * - sonner (toast)
 *
 */


import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


export function DialogoEditarLibro({
  open,
  onClose,
  libroSeleccionado,
  cursos,
  onSuccess,
}) {
  const [libro, setLibro] = useState("");
  const [idcurso, setIdcurso] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    if (libroSeleccionado) {
      setLibro(libroSeleccionado.libro || "");
      setIdcurso(libroSeleccionado.idcurso || "");
    }
  }, [libroSeleccionado]);

  const handleEditar = async () => {
    try {
      const res = await fetch(
        `${API_URL}/db/libros/${libroSeleccionado.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ libro, idcurso }),
        }
      );

      if (!res.ok) throw new Error("Error al modificar");

      toast.success("Libro modificado");
      await onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Error al modificar libro");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Editar libro</DialogTitle>
        </DialogHeader>
        <select
          value={idcurso}
          onChange={(e) => setIdcurso(e.target.value)}
          className="border p-2 rounded w-full text-sm"
        >
          <option value="">Seleccionar curso</option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.curso}
            </option>
          ))}
        </select>
        <Input value={libro} onChange={(e) => setLibro(e.target.value)} />
        <DialogFooter>
          <Button onClick={handleEditar}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


