/**
 * DialogoLlavesRestricciones.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Proyecto: gestionIES
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Descripción:
 * Diálogo para activar o desactivar la restricción
 * de entrega de llaves solo con reserva previa.
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function DialogoLlavesRestricciones({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  const [activa, setActiva] = useState(false);
  const [existe, setExiste] = useState(false);
  const [cargando, setCargando] = useState(false);

  // ---------------------------------------------------
  // Cargar restricción al abrir diálogo
  // ---------------------------------------------------
  useEffect(() => {
    if (open) {
      fetchRestriccionLlaves();
    }
  }, [open]);

  const fetchRestriccionLlaves = async () => {
    try {
      setCargando(true);

      const res = await fetch(`${API_URL}/db/restricciones/llaves`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al obtener restricción");

      const data = await res.json();

      if (data) {
        setActiva(data.valor_bool);
        setExiste(true);
      } else {
        setActiva(false);
        setExiste(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo cargar la restricción de llaves");
    } finally {
      setCargando(false);
    }
  };

  // ---------------------------------------------------
  // Guardar (crear o actualizar)
  // ---------------------------------------------------
  const guardarRestriccionMutation = useMutation({
    mutationFn: async () => {
      const url = `${API_URL}/db/restricciones/llaves`;
      const method = existe ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ activa }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al guardar");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("Restricción actualizada correctamente");
      queryClient.invalidateQueries(["restriccion_llaves"]);
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleGuardar = () => {
    guardarRestriccionMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg w-[600px] flex flex-col"
      >
        {/* Header */}
        <DialogHeader className="bg-green-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Control de Entrega de Llaves
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="py-6 px-6">
            <div className="flex items-center justify-between space-x-6">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Entregar llave sólo si se ha reservado el aula previamente
                </Label>
                <p className="text-sm text-muted-foreground">
                  Si está activado, la llave únicamente podrá entregarse a la
                  persona que tenga una reserva activa del aula.
                </p>
              </div>

              <Switch
                checked={activa}
                onCheckedChange={setActiva}
                disabled={cargando}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          <Button
            onClick={handleGuardar}
            disabled={guardarRestriccionMutation.isLoading}
          >
            {guardarRestriccionMutation.isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
