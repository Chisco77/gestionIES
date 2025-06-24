// components/DialogoEditarPrestamos.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DialogoEditarPrestamos({ open, onClose, alumno }) {
  if (!alumno) return null;

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Préstamos de {alumno.nombreAlumno}</DialogTitle>
        </DialogHeader>
        <ul className="space-y-2 max-h-80 overflow-y-auto text-sm">
          {alumno.prestamos.map((p, i) => (
            <li key={i} className="border p-2 rounded">
              <div><strong>Libro:</strong> {p.libro}</div>
              <div><strong>Entrega:</strong> {p.fechaentrega?.slice(0, 10) || "—"}</div>
              <div><strong>Devuelto:</strong> {p.devuelto ? "Sí" : "No"}</div>
              <div><strong>Devolución:</strong> {p.fechadevolucion?.slice(0, 10) || "—"}</div>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
