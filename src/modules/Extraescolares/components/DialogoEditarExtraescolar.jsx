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
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  // --- Determina permisos ---
  const esPropietario = user.username === actividad?.uid;
  const editableCamposGenerales = esPropietario && actividad?.estado === 0; // fechas, periodos, tipo, ubicación
  const editableCamposBasicos = esPropietario; // título, descripción, departamento, cursos, profesores

  // Cargar datos de la actividad
  useEffect(() => {
    if (!actividad) return;

    setTitulo(actividad.titulo || "");
    setDescripcion(actividad.descripcion || "");
    setTipo(actividad.tipo || "complementaria");

    const depto = departamentos.find(
      (d) => String(d.gidNumber) === String(actividad.gidnumber)
    );
    setDepartamento(depto ? String(depto.gidNumber) : "");

    setFechaInicio(actividad.fecha_inicio?.split("T")[0] || "");
    setFechaFin(actividad.fecha_fin?.split("T")[0] || "");

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
      queryClient.invalidateQueries(["extraescolares", "uid", user.uid]);
      queryClient.invalidateQueries(["extraescolares", "all"]);
      toast.success("Extraescolar actualizada");
      if (onGuardado) onGuardado(actividad);
      onClose();
    },
    onError: (err) => {
      console.error("Error actualizando extraescolar:", err);
      toast.error(err.message || "Error actualizando actividad");
    },
  });

  const handleGuardar = () => {
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
    mutation.mutate(datos);
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg max-w-5xl w-full"
      >
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar Actividad
          </DialogTitle>
        </DialogHeader>

        {/* Estado centrado */}
        {actividad && (
          <div className="w-full flex justify-center my-1">
            {(() => {
              const estados = {
                0: {
                  text: "Pendiente",
                  color: "text-yellow-600 bg-yellow-100",
                },
                1: { text: "Aceptada", color: "text-green-600 bg-green-100" },
                2: { text: "Rechazada", color: "text-red-600 bg-red-100" },
              };
              const estado = estados[actividad.estado] || {
                text: "Desconocido",
                color: "text-gray-600 bg-gray-100",
              };
              return (
                <span
                  className={`${estado.color} px-3 py-1 rounded-full font-semibold`}
                >
                  {estado.text}
                </span>
              );
            })()}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-1">
          {/* Izquierda */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Título</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={!editableCamposBasicos}
              />
            </div>

            <div className="space-y-1">
              <Label>Descripción</Label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
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
              disabled={!editableCamposBasicos}
            />

            <div className="space-y-2">
              <Label>Cursos participantes</Label>
              <MultiSelect
                values={cursosSeleccionados}
                onChange={setCursosSeleccionados}
                options={cursos.map((c) => ({
                  value: String(c.gid),
                  label: c.nombre,
                }))}
                disabled={!editableCamposBasicos}
              />
            </div>

            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select
                value={tipo}
                onValueChange={setTipo}
                disabled={!editableCamposGenerales}
              >
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
                  disabled={!editableCamposGenerales}
                />
              </div>
              <div>
                <Label>Fecha fin</Label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  disabled={!editableCamposGenerales}
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
                    disabled={!editableCamposGenerales}
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
                  <Select
                    value={periodoFin}
                    onValueChange={setPeriodoFin}
                    disabled={!editableCamposGenerales}
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
              </div>
            )}
          </div>

          {/* Derecha */}
          <div className="flex flex-col justify-center space-y-3">
            <Label>Ubicación</Label>
            <Autocomplete
              value={ubicacion}
              onChange={setUbicacion}
              buscar={buscarLugar}
              onSelect={(lugar) => {
                if (!editableCamposGenerales) return;
                setUbicacion(lugar.label);
                setCoords({ lat: lugar.lat, lng: lugar.lng });
              }}
              disabled={!editableCamposGenerales}
            />
            <MapContainer
              center={coords}
              zoom={13}
              style={{ height: "300px", width: "100%", marginTop: "8px" }}
              scrollWheelZoom
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
              >
                <Popup>Mueve el marcador</Popup>
              </Marker>
              <ClickHandler
                setCoords={setCoords}
                setUbicacion={setUbicacion}
                disabled={!editableCamposGenerales}
              />
              <SetViewOnChange coords={coords} />
            </MapContainer>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleGuardar}
            disabled={!esPropietario || mutation.isLoading}
          >
            {mutation.isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
