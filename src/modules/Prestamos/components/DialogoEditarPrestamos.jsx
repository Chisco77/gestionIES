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

export function DialogoEditarPrestamos({ open, onClose, alumno, onSuccess }) {
  const [seleccionados, setSeleccionados] = useState([]);

  useEffect(() => {
    if (!open) setSeleccionados([]);
  }, [open]);

  if (!alumno) return null;

  const prestamosNormalizados = alumno.prestamos.map((p) => ({
    ...p,
    devuelto: p.devuelto === true || p.devuelto === "true",
  }));
  // Dividir préstamos en devueltos y no devueltos
  const noDevueltos = alumno.prestamos.filter((p) => !p.devuelto);
  const devueltos = alumno.prestamos.filter((p) => p.devuelto);

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const devolverSeleccionados = async () => {
    if (seleccionados.length === 0) {
      toast.error("Selecciona al menos un préstamo para devolver");
      return;
    }
    try {
      const res = await fetch(
        "http://localhost:5000/api/db/prestamos/devolver",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: seleccionados }),
        }
      );
      if (!res.ok) throw new Error("Error al devolver préstamos");

      toast.success("Préstamos devueltos correctamente");
      setSeleccionados([]);
      await onSuccess?.(); // refrescar datos
    } catch (error) {
      toast.error("Error al devolver préstamos");
      console.error(error);
    }
  };

  const devolverTodos = async () => {
    if (noDevueltos.length === 0) {
      toast.error("No hay préstamos pendientes para devolver");
      return;
    }
    try {
      const idsTodos = noDevueltos.map((p) => p.id);
      const res = await fetch(
        "http://localhost:5000/api/db/prestamos/devolver",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: idsTodos }),
        }
      );
      if (!res.ok) throw new Error("Error al devolver préstamos");

      toast.success("Todos los préstamos devueltos correctamente");
      setSeleccionados([]);
      await onSuccess?.();
    } catch (error) {
      toast.error("Error al devolver préstamos");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-4xl"
      >
        <DialogHeader>
          <DialogTitle>Préstamos de {alumno.nombreAlumno}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 max-h-96 overflow-y-auto text-sm">
          {/* No devueltos */}
          <div>
            <h3 className="font-semibold mb-2">No devueltos</h3>
            {noDevueltos.length === 0 && (
              <p className="text-muted-foreground">
                No hay préstamos pendientes.
              </p>
            )}
            <ul className="space-y-2">
              {noDevueltos.map((p) => {
                console.log("ID préstamo:", p);
                return (
                  <li
                    key={p.id}
                    className="border p-2 rounded flex items-center space-x-2"
                  >
                    <input
                      id={`checkbox-${p.id}`}
                      type="checkbox"
                      checked={seleccionados.includes(p.id)}
                      onChange={() => toggleSeleccion(p.id)}
                    />
                    <label
                      htmlFor={`checkbox-${p.id}`}
                      className="cursor-pointer select-none"
                    >
                      <div>
                        <div>
                          <strong>Libro:</strong> {p.libro}
                        </div>
                        <div>
                          <strong>Entrega:</strong>{" "}
                          {p.fechaentrega?.slice(0, 10) || "—"}
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Devueltos */}
          <div>
            <h3 className="font-semibold mb-2">Devueltos</h3>
            {devueltos.length === 0 && (
              <p className="text-muted-foreground">
                No hay préstamos devueltos.
              </p>
            )}
            <ul className="space-y-2">
              {devueltos.map((p) => (
                <li key={p.id} className="border p-2 rounded">
                  <div>
                    <strong>Libro:</strong> {p.libro}
                  </div>
                  <div>
                    <strong>Entrega:</strong>{" "}
                    {p.fechaentrega?.slice(0, 10) || "—"}
                  </div>
                  <div>
                    <strong>Devolución:</strong>{" "}
                    {p.fechadevolucion?.slice(0, 10) || "—"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button
            onClick={devolverSeleccionados}
            disabled={seleccionados.length === 0}
          >
            Devolver seleccionado{seleccionados.length > 1 ? "s" : ""}
          </Button>
          <Button
            onClick={devolverTodos}
            disabled={noDevueltos.length === 0}
            variant="secondary"
          >
            Devolver todos
          </Button>
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
