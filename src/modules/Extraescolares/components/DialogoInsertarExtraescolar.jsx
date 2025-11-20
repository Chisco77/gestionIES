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
import { useAuth } from "@/context/AuthContext"; // Importar el contexto de autenticación
import { Autocomplete } from "@/modules/Utilidades/components/Autocomplete";
import { toast } from "sonner";

const provider = new OpenStreetMapProvider();

/* ============================
   FUNCIONES GEO
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
   COMPONENTES MAP
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
   COMPONENTE PRINCIPAL
============================ */
export function DialogoInsertarExtraescolar({
  open,
  onClose,
  onGuardado,
  fechaSeleccionada,
  periodos = [],
}) {
  const [titulo, setTitulo] = useState("Excursión a Alemania");
  const [descripcion, setDescripcion] = useState(
    "Viaje de intercambio durante varios días."
  );
  const [tipo, setTipo] = useState("complementaria");
  const [departamento, setDepartamento] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFin, setPeriodoFin] = useState("");
  const [cursosSeleccionados, setCursosSeleccionados] = useState([]);
  const [ubicacion, setUbicacion] = useState("");
  const [coords, setCoords] = useState({ lat: 40.4168, lng: -3.7038 });
  const [fechaInicio, setFechaInicio] = useState(
    fechaSeleccionada || "2025-03-10"
  );
  const [fechaFin, setFechaFin] = useState(fechaSeleccionada || "2025-03-15");
  const [departamentos, setDepartamentos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [profesoresSeleccionados, setProfesoresSeleccionados] = useState([]);

  const { user } = useAuth(); // Acceder al usuario autenticado

  useEffect(() => {
    if (open && fechaSeleccionada) {
      const f = fechaSeleccionada.split("T")[0];
      setFechaInicio(f);
      setFechaFin(f);
    }
  }, [open, fechaSeleccionada]);

  useEffect(() => {
    if (open && periodos.length > 0) {
      setPeriodoInicio(String(periodos[0].id));
      setPeriodoFin(String(periodos[periodos.length - 1].id));
    }
  }, [open, periodos]);

  useEffect(() => {
    if (!open) return;

    const API_URL = import.meta.env.VITE_API_URL;

    // Cargar departamentos
    fetch(`${API_URL}/ldap/grupos?groupType=school_department`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) =>
        setDepartamentos(
          data
            .map((d) => ({ gidNumber: d.gidNumber, nombre: d.cn }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
        )
      )
      .catch(() => setDepartamentos([]));

    // Cargar cursos
    fetch(`${API_URL}/ldap/grupos?groupType=school_class`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) =>
        setCursos(
          data
            .map((c) => ({ gid: c.gidNumber, nombre: c.cn }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
        )
      )
      .catch(() => setCursos([]));
  }, [open]);

  const handleMarkerDrag = async (event) => {
    const { lat, lng } = event.target.getLatLng();
    setCoords({ lat, lng });
    const direccion = await reverseGeocode({ lat, lng });
    setUbicacion(direccion);
  };

  const handleGuardar = async () => {
    const API_URL = import.meta.env.VITE_API_URL;

    const datos = {
      uid: user.username,
      titulo,
      descripcion,
      tipo,
      gidnumber: Number(departamento),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      idperiodo_inicio: tipo === "lectivo" ? Number(periodoInicio) : null,
      idperiodo_fin: tipo === "lectivo" ? Number(periodoFin) : null,
      cursos_gids: cursosSeleccionados,
      responsables_uids: profesoresSeleccionados,
      ubicacion,
      coords,
    };

    try {
      const resp = await fetch(`${API_URL}/db/extraescolares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(datos),
      });

      const json = await resp.json();

      if (!resp.ok || !json.ok) {
        console.error("Error guardando extraescolar", json);
        toast.error(json.error || "Error guardando actividad");
        return;
      }

      toast.success("Actividad creada"); // muestra el toast
      if (onGuardado) onGuardado(json.actividad); // recarga tabla/panel
      onClose(); // cierra diálogo
    } catch (e) {
      console.error("Error haciendo la petición:", e);
      toast.error("Error guardando actividad");
    }
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
          {/* Parte izquierda */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Título</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Departamento organizador</Label>
              <Select
                value={departamento}
                onValueChange={(v) => {
                  console.log("Seleccionado:", v);
                  setDepartamento(v);
                }}
              >
                <SelectTrigger>
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
            </div>
            {/* ---------------- Profesores responsables ---------------- */}

            <MultiSelectProfesores
              value={profesoresSeleccionados}
              onChange={setProfesoresSeleccionados}
            />
            {/* ---------------- Cursos participantes (MultiSelect) ---------------- */}
            <div className="space-y-2">
              <Label>Cursos participantes</Label>
              <MultiSelect
                values={cursosSeleccionados}
                onChange={setCursosSeleccionados}
                options={cursos.map((c) => ({ value: c.gid, label: c.nombre }))}
                placeholder="Seleccionar cursos"
              />
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
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Fecha fin</Label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
            {/* ---------------- Periodo Inicio y Periodo Fin ---------------- */}
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

          {/* Parte derecha */}
          <div className="flex flex-col justify-center space-y-3">
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
          <Button variant="outline" onClick={handleGuardar}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
