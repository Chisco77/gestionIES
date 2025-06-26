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
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_BASE_URL } from '../../../config';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function DialogoEditarPrestamos({ open, onClose, alumno, onSuccess }) {
  const [prestamos, setPrestamos] = useState([]);
  const [seleccionadosIzquierda, setSeleccionadosIzquierda] = useState([]);
  const [seleccionadosDerecha, setSeleccionadosDerecha] = useState([]);
  const [confirmarEliminacionAbierto, setConfirmarEliminacionAbierto] =
    useState(false);

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
        `${API_BASE_URL}/db/prestamos/devolver`,
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
        `${API_BASE_URL}/db/prestamos/prestar`,
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

  const eliminarPrestamosSeleccionados = () => {
    const ids = seleccionadosIzquierda;
    if (ids.length === 0) {
      toast.error("Selecciona préstamo(s) a eliminar");
      return;
    }

    // Aquí en el frontend solo se eliminan visualmente
    setPrestamos((prev) => prev.filter((p) => !ids.includes(p.id)));
    setSeleccionadosIzquierda([]);
    toast.success("Préstamos eliminados del listado (frontend)");
  };

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

        <div className="grid grid-cols-2 gap-6 max-h-[30rem] text-sm">
          {/* En préstamo */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">En Préstamo</h3>
              <div className="flex gap-1 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={devolverSeleccionados}
                      disabled={seleccionadosIzquierda.length === 0}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Devolver seleccionado(s)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={devolverTodos}
                      disabled={noDevueltos.length === 0}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Devolver todos</TooltipContent>
                </Tooltip>
                <AlertDialog
                  open={confirmarEliminacionAbierto}
                  onOpenChange={setConfirmarEliminacionAbierto}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={seleccionadosIzquierda.length === 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Eliminar préstamo</TooltipContent>
                  </Tooltip>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Eliminar préstamo(s)?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán
                        definitivamente los préstamos seleccionados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            const res = await fetch(
                              `${API_BASE_URL}/db/prestamos/eliminar`,
                              {
                                method: "POST",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  ids: seleccionadosIzquierda,
                                }),
                              }
                            );

                            if (!res.ok) throw new Error("Error al eliminar");

                            toast.success("Préstamos eliminados correctamente");

                            setPrestamos((prev) =>
                              prev.filter(
                                (p) => !seleccionadosIzquierda.includes(p.id)
                              )
                            );
                            setSeleccionadosIzquierda([]);
                            await onSuccess?.();
                          } catch (err) {
                            toast.error("Error al eliminar préstamos");
                            console.error(err);
                          }
                        }}
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <ScrollArea className="h-64 border rounded-md p-2">
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
            </ScrollArea>
          </div>

          {/* Devueltos */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Devueltos</h3>
              <div className="flex gap-1 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prestarSeleccionados}
                      disabled={seleccionadosDerecha.length === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Prestar seleccionado(s)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prestarTodos}
                      disabled={devueltos.length === 0}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Prestar todos</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <ScrollArea className="h-64 border rounded-md p-2">
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
            </ScrollArea>
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
