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
import { parse } from "date-fns";

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
  const esDirectiva = user?.perfil === "directiva";
  const esExtraescolares = user?.perfil === "extraescolares";
  const queryClient = useQueryClient();

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
  const [coords, setCoords] = useState({ lat: 40.4168, lng: -3.7038 });
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("14:00");
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());

  // NUEVO ATRIBUTO
  const [generaAusencias, setGeneraAusencias] = useState(true);

  // --- Permisos ---
  const esPropietario = user.username === actividad?.uid;

  const editableCamposGenerales =
    esDirectiva ||
    esExtraescolares ||
    (esPropietario && actividad?.estado === 0);

  const editableCamposBasicos =
    esDirectiva || esExtraescolares || esPropietario;

  const puedeGuardar = esDirectiva || esExtraescolares || esPropietario;

  // --- Inicializar datos ---
  useEffect(() => {
    if (!actividad) return;

    setTitulo(actividad.titulo || "");
    setDescripcion(actividad.descripcion || "");
    setTipo(actividad.tipo || "complementaria");
    setGeneraAusencias(actividad.genera_ausencias ?? true);

    if (actividad.fecha_inicio) {
      const [fechaStr, horaStr] = actividad.fecha_inicio.split(" ");
      setFechaInicio(parse(fechaStr, "yyyy-MM-dd", new Date()));
      if (actividad.tipo === "extraescolar" && horaStr) {
        setHoraInicio(horaStr.slice(0, 5));
      }
    }

    if (actividad.fecha_fin) {
      const [fechaStr, horaStr] = actividad.fecha_fin.split(" ");
      setFechaFin(parse(fechaStr, "yyyy-MM-dd", new Date()));
      if (actividad.tipo === "extraescolar" && horaStr) {
        setHoraFin(horaStr.slice(0, 5));
      }
    }

    const depto = departamentos.find(
      (d) => String(d.gidNumber) === String(actividad.gidnumber)
    );
    setDepartamento(depto ? String(depto.gidNumber) : "");

    const periodoIni = periodos.find(
      (p) => String(p.id) === String(actividad.idperiodo_inicio)
    );
    const periodoFi = periodos.find(
      (p) => String(p.id) === String(actividad.idperiodo_fin)
    );
    setPeriodoInicio(periodoIni ? String(periodoIni.id) : "");
    setPeriodoFin(periodoFi ? String(periodoFi.id) : "");

    const cursosSel = cursos
      .filter((c) => actividad.cursos_gids?.map(String).includes(String(c.gid)))
      .map((c) => String(c.gid));
    setCursosSeleccionados(cursosSel);

    setProfesoresSeleccionados(actividad.responsables_uids || []);
    setUbicacion(actividad.ubicacion || "");
    setCoords(actividad.coords || { lat: 40.4168, lng: -3.7038 });
  }, [actividad, periodos, departamentos, cursos]);

  // Si el tipo cambia a extraescolar en edición, forzamos el check
  useEffect(() => {
    if (tipo === "extraescolar") {
      setGeneraAusencias(true);
    }
  }, [tipo]);

  // --- Toggle todos cursos ---
  const todosLosCursosSeleccionados =
    cursos.length > 0 && cursosSeleccionados.length === cursos.length;
  const handleToggleTodosCursos = (checked) => {
    if (checked) setCursosSeleccionados(cursos.map((c) => String(c.gid)));
    else setCursosSeleccionados([]);
  };

  // --- Mutation ---
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
        const error = new Error("Error validación");
        error.data = json;
        throw error;
      }

      return json.actividad;
    },
    onSuccess: (actividad) => {
      queryClient.invalidateQueries(["extraescolares", "uid", user.username]);
      queryClient.invalidateQueries(["extraescolares", "all"]);
      toast.success("Actividad actualizada", actividad.titulo);
      onGuardado?.(actividad);
      onClose();
    },
    onError: (err) => {
      const data = err?.data;
      if (data?.errores && Array.isArray(data.errores)) {
        toast.error(
          <div className="flex flex-col">
            {data.errores.map((e, i) => (
              <span key={i}>• {e}</span>
            ))}
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(
          data?.error || err.message || "Error actualizando actividad"
        );
      }
    },
  });

  // --- Guardar ---
  const handleGuardar = () => {
    const isValidDate = (d) => d instanceof Date && !isNaN(d);
    if (!isValidDate(fechaInicio) || !isValidDate(fechaFin)) {
      toast.error("Las fechas no son válidas");
      return;
    }

    const fechaInicioBase = format(fechaInicio, "yyyy-MM-dd");
    const fechaFinBase = format(fechaFin, "yyyy-MM-dd");

    let fechaInicioStr, fechaFinStr;
    if (tipo === "extraescolar") {
      fechaInicioStr = `${fechaInicioBase} ${horaInicio}:00`;
      fechaFinStr = `${fechaFinBase} ${horaFin}:00`;
    } else {
      fechaInicioStr = `${fechaInicioBase} 00:00:00`;
      fechaFinStr = `${fechaFinBase} 00:00:00`;
    }

    if (fechaFinStr < fechaInicioStr) {
      toast.error("La fecha y hora de fin debe ser posterior a la de inicio");
      return;
    }

    const datos = {
      updated_by: user.username,
      titulo,
      descripcion,
      tipo,
      gidnumber: Number(departamento),
      fecha_inicio: fechaInicioStr,
      fecha_fin: fechaFinStr,
      idperiodo_inicio:
        tipo === "complementaria" ? Number(periodoInicio) : undefined,
      idperiodo_fin: tipo === "complementaria" ? Number(periodoFin) : undefined,
      cursos_gids: cursosSeleccionados,
      responsables_uids: profesoresSeleccionados,
      ubicacion,
      coords,
      estado: actividad.estado,
      genera_ausencias: generaAusencias,
    };

    mutation.mutate(datos);
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="p-0 overflow-visible rounded-lg max-w-5xl w-full"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex flex-col items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar Actividad
          </DialogTitle>

          {actividad && (
            <span
              className={`mt-2 px-3 py-1 rounded-full text-sm font-medium
        ${actividad.estado === 0 ? "bg-yellow-100 text-yellow-800" : ""}
        ${actividad.estado === 1 ? "bg-green-100 text-green-800" : ""}
        ${actividad.estado === 2 ? "bg-red-100 text-red-800" : ""}`}
            >
              {actividad.estado === 0
                ? "Pendiente"
                : actividad.estado === 1
                  ? "Aceptada"
                  : "Rechazada"}
            </span>
          )}
        </DialogHeader>

        <div className="px-6 py-5">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="detalles">Detalles</TabsTrigger>
              <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
            </TabsList>

            {/* --- GENERAL --- */}
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-1">
                <Label>Título</Label>
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={!editableCamposBasicos}
                />
              </div>

              <div className="space-y-1">
                <Label>Departamento organizador</Label>
                <Select
                  value={departamento}
                  onValueChange={setDepartamento}
                  disabled={!editableCamposBasicos}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((d) => (
                      <SelectItem key={d.gidNumber} value={String(d.gidNumber)}>
                        {d.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Tipo de actividad</Label>
                <Select
                  value={tipo}
                  onValueChange={setTipo}
                  disabled={!editableCamposGenerales}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complementaria">
                      Complementaria
                    </SelectItem>
                    <SelectItem value="extraescolar">Extraescolar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Fecha inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled={!editableCamposGenerales}
                      >
                        {fechaInicio instanceof Date && !isNaN(fechaInicio)
                          ? format(fechaInicio, "dd/MM/yyyy")
                          : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={fechaInicio}
                        onSelect={(date) => date && setFechaInicio(date)}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {tipo === "extraescolar" && (
                  <div className="space-y-1">
                    <Label>Hora inicio</Label>
                    <Input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      disabled={!editableCamposGenerales}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Fecha fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled={!editableCamposGenerales}
                      >
                        {fechaFin instanceof Date && !isNaN(fechaFin)
                          ? format(fechaFin, "dd/MM/yyyy")
                          : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={fechaFin}
                        onSelect={(date) => date && setFechaFin(date)}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {tipo === "extraescolar" && (
                  <div className="space-y-1">
                    <Label>Hora fin</Label>
                    <Input
                      type="time"
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                      disabled={!editableCamposGenerales}
                    />
                  </div>
                )}
              </div>

              {tipo === "complementaria" && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col space-y-1">
                    <Label className="text-sm font-bold text-gray-700">
                      Horario lectivo afectado
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Indica desde qué periodo hasta cuál se desarrollará la
                      actividad.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50/50">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Desde el periodo
                      </Label>
                      <Select
                        value={periodoInicio}
                        onValueChange={setPeriodoInicio}
                        disabled={!editableCamposGenerales}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Inicio" />
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

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Hasta el periodo
                      </Label>
                      <Select
                        value={periodoFin}
                        onValueChange={setPeriodoFin}
                        disabled={!editableCamposGenerales}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Fin" />
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
                </div>
              )}
            </TabsContent>

            {/* --- DETALLES --- */}
            <TabsContent value="detalles" className="space-y-6">
              <div className="space-y-1">
                <Label>Descripción</Label>
                <Textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={!editableCamposBasicos}
                />
              </div>

              <div className="space-y-1">
                <MultiSelectProfesores
                  value={profesoresSeleccionados}
                  onChange={setProfesoresSeleccionados}
                  disabled={!editableCamposBasicos}
                />
              </div>

              {/* NUEVO INPUT UBICADO DEBAJO DE PROFESORES */}
              <div className="flex flex-col space-y-2 p-4 border rounded-md bg-blue-50/30">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="genera_ausencias"
                    checked={generaAusencias}
                    disabled={
                      !editableCamposGenerales || tipo === "extraescolar"
                    }
                    onCheckedChange={(checked) => setGeneraAusencias(!!checked)}
                  />
                  <Label
                    htmlFor="genera_ausencias"
                    className="font-semibold cursor-pointer"
                  >
                    Cubrir con guardias
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6 leading-relaxed">
                  Esta actividad genera ausencias del profesorado que participa
                  en ella, que hay que cubrir con las guardias.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Cursos participantes</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="todos-cursos-edit"
                    checked={todosLosCursosSeleccionados}
                    onCheckedChange={handleToggleTodosCursos}
                    disabled={!editableCamposBasicos}
                  />
                  <label
                    htmlFor="todos-cursos-edit"
                    className="text-sm cursor-pointer"
                  >
                    Todos los cursos
                  </label>
                </div>
                <MultiSelect
                  values={cursosSeleccionados}
                  onChange={setCursosSeleccionados}
                  options={cursos.map((c) => ({
                    value: String(c.gid),
                    label: c.nombre,
                  }))}
                  disabled={!editableCamposBasicos}
                  placeholder={
                    cursosSeleccionados.length === 0
                      ? "No hay cursos seleccionados"
                      : ""
                  }
                />
              </div>
            </TabsContent>

            {/* --- UBICACIÓN --- */}
            <TabsContent value="ubicacion" className="space-y-4">
              <div className="space-y-1">
                <Autocomplete
                  value={ubicacion}
                  placeholder="Nombre de la localidad o lugar..."
                  buscar={buscarLugar}
                  onChange={(val) => setUbicacion(val)}
                  onSelect={(lugar) => {
                    if (!editableCamposGenerales) return;
                    setUbicacion(lugar.label);
                    setCoords({ lat: lugar.lat, lng: lugar.lng });
                  }}
                  disabled={!editableCamposGenerales}
                />
              </div>

              <MapContainer
                center={coords}
                zoom={13}
                style={{ height: "350px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={coords}
                  draggable={editableCamposGenerales}
                  eventHandlers={{
                    dragend: async (e) => {
                      if (!editableCamposGenerales) return;
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
                  disabled={!editableCamposGenerales}
                />
                <SetViewOnChange coords={coords} />
              </MapContainer>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleGuardar}
            disabled={!puedeGuardar || mutation.isLoading}
          >
            {mutation.isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
