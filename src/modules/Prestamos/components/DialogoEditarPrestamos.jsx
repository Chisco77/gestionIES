/**
 * Componente: DialogoEditarPrestamos
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Este componente muestra un diálogo para la edición de asignaciones y préstamos de libros de un usuario
 * (alumno o tutor). Permite:
 *   - Visualizar foto y datos del usuario.
 *   - Gestionar asignaciones.
 *   - Prestar libros, devolverlos o "desprestar" libros devueltos.
 *   - Cambiar fechas de préstamo y devolución individualmente.
 *   - Asignar libros disponibles a un usuario.
 *   - Eliminar préstamos seleccionados.
 *   - Controlar el documento de compromiso y mostrar información de inicio de curso.
 *
 * Props:
 *   - open: boolean → indica si el diálogo está abierto.
 *   - onClose: function → callback para cerrar el diálogo.
 *   - usuario: object → usuario seleccionado, con propiedades:
 *       - uid: string
 *       - nombreUsuario: string
 *       - rol: string ('alumno' | 'tutor' | ...)
 *       - prestamos: array → lista de préstamos del usuario
 *       - doc_compromiso: number → estado del documento de compromiso (0,1,2)
 *       - iniciocurso: boolean → indica si ha comenzado el curso
 *   - onSuccess: function → callback que se ejecuta tras cualquier acción exitosa.
 *
 * Estados internos:
 *   - state: objeto con:
 *       - prestamos: lista de préstamos normalizados
 *       - seleccionadosIzquierda: ids seleccionados en lista izquierda
 *       - seleccionadosDerecha: ids seleccionados en lista derecha
 *       - librosDisponibles: libros disponibles según curso seleccionado
 *       - librosDisponiblesSeleccionados: ids seleccionados de libros disponibles
 *       - cursos: lista de cursos para el select
 *       - cursoSeleccionado: id del curso seleccionado
 *   - modals: controla la apertura de sub-diálogos:
 *       - confirmarEliminacionAbierto
 *       - fechaPrestamoModalAbierto
 *       - fechaDevolucionModalAbierto
 *   - dates: fechas seleccionadas en modales de edición
 *       - fechaNuevaPrestamo
 *       - fechaNuevaDevolucion
 *   - fotoUrl: URL de la foto del usuario (si existe)
 *   - activeTab: string → pestaña activa ('asignaciones' | 'prestamos')
 *
 * Funciones principales:
 *   - apiCall(endpoint, method, body, successMsg, errorMsg): realiza fetch al backend,
 *     muestra toasts y llama a onSuccess si es exitoso.
 *   - toggleSeleccion(id, side): selecciona/deselecciona un préstamo en la lista izquierda/derecha.
 *   - toggleSeleccionDisponible(id): selecciona/deselecciona un libro disponible.
 *   - filtrarPrestamos(entregado, devuelto): filtra los préstamos según su estado.
 *   - updatePrestamosState(ids, updates): actualiza el estado de los préstamos localmente.
 *   - handleAction(endpoint, ids, successMsg, errorMsg, updates): envía acción al backend
 *     (prestar, devolver, reactivar o eliminar) y actualiza el estado.
 *   - entregarSeleccionados / entregarTodos: marcan como entregados los préstamos seleccionados.
 *   - devolverSeleccionados / devolverTodos: marcan como devueltos los préstamos seleccionados.
 *   - prestarSeleccionados / prestarTodos: reactivan préstamos devueltos.
 *   - handleDateChange(dateType): actualiza fecha de préstamo o devolución de un préstamo individual.
 *   - asignarLibros: asigna libros seleccionados disponibles al usuario.
 *   - eliminarAsignacion: elimina los préstamos seleccionados de un usuario.
 *
 * Subcomponentes:
 *   - ListSection: componente reutilizable que muestra listas con scroll,
 *     selección múltiple y acciones.
 *   - Tabs: separa vistas entre "Asignaciones" y "Préstamos".
 *   - Dialogs internos: para cambiar fecha de préstamo y devolución.
 *   - AlertDialog: confirmación de eliminación de préstamos.
 *
 * Flujo de uso:
 *   1. Abrir diálogo con un usuario seleccionado.
 *   2. El componente carga foto, normaliza préstamos y resetea selecciones.
 *   3. El usuario puede:
 *       - Seleccionar libros disponibles y asignarlos.
 *       - Prestar libros pendientes, devolver libros prestados o reactivar devueltos.
 *       - Cambiar fechas de préstamo y devolución individualmente.
 *       - Eliminar préstamos seleccionados.
 *   4. Se muestran toasts de éxito/error tras cada acción.
 *   5. Se actualiza el estado local para reflejar cambios sin recargar.
 *   6. Cerrar el diálogo al finalizar.
 *
 * Librerías/componentes usados:
 *   - React: useState, useEffect
 *   - sonner: toast notifications
 *   - lucide-react: iconos
 *   - Componentes UI: Dialog, Button, Tooltip, ScrollArea, AlertDialog, Select, Tabs
 *
 *
 * Notas:
 *    Una vez el documento de compromiso pasa del estado "No entregado" a cualquier otro, no se
 *    pueden realizar modificaciones en asignaciones ni prestar nuevos libros.
 *
 *    Para hacer nuevos préstamos, hay que crear un nuevo registro utilizando la opción "+" del
 *    pie de la tabla de préstamos.
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
  const [usuarioEdit, setUsuarioEdit] = useState(usuario);
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

  useEffect(() => {
    setUsuarioEdit(usuario);
  }, [usuario]);

  // Pone foto, normaliza préstamos y resetea el estado de la UI al abrirse
  useEffect(() => {
    if (!usuario) return;
    if (open) {
      // Reiniciar las selecciones y la pestaña activa para cada nuevo usuario
      setState((prev) => ({
        ...prev,
        seleccionadosIzquierda: [],
        seleccionadosDerecha: [],
        librosDisponiblesSeleccionados: [],
        cursoSeleccionado: null,
      }));
      setActiveTab("asignaciones");
      setFotoUrl(null); // Resetear la URL de la foto también

      // Normalizar los préstamos para el usuario actual
      const normalizados = usuario.prestamos.map((p) => ({
        ...p,
        devuelto: p.devuelto === true || p.devuelto === "true",
        entregado: p.entregado === true || p.entregado === "true",
      }));
      setState((prev) => ({
        ...prev,
        prestamos: normalizados,
      }));

      const fetchFoto = async () => {
        const extensiones = ["jpg", "jpeg", "png"];
        for (const ext of extensiones) {
          try {
            const res = await fetch(
              `/gestionIES/uploads/alumnos/${usuario.uid}.${ext}`,
              { method: "HEAD" }
            );
            if (res.ok) {
              setFotoUrl(`/gestionIES/uploads/alumnos/${usuario.uid}.${ext}`);
              return;
            }
          } catch (e) {
            /* ignore */
          }
        }
        setFotoUrl(null);
      };
      fetchFoto();
    }
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
  // Si el documento de compromiso del usuario es 0, todos los asignados pueden entregarse.
  // De lo contrario, la lista de "puedenEntregar" estará vacía.
  const puedenEntregar =
    usuario?.doc_compromiso === 0 ? asignadosNoEntregados : [];
  /*const puedenEntregar = asignadosNoEntregados.filter(
    (p) => p.doc_compromiso === 0
  );*/

  const updatePrestamosState = (ids, updates) => {
    setState((prev) => ({
      ...prev,
      prestamos: prev.prestamos.map((p) =>
        ids.includes(p.id_item) ? { ...p, ...updates } : p
      ),
    }));
  };

  const handleGuardarCompleto = async () => {
    console.log("Uasuario: ", usuario);
    try {
      if (!usuario?.id_prestamo) {
        toast.error("No se encontró el préstamo");
        return;
      }

      const payload = {
        prestamo: {
          doc_compromiso: Number(usuarioEdit.doc_compromiso),
          iniciocurso: usuarioEdit.iniciocurso,
        },
        items: state.prestamos.map((p) => ({
          id: p.id_item,
          entregado: p.entregado,
          devuelto: p.devuelto,
          fechaentrega: p.fechaentrega,
          fechadevolucion: p.fechadevolucion,
        })),
      };

      const res = await fetch(
        `${API_URL}/db/prestamos/${usuario.id_prestamo}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Error");

      toast.success("Préstamo actualizado correctamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Error al guardar cambios");
      console.error(error);
    }
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

  // Marca a prestado los elementos seleccionados de la lista Asignados / No entregados
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
      "prestamos/prestar",
      asignadosNoEntregados.map((p) => p.id_item),
      "Todos los libros entregados correctamente",
      "Error al entregar libros",
      { entregado: true, fechaentrega: new Date().toISOString() }
    );

  // Marca devuelto los items en la lista prestados
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

  // Permite "desprestar" libros
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
      "Asignación eliminada correctamente",
      "Error al eliminar asignaciones"
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

  const handleDocCompromisoChange = (nuevoValor) => {
    const valorActual = Number(usuarioEdit.doc_compromiso);
    const valorNuevo = Number(nuevoValor);

    const esCambioValido =
      (valorActual === 0 && valorNuevo === 1) ||
      (valorActual === 1 && valorNuevo === 0);

    if (!esCambioValido) {
      toast.error("Cambio de estado no permitido.");
      return;
    }

    setUsuarioEdit((prev) => ({
      ...prev,
      doc_compromiso: valorNuevo,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
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
                            //state.librosDisponiblesSeleccionados.length === 0
                            usuario?.doc_compromiso != 0
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

                {/* Select de cursos */}
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
                          // debe haberse recibido el documento de compromiso para poder prestar
                          disabled={usuario?.doc_compromiso != 2}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Prestar seleccionado(s)</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={entregarTodos}
                          // debe haberse recibido el documento de compromiso para poder prestar
                          disabled={usuario?.doc_compromiso != 2}
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Prestar todos</TooltipContent>
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
                              disabled={usuario?.doc_compromiso != 0}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Eliminar asignación</TooltipContent>
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar asignación(es)?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminarán
                            definitivamente las asignaciones seleccionados.
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
                          // debe haberse recibido el documento de compromiso para poder prestar
                          disabled={usuario?.doc_compromiso != 2}
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
                          // debe haberse recibido el documento de compromiso para poder prestar
                          disabled={usuario?.doc_compromiso != 2}
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
          modal={true}
          onOpenChange={() =>
            setModals((m) => ({ ...m, fechaPrestamoModalAbierto: false }))
          }
        >
          <DialogContent
            className="max-w-md"
            onInteractOutside={(e) => e.preventDefault()}
          >
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
                <label className="text-sm font-medium text-gray-700">
                  Documento de compromiso:
                </label>

                <Select
                  value={usuarioEdit?.doc_compromiso?.toString()}
                  onValueChange={(nuevoValor) => {
                    const valorActual = Number(usuarioEdit.doc_compromiso);
                    const valorNuevo = Number(nuevoValor);

                    // Solo permitir cambios entre 0 y 1
                    if (valorActual === 2) return; // recibido, no editable
                    if (
                      (valorActual === 0 && valorNuevo === 1) ||
                      (valorActual === 1 && valorNuevo === 0)
                    ) {
                      setUsuarioEdit((prev) => ({
                        ...prev,
                        doc_compromiso: valorNuevo,
                      }));
                    } else {
                      toast.error("Cambio de estado no permitido.");
                    }
                  }}
                  disabled={usuarioEdit?.doc_compromiso === 2} // Recibido no editable
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Pendiente</SelectItem>
                    <SelectItem value="1">Entregado</SelectItem>
                    <SelectItem value="2">Recibido</SelectItem>
                  </SelectContent>
                </Select>
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
        <DialogFooter className="mt-4 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button onClick={handleGuardarCompleto}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
