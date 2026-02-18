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
import { schemaExtraescolar } from "@/zod/extraescolares";

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

function CampoError({ children }) {
  return <p className="text-red-600 text-sm mt-1">{children}</p>;
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
  const [errores, setErrores] = useState({});

  // --- Permisos ---
  const esPropietario = user.username === actividad?.uid;

  // Directiva o responsable de extraescolares pueden editar siempre
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

    const fInicio = new Date(actividad.fecha_inicio);
    const fFin = new Date(actividad.fecha_fin);
    setFechaInicio(fInicio);
    setFechaFin(fFin);

    if (actividad.tipo === "extraescolar") {
      setHoraInicio(format(fInicio, "HH:mm"));
      setHoraFin(format(fFin, "HH:mm"));
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
      if (!resp.ok || !json.ok)
        throw new Error(json.error || "Error actualizando actividad");
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
      toast.error(err.message || "Error actualizando actividad");
    },
  });

  // --- Guardar ---
  const handleGuardar = () => {
    const pad = (n) => String(n).padStart(2, "0");
    const fInicio = new Date(fechaInicio);
    const fFin = new Date(fechaFin);

    if (tipo === "extraescolar") {
      const [hIni, mIni] = horaInicio.split(":").map(Number);
      const [hFin, mFin] = horaFin.split(":").map(Number);
      fInicio.setHours(hIni, mIni, 0, 0);
      fFin.setHours(hFin, mFin, 0, 0);
      if (fFin <= fInicio) {
        setErrores({
          fecha_fin: "La fecha y hora de fin debe ser posterior a la de inicio",
        });
        return;
      }
    } else {
      fInicio.setHours(0, 0, 0, 0);
      fFin.setHours(0, 0, 0, 0);
    }

    const datos = {
      uid: user.username,
      titulo,
      descripcion,
      tipo,
      gidnumber: Number(departamento),
      fecha_inicio: format(fInicio, "yyyy-MM-dd HH:mm:ss"),
      fecha_fin: format(fFin, "yyyy-MM-dd HH:mm:ss"),
      idperiodo_inicio:
        tipo === "complementaria" ? Number(periodoInicio) : undefined,
      idperiodo_fin: tipo === "complementaria" ? Number(periodoFin) : undefined,
      cursos_gids: cursosSeleccionados,
      responsables_uids: profesoresSeleccionados,
      ubicacion,
      coords,
      estado: actividad.estado,
    };

    const result = schemaExtraescolar.safeParse(datos);
    if (!result.success) {
      const nuevosErrores = {};
      result.error.errors.forEach((err) => {
        nuevosErrores[err.path[0]] = err.message;
      });
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    mutation.mutate(datos);
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal>
      <DialogContent className="p-0 overflow-visible rounded-lg max-w-5xl w-full">
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex flex-col items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar Actividad
          </DialogTitle>

          {/* --- ESTADO DE LA ACTIVIDAD --- */}
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
              {/* Título */}
              <div className="space-y-1">
                <Label>Título</Label>
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className={errores.titulo && "border-red-500"}
                  disabled={!editableCamposBasicos}
                />
                {errores.titulo && <CampoError>{errores.titulo}</CampoError>}
              </div>

              {/* Departamento */}
              <div className="space-y-1">
                <Label>Departamento organizador</Label>
                <Select
                  value={departamento}
                  onValueChange={setDepartamento}
                  disabled={!editableCamposBasicos}
                >
                  <SelectTrigger
                    className={errores.gidnumber && "border-red-500"}
                  >
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
                {errores.gidnumber && (
                  <CampoError>{errores.gidnumber}</CampoError>
                )}
              </div>

              {/* Tipo */}
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

              {/* Fechas */}
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
                        {format(fechaInicio, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={fechaInicio}
                        onSelect={setFechaInicio}
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
                  <Popover disabled={!editableCamposGenerales}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled={!editableCamposGenerales}
                      >
                        {format(fechaFin, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={fechaFin}
                        onSelect={setFechaFin}
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

              {/* Periodos */}
              {tipo === "complementaria" && (
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={periodoInicio}
                    onValueChange={setPeriodoInicio}
                    disabled={!editableCamposGenerales}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Periodo inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodos.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={periodoFin}
                    onValueChange={setPeriodoFin}
                    disabled={!editableCamposGenerales}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Periodo fin" />
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
              )}
            </TabsContent>

            {/* --- DETALLES --- */}
            <TabsContent value="detalles" className="space-y-4">
              <div className="space-y-1">
                <Label>Descripción</Label>
                <Textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className={errores.descripcion && "border-red-500"}
                  disabled={!editableCamposBasicos}
                />
                {errores.descripcion && (
                  <CampoError>{errores.descripcion}</CampoError>
                )}
              </div>

              <div className="space-y-1">
                <MultiSelectProfesores
                  value={profesoresSeleccionados}
                  onChange={setProfesoresSeleccionados}
                  className={errores.responsables_uids && "border-red-500"}
                  disabled={!editableCamposBasicos}
                />
                {errores.responsables_uids && (
                  <CampoError>{errores.responsables_uids}</CampoError>
                )}
              </div>

              <div className="space-y-2">
                <Label>Cursos participantes</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={todosLosCursosSeleccionados}
                    onCheckedChange={handleToggleTodosCursos}
                    disabled={!editableCamposBasicos}
                  />
                  <span className="text-sm">Todos los cursos</span>
                </div>

                <MultiSelect
                  values={cursosSeleccionados}
                  onChange={setCursosSeleccionados}
                  options={cursos.map((c) => ({
                    value: String(c.gid),
                    label: c.nombre,
                  }))}
                  className={errores.cursos_gids && "border-red-500"}
                  disabled={!editableCamposBasicos}
                />
                {errores.cursos_gids && (
                  <CampoError>{errores.cursos_gids}</CampoError>
                )}
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
                  className={errores.ubicacion && "border-red-500"}
                  disabled={!editableCamposGenerales}
                />
                {errores.ubicacion && (
                  <CampoError>{errores.ubicacion}</CampoError>
                )}
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
            variant="outline"
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
