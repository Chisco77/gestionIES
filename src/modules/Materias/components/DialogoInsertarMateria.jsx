/**
 * DialogoInsertarMateria.jsx - Diálogo para crear una nueva materia
 *
 * Autor: Francisco Damian Mendez Palma
 * Fecha: 2026
 *
 * Descripción:
 * Permite insertar una nueva materia en la base de datos.
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
// 1. Importamos useQueryClient
import { useQueryClient } from "@tanstack/react-query";

export function DialogoInsertarMateria({ open, onClose, onSuccess }) {
  const [nombre, setNombre] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  // 2. Inicializamos el cliente
  const queryClient = useQueryClient();

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/materias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nombre }),
      });

      if (!res.ok) throw new Error("Error al insertar");

      // 3. Invalidamos la caché de 'materias'
      // Esto marca los datos como 'stale' y dispara un refetch automático
      await queryClient.invalidateQueries({ queryKey: ["materias"] });

      toast.success("Materia insertada correctamente");
      setNombre("");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Error al insertar materia");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Insertar materia</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Nombre de la materia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGuardar()}
        />
        <DialogFooter>
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
