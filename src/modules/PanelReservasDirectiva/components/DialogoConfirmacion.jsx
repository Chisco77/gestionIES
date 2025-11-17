import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DialogoConfirmacion({
  open,
  setOpen,
  onConfirm,
  mensaje,
  accion,    
}) {
  const esAceptar = accion === "aceptar";

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        {/* HEADER */}
        <DialogHeader
          className={`${
            esAceptar ? "bg-blue-500" : "bg-red-600"
          } text-white rounded-t-lg flex items-center justify-center py-3 px-6`}
        >
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            {esAceptar ? "Confirmar aceptación" : "Confirmar rechazo"}
          </DialogTitle>
        </DialogHeader>

        {/* CUERPO */}
        <div className="text-sm text-gray-700 space-y-4 px-6 pt-5 pb-2">
          {mensaje}
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 bg-gray-50 flex gap-2">
          {esAceptar ? (
            <>
              <Button
                onClick={onConfirm}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Aceptar
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                onClick={onConfirm}
              >
                Rechazar
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
