/**
 * DialogoGestionLlaves.jsx - Diálogo para gestión de préstamo y devolución de llaves
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Componente que muestra un cuadro de diálogo para gestionar el préstamo y la devolución
 * de llaves a profesores para una estancia determinada.
 * - Permite prestar llaves disponibles a profesores filtrables por nombre, apellido o uid.
 * - Permite devolver llaves a partir de la lista de préstamos activos.
 * - Calcula dinámicamente llaves disponibles y prestadas.
 * - Integra pestañas para diferenciar operaciones de "Préstamos" y "Devoluciones".
 *
 * Props:
 * - open: boolean que controla la visibilidad del diálogo.
 * - estancia: objeto con la información de la estancia (id, nombre, totalllaves/totalllaves).
 * - prestamosActivos: array con los préstamos actuales de la estancia.
 * - onClose: función que cierra el diálogo.
 * - onSuccess: callback opcional que se ejecuta tras realizar un préstamo o devolución con éxito.
 *
 * Estado interno:
 * - profesores: array de profesores obtenidos desde LDAP.
 * - profesorSeleccionado: uid del profesor seleccionado para préstamo.
 * - filtroProfesor: string para filtrar la lista de profesores.
 * - seleccionados: array de ids de préstamos seleccionados para devolución.
 *
 * Funcionalidad:
 * - Al abrir, se resetean los estados internos (profesorSeleccionado, filtro, seleccionados).
 * - fetch de profesores desde LDAP filtrando por tipo "teachers", ordenados por apellido y nombre.
 * - Filtrado dinámico de profesores según búsqueda en apellido, nombre o uid.
 * - handlePrestar(): realiza el préstamo de una unidad de llave al profesor seleccionado mediante POST a la API.
 * - handleDevolver(): devuelve las llaves seleccionadas mediante POST a la API.
 * - toggleSeleccion(): añade o quita préstamos seleccionados para la devolución.
 *
 * UI/UX:
 * - Pestañas para separar "Préstamos" y "Devoluciones".
 * - Listados con scroll y selección resaltada:
 *   - verde claro para profesor seleccionado en préstamos
 *   - rojo claro para préstamos seleccionados en devoluciones
 * - Indicadores de total de llaves y llaves prestadas en cada pestaña.
 * - Botones de acción habilitados según selección.
 *
 * Dependencias:
 * - React (useState, useEffect)
 * - @/components/ui/dialog
 * - @/components/ui/tabs
 * - @/components/ui/button
 * - @/components/ui/input
 * - sonner (toast)
 *
 * Notas:
 * - Se calculan llaves disponibles en tiempo real restando las prestadas del total.
 */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useProfesoresLdap } from "@/hooks/useProfesoresLdap";

const API_URL = import.meta.env.VITE_API_URL || "";

export function DialogoGestionLlaves({
  open,
  estancia,
  prestamosActivos,
  onClose,
  onSuccess,
}) {
  const [profesorSeleccionado, setProfesorSeleccionado] = useState("");
  const [filtroProfesor, setFiltroProfesor] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);

  // React query para obtener profesores
  const {
    data: profesores = [],
    isLoading,
    isError,
    refetch,
  } = useProfesoresLdap();

  if (!estancia) return null;

  const disponibles = Math.max(
    0,
    (estancia.totalllaves || estancia.totalllaves || 0) -
      (prestamosActivos?.reduce((acc, p) => acc + p.unidades, 0) || 0)
  );

  const hayPrestamos = prestamosActivos?.length > 0;

  // Resetear estados al abrir
  useEffect(() => {
    if (open) {
      setProfesorSeleccionado("");
      setFiltroProfesor("");
      setSeleccionados([]);
      refetch(); // Vuelve a pedir datos pero usa caché mientras
    }
  }, [open, refetch]);

  // Ordenar profesores
  const profesoresOrdenados = [...profesores].sort((a, b) => {
    if (a.sn === b.sn) return a.givenName.localeCompare(b.givenName);
    return a.sn.localeCompare(b.sn);
  });

  // Filtrado de profesores
  const profesoresFiltrados = profesoresOrdenados.filter((p) => {
    const q = filtroProfesor.toLowerCase();
    return (
      p.sn.toLowerCase().includes(q) ||
      p.givenName.toLowerCase().includes(q) ||
      p.uid.toLowerCase().includes(q)
    );
  });

  // --- acciones ---
  const handlePrestar = async () => {
    if (!profesorSeleccionado) return toast.error("Selecciona un profesor");
    if (!estancia?.id) return toast.error("Estancia no definida");

    try {
      const res = await fetch(`${API_URL}/db/prestamos-llaves/prestar`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: profesorSeleccionado,
          idestancia: estancia.id,
          unidades: 1,
        }),
      });

      if (!res.ok) throw new Error((await res.json())?.error);

      toast.success("Llave prestada correctamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al prestar llave");
    }
  };

  const handleDevolver = async () => {
    if (!seleccionados.length)
      return toast.error("Selecciona al menos una llave");

    try {
      const res = await fetch(`${API_URL}/db/prestamos-llaves/devolver`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: seleccionados }),
      });

      if (!res.ok) throw new Error((await res.json())?.error);

      toast.success("Llaves devueltas correctamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al devolver llave");
    }
  };

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-lg"
      >
        <DialogHeader className="flex justify-between items-center">
          <div>
            <DialogTitle>
              Gestión de llaves · {estancia.descripcion}
            </DialogTitle>
            <DialogDescription>
              {estancia?.codigollave || estancia?.armario ? (
                <>
                  {estancia?.codigollave && (
                    <>
                      Código llave: <strong>{estancia.codigollave}</strong>
                    </>
                  )}
                  {estancia?.codigollave && estancia?.armario && " · "}
                  {estancia?.armario && (
                    <>
                      Armario: <strong>{estancia.armario}</strong>
                    </>
                  )}
                </>
              ) : (
                <span className="text-gray-500 italic">
                  Sin información de ubicación.
                </span>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Tabs defaultValue="prestar" className="mt-4">
          <TabsList>
            <TabsTrigger value="prestar">Entregar llave</TabsTrigger>
            <TabsTrigger value="devolver">Pendientes devolver</TabsTrigger>
          </TabsList>

          {/* --- PRESTAR --- */}
          <TabsContent value="prestar" className="mt-4 space-y-4">
            {disponibles <= 0 ? (
              <p className="text-gray-500 text-sm">
                No hay llaves disponibles.
              </p>
            ) : (
              <>
                <Input
                  placeholder="Buscar profesor"
                  value={filtroProfesor}
                  onChange={(e) => setFiltroProfesor(e.target.value)}
                />

                <div className="max-h-64 overflow-auto border rounded p-3 shadow-sm mt-2">
                  {isLoading && <p className="text-sm">Cargando...</p>}
                  {isError && (
                    <p className="text-sm text-red-500">
                      Error al cargar profesores.{" "}
                      <button className="underline" onClick={() => refetch()}>
                        Reintentar
                      </button>
                    </p>
                  )}

                  {!isLoading && profesoresFiltrados.length === 0 && (
                    <p className="text-xs italic text-gray-500">
                      No hay profesores
                    </p>
                  )}

                  {profesoresFiltrados.map((p) => (
                    <div
                      key={p.uid}
                      onClick={() => setProfesorSeleccionado(p.uid)}
                      className={`cursor-pointer p-2 rounded mb-1 ${
                        profesorSeleccionado === p.uid
                          ? "bg-green-200"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {p.sn}, {p.givenName} ({p.uid})
                    </div>
                  ))}
                </div>

                <DialogFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handlePrestar}
                    disabled={!profesorSeleccionado}
                  >
                    Prestar llave
                  </Button>
                </DialogFooter>
              </>
            )}
          </TabsContent>

          {/* --- DEVOLVER --- */}
          <TabsContent value="devolver" className="mt-4 space-y-4">
            {!hayPrestamos ? (
              <p className="text-gray-500 text-sm">No hay préstamos activos.</p>
            ) : (
              <>
                <div className="max-h-64 overflow-auto border rounded p-3 shadow-sm mt-2">
                  {prestamosActivos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => toggleSeleccion(p.id)}
                      className={`cursor-pointer p-2 rounded mb-1 ${
                        seleccionados.includes(p.id)
                          ? "bg-red-200"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {p.nombre} · {p.unidades} llave(s)
                    </div>
                  ))}
                </div>

                <DialogFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDevolver}
                    disabled={!seleccionados.length}
                  >
                    Devolver llave
                  </Button>
                </DialogFooter>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
