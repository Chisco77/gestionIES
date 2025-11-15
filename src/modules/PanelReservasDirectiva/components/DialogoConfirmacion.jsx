import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DialogoConfirmacion({ open, setOpen, onConfirm, mensaje }) {
  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogContent className="sm:max-w-[400px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Confirmación</DialogTitle>
        </DialogHeader>
        <p className="my-4">{mensaje}</p>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
