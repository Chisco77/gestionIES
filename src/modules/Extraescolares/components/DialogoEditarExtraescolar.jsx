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
import { format, parse } from "date-fns";

import { useEstancias } from "@/hooks/Estancias/useEstancias";

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

function ClickHandler({ setCoords, setUbicacion, disabled }) {
  useMapEvent("click", async (e) => {
    if (disabled) return;
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

export function DialogoEditarExtraescolar({
  open,
  onClose,
  onGuardado,
  actividad,
  periodos = [],
  departamentos = [],
  cursos = [],
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: estancias = [], isLoading: loadingEstancias } = useEstancias();

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
  const [ambito, setAmbito] = useState("fuera");
  const [estancia, setEstancia] = useState("");
  const [generaAusencias, setGeneraAusencias] = useState(true);

  // --- Permisos ---
  const esDirectiva = user?.perfil === "directiva";
  const esExtraescolares = user?.perfil === "extraescolares";
  const esPropietario = user.username === actividad?.uid;

  const esEditable =
    esDirectiva ||
    esExtraescolares ||
    (esPropietario && actividad?.estado === 0);

  // --- Inicializar datos ---
  useEffect(() => {
    if (!actividad || !open) return;

    setTitulo(actividad.titulo || "");
    setDescripcion(actividad.descripcion || "");
    setTipo(actividad.tipo || "complementaria");
    setGeneraAusencias(actividad.genera_ausencias ?? true);

    if (actividad.fecha_inicio) {
      const [fechaStr, horaStr] = actividad.fecha_inicio.split(" ");
      setFechaInicio(parse(fechaStr, "yyyy-MM-dd", new Date()));
      if (horaStr) setHoraInicio(horaStr.slice(0, 5));
    }

    if (actividad.fecha_fin) {
      const [fechaStr, horaStr] = actividad.fecha_fin.split(" ");
      setFechaFin(parse(fechaStr, "yyyy-MM-dd", new Date()));
      if (horaStr) setHoraFin(horaStr.slice(0, 5));
    }

    setDepartamento(actividad.gidnumber ? String(actividad.gidnumber) : "");
    setPeriodoInicio(
      actividad.idperiodo_inicio ? String(actividad.idperiodo_inicio) : ""
    );
    setPeriodoFin(
      actividad.idperiodo_fin ? String(actividad.idperiodo_fin) : ""
    );
    setCursosSeleccionados(actividad.cursos_gids?.map(String) || []);
    setProfesoresSeleccionados(actividad.responsables_uids || []);

    if (actividad.idestancia) {
      setAmbito("centro");
      setEstancia(String(actividad.idestancia));
    } else {
      setAmbito("fuera");
      setUbicacion(actividad.ubicacion || "");
      if (actividad.coords?.lat) setCoords(actividad.coords);
    }
  }, [actividad, open]);

  // Lógica de negocio: extraescolares siempre generan ausencias
  useEffect(() => {
    if (tipo === "extraescolar") {
      setGeneraAusencias(true);
    }
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
      const resp = await fetch(`${API_URL}/db/extraescolares/${actividad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(datos),
      });

      const json = await resp.json();

      if (!resp.ok || !json.ok) {
        // Lanzamos un error y le adjuntamos el JSON del backend
        const error = new Error("Error en la petición");
        error.serverData = json;
        throw error;
      }
      return json.actividad;
    },
    onSuccess: (act) => {
      queryClient.invalidateQueries(["extraescolares"]);
      toast.success("Actividad actualizada", { description: act.titulo });
      onGuardado?.(act);
      onClose();
    },
    onError: (err) => {
      // Extraemos los datos que guardamos en la mutación
      const serverData = err.serverData;

      // 1. Si el backend envió un array de "errores" (validación)
      if (serverData?.errores && Array.isArray(serverData.errores)) {
        serverData.errores.forEach((msg) => {
          toast.error(msg, { duration: 5000 });
        });
      }
      // 2. Si el backend envió un string simple "error" (permisos, base de datos)
      else if (serverData?.error) {
        toast.error(serverData.error);
      }
      // 3. Error de red o error de código (err.message)
      else {
        toast.error(
          err.message || "Error inesperado al conectar con el servidor"
        );
      }
    },
  });

  const handleGuardar = () => {
    if (!titulo.trim()) return toast.error("El título es necesario");

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
      ubicacion: ambito === "fuera" ? ubicacion : "centro",
      coords: ambito === "fuera" ? coords : null,
      ambito,
      idestancia: ambito === "centro" ? Number(estancia) : null,
      updated_by: user.username,
    };

    mutation.mutate(datos);
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="p-0 overflow-hidden rounded-lg max-w-5xl w-full flex flex-col max-h-[95vh]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="py-4 px-6 text-white bg-green-600 relative flex flex-row items-center justify-center space-y-0">
          <DialogTitle className="text-xl font-bold">
            Editar Actividad
          </DialogTitle>
          {actividad && (
            <div className="absolute right-6 bg-white/20 px-3 py-1 rounded-full text-sm font-medium border border-white/30">
              {actividad.estado === 0
                ? "Pendiente"
                : actividad.estado === 1
                  ? "Aceptada"
                  : "Rechazada"}
            </div>
          )}
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
                {/* BLOQUE INICIAL: CONFIGURACIÓN BÁSICA */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-4 space-y-2">
                    <Label className="font-bold text-blue-700">
                      Tipo de Actividad
                    </Label>
                    <Select
                      value={tipo}
                      onValueChange={setTipo}
                      disabled={!esEditable}
                    >
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
                      disabled={!esEditable}
                      placeholder="Ej: Visita al Museo del Prado"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Departamento Organizador</Label>
                  <Select
                    value={departamento}
                    onValueChange={setDepartamento}
                    disabled={!esEditable}
                  >
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

                {/* BLOQUE LOGÍSTICO: CRONOGRAMA Y GUARDIAS */}
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-tight">
                      Planificación Horaria
                    </h3>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border shadow-sm max-w-[280px]">
                      <Checkbox
                        id="aus"
                        checked={generaAusencias}
                        disabled={!esEditable || tipo === "extraescolar"}
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
                          Marcar si los profesores responsables necesitan ser
                          sustituidos en sus clases.
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
                                disabled={!esEditable}
                              >
                                {format(fechaInicio, "dd/MM/yyyy")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={fechaInicio}
                                onSelect={setFechaInicio}
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
                              disabled={!esEditable}
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
                                disabled={!esEditable}
                              >
                                {format(fechaFin, "dd/MM/yyyy")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={fechaFin}
                                onSelect={setFechaFin}
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
                              disabled={!esEditable}
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
                            disabled={!esEditable}
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
                            disabled={!esEditable}
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

              {/* --- TAB DETALLES (Mismo código pero verificado) --- */}
              <TabsContent value="detalles" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold">
                    Descripción / Itinerario / Objetivos
                  </Label>
                  <Textarea
                    className="min-h-[120px]"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    disabled={!esEditable}
                    placeholder="Describe detalladamente la actividad..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Profesores Responsables</Label>
                  <MultiSelectProfesores
                    value={profesoresSeleccionados}
                    onChange={setProfesoresSeleccionados}
                    disabled={!esEditable}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="font-bold">Cursos Participantes</Label>
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      <Checkbox
                        id="sel-all"
                        checked={todosLosCursosSeleccionados}
                        onCheckedChange={handleToggleTodosCursos}
                        disabled={!esEditable}
                      />
                      <label
                        htmlFor="sel-all"
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
                    disabled={!esEditable}
                  />
                </div>
              </TabsContent>

              {/* --- TAB UBICACIÓN (Mismo código pero verificado) --- */}
              <TabsContent value="ubicacion" className="mt-0 space-y-4">
                <div className="flex justify-center p-1 bg-slate-100 rounded-lg w-fit mx-auto border shadow-inner">
                  <Button
                    variant={ambito === "centro" ? "white" : "ghost"}
                    size="sm"
                    onClick={() => setAmbito("centro")}
                    disabled={!esEditable}
                  >
                    En el Centro
                  </Button>
                  <Button
                    variant={ambito === "fuera" ? "white" : "ghost"}
                    size="sm"
                    onClick={() => setAmbito("fuera")}
                    disabled={!esEditable}
                  >
                    Fuera del Centro
                  </Button>
                </div>

                {ambito === "centro" ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4 border-2 border-dashed rounded-2xl bg-slate-50/50">
                    <Label className="text-lg font-semibold text-slate-600">
                      Indica el aula o estancia del centro
                    </Label>
                    <Select
                      value={estancia}
                      onValueChange={setEstancia}
                      disabled={!esEditable}
                    >
                      <SelectTrigger className="w-80 bg-white border-slate-300 shadow-sm">
                        <SelectValue placeholder="Elegir estancia..." />
                      </SelectTrigger>
                      <SelectContent>
                        {estancias.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)}>
                            {e.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <Autocomplete
                      value={ubicacion}
                      buscar={buscarLugar}
                      onChange={setUbicacion}
                      onSelect={(l) => {
                        setUbicacion(l.label);
                        setCoords({ lat: l.lat, lng: l.lng });
                      }}
                      disabled={!esEditable}
                      placeholder="Busca la dirección o lugar..."
                    />
                    <div className="rounded-xl overflow-hidden border-2 border-white shadow-md h-[320px]">
                      <MapContainer
                        center={coords}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker
                          position={coords}
                          draggable={esEditable}
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
                          disabled={!esEditable}
                        />
                        <SetViewOnChange coords={coords} />
                      </MapContainer>
                    </div>
                  </div>
                )}
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
            disabled={!esEditable || mutation.isLoading}
          >
            {mutation.isLoading ? "Procesando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
