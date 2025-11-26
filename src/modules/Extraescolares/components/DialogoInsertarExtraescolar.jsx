import { useState, useRef, useEffect } from "react";
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
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
  useMap,
} from "react-leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { useAuth } from "@/context/AuthContext";
import { Autocomplete } from "@/modules/Utilidades/components/Autocomplete";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDepartamentosLdap } from "@/hooks/useDepartamentosLdap";
import { useCursosLdap } from "@/hooks/useCursosLdap";

import { schemaExtraescolar } from "@/zod/extraescolares";

const provider = new OpenStreetMapProvider();

/* ============================
   Componente de error
============================ */
function CampoError({ children }) {
  return <p className="text-red-600 text-sm mt-1">{children}</p>;
}

/* ============================
   Funciones geolocalización
============================ */
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

/* ============================
   Componentes Map
============================ */
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

/* ============================
   Componente principal
============================ */
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
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFin, setPeriodoFin] = useState("");
  const [cursosSeleccionados, setCursosSeleccionados] = useState([]);
  const [profesoresSeleccionados, setProfesoresSeleccionados] = useState([]);
  const [ubicacion, setUbicacion] = useState("");
  const [coords, setCoords] = useState({ lat: 40.4168, lng: -3.7038 });
  const [fechaInicio, setFechaInicio] = useState(
    fechaSeleccionada || "2025-03-10"
  );
  const [fechaFin, setFechaFin] = useState(fechaSeleccionada || "2025-03-15");
  const { data: departamentos = [] } = useDepartamentosLdap();
  const { data: cursos = [] } = useCursosLdap();

  const [errores, setErrores] = useState({});

  // --- Inicialización de fechas ---
  useEffect(() => {
    if (open && fechaSeleccionada) {
      const f = fechaSeleccionada.split("T")[0];
      setFechaInicio(f);
      setFechaFin(f);
    }
  }, [open, fechaSeleccionada]);

  // --- Inicializar periodos por defecto ---
  useEffect(() => {
    if (open && periodos.length > 0) {
      setPeriodoInicio(String(periodos[0].id));
      setPeriodoFin(String(periodos[periodos.length - 1].id));
    }
  }, [open, periodos]);

  // --- Mutation React Query ---
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
      if (!resp.ok || !json.ok)
        throw new Error(json.error || "Error guardando actividad");
      return json.actividad;
    },
    onSuccess: (actividad) => {
      queryClient.invalidateQueries(["extraescolares", "uid", user.username]);
      queryClient.invalidateQueries(["extraescolares", "all"]);
      toast.success("Alta de actividad ", actividad.titulo);
      if (onGuardado) onGuardado(actividad);
      onClose();
    },
    onError: (err) => {
      console.error("Error creando extraescolar:", err);
      toast.error(err.message || "Error guardando actividad");
    },
  });

  /* ============================
     Guardar actividad
  ============================= */
  const handleGuardar = () => {
    // Construir objeto de datos
    const datos = {
      titulo,
      descripcion,
      gidnumber: departamento ? Number(departamento) : 0,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      cursos_gids: cursosSeleccionados,
      responsables_uids: profesoresSeleccionados,
      ubicacion,
      tipo,
      idperiodo_inicio:
        tipo === "complementaria" ? Number(periodoInicio) : undefined,
      idperiodo_fin: tipo === "complementaria" ? Number(periodoFin) : undefined,
      coords,
      uid: user.username,
    };

    // Validación con Zod
    const result = schemaExtraescolar.safeParse(datos);

    if (!result.success) {
      // Mapear errores a estado local
      const nuevosErrores = {};
      result.error.errors.forEach((err) => {
        if (err.path?.length > 0) {
          nuevosErrores[err.path[0]] = err.message;
        }
      });
      setErrores(nuevosErrores);
      console.log("Errores Zod:", nuevosErrores);
      return;
    }

    // Limpiar errores previos
    setErrores({});

    // Ejecutar la mutation
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
        className="p-0 overflow-hidden rounded-lg max-w-5xl w-full"
      >
        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Nueva Actividad Extraescolar
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-5">
          {/* ===============================
              Parte izquierda
          =============================== */}
          <div className="space-y-4">
            {/* Título */}
            <div className="space-y-1">
              <Label>Título</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className={errores.titulo ? "border-red-500" : ""}
              />
              {errores.titulo && <CampoError>{errores.titulo}</CampoError>}
            </div>

            {/* Descripción */}
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className={errores.descripcion ? "border-red-500" : ""}
              />
              {errores.descripcion && (
                <CampoError>{errores.descripcion}</CampoError>
              )}
            </div>

            {/* Departamento */}
            <div className="space-y-1">
              <Label>Departamento organizador</Label>
              <Select value={departamento} onValueChange={setDepartamento}>
                <SelectTrigger
                  className={errores.gidnumber ? "border-red-500" : ""}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departamentos.map((d) => (
                    <SelectItem key={d.gidNumber} value={d.gidNumber}>
                      {d.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errores.gidnumber && (
                <CampoError>{errores.gidnumber}</CampoError>
              )}
            </div>

            {/* Profesores */}
            <div className="space-y-1">
              <MultiSelectProfesores
                value={profesoresSeleccionados}
                onChange={setProfesoresSeleccionados}
              />
              {errores.responsables_uids && (
                <CampoError>{errores.responsables_uids}</CampoError>
              )}
            </div>

            {/* Cursos */}
            <div className="space-y-1">
              <Label>Cursos participantes</Label>
              <MultiSelect
                values={cursosSeleccionados}
                onChange={setCursosSeleccionados}
                options={cursos.map((c) => ({ value: c.gid, label: c.nombre }))}
                placeholder="Seleccionar cursos"
              />
              {errores.cursos_gids && (
                <CampoError>{errores.cursos_gids}</CampoError>
              )}
            </div>

            {/* Tipo de actividad */}
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

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Fecha inicio</Label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className={errores.fecha_inicio ? "border-red-500" : ""}
                />
                {errores.fecha_inicio && (
                  <CampoError>{errores.fecha_inicio}</CampoError>
                )}
              </div>

              <div className="space-y-1">
                <Label>Fecha fin</Label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className={errores.fecha_fin ? "border-red-500" : ""}
                />
                {errores.fecha_fin && (
                  <CampoError>{errores.fecha_fin}</CampoError>
                )}
              </div>
            </div>

            {/* Periodos */}
            {tipo === "complementaria" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Periodo inicio</Label>
                  <Select
                    value={periodoInicio}
                    onValueChange={setPeriodoInicio}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>Periodo fin</Label>
                  <Select value={periodoFin} onValueChange={setPeriodoFin}>
                    <SelectTrigger>
                      <SelectValue />
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

          {/* ===============================
              Parte derecha: Mapa
          =============================== */}
          <div className="flex flex-col justify-center space-y-3">
            <div className="space-y-1">
              <Label>Ubicación / Lugar</Label>
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
              {errores.ubicacion && (
                <CampoError>{errores.ubicacion}</CampoError>
              )}
            </div>

            <MapContainer
              center={coords}
              zoom={13}
              style={{ height: "300px", width: "100%", marginTop: "8px" }}
              scrollWheelZoom={true}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={coords}
                draggable={true}
                eventHandlers={{ dragend: handleMarkerDrag }}
              >
                <Popup>Arrastra para ajustar la ubicación</Popup>
              </Marker>
              <ClickHandler setCoords={setCoords} setUbicacion={setUbicacion} />
              <SetViewOnChange coords={coords} />
            </MapContainer>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            variant="outline"
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
