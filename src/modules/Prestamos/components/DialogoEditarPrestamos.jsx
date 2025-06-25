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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export function DialogoEditarPrestamos({ open, onClose, alumno, onSuccess }) {
  const [prestamos, setPrestamos] = useState([]);
  const [seleccionadosIzquierda, setSeleccionadosIzquierda] = useState([]);
  const [seleccionadosDerecha, setSeleccionadosDerecha] = useState([]);

  useEffect(() => {
    if (open && alumno?.prestamos) {
      const normalizados = alumno.prestamos.map((p) => ({
        ...p,
        devuelto: p.devuelto === true || p.devuelto === "true",
      }));
      setPrestamos(normalizados);
      setSeleccionadosIzquierda([]);
      setSeleccionadosDerecha([]);
    }
  }, [open, alumno]);

  const noDevueltos = prestamos.filter((p) => !p.devuelto);
  const devueltos = prestamos.filter((p) => p.devuelto);

  const toggleSeleccion = (id, lado) => {
    const setSeleccionados =
      lado === "izquierda"
        ? setSeleccionadosIzquierda
        : setSeleccionadosDerecha;
    const seleccionados =
      lado === "izquierda" ? seleccionadosIzquierda : seleccionadosDerecha;

    setSeleccionados(
      seleccionados.includes(id)
        ? seleccionados.filter((x) => x !== id)
        : [...seleccionados, id]
    );
  };

  const devolver = async (ids) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/db/prestamos/devolver",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        }
      );
      if (!res.ok) throw new Error("Error al devolver préstamos");

      toast.success("Préstamos devueltos correctamente");
      setPrestamos((prev) =>
        prev.map((p) =>
          ids.includes(p.id)
            ? {
                ...p,
                devuelto: true,
                fechadevolucion: new Date().toISOString(),
              }
            : p
        )
      );
      setSeleccionadosIzquierda([]);
      await onSuccess?.();
    } catch (error) {
      toast.error("Error al devolver préstamos");
      console.error(error);
    }
  };

  const prestar = async (ids) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/db/prestamos/prestar",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        }
      );
      if (!res.ok) throw new Error("Error al re-prestar préstamos");

      toast.success("Préstamos reactivados correctamente");
      setPrestamos((prev) =>
        prev.map((p) =>
          ids.includes(p.id)
            ? { ...p, devuelto: false, fechadevolucion: null }
            : p
        )
      );
      setSeleccionadosDerecha([]);
      await onSuccess?.();
    } catch (error) {
      toast.error("Error al re-prestar préstamos");
      console.error(error);
    }
  };

  // ACCIONES
  const devolverSeleccionados = () => {
    if (seleccionadosIzquierda.length === 0) {
      toast.error("Selecciona al menos un préstamo");
      return;
    }
    devolver(seleccionadosIzquierda);
  };

  const devolverTodos = () => {
    const ids = noDevueltos.map((p) => p.id);
    if (ids.length === 0) {
      toast.error("No hay préstamos por devolver");
      return;
    }
    devolver(ids);
  };

  const prestarSeleccionados = () => {
    if (seleccionadosDerecha.length === 0) {
      toast.error("Selecciona al menos un préstamo");
      return;
    }
    prestar(seleccionadosDerecha);
  };

  const prestarTodos = () => {
    const ids = devueltos.map((p) => p.id);
    if (ids.length === 0) {
      toast.error("No hay préstamos devueltos");
      return;
    }
    prestar(ids);
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-6xl"
      >
        <DialogHeader>
          <DialogTitle>Préstamos de {alumno?.nombreAlumno}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 max-h-[30rem] overflow-y-auto text-sm">
          {/* No devueltos */}
          <div>
            <h3 className="font-semibold mb-2">En Préstamo</h3>
            {noDevueltos.length === 0 && (
              <p className="text-muted-foreground">
                No hay préstamos pendientes.
              </p>
            )}
            <ul className="space-y-2">
              {noDevueltos.map((p) => {
                const seleccionado = seleccionadosIzquierda.includes(p.id);
                return (
                  <li
                    key={p.id}
                    className={`border p-2 rounded cursor-pointer transition-all ${
                      seleccionado
                        ? "bg-green-100 border-green-500"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => toggleSeleccion(p.id, "izquierda")}
                  >
                    <div>
                      <strong>Libro:</strong> {p.libro}
                    </div>
                    <div>
                      <strong>Entrega:</strong>{" "}
                      {p.fechaentrega?.slice(0, 10) || "—"}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col justify-center space-y-2 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={prestarTodos}
              disabled={devueltos.length === 0}
            >
              <ChevronsLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={prestarSeleccionados}
              disabled={seleccionadosDerecha.length === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={devolverSeleccionados}
              disabled={seleccionadosIzquierda.length === 0}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={devolverTodos}
              disabled={noDevueltos.length === 0}
            >
              <ChevronsRight className="w-5 h-5" />
            </Button>
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
              {devueltos.map((p) => {
                const seleccionado = seleccionadosDerecha.includes(p.id);
                return (
                  <li
                    key={p.id}
                    className={`border p-2 rounded cursor-pointer transition-all ${
                      seleccionado
                        ? "bg-green-100 border-green-500"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => toggleSeleccion(p.id, "derecha")}
                  >
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
                );
              })}
            </ul>
          </div>
        </div>

        <DialogFooter className="space-x-2 mt-4">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
