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
  const [acronimoUntis, setAcronimoUntis] = useState(""); 
  const API_URL = import.meta.env.VITE_API_URL;

  // 2. Inicializamos el cliente
  const queryClient = useQueryClient();

  useEffect(() => {
    if (materiaSeleccionada) {
      setNombre(materiaSeleccionada.nombre || "");
      setAcronimoUntis(materiaSeleccionada.acronimo_untis || ""); // 👈 SINCRONIZAR AL CARGAR
    }
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
          // 👈 Enviamos ambos campos actualizados al backend
          body: JSON.stringify({
            nombre,
            acronimo_untis: acronimoUntis.trim() || null,
          }),
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

        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre de la materia
            </label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEditar()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Acrónimo Untis
            </label>
            <Input
              placeholder="Ej: LCL"
              value={acronimoUntis}
              onChange={(e) => setAcronimoUntis(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleEditar()}
              maxLength={15}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancelar
          </Button>
          <Button onClick={handleEditar}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
