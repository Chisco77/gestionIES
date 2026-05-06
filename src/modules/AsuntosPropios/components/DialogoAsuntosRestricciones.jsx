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
import { Trash2, CalendarIcon } from "lucide-react";
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

import { useProfesoresActivos } from "@/hooks/useProfesoresActivos";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { DialogoEliminarRango } from "./DialogoEliminarRango";
import { DialogoEliminarAutorizacion } from "./DialogoEliminarAutorizacion";
import { SelectProfesoresSimple } from "@/modules/Utilidades/components/SelectProfesoresSimple";

export function DialogoAsuntosRestricciones({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  const [showFormRango, setShowFormRango] = useState(false);
  const [showFormPermitido, setShowFormPermitido] = useState(false);

  const [restricciones, setRestricciones] = useState({
    asuntosDisponibles: 0,
    maxPorDia: 0,
    antelacionMinima: 0,
    antelacionMaxima: 0,
    maxConsecutivos: 0,
    ofuscar: false,
    mostrarPeticionesDia: false, // ✅ nueva
  });

  const { data: profesores = [], isLoading, error } = useProfesoresActivos();

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

    if (!nuevoRango.motivo.trim()) {
      toast.error("Debes indicar un motivo");
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
      toast.error("Debes indicar profesor y fecha");
      return;
    }
    addAsuntoPermitidoMutation.mutate(nuevoPermitido);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg h-[750px] w-[900px] flex flex-col overflow-hidden"
      >
        {/* HEADER: Fijo arriba */}
        <DialogHeader className="bg-green-500 text-white flex items-center justify-center py-4 px-6 shrink-0">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Restricciones de Asuntos Propios
          </DialogTitle>
        </DialogHeader>

        {/* CONTENEDOR PRINCIPAL: Sin Card, usando flex-1 para ocupar el resto */}
        <Tabs
          defaultValue="restricciones"
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* LISTA DE TABS: Con padding lateral para alinear con el contenido */}
          <div className="px-6 pt-4 bg-slate-50/50 border-b shrink-0">
            <TabsList className="justify-start mb-2">
              <TabsTrigger value="restricciones">Restricciones</TabsTrigger>
              <TabsTrigger value="rangos">Fechas bloqueadas</TabsTrigger>
              <TabsTrigger value="permitidos">Autorizar fechas</TabsTrigger>
            </TabsList>
          </div>

          {/* CONTENIDO DE TABS: Aquí gestionamos el scroll de forma independiente */}
          <div className="flex-1 overflow-hidden relative">
            {/* --- Tab: Restricciones --- */}
            <TabsContent
              value="restricciones"
              className="h-full overflow-y-auto p-6 m-0 space-y-3 focus-visible:outline-none data-[state=inactive]:hidden"
            >
              {/* Asuntos Disponibles */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="asuntosDisponibles"
                    className="text-sm font-semibold"
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
                <p className="text-xs text-muted-foreground">
                  Establece el cupo anual de días de libre disposición asignados
                  a cada docente.
                </p>
              </div>

              {/* Máximo por día */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxPorDia" className="text-sm font-semibold">
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
                <p className="text-xs text-muted-foreground">
                  Cupo máximo de ausencias simultáneas permitidas en el centro.
                </p>
              </div>

              {/* Plazos con diseño mejorado */}
              <div className="space-y-4 rounded-xl border p-4 bg-slate-50/30">
                <Label className="text-sm font-bold">
                  Plazos de solicitud (Antelación)
                </Label>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Antelación mínima</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={restricciones.antelacionMinima}
                        onChange={(e) =>
                          handleChange(
                            "antelacionMinima",
                            Number(e.target.value)
                          )
                        }
                        className="w-24 text-right"
                      />
                      <span className="text-xs text-muted-foreground w-8">
                        días
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Antelación máxima</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={restricciones.antelacionMaxima}
                        onChange={(e) =>
                          handleChange(
                            "antelacionMaxima",
                            Number(e.target.value)
                          )
                        }
                        className="w-24 text-right"
                      />
                      <span className="text-xs text-muted-foreground w-8">
                        días
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transparencia */}
              <div className="flex flex-col space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="mostrarPeticionesDia"
                    className="text-sm font-semibold"
                  >
                    Transparencia de solicitudes
                  </Label>
                  <Switch
                    id="mostrarPeticionesDia"
                    checked={restricciones.mostrarPeticionesDia}
                    onCheckedChange={(checked) =>
                      handleChange("mostrarPeticionesDia", checked)
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground italic bg-amber-50 p-2 rounded border border-amber-100">
                  Permite que los docentes consulten el volumen de solicitudes
                  de forma anonimizada.
                </p>
              </div>
            </TabsContent>

            {/* --- Tab: Rangos bloqueados --- */}
            <TabsContent
              value="rangos"
              className="h-full flex flex-col p-6 m-0 space-y-3 focus-visible:outline-none data-[state=inactive]:hidden"
            >
              <div className="flex items-center justify-between px-1 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Periodos restringidos
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Fechas bloqueadas para petición de Asuntos Propios
                  </p>
                </div>
                <Button
                  variant={showFormRango ? "ghost" : "outline"}
                  size="sm"
                  onClick={() => setShowFormRango(!showFormRango)}
                  className={
                    showFormRango
                      ? "text-slate-500"
                      : "border-slate-800 text-slate-800 border-2 font-bold"
                  }
                >
                  {showFormRango ? "Cancelar" : "Nuevo Rango ..."}
                </Button>
              </div>

              {/* Formulario Colapsable */}
              {showFormRango && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">
                        Inicio
                      </Label>
                      <Input
                        type="date"
                        value={nuevoRango.inicio}
                        onChange={(e) =>
                          setNuevoRango({
                            ...nuevoRango,
                            inicio: e.target.value,
                          })
                        }
                        className="h-9 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">
                        Fin
                      </Label>
                      <Input
                        type="date"
                        value={nuevoRango.fin}
                        onChange={(e) =>
                          setNuevoRango({ ...nuevoRango, fin: e.target.value })
                        }
                        className="h-9 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">
                        Motivo
                      </Label>
                      <Input
                        placeholder="Ej: Evaluaciones"
                        value={nuevoRango.motivo}
                        onChange={(e) =>
                          setNuevoRango({
                            ...nuevoRango,
                            motivo: e.target.value,
                          })
                        }
                        className="h-9 bg-white"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        handleAddRango();
                        setShowFormRango(false);
                      }}
                      className="bg-slate-800 h-9 px-6"
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              )}

              {/* Listado de Rangos - Estilo unificado */}

              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Bloqueos de fechas activos
                  </h4>
                  <div className="h-px flex-1 mx-4 bg-slate-100"></div>
                  <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                    {rangos.length} ACTIVAS
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  {cargandoRangos ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400"></div>
                    </div>
                  ) : rangos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl border-slate-100 bg-slate-50/30">
                      <p className="text-sm text-slate-400">
                        No hay restricciones temporales configuradas.
                      </p>
                    </div>
                  ) : (
                    rangos.map((r, i) => (
                      <div
                        key={i}
                        className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-red-50 group-hover:text-red-500 group-hover:border-red-100 transition-colors">
                            <CalendarIcon className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">
                                {new Date(r.inicio).toLocaleDateString("es-ES")}
                              </span>
                              <span className="text-slate-400 text-[10px] font-bold">
                                AL
                              </span>
                              <span className="text-sm font-bold text-slate-700">
                                {new Date(r.fin).toLocaleDateString("es-ES")}
                              </span>
                            </div>
                            {r.motivo && (
                              <span className="text-xs text-slate-500 mt-0.5 italic flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                {r.motivo}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRango(r)}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* --- Tab: Autorizar (Permitidos) --- */}
            <TabsContent
              value="permitidos"
              className="h-full flex flex-col p-6 m-0 space-y-3 focus-visible:outline-none data-[state=inactive]:hidden"
            >
              <div className="flex items-center justify-between px-1 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-blue-900">
                    Excepciones Administrativas
                  </h3>
                  <p className="text-[11px] text-blue-700/60">
                    Autorizar petición de asunto propio
                  </p>
                </div>
                <Button
                  variant={showFormPermitido ? "ghost" : "default"}
                  size="sm"
                  onClick={() => setShowFormPermitido(!showFormPermitido)}
                  className={
                    showFormPermitido
                      ? "text-slate-500"
                      : "bg-blue-600 hover:bg-blue-700 font-bold"
                  }
                >
                  {showFormPermitido ? "Cancelar" : "Añadir autorización ..."}
                </Button>
              </div>

              {showFormPermitido && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-200 shrink-0 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                      Docente
                    </Label>
                    <SelectProfesoresSimple
                      value={nuevoPermitido.uid}
                      onChange={(uid) =>
                        setNuevoPermitido({ ...nuevoPermitido, uid })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                        Fecha
                      </Label>
                      <Input
                        type="date"
                        value={nuevoPermitido.fecha}
                        onChange={(e) =>
                          setNuevoPermitido({
                            ...nuevoPermitido,
                            fecha: e.target.value,
                          })
                        }
                        className="h-9 bg-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => {
                          handleAddPermitido();
                          setShowFormPermitido(false);
                        }}
                        className="bg-blue-600 w-full h-9 shadow-md"
                      >
                        Confirmar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Listado de Autorizaciones */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Historial de excepciones
                  </h4>
                  <div className="h-px flex-1 mx-4 bg-slate-100"></div>
                  <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                    {asuntosPermitidos.length} ACTIVAS
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  {asuntosPermitidos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl border-slate-100 bg-slate-50/30">
                      <p className="text-sm text-slate-400">
                        No hay permisos registrados.
                      </p>
                    </div>
                  ) : (
                    asuntosPermitidos.map((p) => {
                      const prof = profesores.find((pro) => pro.uid === p.uid);
                      return (
                        <div
                          key={p.id}
                          className="group flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 text-sm font-bold border border-blue-100">
                              {prof?.givenName?.charAt(0) || "?"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">
                                {prof ? `${prof.sn}, ${prof.givenName}` : p.uid}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-1.5 rounded">
                                  {new Date(p.fecha).toLocaleDateString(
                                    "es-ES"
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  • Válido solo para esta fecha
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEliminarAutorizacion(p)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* FOOTER: Fijo abajo */}
        <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={guardarRestriccionesMutation.isLoading}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
          >
            {guardarRestriccionesMutation.isLoading
              ? "Guardando..."
              : "Guardar Cambios"}
          </Button>
        </div>
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
                  (p) => p.uid === autorizacionSeleccionada.uid
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
