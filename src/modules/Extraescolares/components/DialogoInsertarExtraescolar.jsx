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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { es } from "date-fns/locale";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvent,
  useMap,
} from "react-leaflet";

import { OpenStreetMapProvider } from "leaflet-geosearch";
import { Autocomplete } from "@/modules/Utilidades/components/Autocomplete";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDepartamentosLdap } from "@/hooks/useDepartamentosLdap";
import { useCursosLdap } from "@/hooks/useCursosLdap";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const provider = new OpenStreetMapProvider();

function CampoError({ children }) {
  return <p className="text-red-600 text-sm mt-1">{children}</p>;
}

const buscarLugar = async (query) => {
  if (!query || query.length < 3) return [];
  const resultados = await provider.search({ query });
  return resultados.map((r) => ({ label: r.label, lat: r.y, lng: r.x }));
};

async function reverseGeocode({ lat, lng }) {
  try {
    const resultados = await provider.search({ query: `${lat}, ${lng}` });
    if (resultados.length > 0) return resultados[0].label;
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
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
  }, [coords]);
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

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("complementaria");
  const [departamento, setDepartamento] = useState("");

  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());

  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("14:00");

  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFin, setPeriodoFin] = useState("");

  const [cursosSeleccionados, setCursosSeleccionados] = useState([]);
  const [profesoresSeleccionados, setProfesoresSeleccionados] = useState([]);

  const [ubicacion, setUbicacion] = useState("");
  const [coords, setCoords] = useState({ lat: 40.4168, lng: -3.7038 });

  // NUEVO ATRIBUTO: genera_ausencias
  const [generaAusencias, setGeneraAusencias] = useState(true);

  const { data: departamentos = [] } = useDepartamentosLdap();
  const { data: cursos = [] } = useCursosLdap();

  const [errores, setErrores] = useState({});

  const todosLosCursosSeleccionados =
    cursos.length > 0 && cursosSeleccionados.length === cursos.length;

  // Si el tipo es extraescolar, forzamos que genere ausencias (según lógica de negocio)
  useEffect(() => {
    if (tipo === "extraescolar") {
      setGeneraAusencias(true);
    }
  }, [tipo]);

  // Inicializar fechas si viene una seleccionada
  useEffect(() => {
    if (open && fechaSeleccionada) {
      const f = new Date(fechaSeleccionada);
      setFechaInicio(f);
      setFechaFin(f);
    }
  }, [open, fechaSeleccionada]);

  // Inicializar periodos
  useEffect(() => {
    if (open && periodos.length > 0) {
      setPeriodoInicio(String(periodos[0].id));
      setPeriodoFin(String(periodos[periodos.length - 1].id));
    }
  }, [open, periodos]);

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
        const error = new Error("Error validación");
        error.data = json;
        throw error;
      }
      return json.actividad;
    },
    onSuccess: (actividad) => {
      queryClient.invalidateQueries(["extraescolares", "uid", user.username]);
      queryClient.invalidateQueries(["extraescolares", "all"]);
      queryClient.invalidateQueries(["notificacionesDirectiva"]);
      toast.success("Alta de actividad", actividad.titulo);
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
        toast.error(data?.error || err.message || "Error guardando actividad");
      }
    },
  });

  const handleGuardar = () => {
    if (mutation.isLoading) return;

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
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      gidnumber: departamento ? Number(departamento) : null,
      tipo,
      fecha_inicio: fechaInicioStr,
      fecha_fin: fechaFinStr,
      idperiodo_inicio:
        tipo === "complementaria" && periodoInicio
          ? Number(periodoInicio)
          : null,
      idperiodo_fin:
        tipo === "complementaria" && periodoFin ? Number(periodoFin) : null,
      cursos_gids: cursosSeleccionados ?? [],
      responsables_uids: profesoresSeleccionados ?? [],
      ubicacion: ubicacion.trim(),
      coords,
      uid: user.username,
      updated_by: user.username,
      genera_ausencias: generaAusencias, // Enviamos el nuevo valor
    };

    mutation.mutate(datos);
  };

  const handleMarkerDrag = async (event) => {
    const { lat, lng } = event.target.getLatLng();
    setCoords({ lat, lng });
    const direccion = await reverseGeocode({ lat, lng });
    setUbicacion(direccion);
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-visible rounded-lg max-w-5xl w-full"
      >
        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Nueva Actividad Extraescolar
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="detalles">Detalles</TabsTrigger>
              <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
            </TabsList>

            {/* ====== GENERAL ====== */}
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-1">
                <Label>Título</Label>
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label>Departamento organizador</Label>
                <Select value={departamento} onValueChange={setDepartamento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((d) => (
                      <SelectItem key={d.gidNumber} value={d.gidNumber}>
                        {d.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Tipo de actividad</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complementaria">
                      Actividad complementaria
                    </SelectItem>
                    <SelectItem value="extraescolar">
                      Actividad extraescolar
                    </SelectItem>
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
                      Selecciona el rango de periodos en los que se realizará la
                      actividad.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50/50">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Desde el periodo
                      </Label>
                      <Select
                        value={periodoInicio}
                        onValueChange={setPeriodoInicio}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Seleccionar inicio..." />
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
                      <Label className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Hasta el periodo
                      </Label>
                      <Select value={periodoFin} onValueChange={setPeriodoFin}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Seleccionar fin..." />
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

            {/* ====== DETALLES ====== */}
            <TabsContent value="detalles" className="space-y-6">
              <div className="space-y-1">
                <Label>Descripción</Label>
                <Textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Explique brevemente la actividad..."
                />
              </div>

              <div className="space-y-1">
                <MultiSelectProfesores
                  value={profesoresSeleccionados}
                  onChange={setProfesoresSeleccionados}
                />
              </div>

              {/* ====== CUBRIR CON GUARDIAS ====== */}
              <div className="flex flex-col space-y-2 p-4 border rounded-md bg-blue-50/30">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="genera_ausencias"
                    checked={generaAusencias}
                    disabled={tipo === "extraescolar"} // Deshabilitado si es extraescolar (siempre true)
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
                  Marcar si la actividad genera ausencias del profesorado que
                  participa en ella, que hay que cubrir con las guardias.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Cursos participantes</Label>
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="todos-cursos"
                    checked={todosLosCursosSeleccionados}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCursosSeleccionados(cursos.map((c) => c.gid));
                      } else {
                        setCursosSeleccionados([]);
                      }
                    }}
                  />
                  <label
                    htmlFor="todos-cursos"
                    className="text-sm cursor-pointer"
                  >
                    Todos los cursos
                  </label>
                </div>
                <MultiSelect
                  values={cursosSeleccionados}
                  onChange={setCursosSeleccionados}
                  options={cursos.map((c) => ({
                    value: c.gid,
                    label: c.nombre,
                  }))}
                  placeholder={
                    cursosSeleccionados.length === 0
                      ? "No hay cursos seleccionados"
                      : ""
                  }
                />
              </div>
            </TabsContent>

            {/* ====== UBICACIÓN ====== */}
            <TabsContent value="ubicacion" className="space-y-4">
              <div className="space-y-1">
                <Autocomplete
                  value={ubicacion}
                  placeholder="Nombre de la localidad o lugar..."
                  buscar={buscarLugar}
                  onChange={setUbicacion}
                  onSelect={(lugar) => {
                    setUbicacion(lugar.label);
                    setCoords({ lat: lugar.lat, lng: lugar.lng });
                  }}
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
                  draggable
                  eventHandlers={{ dragend: handleMarkerDrag }}
                />
                <ClickHandler
                  setCoords={setCoords}
                  setUbicacion={setUbicacion}
                />
                <SetViewOnChange coords={coords} />
              </MapContainer>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleGuardar}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
