/*import { useState, useEffect } from "react";
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
  Calendar,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

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

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";

export function DialogoEditarPrestamos({ open, onClose, usuario, onSuccess }) {
  const [prestamos, setPrestamos] = useState([]);
  const [seleccionadosIzquierda, setSeleccionadosIzquierda] = useState([]);
  const [seleccionadosDerecha, setSeleccionadosDerecha] = useState([]);
  const [confirmarEliminacionAbierto, setConfirmarEliminacionAbierto] =
    useState(false);

  // Estados para diálogos de cambio fecha
  const [fechaPrestamoModalAbierto, setFechaPrestamoModalAbierto] =
    useState(false);
  const [fechaNuevaPrestamo, setFechaNuevaPrestamo] = useState("");

  const [fechaDevolucionModalAbierto, setFechaDevolucionModalAbierto] =
    useState(false);
  const [fechaNuevaDevolucion, setFechaNuevaDevolucion] = useState("");

  useEffect(() => {
    if (open && usuario?.prestamos) {
      const normalizados = usuario.prestamos.map((p) => ({
        ...p,
        devuelto: p.devuelto === true || p.devuelto === "true",
      }));
      console.log ("Normalizados: ", normalizados);
      setPrestamos(normalizados);
      setSeleccionadosIzquierda([]);
      setSeleccionadosDerecha([]);
    }
  }, [open, usuario]);

  const prestados = prestamos.filter((p) => p.entregado && !p.devuelto);
  const devueltos = prestamos.filter((p) => p.devuelto);
  const API_URL = import.meta.env.VITE_API_URL;

  const [draggingItem, setDraggingItem] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const toggleSeleccion = (id_item, lado) => {
    const setSeleccionados =
      lado === "izquierda"
        ? setSeleccionadosIzquierda
        : setSeleccionadosDerecha;
    const seleccionados =
      lado === "izquierda" ? seleccionadosIzquierda : seleccionadosDerecha;

    setSeleccionados(
      seleccionados.includes(id_item)
        ? seleccionados.filter((x) => x !== id_item)
        : [...seleccionados, id_item]
    );
  };

  // Prestamo seleccionado único izquierda
  const prestamoSeleccionado =
    seleccionadosIzquierda.length === 1
      ? prestados.find((p) => p.id_item === seleccionadosIzquierda[0])
      : null;

  // Prestamo seleccionado único derecha (devueltos)
  const prestamoDevueltoSeleccionado =
    seleccionadosDerecha.length === 1
      ? devueltos.find((p) => p.id_item === seleccionadosDerecha[0])
      : null;

  // Abrir diálogo cambiar fecha préstamo
  const abrirDialogoFechaPrestamo = () => {
    if (!prestamoSeleccionado) return;
    setFechaNuevaPrestamo(
      prestamoSeleccionado.fechaentrega?.slice(0, 10) || ""
    );
    setFechaPrestamoModalAbierto(true);
  };

  // Abrir diálogo cambiar fecha devolución
  const abrirDialogoFechaDevolucion = () => {
    if (!prestamoDevueltoSeleccionado) return;
    setFechaNuevaDevolucion(
      prestamoDevueltoSeleccionado.fechadevolucion?.slice(0, 10) || ""
    );
    setFechaDevolucionModalAbierto(true);
  };

  // Guardar fecha nueva préstamo (simulado)
  const guardarFechaNuevaPrestamo = () => {
    if (!fechaNuevaPrestamo) {
      toast.error("Selecciona una fecha válida");
      return;
    }
    toast.success(
      `Fecha de préstamo actualizada a ${fechaNuevaPrestamo} para el libro "${prestamoSeleccionado.libro}"`
    );
    setFechaPrestamoModalAbierto(false);
    setPrestamos((prev) =>
      prev.map((p) =>
        p.id === prestamoSeleccionado.id_item
          ? { ...p, fechaentrega: fechaNuevaPrestamo }
          : p
      )
    );
    onSuccess?.();
  };

  // estado para almacenar la url de la foto del usuario
  const [fotoUrl, setFotoUrl] = useState(null);

  useEffect(() => {
    if (!usuario?.uid) return;

    const extensiones = ["jpg", "jpeg", "png"];
    const baseUrl = `https://localhost:5000/uploads/alumnos/${usuario.uid}`;
    let encontrada = false;

    (async () => {
      for (const ext of extensiones) {
        try {
          const res = await fetch(`${baseUrl}.${ext}`, {
            method: "HEAD",
            credentials: "include",
          });
          if (res.ok) {
            setFotoUrl(`${baseUrl}.${ext}`);
            encontrada = true;
            break;
          }
        } catch (e) {
          // Silenciar errores
        }
      }
      if (!encontrada) {
        setFotoUrl(null); // o puedes usar una imagen por defecto
      }
    })();
  }, [usuario?.uid]);

  // Guardar fecha nueva devolución (simulado)
  const guardarFechaNuevaDevolucion = () => {
    if (!fechaNuevaDevolucion) {
      toast.error("Selecciona una fecha válida");
      return;
    }
    toast.success(
      `Fecha de devolución actualizada a ${fechaNuevaDevolucion} para el libro "${prestamoDevueltoSeleccionado.libro}"`
    );
    setFechaDevolucionModalAbierto(false);
    setPrestamos((prev) =>
      prev.map((p) =>
        p.id === prestamoDevueltoSeleccionado.id_item
          ? { ...p, fechadevolucion: fechaNuevaDevolucion }
          : p
      )
    );
    onSuccess?.();
  };

  useEffect(() => {
    if (open && usuario?.prestamos) {
      const normalizados = usuario.prestamos.map((p) => ({
        ...p,
        devuelto: p.devuelto === true || p.devuelto === "true",
      }));
      setPrestamos(normalizados);
      setSeleccionadosIzquierda([]);
      setSeleccionadosDerecha([]);
    }
  }, [open, usuario]);

  const devolver = async (ids) => {
    try {
      const res = await fetch(`${API_URL}/db/prestamos/devolver`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Error al devolver préstamos");

      toast.success("Préstamos devueltos correctamente");
      setPrestamos((prev) =>
        prev.map((p) =>
          ids.includes(p.id_item)
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
      const res = await fetch(`${API_URL}/db/prestamos/prestar`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Error al re-prestar préstamos");

      toast.success("Préstamos reactivados correctamente");
      setPrestamos((prev) =>
        prev.map((p) =>
          ids.includes(p.id_item)
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
    setPrestamos((prev) => prev.filter((p) => !ids.includes(p.id_item)));
    setSeleccionadosIzquierda([]);
    toast.success("Préstamos eliminados del listado (frontend)");
  };

  const prestarSeleccionados = () => {
    if (seleccionadosDerecha.length === 0) {
      toast.error("Selecciona al menos un préstamo");
      return;
    }
    prestar(seleccionadosDerecha);
  };

  const prestarTodos = () => {
    const ids = devueltos.map((p) => p.id_item);
    if (ids.length === 0) {
      toast.error("No hay préstamos devueltos");
      return;
    }
    prestar(ids);
  };

  const devolverSeleccionados = () => {
    if (seleccionadosIzquierda.length === 0) {
      toast.error("Selecciona al menos un préstamo");
      return;
    }
    devolver(seleccionadosIzquierda);
  };

  const devolverTodos = () => {
    const ids = prestados.map((p) => p.id_item);
    if (ids.length === 0) {
      toast.error("No hay préstamos por devolver");
      return;
    }
    devolver(ids);
  };
  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-6xl"
      >
        <DialogHeader className="w-full flex flex-col items-center justify-center text-center space-y-2">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Foto del usuario"
              className="w-24 h-24 rounded-full border object-cover"
            />
          ) : (
            <div className="text-xs text-muted-foreground">
              No se encontró imagen
            </div>
          )}
          <DialogTitle>{usuario?.nombreUsuario}</DialogTitle>

          
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 max-h-[30rem] text-sm">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">En Préstamo</h3>
              <div className="flex gap-1 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (seleccionadosIzquierda.length === 0) {
                          toast.error("Selecciona al menos un préstamo");
                          return;
                        }
                        devolver(seleccionadosIzquierda);
                      }}
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
                      onClick={() => {
                        const ids = prestados.map((p) => p.id_item);
                        if (ids.length === 0) {
                          toast.error("No hay préstamos por devolver");
                          return;
                        }
                        devolver(ids);
                      }}
                      disabled={prestados.length === 0}
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
                              `${API_URL}/db/prestamos/eliminarUnAlumno`,
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
                                (p) => !seleccionadosIzquierda.includes(p.id_item)
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
              {prestados.length === 0 && (
                <p className="text-muted-foreground">
                  No hay préstamos pendientes.
                </p>
              )}
              <ul className="space-y-2">
                {prestados.map((p) => {
                  const seleccionado = seleccionadosIzquierda.includes(p.id_item);
                  return (
                    <li
                      key={p.id_item}
                      className={`border p-2 rounded transition-all ${
                        seleccionado
                          ? "bg-green-100 border-green-500"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div
                          onClick={() => toggleSeleccion(p.id_item, "izquierda")}
                          className="cursor-pointer"
                        >
                          <div>
                            <strong>Libro:</strong> {p.libro}
                          </div>
                          <div>
                            <strong>Entrega:</strong>{" "}
                            {p.fechaentrega?.slice(0, 10) || "—"}
                          </div>
                        </div>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setFechaNuevaPrestamo(
                                  p.fechaentrega?.slice(0, 10) || ""
                                );
                                setSeleccionadosIzquierda([p.id_item]);
                                setFechaPrestamoModalAbierto(true);
                              }}
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Cambiar fecha préstamo
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Devueltos</h3>
              <div className="flex gap-1 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (seleccionadosDerecha.length === 0) {
                          toast.error("Selecciona al menos un préstamo");
                          return;
                        }
                        prestar(seleccionadosDerecha);
                      }}
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
                      onClick={() => {
                        if (devueltos.length === 0) {
                          toast.error("No hay préstamos devueltos");
                          return;
                        }
                        prestar(devueltos.map((p) => p.id_item));
                      }}
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
                  const seleccionado = seleccionadosDerecha.includes(p.id_item);
                  return (
                    <li
                      key={p.id_item}
                      className={`border p-2 rounded transition-all ${
                        seleccionado
                          ? "bg-green-100 border-green-500"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div
                          onClick={() => toggleSeleccion(p.id_item, "derecha")}
                          className="cursor-pointer"
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
                        </div>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setFechaNuevaDevolucion(
                                  p.fechadevolucion?.slice(0, 10) || ""
                                );
                                setSeleccionadosDerecha([p.id_item]);
                                setFechaDevolucionModalAbierto(true);
                              }}
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Cambiar fecha devolución
                          </TooltipContent>
                        </Tooltip>
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

        <Dialog
          open={fechaPrestamoModalAbierto}
          onOpenChange={setFechaPrestamoModalAbierto}
          modal={false}
        >
          <DialogContent onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>
                Cambiar fecha de préstamo:{" "}
                <span className="font-semibold">
                  {prestamoSeleccionado?.libro || ""}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <label className="block text-sm font-medium">Fecha</label>
              <input
                type="date"
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                value={fechaNuevaPrestamo}
                onChange={(e) => setFechaNuevaPrestamo(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setFechaPrestamoModalAbierto(false)}
              >
                Cancelar
              </Button>
              <Button onClick={guardarFechaNuevaPrestamo}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={fechaDevolucionModalAbierto}
          onOpenChange={setFechaDevolucionModalAbierto}
          modal={false}
        >
          <DialogContent onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>
                Cambiar fecha de devolución:{" "}
                <span className="font-semibold">
                  {prestamoDevueltoSeleccionado?.libro || ""}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <label className="block text-sm font-medium">Fecha</label>
              <input
                type="date"
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                value={fechaNuevaDevolucion}
                onChange={(e) => setFechaNuevaDevolucion(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setFechaDevolucionModalAbierto(false)}
              >
                Cancelar
              </Button>
              <Button onClick={guardarFechaNuevaDevolucion}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
*/
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
  Calendar,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export function DialogoEditarPrestamos({ open, onClose, usuario, onSuccess }) {
  const [prestamos, setPrestamos] = useState([]);
  const [seleccionadosIzquierda, setSeleccionadosIzquierda] = useState([]);
  const [seleccionadosDerecha, setSeleccionadosDerecha] = useState([]);
  const [confirmarEliminacionAbierto, setConfirmarEliminacionAbierto] =
    useState(false);

  const [fechaPrestamoModalAbierto, setFechaPrestamoModalAbierto] =
    useState(false);
  const [fechaNuevaPrestamo, setFechaNuevaPrestamo] = useState("");
  const [fechaDevolucionModalAbierto, setFechaDevolucionModalAbierto] =
    useState(false);
  const [fechaNuevaDevolucion, setFechaNuevaDevolucion] = useState("");
  const [fotoUrl, setFotoUrl] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (open && usuario?.prestamos) {
      const normalizados = usuario.prestamos.map((p) => ({
        ...p,
        devuelto: p.devuelto === true || p.devuelto === "true",
        entregado: p.entregado === true || p.entregado === "true",
      }));
      setPrestamos(normalizados);
      setSeleccionadosIzquierda([]);
      setSeleccionadosDerecha([]);
    }
  }, [open, usuario]);

  useEffect(() => {
    if (!usuario?.uid) return;

    const extensiones = ["jpg", "jpeg", "png"];
    const baseUrl = `https://localhost:5000/uploads/alumnos/${usuario.uid}`;
    let encontrada = false;

    (async () => {
      for (const ext of extensiones) {
        try {
          const res = await fetch(`${baseUrl}.${ext}`, {
            method: "HEAD",
            credentials: "include",
          });
          if (res.ok) {
            setFotoUrl(`${baseUrl}.${ext}`);
            encontrada = true;
            break;
          }
        } catch (e) {}
      }
      if (!encontrada) setFotoUrl(null);
    })();
  }, [usuario?.uid]);

  const asignadosNoEntregados = prestamos.filter(
    (p) => !p.entregado && !p.devuelto
  );
  const prestados = prestamos.filter((p) => p.entregado && !p.devuelto);
  const devueltos = prestamos.filter((p) => p.devuelto);

  const puedenEntregar = asignadosNoEntregados.filter(
    (p) => p.doc_compromiso === 0
  );

  const toggleSeleccion = (id_item, lado) => {
    const setSeleccionados =
      lado === "izquierda"
        ? setSeleccionadosIzquierda
        : setSeleccionadosDerecha;
    const seleccionados =
      lado === "izquierda" ? seleccionadosIzquierda : seleccionadosDerecha;

    setSeleccionados(
      seleccionados.includes(id_item)
        ? seleccionados.filter((x) => x !== id_item)
        : [...seleccionados, id_item]
    );
  };

  const prestamoSeleccionado =
    seleccionadosIzquierda.length === 1
      ? prestamos.find((p) => p.id_item === seleccionadosIzquierda[0])
      : null;

  const prestamoDevueltoSeleccionado =
    seleccionadosDerecha.length === 1
      ? devueltos.find((p) => p.id_item === seleccionadosDerecha[0])
      : null;

  const entregarSeleccionados = async () => {
    const idsAEntregar = asignadosNoEntregados
      .filter((p) => seleccionadosIzquierda.includes(p.id_item))
      .map((p) => p.id_item);

    if (idsAEntregar.length === 0) {
      toast.error("Los libros seleccionados no pueden entregarse");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/prestamos/prestar`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsAEntregar }),
      });
      if (!res.ok) throw new Error("Error al marcar libros como entregados");

      toast.success("Libros entregados correctamente");
      setPrestamos((prev) =>
        prev.map((p) =>
          idsAEntregar.includes(p.id_item)
            ? { ...p, entregado: true, fechaentrega: new Date().toISOString() }
            : p
        )
      );
      setSeleccionadosIzquierda([]);
      await onSuccess?.();
    } catch (err) {
      toast.error("Error al entregar libros");
      console.error(err);
    }
  };

  const entregarTodos = async () => {
    const ids = puedenEntregar.map((p) => p.id_item);
    if (ids.length === 0) {
      toast.error("No hay libros que puedan entregarse");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/prestamos/entregar`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Error al entregar libros");

      toast.success("Todos los libros entregados correctamente");
      setPrestamos((prev) =>
        prev.map((p) =>
          ids.includes(p.id_item)
            ? { ...p, entregado: true, fechaentrega: new Date().toISOString() }
            : p
        )
      );
      setSeleccionadosIzquierda([]);
      await onSuccess?.();
    } catch (err) {
      toast.error("Error al entregar libros");
      console.error(err);
    }
  };

  const devolver = async (ids) => {
    try {
      const res = await fetch(`${API_URL}/db/prestamos/devolver`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Error al devolver préstamos");

      toast.success("Préstamos devueltos correctamente");
      setPrestamos((prev) =>
        prev.map((p) =>
          ids.includes(p.id_item)
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
      const res = await fetch(`${API_URL}/db/prestamos/prestar`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Error al re-prestar préstamos");

      toast.success("Préstamos reactivados correctamente");
      setPrestamos((prev) =>
        prev.map((p) =>
          ids.includes(p.id_item)
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

  const prestarSeleccionados = () => {
    if (seleccionadosDerecha.length === 0) {
      toast.error("Selecciona al menos un préstamo");
      return;
    }
    prestar(seleccionadosDerecha);
  };

  const prestarTodos = () => {
    const ids = devueltos.map((p) => p.id_item);
    if (ids.length === 0) {
      toast.error("No hay préstamos devueltos");
      return;
    }
    prestar(ids);
  };

  const devolverSeleccionados = () => {
    if (seleccionadosIzquierda.length === 0) {
      toast.error("Selecciona al menos un préstamo");
      return;
    }
    devolver(seleccionadosIzquierda);
  };

  const devolverTodos = () => {
    const ids = prestados.map((p) => p.id_item);
    if (ids.length === 0) {
      toast.error("No hay préstamos por devolver");
      return;
    }
    devolver(ids);
  };

  const abrirDialogoFechaPrestamo = () => {
    if (!prestamoSeleccionado) return;
    setFechaNuevaPrestamo(
      prestamoSeleccionado.fechaentrega?.slice(0, 10) || ""
    );
    setFechaPrestamoModalAbierto(true);
  };

  const abrirDialogoFechaDevolucion = () => {
    if (!prestamoDevueltoSeleccionado) return;
    setFechaNuevaDevolucion(
      prestamoDevueltoSeleccionado.fechadevolucion?.slice(0, 10) || ""
    );
    setFechaDevolucionModalAbierto(true);
  };

  const guardarFechaNuevaPrestamo = () => {
    if (!fechaNuevaPrestamo) {
      toast.error("Selecciona una fecha válida");
      return;
    }
    toast.success(
      `Fecha de préstamo actualizada a ${fechaNuevaPrestamo} para el libro "${prestamoSeleccionado.libro}"`
    );
    setFechaPrestamoModalAbierto(false);
    setPrestamos((prev) =>
      prev.map((p) =>
        p.id_item === prestamoSeleccionado.id_item
          ? { ...p, fechaentrega: fechaNuevaPrestamo }
          : p
      )
    );
    onSuccess?.();
  };

  const guardarFechaNuevaDevolucion = () => {
    if (!fechaNuevaDevolucion) {
      toast.error("Selecciona una fecha válida");
      return;
    }
    toast.success(
      `Fecha de devolución actualizada a ${fechaNuevaDevolucion} para el libro "${prestamoDevueltoSeleccionado.libro}"`
    );
    setFechaDevolucionModalAbierto(false);
    setPrestamos((prev) =>
      prev.map((p) =>
        p.id_item === prestamoDevueltoSeleccionado.id_item
          ? { ...p, fechadevolucion: fechaNuevaDevolucion }
          : p
      )
    );
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-6xl"
      >
        <DialogHeader className="w-full flex flex-col items-center justify-center text-center space-y-2">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Foto del usuario"
              className="w-24 h-24 rounded-full border object-cover"
            />
          ) : (
            <div className="text-xs text-muted-foreground">
              No se encontró imagen
            </div>
          )}
          <DialogTitle>{usuario?.nombreUsuario}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6 max-h-[30rem] text-sm">
          {/* Asignados / No entregados */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Asignados / No entregados</h3>
              <div className="flex gap-1 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={entregarSeleccionados}
                      disabled={seleccionadosIzquierda.length === 0}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Entregar seleccionado(s)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={entregarTodos}
                      disabled={puedenEntregar.length === 0}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Entregar todos</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <ScrollArea className="h-64 border rounded-md p-2">
              {asignadosNoEntregados.length === 0 && (
                <p className="text-muted-foreground">
                  No hay libros pendientes de entrega.
                </p>
              )}
              <ul className="space-y-2">
                {asignadosNoEntregados.map((p) => {
                  const seleccionado = seleccionadosIzquierda.includes(
                    p.id_item
                  );
                  return (
                    <li
                      key={p.id_item}
                      className={`border p-2 rounded transition-all ${seleccionado ? "bg-green-100 border-green-500" : "hover:bg-muted"}`}
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleSeleccion(p.id_item, "izquierda")}
                      >
                        <div>
                          <strong>Libro:</strong> {p.libro}
                        </div>
                        <div>
                          <strong>Doc. compromiso:</strong> {p.doc_compromiso}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </div>

          {/* Prestados */}
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
                      disabled={prestados.length === 0}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Devolver todos</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <ScrollArea className="h-64 border rounded-md p-2">
              {prestados.length === 0 && (
                <p className="text-muted-foreground">
                  No hay préstamos pendientes.
                </p>
              )}
              <ul className="space-y-2">
                {prestados.map((p) => {
                  const seleccionado = seleccionadosIzquierda.includes(
                    p.id_item
                  );
                  return (
                    <li
                      key={p.id_item}
                      className={`border p-2 rounded transition-all ${seleccionado ? "bg-green-100 border-green-500" : "hover:bg-muted"}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            toggleSeleccion(p.id_item, "izquierda")
                          }
                        >
                          <div>
                            <strong>Libro:</strong> {p.libro}
                          </div>
                          <div>
                            <strong>Entrega:</strong>{" "}
                            {p.fechaentrega?.slice(0, 10) || "—"}
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setFechaNuevaPrestamo(
                                  p.fechaentrega?.slice(0, 10) || ""
                                );
                                setSeleccionadosIzquierda([p.id_item]);
                                setFechaPrestamoModalAbierto(true);
                              }}
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Cambiar fecha préstamo
                          </TooltipContent>
                        </Tooltip>
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
                  const seleccionado = seleccionadosDerecha.includes(p.id_item);
                  return (
                    <li
                      key={p.id_item}
                      className={`border p-2 rounded transition-all ${seleccionado ? "bg-blue-100 border-blue-500" : "hover:bg-muted"}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div
                          className="cursor-pointer"
                          onClick={() => toggleSeleccion(p.id_item, "derecha")}
                        >
                          <div>
                            <strong>Libro:</strong> {p.libro}
                          </div>
                          <div>
                            <strong>Devolución:</strong>{" "}
                            {p.fechadevolucion?.slice(0, 10) || "—"}
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setFechaNuevaDevolucion(
                                  p.fechadevolucion?.slice(0, 10) || ""
                                );
                                setSeleccionadosDerecha([p.id_item]);
                                setFechaDevolucionModalAbierto(true);
                              }}
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Cambiar fecha devolución
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </div>
        </div>

        {/* Dialogos de fecha */}
        <Dialog
          open={fechaPrestamoModalAbierto}
          onOpenChange={setFechaPrestamoModalAbierto}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar fecha de préstamo</DialogTitle>
            </DialogHeader>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={fechaNuevaPrestamo}
              onChange={(e) => setFechaNuevaPrestamo(e.target.value)}
            />
            <DialogFooter className="mt-2 flex justify-end gap-2">
              <Button onClick={guardarFechaNuevaPrestamo}>Guardar</Button>
              <Button
                variant="ghost"
                onClick={() => setFechaPrestamoModalAbierto(false)}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={fechaDevolucionModalAbierto}
          onOpenChange={setFechaDevolucionModalAbierto}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar fecha de devolución</DialogTitle>
            </DialogHeader>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={fechaNuevaDevolucion}
              onChange={(e) => setFechaNuevaDevolucion(e.target.value)}
            />
            <DialogFooter className="mt-2 flex justify-end gap-2">
              <Button onClick={guardarFechaNuevaDevolucion}>Guardar</Button>
              <Button
                variant="ghost"
                onClick={() => setFechaDevolucionModalAbierto(false)}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmación eliminación */}
        <AlertDialog
          open={confirmarEliminacionAbierto}
          onOpenChange={setConfirmarEliminacionAbierto}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar préstamo?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  // lógica eliminar préstamo
                  setConfirmarEliminacionAbierto(false);
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="ml-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
