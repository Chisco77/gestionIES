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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  materias,
  onSuccess,
}) {
  const [libro, setLibro] = useState("");
  const [idcurso, setIdcurso] = useState("");
  const [idmateria, setIdmateria] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    if (libroSeleccionado) {
      setLibro(libroSeleccionado.libro || "");
      setIdcurso(String(libroSeleccionado.idcurso) || "");
      setIdmateria(String(libroSeleccionado.idmateria) || "");
    }
  }, [libroSeleccionado]);

  const handleEditar = async () => {
    // VALIDACIÓN
    if (!libro || !idcurso || !idmateria) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/db/libros/${libroSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          libro,
          idcurso: Number(idcurso),
          idmateria: Number(idmateria),
        }),
      });

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
        <Select value={idcurso} onValueChange={setIdcurso}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar curso" />
          </SelectTrigger>
          <SelectContent>
            {cursos.map((curso) => (
              <SelectItem key={curso.id} value={String(curso.id)}>
                {curso.curso}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={idmateria} onValueChange={setIdmateria}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar materia" />
          </SelectTrigger>
          <SelectContent>
            {materias.map((materia) => (
              <SelectItem key={materia.id} value={String(materia.id)}>
                {materia.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={libro} onChange={(e) => setLibro(e.target.value)} />
        <DialogFooter>
          <Button onClick={handleEditar}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
