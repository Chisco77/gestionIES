// prueba
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

  const [activeTab, setActiveTab] = useState("asignaciones");

  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [librosDisponibles, setLibrosDisponibles] = useState([]);
  const [librosDisponiblesSeleccionados, setLibrosDisponiblesSeleccionados] =
    useState([]);

  const API_URL = import.meta.env.VITE_API_URL;
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;


  async function actualizarPrestamoBackend(id_item, updates) {
    try {
      const res = await fetch(`${API_URL}/db/prestamos/update`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_item, ...updates }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar préstamo");
      }

      return await res.json();
    } catch (error) {
      console.error("❌ Error al actualizar préstamo en backend:", error);
      toast.error("Error al actualizar en el servidor");
    }
  }

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
    const baseUrl = `${SERVER_URL}/uploads/alumnos/${usuario.uid}`;
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

  useEffect(() => {
    fetch(`${API_URL}/db/cursos`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const ordenados = data.sort((a, b) => a.curso.localeCompare(b.curso));
        setCursos(ordenados);
      })
      .catch(() => toast.error("Error al obtener cursos"));
  }, []);

  useEffect(() => {
    if (cursoSeleccionado && usuario?.uid) {
      fetch(
        `${API_URL}/db/libros/disponibles/${cursoSeleccionado}/${usuario.uid}`,
        {
          credentials: "include",
        }
      )
        .then((res) => res.json())
        .then(setLibrosDisponibles)
        .catch(() => toast.error("Error al obtener libros disponibles"));
    } else {
      setLibrosDisponibles([]);
    }
  }, [cursoSeleccionado, usuario]);

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

  const toggleSeleccionDisponible = (id) => {
    setLibrosDisponiblesSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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

  // FUNCIÓN PARA ASIGNAR LIBROS
  const asignarLibros = async () => {
    if (librosDisponiblesSeleccionados.length === 0) {
      toast.error("Selecciona al menos un libro para asignar.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/prestamos/asignarUsuario`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: usuario.uid,
          libros: librosDisponiblesSeleccionados,
          esAlumno: usuario.rol === "alumno" || usuario.rol === "tutor",
        }),
      });

      if (!res.ok) throw new Error("Error al asignar libros");

      // Obtener la información de los libros recién asignados
      const nuevosLibros = librosDisponibles.filter((l) =>
        librosDisponiblesSeleccionados.includes(l.id)
      );

      // Mapear a la estructura de prestamos
      const nuevosPrestamos = nuevosLibros.map((libro) => ({
        id_item: libro.id, // En la BD se asigna un ID de item, pero para el frontend temporalmente usamos el id del libro. El backend debería retornar el id_item.
        idlibro: libro.id,
        libro: libro.libro,
        idcurso: libro.idcurso,
        entregado: false,
        devuelto: false,
        fechaasignacion: new Date().toISOString().slice(0, 10),
      }));

      // Actualizar el estado de prestamos y disponibles
      setPrestamos((prev) => [...prev, ...nuevosPrestamos]);
      setLibrosDisponibles((prev) =>
        prev.filter((l) => !librosDisponiblesSeleccionados.includes(l.id))
      );
      setLibrosDisponiblesSeleccionados([]);

      toast.success("Libros asignados correctamente.");
      onSuccess?.();
    } catch (error) {
      toast.error("Error al asignar libros.");
      console.error(error);
    }
  };

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

  const guardarFechaNuevaDevolucion = async () => {
    if (!fechaNuevaDevolucion) {
      toast.error("Selecciona una fecha válida");
      return;
    }

    const result = await actualizarPrestamoBackend(
      prestamoDevueltoSeleccionado.id_item,
      {
        fechadevolucion: fechaNuevaDevolucion,
      }
    );

    if (result?.success !== false) {
      setPrestamos((prev) =>
        prev.map((p) =>
          p.id_item === prestamoDevueltoSeleccionado.id_item
            ? { ...p, fechadevolucion: fechaNuevaDevolucion }
            : p
        )
      );
      toast.success(
        `Fecha de devolución actualizada a ${fechaNuevaDevolucion} para "${prestamoDevueltoSeleccionado.libro}"`
      );
      setFechaDevolucionModalAbierto(false);
      onSuccess?.();
    }
  };

  const guardarFechaNuevaPrestamo = async () => {
    if (!fechaNuevaPrestamo) {
      toast.error("Selecciona una fecha válida");
      return;
    }

    const result = await actualizarPrestamoBackend(
      prestamoSeleccionado.id_item,
      {
        fechaentrega: fechaNuevaPrestamo,
      }
    );

    if (result?.success !== false) {
      setPrestamos((prev) =>
        prev.map((p) =>
          p.id_item === prestamoSeleccionado.id_item
            ? { ...p, fechaentrega: fechaNuevaPrestamo }
            : p
        )
      );
      toast.success(
        `Fecha de préstamo actualizada a ${fechaNuevaPrestamo} para "${prestamoSeleccionado.libro}"`
      );
      setFechaPrestamoModalAbierto(false);
      onSuccess?.();
    }
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="asignaciones">Asignaciones</TabsTrigger>
            <TabsTrigger value="prestamos">Préstamos</TabsTrigger>
          </TabsList>

          <TabsContent value="asignaciones">
            <div className="grid grid-cols-2 gap-6 max-h-[30rem] text-sm">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Disponibles</h3>
                  <div className="flex gap-1 items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={asignarLibros}
                          // ⚠️ HABILITAR BOTÓN ⚠️
                          disabled={librosDisponiblesSeleccionados.length === 0}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Asignar seleccionado(s)</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // TODO: Lógica para asignar todos
                          }}
                          disabled={true}
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Asignar todos</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <Select
                  value={cursoSeleccionado || ""}
                  onValueChange={(value) => setCursoSeleccionado(value)}
                >
                  <SelectTrigger className="w-full mb-2">
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id.toString()}>
                        {curso.curso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ScrollArea className="h-64 border rounded-md p-2">
                  {librosDisponibles.length === 0 && (
                    <p className="text-muted-foreground">
                      No hay libros disponibles.
                    </p>
                  )}
                  <ul className="space-y-2">
                    {librosDisponibles.map((l) => {
                      const seleccionado =
                        librosDisponiblesSeleccionados.includes(l.id);
                      return (
                        <li
                          key={l.id}
                          className={`border p-2 rounded transition-all cursor-pointer ${seleccionado ? "bg-blue-100 border-blue-500" : "hover:bg-muted"}`}
                          onClick={() => toggleSeleccionDisponible(l.id)}
                        >
                          <div>
                            <strong>Libro:</strong> {l.libro}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              </div>

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
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      ids: seleccionadosIzquierda,
                                    }),
                                  }
                                );
                                if (!res.ok)
                                  throw new Error("Error al eliminar");
                                toast.success(
                                  "Préstamos eliminados correctamente"
                                );
                                setPrestamos((prev) =>
                                  prev.filter(
                                    (p) =>
                                      !seleccionadosIzquierda.includes(
                                        p.id_item
                                      )
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
                            onClick={() =>
                              toggleSeleccion(p.id_item, "izquierda")
                            }
                          >
                            <div>
                              <strong>Libro:</strong> {p.libro}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prestamos">
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
                                {p.fechaentrega
                                  ? p.fechaentrega
                                      .split("-")
                                      .reverse()
                                      .join("-")
                                  : "—"}
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
                      const seleccionado = seleccionadosDerecha.includes(
                        p.id_item
                      );
                      return (
                        <li
                          key={p.id_item}
                          className={`border p-2 rounded transition-all ${seleccionado ? "bg-blue-100 border-blue-500" : "hover:bg-muted"}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div
                              className="cursor-pointer"
                              onClick={() =>
                                toggleSeleccion(p.id_item, "derecha")
                              }
                            >
                              <div>
                                <strong>Libro:</strong> {p.libro}
                              </div>
                              <div>
                                <strong>Devolución:</strong>{" "}
                                {p.fechadevolucion
                                  ? p.fechadevolucion
                                      .slice(0, 10)
                                      .split("-")
                                      .reverse()
                                      .join("-")
                                  : "—"}
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
          </TabsContent>
        </Tabs>

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

        <AlertDialog
          open={confirmarEliminacionAbierto}
          onOpenChange={setConfirmarEliminacionAbierto}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar asignación?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
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

        {usuario && (
          <>
            <div className="flex justify-center mt-4 mb-4 border-t pt-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="docCompromiso"
                    className="text-sm font-medium text-gray-700"
                  >
                    Documento de compromiso:
                  </label>
                  <select
                    id="docCompromiso"
                    value={usuario.doc_compromiso}
                    onChange={(e) =>
                      setUsuario({
                        ...usuario,
                        doc_compromiso: Number(e.target.value),
                      })
                    }
                    className="block w-36 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value={0}>No entregado</option>
                    <option value={1}>Entregado</option>
                    <option value={2}>Recibido</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inicioCurso"
                    checked={usuario.iniciocurso}
                    disabled
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="inicioCurso"
                    className="text-sm text-gray-700"
                  >
                    Inicio de curso
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="ml-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}*/

// prueba
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Componente list reutilizable
const ListSection = ({
  title,
  items,
  selectedItems,
  onToggleSelection,
  emptyMessage,
  actions,
  renderItem,
}) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold">{title}</h3>
      <div className="flex gap-1 items-center">{actions}</div>
    </div>
    <ScrollArea className="h-64 border rounded-md p-2">
      {items.length === 0 ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const isSelected = selectedItems.includes(item.id_item || item.id);
            return (
              <li
                key={item.id_item || item.id}
                className={`border p-2 rounded transition-all cursor-pointer ${isSelected ? "bg-blue-100 border-blue-500" : "hover:bg-muted"}`}
                onClick={() => onToggleSelection(item.id_item || item.id)}
              >
                {renderItem(item)}
              </li>
            );
          })}
        </ul>
      )}
    </ScrollArea>
  </div>
);

export function DialogoEditarPrestamos({ open, onClose, usuario, onSuccess }) {
  const [state, setState] = useState({
    prestamos: [],
    seleccionadosIzquierda: [],
    seleccionadosDerecha: [],
    librosDisponibles: [],
    librosDisponiblesSeleccionados: [],
    cursos: [],
    cursoSeleccionado: null,
  });
  const [modals, setModals] = useState({
    confirmarEliminacionAbierto: false,
    fechaPrestamoModalAbierto: false,
    fechaDevolucionModalAbierto: false,
  });
  const [dates, setDates] = useState({
    fechaNuevaPrestamo: "",
    fechaNuevaDevolucion: "",
  });
  const [fotoUrl, setFotoUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("asignaciones");

  const API_URL = import.meta.env.VITE_API_URL;
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  // Fetch reutilizable
  const apiCall = async (endpoint, method, body, successMsg, errorMsg) => {
    try {
      const res = await fetch(`${API_URL}/db/${endpoint}`, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(errorMsg);
      toast.success(successMsg);
      onSuccess?.();
      return res.json();
    } catch (error) {
      toast.error(errorMsg);
      console.error(error);
      return { success: false };
    }
  };

  // Pone foto
  useEffect(() => {
    if (!usuario) return;
    if (open && usuario.prestamos) {
      const normalizados = usuario.prestamos.map((p) => ({
        ...p,
        devuelto: p.devuelto === true || p.devuelto === "true",
        entregado: p.entregado === true || p.entregado === "true",
      }));
      setState((prev) => ({
        ...prev,
        prestamos: normalizados,
        seleccionadosIzquierda: [],
        seleccionadosDerecha: [],
      }));
    }

    const fetchFoto = async () => {
      const extensiones = ["jpg", "jpeg", "png"];
      const baseUrl = `${SERVER_URL}/uploads/alumnos/${usuario.uid}`;
      for (const ext of extensiones) {
        try {
          const res = await fetch(`${baseUrl}.${ext}`, { method: "HEAD" });
          if (res.ok) {
            setFotoUrl(`${baseUrl}.${ext}`);
            return;
          }
        } catch (e) {
          /* ignore */
        }
      }
      setFotoUrl(null);
    };
    fetchFoto();
  }, [open, usuario, SERVER_URL]);

  // Lista cursos
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await fetch(`${API_URL}/db/cursos`, {
          credentials: "include",
        });
        const data = await res.json();
        const ordenados = data.sort((a, b) => a.curso.localeCompare(b.curso));
        setState((prev) => ({ ...prev, cursos: ordenados }));
      } catch {
        toast.error("Error al obtener cursos");
      }
    };
    fetchCursos();
  }, [API_URL]);

  // Lista libros disponibles del curso seleccionado.
  useEffect(() => {
    if (!state.cursoSeleccionado || !usuario?.uid) {
      setState((prev) => ({ ...prev, librosDisponibles: [] }));
      return;
    }
    const fetchLibros = async () => {
      try {
        const res = await fetch(
          `${API_URL}/db/libros/disponibles/${state.cursoSeleccionado}/${usuario.uid}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setState((prev) => ({ ...prev, librosDisponibles: data }));
      } catch {
        toast.error("Error al obtener libros disponibles");
      }
    };
    fetchLibros();
  }, [state.cursoSeleccionado, usuario, API_URL]);

  const toggleSeleccion = (id_item, side) => {
    const key =
      side === "izquierda" ? "seleccionadosIzquierda" : "seleccionadosDerecha";
    setState((prev) => ({
      ...prev,
      [key]: prev[key].includes(id_item)
        ? prev[key].filter((x) => x !== id_item)
        : [...prev[key], id_item],
    }));
  };

  const toggleSeleccionDisponible = (id) => {
    setState((prev) => ({
      ...prev,
      librosDisponiblesSeleccionados:
        prev.librosDisponiblesSeleccionados.includes(id)
          ? prev.librosDisponiblesSeleccionados.filter((x) => x !== id)
          : [...prev.librosDisponiblesSeleccionados, id],
    }));
  };

  const filtrarPrestamos = (entregado, devuelto) =>
    state.prestamos.filter(
      (p) => p.entregado === entregado && p.devuelto === devuelto
    );

  const prestados = filtrarPrestamos(true, false);
  const devueltos = filtrarPrestamos(true, true);
  const asignadosNoEntregados = filtrarPrestamos(false, false);
  const puedenEntregar = asignadosNoEntregados.filter(
    (p) => p.doc_compromiso === 0
  );

  const updatePrestamosState = (ids, updates) => {
    setState((prev) => ({
      ...prev,
      prestamos: prev.prestamos.map((p) =>
        ids.includes(p.id_item) ? { ...p, ...updates } : p
      ),
    }));
  };

  const handleAction = async (endpoint, ids, successMsg, errorMsg, updates) => {
    if (ids.length === 0) {
      toast.error("No hay elementos para esta acción.");
      return;
    }
    const result = await apiCall(
      endpoint,
      "POST",
      { ids },
      successMsg,
      errorMsg
    );
    if (result.success !== false) {
      updatePrestamosState(ids, updates);
      setState((prev) => ({
        ...prev,
        seleccionadosIzquierda: [],
        seleccionadosDerecha: [],
      }));
    }
  };

  const entregarSeleccionados = () =>
    handleAction(
      "prestamos/prestar",
      state.seleccionadosIzquierda,
      "Libros entregados correctamente",
      "Error al entregar libros",
      { entregado: true, fechaentrega: new Date().toISOString() }
    );
  const entregarTodos = () =>
    handleAction(
      "prestamos/entregar",
      puedenEntregar.map((p) => p.id_item),
      "Todos los libros entregados correctamente",
      "Error al entregar libros",
      { entregado: true, fechaentrega: new Date().toISOString() }
    );
  const devolverSeleccionados = () =>
    handleAction(
      "prestamos/devolver",
      state.seleccionadosIzquierda,
      "Préstamos devueltos correctamente",
      "Error al devolver préstamos",
      { devuelto: true, fechadevolucion: new Date().toISOString() }
    );
  const devolverTodos = () =>
    handleAction(
      "prestamos/devolver",
      prestados.map((p) => p.id_item),
      "Todos los préstamos devueltos correctamente",
      "Error al devolver préstamos",
      { devuelto: true, fechadevolucion: new Date().toISOString() }
    );
  const prestarSeleccionados = () =>
    handleAction(
      "prestamos/prestar",
      state.seleccionadosDerecha,
      "Préstamos reactivados correctamente",
      "Error al re-prestar préstamos",
      { devuelto: false, fechadevolucion: null }
    );
  const prestarTodos = () =>
    handleAction(
      "prestamos/prestar",
      devueltos.map((p) => p.id_item),
      "Todos los préstamos reactivados correctamente",
      "Error al re-prestar préstamos",
      { devuelto: false, fechadevolucion: null }
    );

  const handleDateChange = async (dateType) => {
    const isPrestamo = dateType === "prestamo";
    const selectedItem = isPrestamo
      ? state.prestamos.find(
          (p) => p.id_item === state.seleccionadosIzquierda[0]
        )
      : state.prestamos.find(
          (p) => p.id_item === state.seleccionadosDerecha[0]
        );

    if (!selectedItem) {
      toast.error("No se encontró el elemento seleccionado.");
      const modalKey = isPrestamo
        ? "fechaPrestamoModalAbierto"
        : "fechaDevolucionModalAbierto";
      setModals((prev) => ({ ...prev, [modalKey]: false }));
      return;
    }

    const newDate = isPrestamo
      ? dates.fechaNuevaPrestamo
      : dates.fechaNuevaDevolucion;
    const dateKey = isPrestamo ? "fechaentrega" : "fechadevolucion";
    const modalKey = isPrestamo
      ? "fechaPrestamoModalAbierto"
      : "fechaDevolucionModalAbierto";

    if (!newDate) {
      toast.error("Selecciona una fecha válida");
      return;
    }

    const result = await apiCall(
      "prestamos/update",
      "POST",
      { id_item: selectedItem.id_item, [dateKey]: newDate },
      `Fecha de ${dateType} actualizada para "${selectedItem.libro}"`,
      `Error al actualizar fecha de ${dateType}`
    );

    if (result.success !== false) {
      updatePrestamosState([selectedItem.id_item], { [dateKey]: newDate });
      setModals((prev) => ({ ...prev, [modalKey]: false }));
    }
  };

  const asignarLibros = async () => {
    if (state.librosDisponiblesSeleccionados.length === 0) {
      toast.error("Selecciona al menos un libro para asignar.");
      return;
    }
    const result = await apiCall(
      "prestamos/asignarUsuario",
      "POST",
      {
        uid: usuario.uid,
        libros: state.librosDisponiblesSeleccionados,
        esAlumno: usuario.rol === "alumno" || usuario.rol === "tutor",
      },
      "Libros asignados correctamente.",
      "Error al asignar libros."
    );

    if (result.success !== false) {
      const nuevosLibros = state.librosDisponibles.filter((l) =>
        state.librosDisponiblesSeleccionados.includes(l.id)
      );
      const nuevosPrestamos = nuevosLibros.map((libro) => ({
        id_item: libro.id,
        idlibro: libro.id,
        libro: libro.libro,
        idcurso: libro.idcurso,
        entregado: false,
        devuelto: false,
        fechaasignacion: new Date().toISOString().slice(0, 10),
      }));
      setState((prev) => ({
        ...prev,
        prestamos: [...prev.prestamos, ...nuevosPrestamos],
        librosDisponibles: prev.librosDisponibles.filter(
          (l) => !prev.librosDisponiblesSeleccionados.includes(l.id)
        ),
        librosDisponiblesSeleccionados: [],
      }));
    }
  };

  const eliminarAsignacion = async () => {
    const result = await apiCall(
      "prestamos/eliminarUnAlumno",
      "POST",
      { ids: state.seleccionadosIzquierda },
      "Préstamos eliminados correctamente",
      "Error al eliminar préstamos"
    );
    if (result.success !== false) {
      setState((prev) => ({
        ...prev,
        prestamos: prev.prestamos.filter(
          (p) => !prev.seleccionadosIzquierda.includes(p.id_item)
        ),
        seleccionadosIzquierda: [],
      }));
    }
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="asignaciones">Asignaciones</TabsTrigger>
            <TabsTrigger value="prestamos">Préstamos</TabsTrigger>
          </TabsList>
          <TabsContent value="asignaciones">
            <div className="grid grid-cols-2 gap-6 max-h-[30rem] text-sm">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Disponibles</h3>
                  <div className="flex gap-1 items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={asignarLibros}
                          disabled={
                            state.librosDisponiblesSeleccionados.length === 0
                          }
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Asignar seleccionado(s)</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {}}
                          disabled={true}
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Asignar todos</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* SElect de cursos */}
                <Select
                  value={state.cursoSeleccionado || ""}
                  onValueChange={(value) =>
                    setState((prev) => ({ ...prev, cursoSeleccionado: value }))
                  }
                >
                  <SelectTrigger className="w-full mb-2">
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id.toString()}>
                        {curso.curso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ListSection
                  items={state.librosDisponibles}
                  selectedItems={state.librosDisponiblesSeleccionados}
                  onToggleSelection={toggleSeleccionDisponible}
                  emptyMessage="No hay libros disponibles."
                  actions={<></>}
                  renderItem={(l) => (
                    <div>
                      <strong>Libro:</strong> {l.libro}
                    </div>
                  )}
                />
              </div>

              <ListSection
                title="Asignados / No entregados"
                items={asignadosNoEntregados}
                selectedItems={state.seleccionadosIzquierda}
                onToggleSelection={(id) => toggleSeleccion(id, "izquierda")}
                emptyMessage="No hay libros pendientes de entrega."
                actions={
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={entregarSeleccionados}
                          disabled={state.seleccionadosIzquierda.length === 0}
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
                    <AlertDialog
                      open={modals.confirmarEliminacionAbierto}
                      onOpenChange={setModals}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={
                                state.seleccionadosIzquierda.length === 0
                              }
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
                          <AlertDialogAction onClick={eliminarAsignacion}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                }
                renderItem={(p) => (
                  <div>
                    <strong>Libro:</strong> {p.libro}
                  </div>
                )}
              />
            </div>
          </TabsContent>
          <TabsContent value="prestamos">
            <div className="grid grid-cols-2 gap-6 max-h-[30rem] text-sm">
              <ListSection
                title="En Préstamo"
                items={prestados}
                selectedItems={state.seleccionadosIzquierda}
                onToggleSelection={(id) => toggleSeleccion(id, "izquierda")}
                emptyMessage="No hay préstamos pendientes."
                actions={
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={devolverSeleccionados}
                          disabled={state.seleccionadosIzquierda.length === 0}
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
                  </>
                }
                renderItem={(p) => (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <strong>Libro:</strong> {p.libro}
                      <div>
                        <strong>Entrega:</strong>{" "}
                        {p.fechaentrega
                          ?.slice(0, 10)
                          .split("-")
                          .reverse()
                          .join("-") || "—"}
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDates((d) => ({
                              ...d,
                              fechaNuevaPrestamo:
                                p.fechaentrega?.slice(0, 10) || "",
                            }));
                            setState((s) => ({
                              ...s,
                              seleccionadosIzquierda: [p.id_item],
                            }));
                            setModals((m) => ({
                              ...m,
                              fechaPrestamoModalAbierto: true,
                            }));
                          }}
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cambiar fecha préstamo</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              />
              <ListSection
                title="Devueltos"
                items={devueltos}
                selectedItems={state.seleccionadosDerecha}
                onToggleSelection={(id) => toggleSeleccion(id, "derecha")}
                emptyMessage="No hay préstamos devueltos."
                actions={
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={prestarSeleccionados}
                          disabled={state.seleccionadosDerecha.length === 0}
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
                  </>
                }
                renderItem={(p) => (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <strong>Libro:</strong> {p.libro}
                      <div>
                        <strong>Devolución:</strong>{" "}
                        {p.fechadevolucion
                          ?.slice(0, 10)
                          .split("-")
                          .reverse()
                          .join("-") || "—"}
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDates((d) => ({
                              ...d,
                              fechaNuevaDevolucion:
                                p.fechadevolucion?.slice(0, 10) || "",
                            }));
                            setState((s) => ({
                              ...s,
                              seleccionadosDerecha: [p.id_item],
                            }));
                            setModals((m) => ({
                              ...m,
                              fechaDevolucionModalAbierto: true,
                            }));
                          }}
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cambiar fecha devolución</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Dialog
          open={modals.fechaPrestamoModalAbierto}
          onOpenChange={() =>
            setModals((m) => ({ ...m, fechaPrestamoModalAbierto: false }))
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar fecha de préstamo</DialogTitle>
            </DialogHeader>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={dates.fechaNuevaPrestamo}
              onChange={(e) =>
                setDates((d) => ({ ...d, fechaNuevaPrestamo: e.target.value }))
              }
            />
            <DialogFooter className="mt-2 flex justify-end gap-2">
              <Button onClick={() => handleDateChange("prestamo")}>
                Guardar
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setModals((m) => ({ ...m, fechaPrestamoModalAbierto: false }))
                }
              >
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={modals.fechaDevolucionModalAbierto}
          onOpenChange={() =>
            setModals((m) => ({ ...m, fechaDevolucionModalAbierto: false }))
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar fecha de devolución</DialogTitle>
            </DialogHeader>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={dates.fechaNuevaDevolucion}
              onChange={(e) =>
                setDates((d) => ({
                  ...d,
                  fechaNuevaDevolucion: e.target.value,
                }))
              }
            />
            <DialogFooter className="mt-2 flex justify-end gap-2">
              <Button onClick={() => handleDateChange("devolucion")}>
                Guardar
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setModals((m) => ({
                    ...m,
                    fechaDevolucionModalAbierto: false,
                  }))
                }
              >
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {usuario && (
          <div className="flex justify-center mt-4 mb-4 border-t pt-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="docCompromiso"
                  className="text-sm font-medium text-gray-700"
                >
                  Documento de compromiso:
                </label>
                <select
                  id="docCompromiso"
                  value={usuario.doc_compromiso}
                  onChange={(e) => {
                    /* Logic for doc_compromiso update */
                  }}
                  className="block w-36 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value={0}>No entregado</option>
                  <option value={1}>Entregado</option>
                  <option value={2}>Recibido</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inicioCurso"
                  checked={usuario.iniciocurso}
                  disabled
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="inicioCurso" className="text-sm text-gray-700">
                  Inicio de curso
                </label>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="ml-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
