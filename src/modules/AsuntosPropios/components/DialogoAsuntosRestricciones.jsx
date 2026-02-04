/**
 * DialogoAsuntosRestricciones.jsx - Diálogo para las restricciones aplicables a asuntos propios
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
 * Componente que muestra un cuadro de diálogo para establecer restricciones
 * y rangos bloqueados para la petición de días de asuntos propios.
 *
 */

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useProfesoresLdap } from "@/hooks/useProfesoresLdap";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { DialogoEliminarRango } from "./DialogoEliminarRango";
import { DialogoEliminarAutorizacion } from "./DialogoEliminarAutorizacion";

export function DialogoAsuntosRestricciones({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  const [restricciones, setRestricciones] = useState({
    asuntosDisponibles: 0,
    maxPorDia: 0,
    antelacionMinima: 0,
    antelacionMaxima: 0,
    maxConsecutivos: 0,
    ofuscar: false,
    mostrarPeticionesDia: false, // ✅ nueva
  });

  const { data: profesores = [], isLoading, error } = useProfesoresLdap();

  const [busquedaProfesor, setBusquedaProfesor] = useState("");
  const profesoresFiltrados = profesores.filter((p) => {
    const nombreCompleto =
      `${p.givenName ?? ""} ${p.sn ?? ""} ${p.uid}`.toLowerCase();
    return nombreCompleto.includes(busquedaProfesor.toLowerCase());
  });

  const [rangos, setRangos] = useState([]);
  const [nuevoRango, setNuevoRango] = useState({
    inicio: "",
    fin: "",
    motivo: "",
  });
  const [cargandoRangos, setCargandoRangos] = useState(false);

  // para levantar restrccion en una fecha a un profe determinado
  const [asuntosPermitidos, setAsuntosPermitidos] = useState([]);
  const [nuevoPermitido, setNuevoPermitido] = useState({
    uid: "",
    fecha: "",
  });

  // para el rango a eliminar
  const [dialogoEliminarRangoOpen, setDialogoEliminarRangoOpen] =
    useState(false);
  const [rangoSeleccionado, setRangoSeleccionado] = useState(null);

  // autorización a eliminar
  const [dialogoEliminarAutorizacionOpen, setDialogoEliminarAutorizacionOpen] =
    useState(false);
  const [autorizacionSeleccionada, setAutorizacionSeleccionada] =
    useState(null);

  // Cargar datos al abrir
  useEffect(() => {
    if (open) {
      fetchRestricciones();
      fetchRangos();
      fetchAsuntosPermitidos();
    }
  }, [open]);

  // --- Fetch restricciones ---
  const fetchRestricciones = async () => {
    try {
      const res = await fetch(`${API_URL}/db/restricciones`, {
        credentials: "include",
      });
      if (!res.ok)
        throw new Error("Error al obtener restricciones de asuntos propios");
      const data = await res.json();

      const map = {
        dias: "asuntosDisponibles",
        concurrentes: "maxPorDia",
        antelacion_min: "antelacionMinima",
        antelacion_max: "antelacionMaxima",
        consecutivos: "maxConsecutivos",
        ofuscar: "ofuscar",
        mostrar_peticiones_dia: "mostrarPeticionesDia", // ✅
      };

      const newState = { ...restricciones };
      data.forEach((r) => {
        if (r.restriccion === "asuntos" && map[r.descripcion]) {
          newState[map[r.descripcion]] =
            r.descripcion === "ofuscar" ||
            r.descripcion === "mostrar_peticiones_dia"
              ? r.valor_bool
              : r.valor_num;
        }
      });
      setRestricciones(newState);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar las restricciones de asuntos propios");
    }
  };

  // --- Fetch rangos bloqueados ---
  const fetchRangos = async () => {
    try {
      setCargandoRangos(true);
      const res = await fetch(`${API_URL}/db/restricciones/asuntos/rangos`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener rangos bloqueados");
      const data = await res.json();
      setRangos(data.rangos || []);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar los rangos bloqueados");
    } finally {
      setCargandoRangos(false);
    }
  };

  // obtener fechas permitidas
  const fetchAsuntosPermitidos = async () => {
    try {
      const res = await fetch(`${API_URL}/db/asuntos-permitidos`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener permisos especiales");
      const data = await res.json();
      setAsuntosPermitidos(data);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar los permisos especiales");
    }
  };

  // --- Mutations React Query ---
  const guardarRestriccionesMutation = useMutation({
    mutationFn: async (restriccionesAEnviar) => {
      const res = await fetch(`${API_URL}/db/restricciones/asuntos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(restriccionesAEnviar),
      });
      if (!res.ok) throw new Error("Error al guardar restricciones");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Restricciones guardadas correctamente");
      queryClient.invalidateQueries(["restricciones_asuntos"]);
      onOpenChange(false);
    },
    onError: (err) =>
      toast.error(err.message || "Error al guardar restricciones"),
  });

  const addRangoMutation = useMutation({
    mutationFn: async (nuevoRango) => {
      const res = await fetch(`${API_URL}/db/restricciones/asuntos/rangos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevoRango),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al añadir rango bloqueado");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setRangos(data.rangos || []);
      setNuevoRango({ inicio: "", fin: "", motivo: "" });
      toast.success("Rango bloqueado añadido correctamente");
      queryClient.invalidateQueries(["restricciones_asuntos"]);
    },
    onError: (err) => toast.error(err.message),
  });

  const addAsuntoPermitidoMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${API_URL}/db/asuntos-permitidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al añadir permiso");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("Permiso especial añadido");
      setNuevoPermitido({ uid: "", fecha: "" });
      fetchAsuntosPermitidos();
    },
    onError: (err) => toast.error(err.message),
  });

  // --- Handlers ---
  const handleChange = (field, value) =>
    setRestricciones((prev) => ({ ...prev, [field]: value }));
  const handleGuardar = () =>
    guardarRestriccionesMutation.mutate(restricciones);
  const handleAddRango = () => {
    if (!nuevoRango.inicio || !nuevoRango.fin) {
      toast.error("Debes indicar fechas de inicio y fin");
      return;
    }
    addRangoMutation.mutate(nuevoRango);
  };

  const handleDeleteRango = (rango) => {
    setRangoSeleccionado(rango);
    setDialogoEliminarRangoOpen(true);
  };

  const handleEliminarAutorizacion = (autorizacion) => {
    setAutorizacionSeleccionada(autorizacion);
    setDialogoEliminarAutorizacionOpen(true);
  };

  const handleAddPermitido = () => {
    if (!nuevoPermitido.uid || !nuevoPermitido.fecha) {
      toast.error("Debes indicar usuario y fecha");
      return;
    }
    addAsuntoPermitidoMutation.mutate(nuevoPermitido);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="p-0 rounded-lg h-[700px] w-[900px] flex flex-col">
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Restricciones de Asuntos Propios
          </DialogTitle>
        </DialogHeader>

        <Card className="border-none shadow-none bg-transparent flex-1 overflow-hidden">
          <CardContent className="space-y-5 pt-4 flex flex-col h-full overflow-hidden">
            <Tabs
              defaultValue="restricciones"
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="justify-start">
                <TabsTrigger value="restricciones">Restricciones</TabsTrigger>
                <TabsTrigger value="rangos">Rangos bloqueados</TabsTrigger>
                <TabsTrigger value="permitidos">Autorizar fechas</TabsTrigger>
              </TabsList>

              {/* --- Tab: Restricciones --- */}
              <TabsContent
                value="restricciones"
                className="flex-1 overflow-auto space-y-5"
              >
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="asuntosDisponibles"
                    className="text-sm font-medium"
                  >
                    Asuntos propios disponibles
                  </Label>
                  <Input
                    id="asuntosDisponibles"
                    type="number"
                    value={restricciones.asuntosDisponibles}
                    onChange={(e) =>
                      handleChange("asuntosDisponibles", Number(e.target.value))
                    }
                    className="w-28 text-right"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="maxPorDia" className="text-sm font-medium">
                    Máximo de peticiones por día
                  </Label>
                  <Input
                    id="maxPorDia"
                    type="number"
                    value={restricciones.maxPorDia}
                    onChange={(e) =>
                      handleChange("maxPorDia", Number(e.target.value))
                    }
                    className="w-28 text-right"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="antelacionMinima"
                    className="text-sm font-medium"
                  >
                    Antelación mínima (días)
                  </Label>
                  <Input
                    id="antelacionMinima"
                    type="number"
                    value={restricciones.antelacionMinima}
                    onChange={(e) =>
                      handleChange("antelacionMinima", Number(e.target.value))
                    }
                    className="w-28 text-right"
                  />
                </div>

                {/* ✅ Nuevo input: Antelación máxima */}
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="antelacionMaxima"
                    className="text-sm font-medium"
                  >
                    Antelación máxima (días)
                  </Label>
                  <Input
                    id="antelacionMaxima"
                    type="number"
                    value={restricciones.antelacionMaxima}
                    onChange={(e) =>
                      handleChange("antelacionMaxima", Number(e.target.value))
                    }
                    className="w-28 text-right"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="maxConsecutivos"
                    className="text-sm font-medium"
                  >
                    Máximo de días consecutivos
                  </Label>
                  <Input
                    id="maxConsecutivos"
                    type="number"
                    value={restricciones.maxConsecutivos}
                    onChange={(e) =>
                      handleChange("maxConsecutivos", Number(e.target.value))
                    }
                    className="w-28 text-right"
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="mostrarPeticionesDia"
                    className="text-sm font-medium"
                  >
                    Mostrar información de todas las peticiones de APs en un día
                  </Label>
                  <Switch
                    id="mostrarPeticionesDia"
                    checked={restricciones.mostrarPeticionesDia}
                    onCheckedChange={(checked) =>
                      handleChange("mostrarPeticionesDia", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="ofuscar" className="text-sm font-medium">
                    Ofuscar nombres en el calendario
                  </Label>
                  <Switch
                    id="ofuscar"
                    checked={restricciones.ofuscar}
                    onCheckedChange={(checked) =>
                      handleChange("ofuscar", checked)
                    }
                  />
                </div>
              </TabsContent>

              {/* --- Tab: Rangos bloqueados --- */}
              <TabsContent
                value="rangos"
                className="flex-1 overflow-auto space-y-4"
              >
                <p className="text-sm text-muted-foreground mb-3">
                  Define periodos en los que no se podrán solicitar días de
                  asuntos propios.
                </p>

                <div className="flex-1 overflow-auto space-y-2 mb-3">
                  {cargandoRangos ? (
                    <p className="text-sm text-muted-foreground">Cargando...</p>
                  ) : rangos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay rangos bloqueados actualmente.
                    </p>
                  ) : (
                    rangos.map((r, i) => {
                      const inicioStr = new Date(r.inicio).toLocaleDateString(
                        "es-ES",
                      );
                      const finStr = new Date(r.fin).toLocaleDateString(
                        "es-ES",
                      );

                      return (
                        <Card
                          key={i}
                          className="border shadow-sm rounded-xl p-2 bg-white cursor-pointer hover:bg-blue-50 transition-colors relative"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span>
                                {inicioStr} → {finStr}
                              </span>
                              {r.motivo && (
                                <div className="text-muted-foreground ml-0">
                                  ({r.motivo})
                                </div>
                              )}
                            </div>
                            <Button
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRango(r)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  <Input
                    type="date"
                    value={nuevoRango.inicio}
                    onChange={(e) =>
                      setNuevoRango((p) => ({ ...p, inicio: e.target.value }))
                    }
                  />
                  <Input
                    type="date"
                    value={nuevoRango.fin}
                    onChange={(e) =>
                      setNuevoRango((p) => ({ ...p, fin: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Motivo (opcional)"
                    value={nuevoRango.motivo}
                    onChange={(e) =>
                      setNuevoRango((p) => ({ ...p, motivo: e.target.value }))
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="secondary" onClick={handleAddRango}>
                    Añadir rango
                  </Button>
                </div>
              </TabsContent>

              <TabsContent
                value="permitidos"
                className="flex-1 overflow-auto space-y-4"
              >
                {/* --- Formulario para añadir permiso --- */}
                <div className="space-y-4">
                  {/* Profesor */}
                  <div className="flex flex-col space-y-2">
                    <Label>Profesor</Label>

                    <Input
                      placeholder="Buscar por nombre, apellidos o UID"
                      value={busquedaProfesor}
                      onChange={(e) => setBusquedaProfesor(e.target.value)}
                      className="mb-2"
                    />

                    <div className="max-h-48 overflow-y-auto border rounded p-2">
                      {isLoading && (
                        <p className="text-sm text-muted-foreground">
                          Cargando profesores...
                        </p>
                      )}

                      {error && (
                        <p className="text-sm text-red-500">
                          Error al cargar profesores LDAP
                        </p>
                      )}

                      {!isLoading &&
                        !error &&
                        profesoresFiltrados.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No se encontraron profesores
                          </p>
                        )}

                      {!isLoading &&
                        !error &&
                        profesoresFiltrados.map((p) => (
                          <label
                            key={p.uid}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="profesor-permitido"
                              value={p.uid}
                              checked={nuevoPermitido.uid === p.uid}
                              onChange={() =>
                                setNuevoPermitido((prev) => ({
                                  ...prev,
                                  uid: p.uid,
                                }))
                              }
                            />
                            <span>
                              {p.givenName} {p.sn} ({p.uid})
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>

                  {/* Fecha + botón */}
                  <div className="flex flex-col sm:flex-row gap-2 items-end">
                    <div className="flex-1">
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={nuevoPermitido.fecha}
                        onChange={(e) =>
                          setNuevoPermitido((p) => ({
                            ...p,
                            fecha: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button className="sm:mt-6" onClick={handleAddPermitido}>
                      Añadir permiso
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* --- Listado de permisos existentes --- */}
                <div className="space-y-2">
                  {asuntosPermitidos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay permisos especiales definidos.
                    </p>
                  ) : (
                    asuntosPermitidos.map((p) => {
                      const profesor = profesores.find(
                        (prof) => prof.uid === p.uid,
                      );
                      const nombreCompleto = profesor
                        ? `${profesor.givenName} ${profesor.sn}`
                        : p.uid;

                      return (
                        <Card
                          key={p.id}
                          className="p-2 flex items-center justify-between"
                        >
                          <div className="text-sm">
                            <strong>{nombreCompleto}</strong> —{" "}
                            {new Date(p.fecha).toLocaleDateString("es-ES")}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleEliminarAutorizacion(p)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <DialogFooter className="px-6 py-4 bg-gray-50">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={handleGuardar}
                disabled={guardarRestriccionesMutation.isLoading}
              >
                {guardarRestriccionesMutation.isLoading
                  ? "Guardando..."
                  : "Guardar"}
              </Button>
            </DialogFooter>
          </CardContent>
        </Card>
      </DialogContent>
      <DialogoEliminarRango
        open={dialogoEliminarRangoOpen}
        onOpenChange={setDialogoEliminarRangoOpen}
        rango={rangoSeleccionado}
        onDeleteSuccess={() => {
          fetchRangos(); // refresca lista
          setRangoSeleccionado(null);
        }}
      />
      <DialogoEliminarAutorizacion
        open={dialogoEliminarAutorizacionOpen}
        onOpenChange={setDialogoEliminarAutorizacionOpen}
        autorizacion={autorizacionSeleccionada}
        nombreProfesor={
          autorizacionSeleccionada
            ? (() => {
                const prof = profesores.find(
                  (p) => p.uid === autorizacionSeleccionada.uid,
                );
                return prof
                  ? `${prof.givenName} ${prof.sn}`
                  : autorizacionSeleccionada.uid;
              })()
            : ""
        }
        onDeleteSuccess={() => {
          fetchAsuntosPermitidos();
          setAutorizacionSeleccionada(null);
        }}
      />
    </Dialog>
  );
}
