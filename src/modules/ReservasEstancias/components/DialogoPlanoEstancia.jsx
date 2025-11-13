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
            {estancia.descripcion}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <PlanoEstanciaResaltada estancia={estancia} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
