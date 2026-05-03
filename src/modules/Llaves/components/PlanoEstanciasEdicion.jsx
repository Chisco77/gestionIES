/**
 * ------------------------------------------------------------
 * Componente: PlanoEstanciasEdicion.jsx
 *
 * Descripción:
 * Plano interactivo basado en SVG que permite visualizar y gestionar
 * estancias dentro de un centro educativo. Incluye funcionalidad de:
 * - Visualización de estancias sobre plano
 * - Estado de ocupación (llaves prestadas)
 * - Creación de nuevas estancias mediante dibujo de polígonos
 * - Gestión de llaves asociadas a cada estancia
 *
 * Características:
 * - Coordenadas normalizadas para adaptarse a cualquier resolución
 * - Renderizado dinámico sobre imagen SVG
 * - Modo edición con dibujo interactivo
 * - Integración con backend (API REST)
 * - Uso de React Query para sincronización de datos
 * - Control de acceso según perfil de usuario
 *
 * Dependencias principales:
 * - React
 * - ShadCN UI
 * - @tanstack/react-query
 * - Sonner (notificaciones)
 *
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * Centro: IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
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

import { Switch } from "@/components/ui/switch";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePlanos } from "@/hooks/usePlanos";

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

async function apiListarEstancias(plantaId) {
  const url = `${API_BASE}/planos/${plantaId}/estancias`;
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Error listando estancias (${r.status}) ${text}`);
  }
  return parseListResponse(r);
}

async function apiGuardarEstancia(idplano, estancia) {
  const url = `${API_BASE}/planos/estancias`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    // Enviamos idplano
    body: JSON.stringify({ idplano, ...estancia }),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Error guardando estancia (${r.status}) ${txt}`);
  }
  return await r.json();
}

// ------------------- Componente -------------------
export default function PlanoEstanciasEdicion() {
  const { data: listaPlanos = [], isLoading: cargandoPlanos } = usePlanos();
  const [plantaActual, setPlantaActual] = useState(null);
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

  // Buscamos el objeto plano completo basándonos en el ID seleccionado
  const planoSeleccionado = useMemo(() => {
    if (!plantaActual) return null;
    // Usamos == para comparar string con número sin dramas
    return (
      listaPlanos.find((p) => String(p.id) === String(plantaActual)) || null
    );
  }, [listaPlanos, plantaActual]);

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

  useEffect(() => {
    if (!planoSeleccionado) return;

    let cancelado = false;
    (async () => {
      setCargando(true);
      setError("");
      try {
        // Usamos el ID real de la base de datos
        const dataEstancias = await apiListarEstancias(planoSeleccionado.id);
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
        if (!cancelado) setError(e?.message || "Error cargando estancias");
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [planoSeleccionado]);

  useEffect(() => {
    if (listaPlanos.length > 0 && !plantaActual) {
      setPlantaActual(String(listaPlanos[0].id));
    }
  }, [listaPlanos, plantaActual]);

  // Generamos la URL del SVG
  const SERVIDOR_URL = API_BASE.replace("/db", "");

  // Generamos la URL del SVG

  const svgUrl = useMemo(() => {
    if (!planoSeleccionado?.svgUrl) return "";

    // Si la ruta ya empieza por http o https, la usamos tal cual
    if (planoSeleccionado.svgUrl.startsWith("http")) {
      return planoSeleccionado.svgUrl;
    }

    // Si la ruta viene de la DB como /gestionIES/public/planos/...
    // Y tu BASE_URL de Vite ya es /gestionIES
    // Solo necesitamos asegurarnos de que no duplicamos el prefijo.

    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, ""); // ej: /gestionIES

    // Limpiamos el path para que no tenga el prefijo de la base si ya lo trae
    let cleanPath = planoSeleccionado.svgUrl;
    if (cleanPath.startsWith(baseUrl)) {
      cleanPath = cleanPath.substring(baseUrl.length);
    }

    // Resultado: /gestionIES + /public/planos/archivo.svg
    return `${baseUrl}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
  }, [planoSeleccionado]);

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
      // Enviamos el id del plano seleccionado
      const guardada = await apiGuardarEstancia(planoSeleccionado.id, estNueva);
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
  const abrirModalLlaves = (estancia) => {
    setModalLlaves({
      open: true,
      estancia: estancia,
    });
  };

  const cerrarModalLlaves = () => {
    setModalLlaves({ open: false, estancia: null });
  };

  const refrescarPrestamos = () => {
    // Aquí puedes disparar la recarga de datos si usas react-query
    queryClient.invalidateQueries({ queryKey: ["estancias"] });
  };

  // ------------------- SVG helpers -------------------
  const polyToPath = (pts) =>
    pts
      .map((p, i) => (i ? `L ${p[0]} ${p[1]}` : `M ${p[0]} ${p[1]}`))
      .join(" ") + " Z";
  const scalePoints = (pts) => pts.map(([x, y]) => [x * size.w, y * size.h]);

  const esFormularioValido = useMemo(() => {
    // Verificamos que los campos tengan contenido real
    const tieneCodigo = nuevo.codigo && nuevo.codigo.trim().length > 0;
    const tieneDesc = nuevo.descripcion && nuevo.descripcion.trim().length > 0;
    const tieneTipo =
      nuevo.tipoestancia && nuevo.tipoestancia.trim().length > 0;

    return tieneCodigo && tieneDesc && tieneTipo;
  }, [nuevo.codigo, nuevo.descripcion, nuevo.tipoestancia]);

  if (!cargandoPlanos && listaPlanos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center border-2 border-dashed rounded-lg m-4">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          {/* Icono simple de mapa o similar */}
          <svg
            className="w-12 h-12 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m6 13l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7m0 13l-6-3m6-3l-6 3m0-13V4m0 0L9 7m0-3L5 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-700">
          No hay planos configurados
        </h3>
        <p className="text-slate-500 max-w-sm mt-2">
          Actualmente no existen planos cargados en el sistema. Contacta con el
          administrador para subir los archivos SVG.
        </p>
      </div>
    );
  }

  // ------------------- Render -------------------
  return (
    <div style={{ padding: 12 }}>
      {/* Selector de plantas */}
      <Tabs
        value={String(plantaActual)}
        onValueChange={setPlantaActual}
        className="mb-4"
      >
        <TabsList>
          {listaPlanos.map((p) => (
            <TabsTrigger key={p.id} value={String(p.id)}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
        {/* Contenedor del Plano */}
        <div
          ref={wrapperRef}
          style={{
            position: "relative",
            flex: 1,
            maxWidth: "1110px",
            minHeight: "500px", // Altura mínima para que no colapse si no hay imagen
            maxHeight: "860px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            overflow: "hidden",
            background: "#f8fafc",
          }}
        >
          {svgUrl ? (
            <>
              <img
                ref={imgRef}
                src={svgUrl}
                alt="Plano de planta"
                onLoad={() => {
                  if (imgRef.current) {
                    setSize({
                      w: imgRef.current.clientWidth,
                      h: imgRef.current.clientHeight,
                    });
                  }
                }}
                onError={(e) => {
                  console.error("Error al cargar SVG:", e.target.src);
                }}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />

              {/* Capa SVG para polígonos */}
              <svg
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "auto",
                  cursor: modoEdicion ? "crosshair" : "pointer",
                }}
                onClick={startOrAddPoint}
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
            </>
          ) : (
            /* Mensaje si la planta existe pero no tiene archivo SVG */
            <div className="flex flex-col items-center justify-center h-full p-10 text-center">
              <div className="text-amber-500 mb-2 font-semibold">
                ⚠️ Archivo no encontrado
              </div>
              <p className="text-slate-500 text-sm">
                No hay una imagen asociada a la planta{" "}
                <strong>{planoSeleccionado?.label}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div className="w-80">
          {(user?.perfil === "administrador" ||
            user?.perfil === "directiva") && (
            <Card className="border border-slate-300 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="modo-edicion"
                    checked={modoEdicion}
                    onCheckedChange={(v) => setModoEdicion(Boolean(v))}
                  />
                  <Label
                    htmlFor="modo-edicion"
                    className="text-base font-bold cursor-pointer"
                  >
                    Modo edición
                  </Label>
                </div>
              </CardHeader>

              {modoEdicion && (
                <CardContent className="space-y-3">
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
                        <SelectItem value="Armario">Armario</SelectItem>
                        <SelectItem value="Aula">Aula</SelectItem>
                        <SelectItem value="Aula Polivalente">
                          Aula Polivalente
                        </SelectItem>
                        <SelectItem value="Departamento">
                          Departamento
                        </SelectItem>
                        <SelectItem value="Despacho">Despacho</SelectItem>
                        <SelectItem value="Infolab">Infolab</SelectItem>
                        <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                        <SelectItem value="Optativa">Optativa</SelectItem>
                        <SelectItem value="Otras">Otras</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between border rounded-md p-3 mt-2 bg-slate-50">
                    <Label className="text-sm font-medium">Reservable</Label>
                    <Switch
                      checked={nuevo.reservable}
                      onCheckedChange={(v) =>
                        setNuevo((n) => ({ ...n, reservable: v }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-sm">Total llaves</Label>
                      <Input
                        type="number"
                        min={1}
                        value={nuevo.totalllaves}
                        onChange={(e) =>
                          setNuevo((n) => ({
                            ...n,
                            totalllaves: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Ordenadores</Label>
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
                  </div>

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

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      disabled={
                        draw.coordenadas.length < 3 || !esFormularioValido
                      }
                      onClick={finishPolygon}
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
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

      {/* Indicadores de estado flotantes para no romper el layout */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        {cargando && (
          <div className="bg-white/80 backdrop-blur-sm border px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
            Cargando...
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-full shadow-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
