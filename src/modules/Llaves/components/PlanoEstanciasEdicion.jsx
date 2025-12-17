/**
 * PlanoEstanciasInteractivo.jsx - Plano interactivo de estancias con gestión de llaves
 *
 * Adaptado para usar Tabs de ShadCN y seleccionar planta dentro del componente.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { DialogoGestionLlaves } from "./DialogoGestionLlaves";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { PLANOS } from "@/config/planos";
import { Switch } from "@/components/ui/switch";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "";
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

// ------------------- API -------------------
async function parseListResponse(resp) {
  const j = await resp.json().catch(() => null);
  if (!j) throw new Error(`Respuesta no JSON (${resp.status})`);
  if (j && j.ok && Array.isArray(j.estancias)) return j.estancias;
  if (Array.isArray(j)) return j;
  if (Array.isArray(j.rows)) return j.rows;
  if (Array.isArray(j.estancias)) return j.estancias;
  if (typeof j === "object") return [j];
  throw new Error("Formato de respuesta desconocido");
}

async function apiListarEstancias(planta) {
  const url = `${API_BASE}/planos/estancias?planta=${encodeURIComponent(planta)}`;
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Error listando estancias (${r.status}) ${text}`);
  }
  return parseListResponse(r);
}

async function apiGuardarEstancia(planta, estancia) {
  const url = `${API_BASE}/planos/estancias`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ planta, ...estancia }),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Error guardando estancia (${r.status}) ${txt}`);
  }
  const j = await r.json().catch(() => null);
  if (!j) throw new Error("Respuesta inválida al guardar");
  return j;
}

// ------------------- Componente -------------------
export default function PlanoEstanciasEdicion() {
  const [plantaActual, setPlantaActual] = useState("baja");
  const [estancias, setEstancias] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [draw, setDraw] = useState({ activo: false, coordenadas: [] });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Objeto para almacenar la nueva estancia.
  const [nuevo, setNuevo] = useState({
    codigo: "",
    descripcion: "",
    tipoestancia: "",
    totalllaves: 1,
    armario: "",
    codigollave: "",
    numero_ordenadores: 0,
    reservable: false,
  });

  const [modalLlaves, setModalLlaves] = useState({
    open: false,
    estancia: null,
  });
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);
  const [size, setSize] = useState({ w: 1015, h: 860 });

  // ------------------- Observador de tamaño -------------------
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (imgRef.current)
        setSize({
          w: imgRef.current.clientWidth,
          h: imgRef.current.clientHeight,
        });
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // ------------------- Carga de estancias y préstamos según planta -------------------
  useEffect(() => {
    let cancelado = false;
    (async () => {
      setCargando(true);
      setError("");
      try {
        const dataEstancias = await apiListarEstancias(plantaActual);
        const normal = dataEstancias.map((r) => ({
          id: r.id,
          codigo: r.codigo,
          descripcion: r.descripcion,
          totalllaves: r.totalllaves || 1,
          coordenadas: r.coordenadas || r.coordenadas_json || [],
          armario: r.armario,
          codigollave: r.codigollave,
        }));
        if (!cancelado) setEstancias(normal);
      } catch (e) {
        if (!cancelado) setError(e?.message || "Error cargando datos");
        console.error(e);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [plantaActual]);

  const plano = PLANOS[plantaActual] ?? PLANOS.baja;

  const svgUrl = `${import.meta.env.BASE_URL}${plano.svg}`;

  // ------------------- Cálculo de estado de estancias -------------------
  const prestamosPorEstancia = useMemo(() => {
    const m = new Map();
    for (const prof of prestamos) {
      for (const p of prof.prestamos) {
        if (!p.fechadevolucion)
          m.set(p.idestancia, (m.get(p.idestancia) || 0) + p.unidades);
      }
    }
    return m;
  }, [prestamos]);

  const estadoEstancia = (e) => {
    const prestadas = prestamosPorEstancia.get(e.id) || 0;
    const libres = Math.max(0, (e.totalllaves || 0) - prestadas);
    let estado = "none";
    if (prestadas === 0) estado = "none";
    else if (prestadas < e.totalllaves) estado = "partial";
    else estado = "full";
    return { prestadas, libres, estado };
  };

  // ------------------- Dibujo -------------------
  const startOrAddPoint = (evt) => {
    if (!modoEdicion) return;
    const rect = evt.currentTarget.getBoundingClientRect();
    const x = (evt.clientX - rect.left) / rect.width;
    const y = (evt.clientY - rect.top) / rect.height;
    if (!draw.activo) setDraw({ activo: true, coordenadas: [[x, y]] });
    else setDraw((d) => ({ ...d, coordenadas: [...d.coordenadas, [x, y]] }));
  };

  const finishPolygon = async () => {
    if (!modoEdicion || !draw.activo || draw.coordenadas.length < 3) return;
    if (!esFormularioValido) {
      toast.error("Código, descripción y tipo de estancia son obligatorios");
      return;
    }

    // finalizado el polígono que define la estancia, enviamos los datos introducidos en los inputs al objeto
    const estNueva = {
      codigo: nuevo.codigo,
      descripcion: nuevo.descripcion,
      tipoestancia: nuevo.tipoestancia,
      reservable: nuevo.reservable,
      totalllaves: Math.max(1, Number(nuevo.totalllaves) || 1),
      coordenadas: draw.coordenadas,
      armario: nuevo.armario,
      codigollave: nuevo.codigollave,
      numero_ordenadores: nuevo.numero_ordenadores,
    };

    try {
      setCargando(true);
      setError("");
      const guardada = await apiGuardarEstancia(plantaActual, estNueva);
      toast.success(`Estancia "${nuevo.codigo}" creada correctamente`);
      queryClient.invalidateQueries({ queryKey: ["estancias"] });

      const norma = {
        id: guardada.id,
        codigo: guardada.codigo,
        descripcion: guardada.descripcion,
        totalllaves: guardada.totalllaves,
        coordenadas:
          guardada.coordenadas_json ||
          guardada.coordenadas ||
          estNueva.coordenadas,
        armario: guardada.armario || "",
        codigollave: guardada.codigollave || "",
        numero_ordenadores: guardada.numero_ordenadores || 0,
      };
      setEstancias((prev) => {
        const i = prev.findIndex((e) => e.id === norma.id);
        if (i === -1) return [...prev, norma];
        const copia = prev.slice();
        copia[i] = norma;
        return copia;
      });
      setDraw({ activo: false, coordenadas: [] });
      setNuevo({
        codigo: "",
        descripcion: "",
        tipoestancia: "",
        totalllaves: 1,
        armario: "",
        codigollave: "",
        numero_ordenadores: 0,
        reservable: false,
      });
    } catch (e) {
      const msg = e?.message || "Error guardando la estancia";
      setError(msg);
      toast.error(msg);
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const cancelDraw = () => setDraw({ activo: false, coordenadas: [] });

  // ------------------- SVG helpers -------------------
  const polyToPath = (pts) =>
    pts
      .map((p, i) => (i ? `L ${p[0]} ${p[1]}` : `M ${p[0]} ${p[1]}`))
      .join(" ") + " Z";
  const scalePoints = (pts) => pts.map(([x, y]) => [x * size.w, y * size.h]);

  const esFormularioValido = useMemo(() => {
    return (
      nuevo.codigo.trim() !== "" &&
      nuevo.descripcion.trim() !== "" &&
      nuevo.tipoestancia.trim() !== ""
    );
  }, [nuevo]);

  // ------------------- Render -------------------
  return (
    <div style={{ padding: 12 }}>
      {/* Tabs de ShadCN */}
      <Tabs
        value={plantaActual}
        onValueChange={setPlantaActual}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="baja">Planta Baja</TabsTrigger>
          <TabsTrigger value="primera">Primera</TabsTrigger>
          <TabsTrigger value="segunda">Segunda</TabsTrigger>
        </TabsList>
      </Tabs>

      <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
        {/* Plano */}
        <div
          ref={wrapperRef}
          style={{
            position: "relative",
            flex: 1,
            maxWidth: "1110px",
            maxHeight: "860px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <img
            ref={imgRef}
            src={svgUrl}
            alt={`Plano planta ${plantaActual}`}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          <svg
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "auto",
            }}
            onClick={startOrAddPoint}
            onDoubleClick={(e) => {
              e.preventDefault();
              finishPolygon();
            }}
          >
            {estancias.map((s) => {
              const { prestadas, estado } = estadoEstancia(s);
              const absPts = scalePoints(s.coordenadas);
              const color =
                estado === "none"
                  ? "rgba(200,200,200,0.95)"
                  : estado === "partial"
                    ? "rgba(250,200,80,0.95)"
                    : "rgba(250,80,80,0.95)";
              return (
                <g
                  key={s.id}
                  onClick={(e) => {
                    if (!modoEdicion) {
                      e.stopPropagation();
                      abrirModalLlaves(s);
                    }
                  }}
                >
                  <path
                    d={polyToPath(absPts)}
                    fill="white"
                    fillOpacity={0.35}
                    stroke="#0ea5e9"
                    strokeWidth={2}
                  />
                  {(() => {
                    const xs = absPts.map((p) => p[0]);
                    const ys = absPts.map((p) => p[1]);
                    const maxX = Math.max(...xs);
                    const maxY = Math.max(...ys);
                    const offset = 30;
                    const circleX = maxX - offset;
                    const circleY = maxY - offset;
                    return (
                      <>
                        <circle
                          cx={circleX}
                          cy={circleY}
                          r={16}
                          fill={color}
                          stroke="#374151"
                          strokeWidth={1}
                        />
                        <text
                          x={circleX}
                          y={circleY + 4}
                          fontSize={12}
                          textAnchor="middle"
                          fill="#071130"
                          pointerEvents="none"
                        >
                          {prestadas}
                        </text>
                      </>
                    );
                  })()}
                </g>
              );
            })}

            {draw.activo && draw.coordenadas.length > 0 && (
              <g>
                {(() => {
                  const absDrawPts = scalePoints(draw.coordenadas);
                  return (
                    <>
                      <path
                        d={polyToPath(absDrawPts)}
                        fill="rgba(16,185,129,0.18)"
                        stroke="#059669"
                        strokeDasharray="6 4"
                        strokeWidth={2}
                      />
                      {absDrawPts.map((p, i) => (
                        <circle
                          key={i}
                          cx={p[0]}
                          cy={p[1]}
                          r={4}
                          fill="#059669"
                        />
                      ))}
                    </>
                  );
                })()}
              </g>
            )}
          </svg>
        </div>

        {/* Panel lateral */}
        <div className="w-80">
          {(user?.perfil === "administrador" ||
            user?.perfil === "directiva") && (
            <Card className="mt-3 border border-slate-300 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={modoEdicion}
                    onCheckedChange={(v) => setModoEdicion(Boolean(v))}
                  />
                  <CardTitle className="text-base">Modo edición</CardTitle>
                </div>
              </CardHeader>

              {modoEdicion && (
                <CardContent className="space-y-3">
                  {/* Código */}
                  <div className="space-y-1">
                    <Label className="text-sm">Código de la estancia</Label>
                    <Input
                      placeholder="ej. Aula 1.01"
                      value={nuevo.codigo}
                      onChange={(e) =>
                        setNuevo((n) => ({ ...n, codigo: e.target.value }))
                      }
                    />
                  </div>

                  {/* Descripción */}
                  <div className="space-y-1">
                    <Label className="text-sm">Descripción</Label>
                    <Input
                      placeholder="Descripción"
                      value={nuevo.descripcion}
                      onChange={(e) =>
                        setNuevo((n) => ({ ...n, descripcion: e.target.value }))
                      }
                    />
                  </div>

                  {/* Tipo de estancia */}
                  <div className="space-y-1">
                    <Label className="text-sm">Tipo de estancia</Label>
                    <Select
                      value={nuevo.tipoestancia || "sin-tipo"}
                      onValueChange={(v) =>
                        setNuevo((n) => ({
                          ...n,
                          tipoestancia: v === "sin-tipo" ? "" : v,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sin-tipo">
                          Seleccionar tipo
                        </SelectItem>
                        <SelectItem value="Almacen">Almacén</SelectItem>
                        <SelectItem value="Aula">Aula</SelectItem>
                        <SelectItem value="Departamento">
                          Departamento
                        </SelectItem>
                        <SelectItem value="Despacho">Despacho</SelectItem>
                        <SelectItem value="Infolab">Infolab</SelectItem>
                        <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                        <SelectItem value="Otras">Otras</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reservable */}
                  <div className="flex items-center justify-between border rounded-md p-3 mt-2">
                    <Label className="text-sm font-medium">Reservable</Label>
                    <Switch
                      checked={nuevo.reservable}
                      onCheckedChange={(v) =>
                        setNuevo((n) => ({
                          ...n,
                          reservable: v,
                        }))
                      }
                    />
                  </div>

                  {/* Total llaves */}
                  <div className="space-y-1">
                    <Label className="text-sm">Total llaves</Label>
                    <Input
                      type="number"
                      min={1}
                      value={nuevo.totalllaves}
                      onChange={(e) =>
                        setNuevo((n) => ({ ...n, totalllaves: e.target.value }))
                      }
                    />
                  </div>

                  {/* Código de llave */}
                  <div className="space-y-1">
                    <Label className="text-sm">Código de la llave</Label>
                    <Input
                      placeholder="Ej: Aula de informática"
                      value={nuevo.codigollave}
                      onChange={(e) =>
                        setNuevo((n) => ({ ...n, codigollave: e.target.value }))
                      }
                    />
                  </div>

                  {/* Llavera */}
                  <div className="space-y-1">
                    <Label className="text-sm">Llavera</Label>
                    <Select
                      value={nuevo.armario || "sin-asignar"}
                      onValueChange={(v) =>
                        setNuevo((n) => ({
                          ...n,
                          armario: v === "sin-asignar" ? "" : v,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un armario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                        <SelectItem value="Llavera 1">Llavera 1</SelectItem>
                        <SelectItem value="Llavera 2">Llavera 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Número de ordenadores */}
                  <div className="space-y-1">
                    <Label className="text-sm">Número de ordenadores</Label>
                    <Input
                      type="number"
                      min={0}
                      value={nuevo.numero_ordenadores}
                      onChange={(e) =>
                        setNuevo((n) => ({
                          ...n,
                          numero_ordenadores: Number(e.target.value),
                        }))
                      }
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="w-full"
                      disabled={
                        draw.coordenadas.length < 3 || !esFormularioValido
                      }
                      onClick={finishPolygon}
                    >
                      Guardar polígono
                    </Button>

                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={cancelDraw}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </div>

      {modalLlaves.open && (
        <DialogoGestionLlaves
          open={modalLlaves.open}
          estancia={modalLlaves.estancia}
          prestamosActivos={modalLlaves.prestamosEstancia || []}
          onClose={cerrarModalLlaves}
          onSuccess={refrescarPrestamos}
        />
      )}

      {cargando && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
