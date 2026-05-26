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
  const [acronimoUntis, setAcronimoUntis] = useState(""); 
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
        // 👈 Enviamos el acrónimo (si está vacío, enviamos null o string vacío, el backend ya lo gestiona)
        body: JSON.stringify({
          nombre,
          acronimo_untis: acronimoUntis.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Error al insertar");

      // 3. Invalidamos la caché de 'materias'
      // Esto marca los datos como 'stale' y dispara un refetch automático
      await queryClient.invalidateQueries({ queryKey: ["materias"] });

      toast.success("Materia insertada correctamente");
      setNombre("");
      setAcronimoUntis(""); // 👈 Limpiamos el estado al terminar
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

        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre de la materia
            </label>
            <Input
              placeholder="Ej: Lengua Castellana y Literatura"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuardar()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Acrónimo Untis
            </label>
            <Input
              placeholder="Ej: LCL"
              value={acronimoUntis}
              onChange={(e) => setAcronimoUntis(e.target.value.toUpperCase())} // Forzado a mayúsculas opcional
              onKeyDown={(e) => e.key === "Enter" && handleGuardar()}
              maxLength={15}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancelar
          </Button>
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
