/**
 * PlanoEstanciasInteractivo.jsx - Plano interactivo de estancias con gestión de llaves
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Descripción:
 * Componente que muestra un plano interactivo de estancias
 * con la posibilidad de:
 * - Visualizar estancias y su número de llaves prestadas y disponibles.
 * - Abrir un diálogo para gestionar préstamos y devoluciones de llaves a profesores.
 * - Escalado dinámico del plano SVG según tamaño del contenedor.
 *
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { DialogoGestionLlaves } from "./DialogoGestionLlaves";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

async function apiListarPrestamosLlaves() {
  const url = `${API_BASE}/prestamos-llaves/agrupados`;
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error(`Error listando préstamos llaves (${r.status})`);
  const j = await r.json();
  return Array.isArray(j) ? j : [];
}

// ------------------- Componente -------------------
export default function PlanoEstanciasInteractivo({ planta = "baja" }) {
  const svgUrl =
    planta === "primera"
      ? `${import.meta.env.BASE_URL}PLANTA_PRIMERA.svg`
      : planta === "segunda"
        ? `${import.meta.env.BASE_URL}PLANTA_SEGUNDA.svg`
        : `${import.meta.env.BASE_URL}PLANTA_BAJA.svg`;

  const [estancias, setEstancias] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [modalLlaves, setModalLlaves] = useState({
    open: false,
    estancia: null,
  });
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const { user } = useAuth();

  // Escalado dinámico
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (imgRef.current) {
        setSize({
          w: imgRef.current.clientWidth,
          h: imgRef.current.clientHeight,
        });
      }
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [planta]);

  // ------------------- Carga de datos -------------------
  useEffect(() => {
    let cancelado = false;
    (async () => {
      setCargando(true);
      setError("");
      try {
        const dataEstancias = await apiListarEstancias(planta);
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
        const dataPrestamos = await apiListarPrestamosLlaves();
        if (!cancelado) setPrestamos(dataPrestamos);
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
  }, [planta]);

  // ------------------- Lógica de préstamos -------------------
  const prestamosPorEstancia = useMemo(() => {
    const m = new Map();
    for (const prof of prestamos) {
      for (const p of prof.prestamos) {
        if (!p.fechadevolucion) {
          m.set(p.idestancia, (m.get(p.idestancia) || 0) + p.unidades);
        }
      }
    }
    return m;
  }, [prestamos]);

  const handleDevolverLlaves = async () => {
    if (seleccionadas.length === 0) return;
    try {
      const res = await fetch(`${API_URL}/db/prestamos-llaves/devolver`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: seleccionadas }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Error al devolver llaves");
      }
      toast.success("Llaves devueltas correctamente");
      setSeleccionadas([]);
      refrescarPrestamos();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al devolver llaves");
    }
  };

  const estadoEstancia = (e) => {
    const prestadas = prestamosPorEstancia.get(e.id) || 0;
    const libres = Math.max(0, (e.totalllaves || 0) - prestadas);
    let estado = "none";
    if (prestadas === 0) estado = "none";
    else if (prestadas < e.totalllaves) estado = "partial";
    else estado = "full";
    return { prestadas, libres, estado };
  };

  const polyToPath = (pts) =>
    pts
      .map((p, i) => (i ? `L ${p[0]} ${p[1]}` : `M ${p[0]} ${p[1]}`))
      .join(" ") + " Z";
  const scalePoints = (pts) => pts.map(([x, y]) => [x * size.w, y * size.h]);

  const abrirModalLlaves = (estancia) => {
    const prestamosEstancia = prestamos.flatMap((p) =>
      p.prestamos
        .filter((pr) => pr.idestancia === estancia.id && !pr.fechadevolucion)
        .map((pr) => ({ ...pr, nombre: p.nombre }))
    );
    setModalLlaves({ open: true, estancia, prestamosEstancia });
  };

  const cerrarModalLlaves = () =>
    setModalLlaves({ open: false, estancia: null });

  const refrescarPrestamos = async () => {
    try {
      const data = await apiListarPrestamosLlaves();
      setPrestamos(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Préstamos activos
  const prestamosActivos = prestamos.flatMap((profesor) =>
    profesor.prestamos
      .filter((p) => p.fechadevolucion === null)
      .map((p) => ({ ...p, profesor: profesor.nombre }))
  );

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 16 }}>
        {/* -------------------- PLANO -------------------- */}
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
            alt={`Plano planta ${planta}`}
            onLoad={() => {
              if (imgRef.current) {
                setSize({
                  w: imgRef.current.clientWidth,
                  h: imgRef.current.clientHeight,
                });
              }
            }}
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
          >
            <TooltipProvider delayDuration={100}>
              {size.w > 0 &&
                size.h > 0 &&
                estancias.map((s) => {
                  const { prestadas, estado } = estadoEstancia(s);
                  const absPts = scalePoints(s.coordenadas);
                  const color =
                    estado === "none"
                      ? "rgba(200,200,200,0.95)"
                      : estado === "partial"
                        ? "rgba(250,200,80,0.95)"
                        : "rgba(250,80,80,0.95)";

                  return (
                    <Tooltip key={s.id}>
                      <TooltipTrigger asChild>
                        <g
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirModalLlaves(s);
                          }}
                          style={{ cursor: "pointer" }}
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
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-sky-500 text-white text-base px-4 py-2 rounded-md shadow-lg font-medium"
                      >
                        {s.descripcion || s.codigo}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
            </TooltipProvider>

            {/* Leyenda */}
            <g>
              <circle
                cx={45}
                cy={65}
                r={14}
                fill="rgba(200,200,200,0.95)"
                stroke="#374151"
              />
              <text x={65} y={69} fontSize={10} fill="#374151">
                0 prestadas
              </text>
              <circle
                cx={140}
                cy={65}
                r={14}
                fill="rgba(250,200,80,0.95)"
                stroke="#374151"
              />
              <text x={160} y={69} fontSize={10} fill="#374151">
                parcial
              </text>
              <circle
                cx={235}
                cy={65}
                r={14}
                fill="rgba(250,80,80,0.95)"
                stroke="#374151"
              />
              <text x={255} y={69} fontSize={10} fill="#374151">
                todas
              </text>
            </g>
          </svg>
        </div>

        {/* -------------------- PANEL DERECHO -------------------- */}
        <div
          style={{
            width: 340,
            display: "flex",
            flexDirection: "column",
            borderRadius: 8,
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            height: "860px",
            overflow: "hidden",
          }}
        >
          {/* CABECERA ESTILO DIALOGHEADER */}
          <div
            style={{
              background: "#3b82f6", // azul como bg-blue-500
              color: "white", // texto blanco
              padding: "12px 16px",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 600,
              }}
            >
              Llaves prestadas
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                opacity: 0.9,
              }}
            >
              Profesores con llaves prestadas
            </p>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {prestamosActivos.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                No hay préstamos activos.
              </p>
            ) : (
              prestamosActivos.map((p) => (
                <div
                  key={p.id}
                  onClick={() =>
                    setSeleccionadas((prev) =>
                      prev.includes(p.id)
                        ? prev.filter((id) => id !== p.id)
                        : [...prev, p.id]
                    )
                  }
                  style={{
                    border: seleccionadas.includes(p.id)
                      ? "2px solid #0284c7"
                      : "1px solid #e5e7eb",
                    background: seleccionadas.includes(p.id)
                      ? "#f0f9ff"
                      : "white",
                    borderRadius: 6,
                    padding: 10,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>
                    {p.profesor}
                  </div>
                  <div style={{ fontSize: 13, color: "#334155" }}>
                    {p.nombreEstancia + " - " + p.planta + " planta" || "—"}
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              padding: 12,
              background: "#f8fafc",
            }}
          >
            <button
              onClick={handleDevolverLlaves}
              disabled={seleccionadas.length === 0}
              style={{
                width: "100%",
                padding: "8px 0",
                borderRadius: 6,
                background: seleccionadas.length > 0 ? "#0284c7" : "#cbd5e1",
                color: "white",
                fontWeight: 600,
                border: "none",
                cursor: seleccionadas.length > 0 ? "pointer" : "default",
                transition: "background 0.2s",
              }}
            >
              Devolver {seleccionadas.length || ""} llave
              {seleccionadas.length > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Diálogo de gestión de llaves */}
      {modalLlaves.open && (
        <DialogoGestionLlaves
          open={modalLlaves.open}
          estancia={modalLlaves.estancia}
          prestamosActivos={modalLlaves.prestamosEstancia || []}
          onClose={cerrarModalLlaves}
          onSuccess={refrescarPrestamos}
        />
      )}
    </div>
  );
}
