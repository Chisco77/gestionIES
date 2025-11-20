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

import { Autocomplete } from "@/modules/Utilidades/components/Autocomplete";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const provider = new OpenStreetMapProvider();

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
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Cargar actividad
  useEffect(() => {
    if (!actividad) return;

    console.log("📌 Cargando actividad en diálogo:", actividad);
    console.log("📌 Props periodos:", periodos);
    console.log("📌 Props departamentos:", departamentos);
    console.log("📌 Props cursos:", cursos);

    // Título, descripción y tipo
    setTitulo(actividad.titulo || "");
    setDescripcion(actividad.descripcion || "");
    setTipo(actividad.tipo || "complementaria");

    // Departamento
    const depto = departamentos.find(
      (d) => String(d.gidNumber) === String(actividad.gidnumber)
    );
    setDepartamento(depto ? String(depto.gidNumber) : "");

    // Fechas
    setFechaInicio(actividad.fecha_inicio?.split("T")[0] || "");
    setFechaFin(actividad.fecha_fin?.split("T")[0] || "");

    // Periodos
    const periodoIni = periodos.find(
      (p) => String(p.id) === String(actividad.idperiodo_inicio)
    );
    const periodoFi = periodos.find(
      (p) => String(p.id) === String(actividad.idperiodo_fin)
    );
    setPeriodoInicio(periodoIni ? String(periodoIni.id) : "");
    setPeriodoFin(periodoFi ? String(periodoFi.id) : "");

    // Cursos
    const cursosSel = cursos
      .filter((c) => actividad.cursos_gids?.map(String).includes(String(c.gid)))
      .map((c) => String(c.gid));
    setCursosSeleccionados(cursosSel);

    // Profesores
    setProfesoresSeleccionados(actividad.responsables_uids || []);

    // Ubicación y coordenadas
    setUbicacion(actividad.ubicacion || "");
    setCoords(actividad.coords || { lat: 40.4168, lng: -3.7038 });
  }, [actividad, periodos, departamentos, cursos]);

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
      idperiodo_inicio: periodoInicio ? Number(periodoInicio) : null,
      idperiodo_fin: periodoFin ? Number(periodoFin) : null,

      estado: actividad.estado,
      cursos_gids: cursosSeleccionados,
      responsables_uids: profesoresSeleccionados,
      ubicacion,
      coords,
    };

    try {
      const resp = await fetch(`${API_URL}/db/extraescolares/${actividad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(datos),
      });

      const json = await resp.json();

      if (!resp.ok || !json.ok) {
        toast.error(json.error || "Error actualizando actividad");
        return;
      }

      toast.success("Actividad actualizada");
      if (onGuardado) onGuardado(json.actividad);
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Error guardando");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-5xl w-[90vw] overflow-hidden">
        <DialogHeader className="bg-blue-500 text-white py-3 flex justify-center">
          <DialogTitle>Editar Actividad Extraescolar</DialogTitle>
        </DialogHeader>

        {/* === CUERPO === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-5">
          {/* IZQUIERDA */}
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
              <Select value={departamento} onValueChange={setDepartamento}>
                <SelectTrigger>
                  <SelectValue />
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

            <MultiSelectProfesores
              value={profesoresSeleccionados}
              onChange={setProfesoresSeleccionados}
            />

            <div className="space-y-2">
              <Label>Cursos participantes</Label>
              <MultiSelect
                values={cursosSeleccionados}
                onChange={setCursosSeleccionados}
                options={cursos.map((c) => ({
                  value: String(c.gid), // Convertimos a string
                  label: c.nombre,
                }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complementaria">Complementaria</SelectItem>
                  <SelectItem value="extraescolar">Extraescolar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha inicio</Label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div>
                <Label>Fecha fin</Label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>

            {tipo === "complementaria" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
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
                <div>
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

          {/* DERECHA */}
          <div className="flex flex-col space-y-2">
            <Label>Ubicación</Label>

            <Autocomplete
              value={ubicacion}
              onChange={setUbicacion}
              buscar={buscarLugar}
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
                draggable
                eventHandlers={{
                  dragend: async (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    setCoords({ lat, lng });
                    const dir = await reverseGeocode({ lat, lng });
                    setUbicacion(dir);
                  },
                }}
              >
                <Popup>Mueve el marcador</Popup>
              </Marker>

              <ClickHandler setCoords={setCoords} setUbicacion={setUbicacion} />
              <SetViewOnChange coords={coords} />
            </MapContainer>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={handleGuardar}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
