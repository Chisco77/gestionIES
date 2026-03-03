/**
 * DialogoInsertarLibro.jsx - Componente de diálogo para insertar un libro
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
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
 * Componente que renderiza un diálogo para agregar un nuevo libro.
 * - Permite seleccionar el curso al que pertenece el libro.
 * - Permite introducir el nombre del libro mediante un input.
 * - Gestiona la inserción mediante una llamada fetch al backend.
 * - Notifica al usuario del éxito o error mediante toast.
 *
 * Props:
 * - open: boolean, controla si el diálogo está abierto.
 * - onClose: función que se ejecuta al cerrar el diálogo.
 * - cursos: array de objetos con los cursos disponibles para asignar al libro.
 * - onSuccess: función opcional que se llama después de una inserción exitosa.
 *
 * Dependencias:
 * - React
 * - @/components/ui/dialog
 * - @/components/ui/button
 * - @/components/ui/input
 * - sonner (toast)
 *
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DialogoInsertarLibro({
  open,
  onClose,
  cursos,
  materias,
  onSuccess,
}) {
  const [libro, setLibro] = useState("");
  const [idcurso, setIdcurso] = useState("");
  const [idmateria, setIdmateria] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleGuardar = async () => {
    if (!libro || !idcurso || !idmateria) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/db/libros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          libro,
          idcurso: Number(idcurso),
          idmateria: Number(idmateria),
        }),
      });

      if (!res.ok) throw new Error("Error al insertar");

      toast.success("Libro insertado correctamente");
      setLibro("");
      setIdcurso("");
      setIdmateria("");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Error al insertar libro");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Insertar libro</DialogTitle>
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
        <Input
          placeholder="Nombre del libro"
          value={libro}
          onChange={(e) => setLibro(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
