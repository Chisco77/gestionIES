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
import { Monitor, Map as MapIcon, X } from "lucide-react"; // Añadimos X por si quieres un botón manual
import { Badge } from "@/components/ui/badge";
import PlanoEstanciaResaltada from "@/modules/Utilidades/components/PlanoEstanciasResaltada";

export function DialogoPlanoEstancia({ open, onClose, estancia }) {
  if (!estancia) return null;

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg max-w-6xl w-[92vw] h-[90vh] max-h-[90vh] flex flex-col border-none shadow-2xl bg-white"
      >
        <DialogHeader className="bg-green-600 text-white flex flex-col items-center justify-center py-3 px-8 border-b border-green-700 shrink-0">
          <DialogTitle className="text-xl font-bold tracking-tight text-center">
            {estancia.descripcion}
          </DialogTitle>
          <div className="flex items-center gap-3 mt-1">
            {/* Mostramos el label del plano si viene en la estancia */}
            <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded text-green-50">
              {estancia.label_plano || "Plano del Centro"}
            </span>
            {estancia.numero_ordenadores > 0 && (
              <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded text-blue-100">
                <Monitor className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase">
                  {estancia.numero_ordenadores} PC
                </span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 w-full p-2 md:p-4 bg-slate-50 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 w-full bg-white rounded-xl shadow-inner border border-slate-200 p-2 overflow-hidden">
            <PlanoEstanciaResaltada estancia={estancia} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
