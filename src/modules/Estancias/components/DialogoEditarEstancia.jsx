/**
 * DialogoEditarEstancia.jsx - Componente de diálogo para editar una estancia
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
 * Componente que renderiza un diálogo para editar la información de una estancia.
 * - Permite modificar:
 *    - Descripción
 *    - Nº de llaves
 *    - Armario (seleccionable: Llavera 1 / Llavera 2)
 *    - Código de la llave
 *
 * Props:
 * - open: boolean → controla si el diálogo está abierto.
 * - onClose: función → se ejecuta al cerrar el diálogo.
 * - estanciaSeleccionada: objeto con los datos actuales de la estancia.
 * - onSuccess: función opcional que se llama tras una edición exitosa.
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

export function DialogoEditarEstancia({
  open,
  onClose,
  estanciaSeleccionada,
  onSuccess,
}) {
  const [descripcion, setDescripcion] = useState("");
  const [totalllaves, setTotalllaves] = useState("");
  const [armario, setArmario] = useState("");
  const [codigollave, setCodigoLlave] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (estanciaSeleccionada) {
      setDescripcion(estanciaSeleccionada.descripcion || "");
      setTotalllaves(estanciaSeleccionada.totalllaves || "");
      setArmario(estanciaSeleccionada.armario || "");
      setCodigoLlave(estanciaSeleccionada.codigollave || "");
    }
  }, [estanciaSeleccionada]);

  const handleEditar = async () => {
    try {
      const res = await fetch(`${API_URL}/db/estancias/${estanciaSeleccionada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          descripcion,
          totalllaves,
          armario,
          codigollave,
        }),
      });

      if (!res.ok) throw new Error("Error al modificar estancia");

      toast.success("Estancia modificada correctamente");
      await onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Error al modificar estancia");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Editar estancia</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-sm font-medium">Descripción</label>
            <Input
              placeholder="Ej: Laboratorio de Ciencias"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Nº de llaves</label>
            <Input
              type="number"
              placeholder="Ej: 3"
              value={totalllaves}
              onChange={(e) => setTotalllaves(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Llavera</label>
            <select
              value={armario}
              onChange={(e) => setArmario(e.target.value)}
              className="border p-2 rounded w-full text-sm"
            >
              <option value="">Seleccionar llavera</option>
              <option value="Llavera 1">Llavera 1</option>
              <option value="Llavera 2">Llavera 2</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Código de la llave</label>
            <Input
              placeholder="Ej: A-23"
              value={codigollave}
              onChange={(e) => setCodigoLlave(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleEditar}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
