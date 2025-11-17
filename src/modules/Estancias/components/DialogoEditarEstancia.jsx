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
 *    - Reservable (booleano)
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function DialogoEditarEstancia({
  open,
  onClose,
  estanciaSeleccionada,
  onSuccess,
}) {
  const [descripcion, setDescripcion] = useState("");
  const [totalllaves, setTotalllaves] = useState("");
  const [numero_ordenadores, setNumeroOrdenadores] = useState("");

  const [armario, setArmario] = useState("");
  const [codigollave, setCodigoLlave] = useState("");
  const [reservable, setReservable] = useState(false);
  const [tipoestancia, setTipoEstancia] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (estanciaSeleccionada) {
      setDescripcion(estanciaSeleccionada.descripcion || "");
      setTotalllaves(estanciaSeleccionada.totalllaves || "");
      setArmario(estanciaSeleccionada.armario || "");
      setCodigoLlave(estanciaSeleccionada.codigollave || "");
      setReservable(!!estanciaSeleccionada.reservable);
      setTipoEstancia(estanciaSeleccionada.tipoestancia || "");
      setNumeroOrdenadores(estanciaSeleccionada.numero_ordenadores || "");
    }
  }, [estanciaSeleccionada]);
  console.log(estanciaSeleccionada);
  const handleEditar = async () => {
    try {
      const res = await fetch(
        `${API_URL}/db/estancias/${estanciaSeleccionada.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            descripcion,
            totalllaves,
            armario,
            codigollave,
            reservable,
            tipoestancia,
            numero_ordenadores,
          }),
        }
      );

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
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        {/* ENCABEZADO */}
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar estancia
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 p-6">
          <div>
            <Label className="text-sm font-medium">Descripción</Label>
            <Input
              placeholder="Ej: Laboratorio de Ciencias"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Tipo de Estancia</Label>
            <select
              value={tipoestancia}
              onChange={(e) => setTipoEstancia(e.target.value)}
              className="border p-2 rounded w-full text-sm"
            >
              <option value="">Seleccionar tipo</option>
              <option value="Almacen">Almacén</option>
              <option value="Aula">Aula</option>
              <option value="Departamento">Departamento</option>
              <option value="Despacho">Despacho</option>
              <option value="Infolab">Infolab</option>
              <option value="Laboratorio">Laboratorio</option>
              <option value="Otras">Otras</option>
            </select>
          </div>

          <div>
            <Label className="text-sm font-medium">Nº de llaves</Label>
            <Input
              type="number"
              placeholder="Ej: 3"
              value={totalllaves}
              onChange={(e) => setTotalllaves(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Llavera</Label>
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
            <Label className="text-sm font-medium">Código de la llave</Label>
            <Input
              placeholder="Ej: A-23"
              value={codigollave}
              onChange={(e) => setCodigoLlave(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Nº de ordenadores</Label>
            <Input
              type="number"
              placeholder="Ej: 3"
              value={numero_ordenadores}
              onChange={(e) => setNumeroOrdenadores(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between border rounded-md p-3 mt-2">
            <Label className="text-sm font-medium">Reservable</Label>
            <Switch checked={reservable} onCheckedChange={setReservable} />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={handleEditar}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
