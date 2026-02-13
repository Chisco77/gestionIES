/**
 * DialogoPlanoEstancia.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Muestra un diálogo con el plano de la planta de una estancia seleccionada,
 * resaltando la ubicación de la estancia y mostrando información relevante
 * como la planta y el número de ordenadores disponibles.
 *
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import PlanoEstanciaResaltada from "@/modules/Utilidades/components/PlanoEstanciasResaltada";

export function DialogoPlanoEstancia({ open, onClose, estancia }) {
  if (!estancia) return null;

  
  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="max-w-5xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            Plano de la planta ({estancia.planta || "baja"}) —{" "}
            {estancia.descripcion} {"("}{estancia.numero_ordenadores} {"ordenadores)"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <PlanoEstanciaResaltada estancia={estancia} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
