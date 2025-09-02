import React, { useEffect, useMemo, useRef, useState } from "react";
import { DialogoPrestarLlaves } from "./DialogoPrestarLlaves";
import { DialogoDevolverLlaves } from "./DialogoDevolverLlaves";

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

// Estancias
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

// Préstamos de llaves
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
      ? "/PLANTA_PRIMERA.svg"
      : planta === "segunda"
        ? "/PLANTA_SEGUNDA.svg"
        : "/PLANTA_BAJA.svg";

  const [estancias, setEstancias] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [draw, setDraw] = useState({ activo: false, coordenadas: [] });
  const [nuevo, setNuevo] = useState({ nombre: "", totalllaves: 1 });

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

  // ------------------- Carga de estancias y préstamos -------------------
  useEffect(() => {
    let cancelado = false;
    (async () => {
      setCargando(true);
      setError("");
      try {
        const dataEstancias = await apiListarEstancias(planta);
        console.log(modalLlaves.estancia);
        const normal = dataEstancias.map((r) => ({
          id: r.id, 
          codigo: r.codigo, 
          nombre: r.nombre || r.descripcion,
          totalllaves: r.totalllaves || 1,
          coordenadas: r.coordenadas || r.coordenadas_json || [],
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

  const prestamosPorEstancia = useMemo(() => {
    const m = new Map();
    for (const prof of prestamos) {
      for (const p of prof.prestamos) {
        if (!p.fechadevolucion) {
          // ✅ solo préstamos activos
          m.set(p.idestancia, (m.get(p.idestancia) || 0) + p.unidades);
        }
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
    const id = slugify(nuevo.nombre || `estancia-${estancias.length + 1}`);
    const estNueva = {
      id,
      nombre: nuevo.nombre,
      totalllaves: Math.max(1, Number(nuevo.totalllaves) || 1),
      coordenadas: draw.coordenadas,
    };
    try {
      setCargando(true);
      setError("");
      const guardada = await apiGuardarEstancia(planta, estNueva);
      const norma = {
        id: guardada.id,
        nombre: guardada.nombre || guardada.descripcion,
        totalllaves: guardada.totalllaves,
        coordenadas:
          guardada.coordenadas_json ||
          guardada.coordenadas ||
          estNueva.coordenadas,
      };
      setEstancias((prev) => {
        const i = prev.findIndex((e) => e.id === norma.id);
        if (i === -1) return [...prev, norma];
        const copia = prev.slice();
        copia[i] = norma;
        return copia;
      });
      setDraw({ activo: false, coordenadas: [] });
      setNuevo({ nombre: "", totalllaves: 1 });
    } catch (e) {
      setError(e?.message || "Error guardando la estancia");
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const cancelDraw = () => setDraw({ activo: false, coordenadas: [] });

  // ------------------- Escalado y path -------------------
  const polyToPath = (pts) =>
    pts
      .map((p, i) => (i ? `L ${p[0]} ${p[1]}` : `M ${p[0]} ${p[1]}`))
      .join(" ") + " Z";

  const scalePoints = (pts) => pts.map(([x, y]) => [x * size.w, y * size.h]);

  // ------------------- Modal de llaves -------------------
  /*const abrirModalLlaves = (estancia) => {
    console.log("👉 Estancia seleccionada:", estancia);
    setModalLlaves({ open: true, estancia });
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
  };*/

  // ------------------- Modal de llaves -------------------
  const abrirModalLlaves = (estancia) => {
    // prestamos de esta estancia
    const prestamosEstancia = prestamos.flatMap((p) =>
      p.prestamos
        .filter((pr) => pr.idestancia === estancia.id)
        .map((pr) => ({
          ...pr,
          nombre: p.nombre, // profesor
        }))
    );

    const modo = prestamosEstancia.length > 0 ? "devolver" : "prestar";
    setModalLlaves({ open: true, estancia, modo });
  };

  const cerrarModalLlaves = () =>
    setModalLlaves({ open: false, estancia: null, modo: "prestar" });

  const refrescarPrestamos = async () => {
    try {
      const data = await apiListarPrestamosLlaves();
      setPrestamos(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 12 }}>
      {/* Panel lateral y plano */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ width: 340 }}>
          {/* Préstamos */}
          <h3 style={{ margin: 0 }}>Préstamos activos</h3>
          <div style={{ marginTop: 8 }}>
            {prestamos.length === 0 ? (
              <p style={{ color: "#6b7280" }}>No hay préstamos.</p>
            ) : (
              <ul style={{ paddingLeft: 0 }}>
                {prestamos.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      listStyle: "none",
                      marginBottom: 10,
                      border: "1px solid #e5e7eb",
                      padding: 8,
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {estancias.find((e) => e.id === p.estanciaId)?.nombre ||
                        p.estanciaId}
                    </div>
                    <div style={{ fontSize: 13, color: "#374151" }}>
                      {p.nombre} · {p.unidades} llave(s)
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <hr style={{ margin: "12px 0" }} />

          {/* Edición */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={modoEdicion}
                onChange={(e) => setModoEdicion(e.target.checked)}
              />{" "}
              <strong>Modo edición</strong>
            </label>
            {modoEdicion && (
              <div
                style={{
                  marginTop: 8,
                  border: "1px dashed #e6eef0",
                  padding: 8,
                  borderRadius: 6,
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: "block", fontSize: 13 }}>
                    Nombre de la estancia
                  </label>
                  <input
                    placeholder="Aula 1.01"
                    value={nuevo.nombre}
                    onChange={(e) =>
                      setNuevo((n) => ({ ...n, nombre: e.target.value }))
                    }
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: "block", fontSize: 13 }}>
                    Nº llaves totales
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={nuevo.totalllaves}
                    onChange={(e) =>
                      setNuevo((n) => ({
                        ...n,
                        totalllaves: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={finishPolygon}
                    disabled={
                      !draw.activo || draw.coordenadas.length < 3 || cargando
                    }
                  >
                    {cargando ? "Guardando..." : "Guardar estancia"}
                  </button>
                  <button
                    onClick={cancelDraw}
                    disabled={!draw.activo || cargando}
                  >
                    Cancelar dibujo
                  </button>
                </div>
                {error && (
                  <p style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>
                    {error}
                  </p>
                )}
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                  Click en el plano para añadir coordenadas. Doble-click para
                  cerrar el polígono.
                </p>
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  {estancias.map((s) => (
                    <span
                      key={s.id}
                      style={{
                        background: "#eef2ff",
                        padding: "4px 8px",
                        borderRadius: 999,
                        fontSize: 12,
                      }}
                    >
                      {s.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plano */}
        <div
          ref={wrapperRef}
          style={{
            position: "relative",
            flex: 1,
            maxWidth: "1014px",
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
            <g>
              <circle
                cx={20}
                cy={100}
                r={8}
                fill="rgba(200,200,200,0.95)"
                stroke="#374151"
              />
              <text x={35} y={104} fontSize={10} fill="#374151">
                0 prestadas
              </text>

              <circle
                cx={100}
                cy={100}
                r={8}
                fill="rgba(250,200,80,0.95)"
                stroke="#374151"
              />
              <text x={115} y={104} fontSize={10} fill="#374151">
                parcial
              </text>

              <circle
                cx={160}
                cy={100}
                r={8}
                fill="rgba(250,80,80,0.95)"
                stroke="#374151"
              />
              <text x={175} y={104} fontSize={10} fill="#374151">
                todas
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Dialogo Prestar Llaves */}
      {/* Diálogos */}
      {modalLlaves.modo === "prestar" && (
        <DialogoPrestarLlaves
          open={modalLlaves.open}
          estancia={modalLlaves.estancia}
          onClose={cerrarModalLlaves}
          onSuccess={refrescarPrestamos}
        />
      )}

      {modalLlaves.modo === "devolver" && (
        <DialogoDevolverLlaves
          open={modalLlaves.open}
          estancia={modalLlaves.estancia}
          prestamos={prestamos.flatMap((p) =>
            p.prestamos
              .filter((pr) => pr.idestancia === modalLlaves.estancia?.id)
              .map((pr) => ({
                ...pr,
                nombre: p.nombre,
              }))
          )}
          onClose={cerrarModalLlaves}
          onSuccess={refrescarPrestamos}
        />
      )}
    </div>
  );
}

// ------------------- Helper -------------------
function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
