import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * PlanoEstanciasInteractivo.jsx (actualizado para API backend con VITE_API_URL)
 *
 * Propósito:
 *  - Usa import.meta.env.VITE_API_URL si está definida, si no, usa rutas relativas (/db/...)
 *  - Añade credentials: "include" (consistente con CursosIndex)
 *  - Maneja varias formas de respuesta JSON (array directo, { ok:true, estancias }, { rows })
 */

// ------------------------------
// Mock profesores (sustituir por LDAP)
// ------------------------------
const PROFESORES_MOCK = [
  { uid: "aperez", nombre: "Ana Pérez" },
  { uid: "jlopez", nombre: "Javier López" },
  { uid: "mruiz", nombre: "María Ruiz" },
  { uid: "fsantos", nombre: "Francisco Santos" },
];

// Base API desde env (igual que en CursosIndex)
const API_URL = import.meta.env.VITE_API_URL || ""; // ejemplo: "http://localhost:3000"
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

// util para parsear respuestas variadas del backend
async function parseListResponse(resp) {
  // intenta parsear JSON y normalizar a array de estancias [{ id,nombre,keysTotales,puntos }]
  const j = await resp.json().catch(() => null);
  if (!j) throw new Error(`Respuesta no JSON (${resp.status})`);
  // varios formatos posibles:
  // 1) { ok: true, estancias: [...] }
  if (j && j.ok && Array.isArray(j.estancias)) return j.estancias;
  // 2) array directo: [...]
  if (Array.isArray(j)) return j;
  // 3) { rows: [...] }
  if (Array.isArray(j.rows)) return j.rows;
  // 4) { estancias: [...] }
  if (Array.isArray(j.estancias)) return j.estancias;
  // fallback: si devuelve un objeto único (por ejemplo row con campos), devuélvelo envuelto
  if (typeof j === "object") return [j];
  throw new Error("Formato de respuesta desconocido");
}

// ------------------------------
// API helpers (usando API_BASE)
// ------------------------------
async function apiListarEstancias(planta) {
  const url = `${API_BASE}/planos/estancias?planta=${encodeURIComponent(planta)}`;
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) {
    // intenta leer body para dar un mensaje más claro
    let text = await r.text().catch(() => "");
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
    let txt = await r.text().catch(() => "");
    throw new Error(`Error guardando estancia (${r.status}) ${txt}`);
  }
  // la respuesta puede ser fila creada u objeto; normalizamos:
  const j = await r.json().catch(() => null);
  if (!j) throw new Error("Respuesta inválida al guardar");
  if (j.ok && j.estancia) return j.estancia;
  if (Array.isArray(j)) return j[0]; // improbable pero por si el server devuelve array
  if (j.codigo || j.id || j.descripcion) {
    // adaptamos a forma front: id, nombre, keysTotales, puntos
    return {
      id: j.codigo || j.id,
      nombre: j.descripcion || j.nombre,
      keysTotales: j.totalllaves || j.keysTotales || 1,
      puntos: j.coordenadas_json || j.puntos || j.coordenadas || [],
    };
  }
  return j;
}

// ------------------------------
// Componente
// ------------------------------
export default function PlanoEstanciasInteractivo({ planta = "baja" }) {
  // decide la url del svg según la planta
  const svgUrl =
    planta === "primera"
      ? "/PLANTA_PRIMERA.svg"
      : planta === "segunda"
      ? "/PLANTA_SEGUNDA.svg"
      : "/PLANTA_BAJA.svg";

  // estancias: { id, nombre, keysTotales, puntos: [[x,y],...] }
  const [estancias, setEstancias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // préstamos activos (en memoria demo): [{ estanciaId, uid, nombre, unidades, ts }]
  const [prestamos, setPrestamos] = useState([]);

  // UI state
  const [modoEdicion, setModoEdicion] = useState(false);
  const [draw, setDraw] = useState({ activo: false, puntos: [] });
  const [nuevo, setNuevo] = useState({ nombre: "", keysTotales: 1 });

  const [modal, setModal] = useState({ open: false, estancia: null });
  const [form, setForm] = useState({ uid: "", unidades: 1 });

  // refs y tamaño para colocar leyenda
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (imgRef.current) setSize({ w: imgRef.current.clientWidth, h: imgRef.current.clientHeight });
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // cargar estancias desde la API cuando cambia la planta
  useEffect(() => {
    let cancelado = false;
    (async () => {
      setCargando(true);
      setError("");
      try {
        const data = await apiListarEstancias(planta);
        if (!cancelado) {
          // normalizamos campos si es necesario (si vienen con nombres DB)
          const normal = data.map((r) => ({
            id: r.id || r.codigo,
            nombre: r.nombre || r.descripcion,
            keysTotales: r.keysTotales || r.totalllaves || 1,
            puntos: r.puntos || r.coordenadas_json || r.coordenadas || [],
          }));
          setEstancias(normal);
        }
      } catch (e) {
        if (!cancelado) setError(e?.message || "Error cargando estancias");
        console.error("[PlanoEstancias] apiListarEstancias:", e);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => { cancelado = true; };
  }, [planta]);

  // util: mapa de prestadas por estancia
  const prestamosPorEstancia = useMemo(() => {
    const m = new Map();
    for (const p of prestamos) m.set(p.estanciaId, (m.get(p.estanciaId) || 0) + p.unidades);
    return m;
  }, [prestamos]);

  const estadoEstancia = (e) => {
    const prestadas = prestamosPorEstancia.get(e.id) || 0;
    const libres = Math.max(0, (e.keysTotales || 0) - prestadas);
    let estado = "none"; // none | partial | full
    if (prestadas === 0) estado = "none";
    else if (prestadas < e.keysTotales) estado = "partial";
    else estado = "full";
    return { prestadas, libres, estado };
  };

  // dibujo: click -> add point; doble click -> close
  const startOrAddPoint = (evt) => {
    if (!modoEdicion) return;
    // coords relativas al overlay
    const rect = evt.currentTarget.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    if (!draw.activo) setDraw({ activo: true, puntos: [[x, y]] });
    else setDraw((d) => ({ ...d, puntos: [...d.puntos, [x, y]] }));
  };

  const finishPolygon = async () => {
    if (!modoEdicion || !draw.activo || draw.puntos.length < 3) return;
    const id = slugify(nuevo.nombre || `estancia-${estancias.length + 1}`);
    const estNueva = {
      id,
      nombre: nuevo.nombre || id,
      keysTotales: Math.max(1, Number(nuevo.keysTotales) || 1),
      puntos: draw.puntos,
    };

    try {
      setCargando(true);
      setError("");
      const guardada = await apiGuardarEstancia(planta, estNueva);
      // normalizar respuesta guardada (puede venir con nombres DB)
      const norma = {
        id: guardada.id || guardada.codigo,
        nombre: guardada.nombre || guardada.descripcion,
        keysTotales: guardada.keysTotales || guardada.totalllaves || estNueva.keysTotales,
        puntos: guardada.puntos || guardada.coordenadas_json || guardada.coordenadas || estNueva.puntos,
      };
      setEstancias((prev) => {
        const i = prev.findIndex((e) => e.id === norma.id);
        if (i === -1) return [...prev, norma];
        const copia = prev.slice();
        copia[i] = norma;
        return copia;
      });
      setDraw({ activo: false, puntos: [] });
      setNuevo({ nombre: "", keysTotales: 1 });
    } catch (e) {
      setError(e?.message || "Error guardando la estancia");
      console.error("[PlanoEstancias] apiGuardarEstancia:", e);
    } finally {
      setCargando(false);
    }
  };

  const cancelDraw = () => setDraw({ activo: false, puntos: [] });

  // abrir modal prestar
  const abrirModal = (e) => {
    setModal({ open: true, estancia: e });
    setForm({ uid: "", unidades: 1 });
  };
  const cerrarModal = () => setModal({ open: false, estancia: null });

  // prestar (demo en memoria)
  const prestar = () => {
    if (!modal.estancia || !form.uid) return alert("Introduce uid y cantidad.");
    const { prestadas } = estadoEstancia(modal.estancia);
    const dispon = modal.estancia.keysTotales - prestadas;
    if (form.unidades < 1 || form.unidades > dispon) return alert("Cantidad inválida.");
    const prof = PROFESORES_MOCK.find((p) => p.uid === form.uid) || { uid: form.uid, nombre: form.uid };
    setPrestamos((p) => [...p, { estanciaId: modal.estancia.id, uid: prof.uid, nombre: prof.nombre, unidades: form.unidades, ts: Date.now() }]);
    cerrarModal();
  };

  const devolver = (idx) => setPrestamos((p) => p.filter((_, i) => i !== idx));

  // helpers para SVG
  const polyToPath = (pts) => pts.map((p, i) => (i ? `L ${p[0]} ${p[1]}` : `M ${p[0]} ${p[1]}`)).join(" ") + " Z";
  const centroid = (pts) => {
    // centroid (fallback average)
    let signedArea = 0,
      cx = 0,
      cy = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      const a = x0 * y1 - x1 * y0;
      signedArea += a;
      cx += (x0 + x1) * a;
      cy += (y0 + y1) * a;
    }
    signedArea *= 0.5;
    if (Math.abs(signedArea) < 1e-6) {
      const sx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const sy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      return [sx, sy];
    }
    cx /= 6 * signedArea;
    cy /= 6 * signedArea;
    return [cx, cy];
  };

  // --------------------------
  // Render
  // --------------------------
  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 12 }}>
        {/* Panel lateral: prestamos + editor */}
        <div style={{ width: 340 }}>
          <h3 style={{ margin: 0 }}>Préstamos activos</h3>
          <div style={{ marginTop: 8 }}>
            {prestamos.length === 0 ? (
              <p style={{ color: "#6b7280" }}>No hay préstamos.</p>
            ) : (
              <ul style={{ paddingLeft: 0 }}>
                {prestamos.map((p, i) => (
                  <li key={i} style={{ listStyle: "none", marginBottom: 10, border: "1px solid #e5e7eb", padding: 8, borderRadius: 6 }}>
                    <div style={{ fontWeight: 700 }}>{(estancias.find((e) => e.id === p.estanciaId)?.nombre) || p.estanciaId}</div>
                    <div style={{ fontSize: 13, color: "#374151" }}>{p.nombre} · {p.unidades} llave(s)</div>
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => devolver(i)}>Devolver</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <hr style={{ margin: "12px 0" }} />

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={modoEdicion} onChange={(e) => setModoEdicion(e.target.checked)} /> <strong>Modo edición</strong>
            </label>

            {modoEdicion && (
              <div style={{ marginTop: 8, border: "1px dashed #e6eef0", padding: 8, borderRadius: 6 }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: "block", fontSize: 13 }}>Nombre de la estancia</label>
                  <input placeholder="Aula 1.01" value={nuevo.nombre} onChange={(e) => setNuevo((n) => ({ ...n, nombre: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: "block", fontSize: 13 }}>Nº llaves totales</label>
                  <input type="number" min={1} value={nuevo.keysTotales} onChange={(e) => setNuevo((n) => ({ ...n, keysTotales: Number(e.target.value) }))} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={finishPolygon} disabled={!draw.activo || draw.puntos.length < 3 || cargando}>
                    {cargando ? "Guardando..." : "Guardar estancia"}
                  </button>
                  <button onClick={cancelDraw} disabled={!draw.activo || cargando}>Cancelar dibujo</button>
                </div>
                {error && <p style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>{error}</p>}
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                  Click en el plano para añadir puntos. Doble-click para cerrar el polígono.
                </p>
                <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {estancias.map((s) => <span key={s.id} style={{ background: "#eef2ff", padding: "4px 8px", borderRadius: 999, fontSize: 12 }}>{s.nombre}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plano con overlay */}
        <div ref={wrapperRef} style={{ position: "relative", flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <img ref={imgRef} src={svgUrl} alt={`Plano planta ${planta}`} style={{ width: "100%", height: "auto", display: "block" }} />

          {/* overlay SVG absoluto */}
          <svg
            style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "auto" }}
            onClick={startOrAddPoint}
            onDoubleClick={(e) => { e.preventDefault(); finishPolygon(); }}
          >
            {/* estancias existentes */}
            {estancias.map((s) => {
              const { prestadas, estado } = estadoEstancia(s);
              const [cx, cy] = centroid(s.puntos);
              const color = estado === "none" ? "rgba(200,200,200,0.95)" : estado === "partial" ? "rgba(250,200,80,0.95)" : "rgba(250,80,80,0.95)";
              return (
                <g key={s.id} onClick={(e) => { if (!modoEdicion) { e.stopPropagation(); abrirModal(s); } }}>
                  <path d={polyToPath(s.puntos)} fill="white" fillOpacity={0.35} stroke="#0ea5e9" strokeWidth={2} />
                  <text x={cx} y={cy - 18} fontSize={12} textAnchor="middle" fill="#111827" pointerEvents="none">{s.nombre}</text>
                  <g>
                    <circle cx={cx} cy={cy} r={16} fill={color} stroke="#374151" strokeWidth={1} />
                    <text x={cx} y={cy + 4} fontSize={12} textAnchor="middle" fill="#071130" pointerEvents="none">{prestadas}</text>
                  </g>
                </g>
              );
            })}

            {/* polígono en curso */}
            {draw.activo && draw.puntos.length > 0 && (
              <g>
                <path d={polyToPath(draw.puntos)} fill="rgba(16,185,129,0.18)" stroke="#059669" strokeDasharray="6 4" strokeWidth={2} />
                {draw.puntos.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="#059669" />)}
              </g>
            )}

            {/* leyenda esquina inferior derecha */}
            <g>
              <circle cx={size.w - 180} cy={size.h - 20} r={8} fill="rgba(200,200,200,0.95)" stroke="#374151" />
              <text x={size.w - 165} y={size.h - 16} fontSize={10} fill="#374151">0 prestadas</text>
              <circle cx={size.w - 100} cy={size.h - 20} r={8} fill="rgba(250,200,80,0.95)" stroke="#374151" />
              <text x={size.w - 85} y={size.h - 16} fontSize={10} fill="#374151">parcial</text>
              <circle cx={size.w - 40} cy={size.h - 20} r={8} fill="rgba(250,80,80,0.95)" stroke="#374151" />
              <text x={size.w - 25} y={size.h - 16} fontSize={10} fill="#374151">todas</text>
            </g>
          </svg>
        </div>
      </div>

      {/* modal simple */}
      {modal.open && modal.estancia && (
        <div style={{
          position: "fixed", left: 0, top: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.45)", zIndex: 60
        }}>
          <div style={{ width: 480, background: "white", padding: 16, borderRadius: 8 }}>
            <h3 style={{ margin: 0 }}>Prestar llave — {modal.estancia.nombre}</h3>
            <div style={{ marginTop: 8 }}>
              <div>Total llaves: <strong>{modal.estancia.keysTotales}</strong></div>
              <div>Prestadas: <strong>{estadoEstancia(modal.estancia).prestadas}</strong></div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input placeholder="uid profesor (ej. aperez)" value={form.uid} onChange={e => setForm(f => ({ ...f, uid: e.target.value }))} />
              <input type="number" min={1} value={form.unidades} onChange={e => setForm(f => ({ ...f, unidades: Number(e.target.value) }))} style={{ width: 100 }} />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={cerrarModal}>Cancelar</button>
              <button onClick={prestar} disabled={!form.uid}>Prestar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------- helpers --------------
function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
