import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multiselect";
import { MultiSelectProfesores } from "@/modules/Utilidades/components/MultiSelectProfesores";

import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvent,
  useMap,
} from "react-leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { Autocomplete } from "@/modules/Utilidades/components/Autocomplete";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { useEstancias } from "@/hooks/Estancias/useEstancias";
import { useDepartamentosLdap } from "@/hooks/useDepartamentosLdap";
import { useCursosLdap } from "@/hooks/useCursosLdap";

const provider = new OpenStreetMapProvider();

const buscarLugar = async (query) => {
  if (!query || query.length < 3) return [];
  const resultados = await provider.search({ query });
  return resultados.map((r) => ({ label: r.label, lat: r.y, lng: r.x }));
};

async function reverseGeocode({ lat, lng }) {
  try {
    const resultados = await provider.search({ query: `${lat}, ${lng}` });
    return resultados.length > 0
      ? resultados[0].label
      : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

function ClickHandler({ setCoords, setUbicacion }) {
  useMapEvent("click", async (e) => {
    const { lat, lng } = e.latlng;
    setCoords({ lat, lng });
    const direccion = await reverseGeocode({ lat, lng });
    setUbicacion(direccion);
  });
  return null;
}

function SetViewOnChange({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (map) map.setView([coords.lat, coords.lng], map.getZoom());
  }, [coords, map]);
  return null;
}

export function DialogoInsertarExtraescolar({
  open,
  onClose,
  onGuardado,
  fechaSeleccionada,
  periodos = [],
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: estancias = [] } = useEstancias();
  const { data: departamentos = [] } = useDepartamentosLdap();
  const { data: cursos = [] } = useCursosLdap();

  // --- State ---
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("complementaria");
  const [departamento, setDepartamento] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFin, setPeriodoFin] = useState("");
  const [cursosSeleccionados, setCursosSeleccionados] = useState([]);
  const [profesoresSeleccionados, setProfesoresSeleccionados] = useState([]);
  const [ubicacion, setUbicacion] = useState("");
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("14:00");
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());

  // Nuevo estado booleano según la nueva lógica del backend
  const [fueraDelCentro, setFueraDelCentro] = useState(false);
  const [estancia, setEstancia] = useState("");
  const [generaAusencias, setGeneraAusencias] = useState(true);

  // seleccion de ubicación válida o no
  const [seleccionValida, setSeleccionValida] = useState(false);

  // --- Inicialización ---
  useEffect(() => {
    if (open) {
      const f = fechaSeleccionada ? new Date(fechaSeleccionada) : new Date();
      setFechaInicio(f);
      setFechaFin(f);
      if (periodos.length > 0) {
        setPeriodoInicio(String(periodos[0].id));
        setPeriodoFin(String(periodos[periodos.length - 1].id));
      }
      // Reset campos
      setTitulo("");
      setDescripcion("");
      setProfesoresSeleccionados([]);
      setCursosSeleccionados([]);
    }
  }, [open, fechaSeleccionada, periodos]);

  useEffect(() => {
    if (tipo === "extraescolar") setGeneraAusencias(true);
  }, [tipo]);

  const todosLosCursosSeleccionados =
    cursos.length > 0 && cursosSeleccionados.length === cursos.length;

  const handleToggleTodosCursos = (checked) => {
    if (checked) setCursosSeleccionados(cursos.map((c) => String(c.gid)));
    else setCursosSeleccionados([]);
  };

  const mutation = useMutation({
    mutationFn: async (datos) => {
      const API_URL = import.meta.env.VITE_API_URL;
      const resp = await fetch(`${API_URL}/db/extraescolares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(datos),
      });

      const json = await resp.json();

      if (!resp.ok || !json.ok) {
        // Lanzamos el JSON para que onError lo reciba directamente
        throw json;
      }
      // Retornamos todo el json para poder leer el 'aviso' si existiera
      return json;
    },
    onSuccess: (data) => {
      const { actividad: act, aviso } = data;

      // 1. Refrescar cachés
      queryClient.invalidateQueries(["extraescolares"]);
      queryClient.invalidateQueries(["reservasPanel", user.username]);
      queryClient.invalidateQueries(["notificacionesDirectiva"]);

      // 2. Notificación de éxito
      toast.success("Actividad creada correctamente", {
        description: act.titulo,
      });

      // 3. Manejo de aviso opcional (por si en el futuro permites avisos no bloqueantes)
      if (aviso) {
        toast.warning("Nota informativa", {
          description: aviso,
          duration: 8000,
        });
      }

      onGuardado?.(act);
      onClose();
    },
    onError: (serverData) => {
      // 1. Errores de validación (el listado con <ul> que ya tenías, que es genial)
      if (serverData?.errores && Array.isArray(serverData.errores)) {
        toast.error("Revisa los siguientes errores:", {
          description: (
            <ul className="mt-2 list-disc list-inside space-y-1">
              {serverData.errores.map((msg, i) => (
                <li key={i} className="text-sm">
                  {msg}
                </li>
              ))}
            </ul>
          ),
          duration: 6000,
        });
      }
      // 2. Error de conflicto de estancia (procedente del throw Error del backend)
      else if (serverData?.error) {
        toast.error("No se pudo crear la actividad", {
          description: serverData.error,
          duration: 8000,
        });
      }
      // 3. Error de red o crash del servidor
      else {
        toast.error(
          serverData?.message || "Error inesperado al conectar con el servidor",
        );
      }
    },
  });

  const handleGuardar = () => {
    const fechaInicioStr =
      tipo === "extraescolar"
        ? `${format(fechaInicio, "yyyy-MM-dd")} ${horaInicio}:00`
        : `${format(fechaInicio, "yyyy-MM-dd")} 00:00:00`;

    const fechaFinStr =
      tipo === "extraescolar"
        ? `${format(fechaFin, "yyyy-MM-dd")} ${horaFin}:00`
        : `${format(fechaFin, "yyyy-MM-dd")} 00:00:00`;

    const datos = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipo,
      gidnumber: departamento ? Number(departamento) : null,
      fecha_inicio: fechaInicioStr,
      fecha_fin: fechaFinStr,
      idperiodo_inicio:
        tipo === "complementaria" ? Number(periodoInicio) : null,
      idperiodo_fin: tipo === "complementaria" ? Number(periodoFin) : null,
      cursos_gids: cursosSeleccionados,
      responsables_uids: profesoresSeleccionados,
      genera_ausencias: generaAusencias,
      // Aplicamos la lógica de envío:
      fuera_del_centro: fueraDelCentro,
      ubicacion: fueraDelCentro ? ubicacion : "",
      coords: fueraDelCentro ? coords : null,
      idestancia: !fueraDelCentro && estancia ? Number(estancia) : null,
      uid: user.username,
    };

    mutation.mutate(datos);
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="p-0 overflow-hidden rounded-lg max-w-5xl w-full flex flex-col max-h-[95vh] border-none"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="py-4 px-6 text-white bg-blue-600 flex flex-row items-center justify-center space-y-0">
          <DialogTitle className="text-xl font-bold">
            Nueva Solicitud de Actividad
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-white">
          <Tabs defaultValue="general" className="w-full">
            <div className="px-6 pt-4 bg-slate-50 border-b">
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="detalles">Participantes</TabsTrigger>
                <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
              </TabsList>
            </div>
            <div className="px-8 py-6 min-h-[520px]">
              {/* --- TAB GENERAL --- */}
              <TabsContent value="general" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-4 space-y-2">
                    <Label className="font-bold text-blue-700">
                      Tipo de Actividad
                    </Label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger className="border-blue-200 bg-blue-50/30 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="complementaria">
                          Act. Complementaria
                        </SelectItem>
                        <SelectItem value="extraescolar">
                          Act. Extraescolar
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-8 space-y-2">
                    <Label className="font-bold">Título de la Actividad</Label>
                    <Input
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej: Visita al Museo del Prado"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Departamento Organizador</Label>
                  <Select value={departamento} onValueChange={setDepartamento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((d) => (
                        <SelectItem
                          key={d.gidNumber}
                          value={String(d.gidNumber)}
                        >
                          {d.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* BLOQUE LOGÍSTICO */}
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-tight">
                      Planificación Horaria
                    </h3>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border shadow-sm max-w-[280px]">
                      <Checkbox
                        id="aus"
                        checked={generaAusencias}
                        onCheckedChange={setGeneraAusencias}
                      />
                      <div className="grid gap-0.5 leading-none">
                        <Label
                          htmlFor="aus"
                          className="text-[11px] font-bold cursor-pointer text-slate-800"
                        >
                          SOLICITAR GUARDIAS
                        </Label>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          Marcar si se requiere cobertura de guardias para los
                          responsables.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-slate-500 font-medium text-xs">
                          FECHA Y HORA DE INICIO
                        </Label>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex-1 justify-start border-slate-300"
                              >
                                {format(fechaInicio, "dd/MM/yyyy")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={fechaInicio}
                                onSelect={(d) => d && setFechaInicio(d)}
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                          {tipo === "extraescolar" && (
                            <Input
                              type="time"
                              className="w-28 border-slate-300"
                              value={horaInicio}
                              onChange={(e) => setHoraInicio(e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-500 font-medium text-xs">
                          FECHA Y HORA DE FIN
                        </Label>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex-1 justify-start border-slate-300"
                              >
                                {format(fechaFin, "dd/MM/yyyy")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={fechaFin}
                                onSelect={(d) => d && setFechaFin(d)}
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                          {tipo === "extraescolar" && (
                            <Input
                              type="time"
                              className="w-28 border-slate-300"
                              value={horaFin}
                              onChange={(e) => setHoraFin(e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {tipo === "complementaria" && (
                      <div className="pt-4 border-t grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-blue-600">
                            Periodo Lectivo Inicial
                          </Label>
                          <Select
                            value={periodoInicio}
                            onValueChange={setPeriodoInicio}
                          >
                            <SelectTrigger className="bg-blue-50/20 border-blue-100">
                              <SelectValue placeholder="Periodo..." />
                            </SelectTrigger>
                            <SelectContent>
                              {periodos.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-blue-600">
                            Periodo Lectivo Final
                          </Label>
                          <Select
                            value={periodoFin}
                            onValueChange={setPeriodoFin}
                          >
                            <SelectTrigger className="bg-blue-50/20 border-blue-100">
                              <SelectValue placeholder="Periodo..." />
                            </SelectTrigger>
                            <SelectContent>
                              {periodos.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* --- TAB PARTICIPANTES --- */}
              <TabsContent value="detalles" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold">
                    Descripción / Itinerario / Objetivos
                  </Label>
                  <Textarea
                    className="min-h-[120px]"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe detalladamente la actividad..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Profesores Responsables</Label>
                  <MultiSelectProfesores
                    value={profesoresSeleccionados}
                    onChange={setProfesoresSeleccionados}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="font-bold">Cursos Participantes</Label>
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      <Checkbox
                        id="sel-all-ins"
                        checked={todosLosCursosSeleccionados}
                        onCheckedChange={handleToggleTodosCursos}
                      />
                      <label
                        htmlFor="sel-all-ins"
                        className="cursor-pointer font-medium"
                      >
                        Seleccionar todos
                      </label>
                    </div>
                  </div>
                  <MultiSelect
                    values={cursosSeleccionados}
                    onChange={setCursosSeleccionados}
                    options={cursos.map((c) => ({
                      value: String(c.gid),
                      label: c.nombre,
                    }))}
                  />
                </div>
              </TabsContent>

              {/* --- TAB UBICACIÓN --- */}
              <TabsContent value="ubicacion" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col items-center space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <Label className="text-sm font-bold text-slate-700 uppercase">
                      ¿Dónde se realizará la actividad?
                    </Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={!fueraDelCentro ? "default" : "outline"}
                        className={
                          !fueraDelCentro ? "bg-blue-600 hover:bg-blue-700" : ""
                        }
                        onClick={() => setFueraDelCentro(false)}
                      >
                        🏠 En el propio centro
                      </Button>
                      <Button
                        type="button"
                        variant={fueraDelCentro ? "default" : "outline"}
                        className={
                          fueraDelCentro ? "bg-blue-600 hover:bg-blue-700" : ""
                        }
                        onClick={() => setFueraDelCentro(true)}
                      >
                        📍 Fuera del centro
                      </Button>
                    </div>
                  </div>

                  {!fueraDelCentro ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 border-2 border-dashed rounded-2xl bg-slate-50/50 animate-in fade-in zoom-in-95 duration-300">
                      <div className="text-center space-y-1">
                        <Label className="text-lg font-semibold text-slate-700">
                          Ubicación en el centro
                        </Label>
                        <p className="text-xs text-slate-500">
                          Opcional: Seleccione una estancia si desea reservar un
                          espacio concreto
                        </p>
                      </div>
                      <Select value={estancia} onValueChange={setEstancia}>
                        <SelectTrigger className="w-80 bg-white border-slate-300 shadow-sm">
                          <SelectValue placeholder="Sin estancia específica" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">
                            Ninguna / Todo el centro
                          </SelectItem>
                          {estancias.map((e) => (
                            <SelectItem key={e.id} value={String(e.id)}>
                              {e.descripcion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-2">
                        <Label className="font-bold">
                          Dirección o Lugar de Destino
                        </Label>
                        <Autocomplete
                          value={ubicacion}
                          buscar={buscarLugar}
                          onChange={(nuevoTexto) => setUbicacion(nuevoTexto)}
                          onSelect={(l) => {
                            setUbicacion(l.label);
                            setCoords({ lat: l.lat, lng: l.lng });
                          }}
                          placeholder="Busca la dirección, museo, localidad..."
                        />
                      </div>
                      <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-md h-[320px]">
                        <MapContainer
                          center={coords}
                          zoom={13}
                          style={{ height: "100%", width: "100%" }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker
                            position={coords}
                            draggable
                            eventHandlers={{
                              dragend: async (e) => {
                                const { lat, lng } = e.target.getLatLng();
                                setCoords({ lat, lng });
                                const dir = await reverseGeocode({ lat, lng });
                                setUbicacion(dir);
                              },
                            }}
                          />
                          <ClickHandler
                            setCoords={setCoords}
                            setUbicacion={setUbicacion}
                          />
                          <SetViewOnChange coords={coords} />
                        </MapContainer>
                      </div>
                      <p className="text-[10px] text-slate-500 italic text-center">
                        Puedes hacer clic en el mapa para ajustar la ubicación
                        exacta.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isLoading}
          >
            Cancelar
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 font-bold"
            onClick={handleGuardar}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Guardando..." : "Crear Actividad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
