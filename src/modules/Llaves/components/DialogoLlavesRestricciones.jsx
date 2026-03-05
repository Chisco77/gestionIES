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
 * de entrega de llaves solo con reserva previa,
 * con gestión de excepciones por usuario.
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

  const [excepciones, setExcepciones] = useState([]);
  const [nuevoUid, setNuevoUid] = useState("");

  // ---------------------------------------------------
  // Cargar restricción y excepciones al abrir diálogo
  // ---------------------------------------------------
  useEffect(() => {
    if (open) {
      fetchRestriccionLlaves();
      fetchExcepciones();
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

  const fetchExcepciones = async () => {
    try {
      const res = await fetch(
        `${API_URL}/db/restricciones/llaves/excepciones`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Error al obtener excepciones");
      const data = await res.json();
      console.log ("Excepciones: ", data);
      setExcepciones(data.excepciones || []);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar las excepciones");
    }
  };

  // ---------------------------------------------------
  // Guardar restricción (crear o actualizar)
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

  // ---------------------------------------------------
  // Añadir excepción
  // ---------------------------------------------------
  const agregarExcepcion = async () => {
    if (!nuevoUid) return toast.error("Debe indicar un UID");
    try {
      const res = await fetch(
        `${API_URL}/db/restricciones/llaves/excepciones`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ uid: nuevoUid }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al añadir excepción");
      }
      const data = await res.json();
      setExcepciones(data.usuarios);
      setNuevoUid("");
      toast.success("Excepción añadida correctamente");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  // ---------------------------------------------------
  // Eliminar excepción
  // ---------------------------------------------------
  const eliminarExcepcion = async (uid) => {
    try {
      const res = await fetch(
        `${API_URL}/db/restricciones/llaves/excepciones`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ uid }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al eliminar excepción");
      }
      const data = await res.json();
      setExcepciones(data.usuarios);
      toast.success("Excepción eliminada correctamente");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------
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
          <CardContent className="py-6 px-6 space-y-4">
            {/* Switch de restricción */}
            <div className="flex items-center justify-between space-x-6">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Entregar llave sólo si se ha reservado el aula previamente
                </Label>
                <p className="text-sm text-muted-foreground">
                  Si está activado, la llave únicamente podrá entregarse a la
                  persona que tenga una reserva activa del aula, desde 15
                  minutos antes del inicio de la reserva
                </p>
              </div>
              <Switch
                checked={activa}
                onCheckedChange={setActiva}
                disabled={cargando}
              />
            </div>

            {/* Excepciones */}
            <div>
              <Label className="text-base font-medium">
                Excepciones (usuarios que pueden coger la llave sin reserva)
              </Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {excepciones.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No hay usuarios exentos
                  </p>
                )}
                {excepciones.map((uid) => (
                  <div
                    key={uid}
                    className="flex items-center justify-between border rounded px-3 py-1"
                  >
                    <span>{uid}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => eliminarExcepcion(uid)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex space-x-2">
                <input
                  type="text"
                  placeholder="UID del usuario"
                  value={nuevoUid}
                  onChange={(e) => setNuevoUid(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
                <Button size="sm" onClick={agregarExcepcion}>
                  Añadir
                </Button>
              </div>
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
