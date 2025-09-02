import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "";

export function DialogoDevolverLlaves({ open, onClose, onSuccess, estancia, prestamos }) {
  const [seleccionados, setSeleccionados] = useState([]);

  // Resetear estado al abrir
  useEffect(() => {
    if (open) {
      setSeleccionados([]);
    }
  }, [open]);

  if (!open || !estancia) return null;

  const toggleSeleccion = (idPrestamo) => {
    setSeleccionados((prev) =>
      prev.includes(idPrestamo)
        ? prev.filter((id) => id !== idPrestamo)
        : [...prev, idPrestamo]
    );
  };

  const handleDevolver = async () => {
    if (seleccionados.length === 0) {
      toast.error("Selecciona al menos un profesor para devolver la llave");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/prestamos-llaves/devolver`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: seleccionados }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Error al devolver llave");
      }

      toast.success("Llaves devueltas correctamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.message || "Error al devolver llave");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Devolver llaves — {estancia?.nombre}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Lista de préstamos */}
          <div className="max-h-64 overflow-auto border border-gray-200 rounded-md p-3 shadow-sm mt-2">
            {(!prestamos || prestamos.length === 0) && (
              <p className="text-xs italic text-gray-500">
                No hay llaves prestadas en esta estancia
              </p>
            )}
            {prestamos?.map((p) => (
              <div
                key={p.id}
                onClick={() => toggleSeleccion(p.id)}
                className={`cursor-pointer p-2 rounded-md mb-1 select-none
                  ${
                    seleccionados.includes(p.id)
                      ? "bg-red-200"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                {p.nombre} · {p.unidades} llave(s)
              </div>
            ))}
          </div>

          <div>
            <p>
              Total llaves: <strong>{estancia?.totalllaves || 1}</strong>
            </p>
            <p>
              Prestadas: <strong>{prestamos?.reduce((sum, p) => sum + p.unidades, 0) || 0}</strong>
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleDevolver} disabled={seleccionados.length === 0}>
            Devolver llave{seleccionados.length > 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
