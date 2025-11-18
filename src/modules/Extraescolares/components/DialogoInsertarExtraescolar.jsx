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
import { Checkbox } from "@/components/ui/checkbox";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";

const provider = new OpenStreetMapProvider();

/* ============================
   AUTOCOMPLETE COMPONENTE
=========================== */
export function Autocomplete({
  value,
  onChange,
  onSelect,
  buscar,
  placeholder = "",
}) {
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const containerRef = useRef(null);

  // Debounce
  const debounceRef = useRef(null);

  // Cerrar si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeBuscar = async (texto) => {
    try {
      console.log("[Autocomplete] Llamando buscar() con:", texto);
      const resultados = await buscar(texto);
      console.log("[Autocomplete] Resultados de buscar():", resultados);
      // Asegúrate de que es un array
      if (Array.isArray(resultados)) {
        setSugerencias(resultados);
      } else {
        console.warn(
          "[Autocomplete] buscar() NO devolvió un array:",
          resultados
        );
        setSugerencias([]);
      }
      setAbierto(true);
    } catch (err) {
      console.error("[Autocomplete] Error en buscar():", err);
      setSugerencias([]);
      setAbierto(false);
    }
  };

  const handleInput = (texto) => {
    // 1) Actualiza el valor controlado en el padre
    onChange(texto);

    // 2) Cancelar debounce anterior
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // 3) Si texto corto, limpiar
    if (!texto || texto.length < 3) {
      setSugerencias([]);
      setAbierto(false);
      return;
    }

    // 4) Debounce antes de consultar la API
    debounceRef.current = setTimeout(() => {
      safeBuscar(texto);
    }, 300);
  };

  const handleSelect = (item) => {
    console.log("[Autocomplete] seleccionado:", item);
    onSelect(item);
    setAbierto(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => {
          // si ya tenemos sugerencias, abrir
          if (sugerencias.length > 0) setAbierto(true);
        }}
      />

      {abierto && sugerencias.length > 0 && (
        <ul
          className="absolute w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50"
          role="listbox"
        >
          {sugerencias.map((s, i) => (
            <li
              key={i}
              role="option"
              className="p-2 text-sm cursor-pointer hover:bg-gray-100"
              onMouseDown={() => handleSelect(s)} // onMouseDown evita que el blur cierre antes
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}

      {/* ---------- PANEL DE DEBUG (quítalo cuando funcione) ---------- */}
      <div
        style={{
          marginTop: 6,
          padding: 8,
          fontSize: 12,
          background: "#f8fafc",
          border: "1px solid #e6eef6",
          borderRadius: 6,
        }}
      >
        <div>
          <strong>DEBUG Autocomplete</strong>
        </div>
        <div>
          valor input: <code>{String(value)}</code>
        </div>
        <div>
          sugerencias (count): <strong>{sugerencias.length}</strong>
        </div>
        <details style={{ marginTop: 6 }}>
          <summary>JSON sugerencias (expandir)</summary>
          <pre
            style={{ whiteSpace: "pre-wrap", maxHeight: 200, overflow: "auto" }}
          >
            {JSON.stringify(sugerencias, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

/* ============================
   FUNCIÓN BÚSQUEDA
=========================== */
const buscarLugar = async (query) => {
  if (!query || query.length < 3) return [];
  const resultados = await provider.search({ query });
  return resultados.map((r) => ({
    label: r.label,
    lat: r.y,
    lng: r.x,
  }));
};

// Datos fake
const periodos = [
  { id: 1, nombre: "1ª hora" },
  { id: 2, nombre: "2ª hora" },
  { id: 3, nombre: "3ª hora" },
  { id: 4, nombre: "4ª hora" },
  { id: 5, nombre: "5ª hora" },
  { id: 6, nombre: "6ª hora" },
];

const cursosPrueba = [
  { gid: 101, nombre: "1º ESO A" },
  { gid: 102, nombre: "1º ESO B" },
  { gid: 201, nombre: "2º ESO A" },
  { gid: 202, nombre: "2º ESO B" },
];

const departamentosPrueba = [
  { gidNumber: 1, nombre: "Departamento de Matemáticas" },
  { gidNumber: 2, nombre: "Departamento de Ciencias" },
  { gidNumber: 3, nombre: "Departamento de Idiomas" },
];

/* ============================
   COMPONENTE PRINCIPAL
=========================== */
export function DialogoInsertarExtraescolar({ open, onClose, onGuardar }) {
  const [titulo, setTitulo] = useState("Excursión a Alemania");
  const [descripcion, setDescripcion] = useState(
    "Viaje de intercambio durante varios días."
  );
  const [tipo, setTipo] = useState("extracurricular");
  const [departamento, setDepartamento] = useState(
    departamentosPrueba[0].gidNumber
  );

  const [fechaInicio, setFechaInicio] = useState("2025-03-10");
  const [fechaFin, setFechaFin] = useState("2025-03-15");

  const [periodoInicio, setPeriodoInicio] = useState("1");
  const [periodoFin, setPeriodoFin] = useState("2");

  const [cursosSeleccionados, setCursosSeleccionados] = useState([]);

  const [ubicacion, setUbicacion] = useState("");
  const [coords, setCoords] = useState({ lat: 40.4168, lng: -3.7038 });

  const toggleCurso = (gid) => {
    setCursosSeleccionados((prev) =>
      prev.includes(gid) ? prev.filter((g) => g !== gid) : [...prev, gid]
    );
  };

  const handleMarkerDrag = (event) => {
    setCoords(event.target.getLatLng());
  };

  const handleGuardar = () => {
    const datos = {
      titulo,
      descripcion,
      tipo,
      departamento,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      idperiodo_inicio: tipo === "lectivo" ? Number(periodoInicio) : null,
      idperiodo_fin: tipo === "lectivo" ? Number(periodoFin) : null,
      cursos_gids: cursosSeleccionados,
      ubicacion,
      coords,
    };

    onGuardar?.(datos);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg max-w-5xl w-[90vw]"
      >
        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Nueva Actividad Extraescolar
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Parte izquierda */}
          <div className="space-y-4 px-6 py-5">
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
                  {departamentosPrueba.map((d) => (
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
                  <SelectItem value="lectivo">
                    Dentro del horario lectivo
                  </SelectItem>
                  <SelectItem value="extracurricular">
                    Fuera del horario lectivo
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

            {tipo === "lectivo" && (
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
                          {" "}
                          {p.nombre}{" "}
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
                          {" "}
                          {p.nombre}{" "}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Cursos participantes</Label>
              <div className="border rounded-lg p-3 space-y-2">
                {cursosPrueba.map((curso) => (
                  <div key={curso.gid} className="flex items-center gap-2">
                    <Checkbox
                      checked={cursosSeleccionados.includes(curso.gid)}
                      onCheckedChange={() => toggleCurso(curso.gid)}
                    />
                    <span>{curso.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parte derecha */}
          <div className="flex flex-col space-y-3 px-6 py-5">
            <Label>Ubicación / Lugar</Label>

            <Autocomplete
              value={ubicacion}
              placeholder="Nombre de la localidad o lugar..."
              buscar={buscarLugar}
              onChange={(t) => setUbicacion(t)}
              onSelect={(lugar) => {
                setUbicacion(lugar.label);
                setCoords({ lat: lugar.lat, lng: lugar.lng });
              }}
            />

            <MapContainer
              key={`${coords.lat}-${coords.lng}`}
              center={coords}
              zoom={13}
              style={{ height: "300px", width: "100%", marginTop: "8px" }}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={coords}
                draggable={true}
                eventHandlers={{ dragend: handleMarkerDrag }}
              >
                <Popup>Arrastra para ajustar la ubicación</Popup>
              </Marker>
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
