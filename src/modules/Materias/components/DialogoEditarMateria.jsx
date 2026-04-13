/**
 * DialogoEditarMateria.jsx - Diálogo para editar una materia existente
 *
 * Autor: Francisco Damian Mendez Palma
 * Fecha: 2026
 *
 * Descripción:
 * Permite modificar el nombre de una materia seleccionada.
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
// 1. Importamos el hook del cliente
import { useQueryClient } from "@tanstack/react-query";

export function DialogoEditarMateria({
  open,
  onClose,
  materiaSeleccionada,
  onSuccess,
}) {
  const [nombre, setNombre] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  // 2. Inicializamos el cliente
  const queryClient = useQueryClient();

  useEffect(() => {
    if (materiaSeleccionada) setNombre(materiaSeleccionada.nombre || "");
  }, [materiaSeleccionada]);

  const handleEditar = async () => {
    if (!nombre.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/db/materias/${materiaSeleccionada.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ nombre }),
        }
      );

      if (!res.ok) throw new Error("Error al modificar");

      // 3. Invalidamos la caché para que useMaterias vuelva a pedir los datos
      await queryClient.invalidateQueries({ queryKey: ["materias"] });

      toast.success("Materia modificada");

      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      toast.error("Error al modificar materia");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Editar materia</DialogTitle>
        </DialogHeader>
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEditar()}
        />
        <DialogFooter>
          <Button onClick={handleEditar}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
