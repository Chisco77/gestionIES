/**
 * DialogoEditarCurso.jsx - Diálogo para editar un curso existente
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
 * Componente que muestra un cuadro de diálogo para modificar el nombre
 * de un curso previamente seleccionado.
 *
 * Props:
 * - open: boolean, controla la visibilidad del diálogo.
 * - onClose: función que cierra el diálogo.
 * - cursoSeleccionado: objeto con la información del curso (id, curso).
 * - onSuccess: callback opcional que se ejecuta tras modificar con éxito.
 *
 * Estado interno:
 * - curso: string que almacena el nombre del curso a editar.
 *
 * Funcionalidad:
 * - Al abrirse, inicializa el campo de texto con el nombre del curso recibido.
 * - Permite modificar el curso y guardar cambios mediante petición PUT a la API.
 * - Si la operación es exitosa, muestra notificación de éxito, ejecuta `onSuccess`
 *   y cierra el diálogo.
 * - Si ocurre un error, muestra notificación de error.
 *
 * Dependencias:
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


export function DialogoEditarCurso({
  open,
  onClose,
  cursoSeleccionado,
  onSuccess,
}) {
  const [curso, setCurso] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Este efecto actualiza el input cuando cambia el curso seleccionado
  useEffect(() => {
    if (cursoSeleccionado) {
      setCurso(cursoSeleccionado.curso || "");
    }
  }, [cursoSeleccionado]);

  const handleEditar = async () => {
    console.log ("Curso seleccionado: ",cursoSeleccionado.id);
  try {
    const res =  await fetch(`${API_URL}/db/cursos/${cursoSeleccionado.id}`, 
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ curso }),
      }
    );

    if (!res.ok) throw new Error("Error al modificar");

    toast.success("Curso modificado");
    await onSuccess?.(); // Esperamos recargar
    onClose();           // Y luego cerramos
  } catch (err) {
    toast.error("Error al modificar curso");
    console.error(err);
  }
};

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Editar curso</DialogTitle>
        </DialogHeader>
        <Input value={curso} onChange={(e) => setCurso(e.target.value)} />
        <DialogFooter>
          <Button onClick={handleEditar}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
