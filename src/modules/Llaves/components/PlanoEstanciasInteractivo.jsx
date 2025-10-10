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
 * Fecha de creación: 2025
 *
 * Descripción:
 * Componente que muestra un plano interactivo de estancias
 * con la posibilidad de:
 * - Visualizar estancias y su número de llaves prestadas y disponibles.
 * - Abrir un diálogo para gestionar préstamos y devoluciones de llaves a profesores.
 * - Modo de edición para crear nuevas estancias mediante dibujo de polígonos sobre el plano.
 * - Escalado dinámico del plano SVG según tamaño del contenedor.
 *
 * Funcionalidad principal:
 * - Carga las estancias de una planta determinada desde la API.
 * - Carga los préstamos de llaves agrupados por profesor.
 * - Calcula el estado de cada estancia (ninguna llave prestada, parcial o todas prestadas).
 * - Permite dibujar nuevas estancias en modo edición y guardarlas en la API.
 * - Muestra un panel lateral con:
 *     - Lista de préstamos activos.
 *     - Controles para activar el modo edición y crear nuevas estancias.
 * - Dibuja polígonos para cada estancia en el plano SVG, coloreando según el estado de las llaves.
 * - Permite hacer click sobre una estancia para abrir el diálogo de gestión de llaves (`DialogoGestionLlaves`).
 *
 * Props:
 * - planta: string que indica la planta a mostrar ("baja", "primera", "segunda"). Por defecto "baja".
 *
 * Estado interno:
 * - estancias: array con todas las estancias cargadas de la planta.
 * - prestamos: array con los préstamos agrupados por profesor.
 * - cargando: boolean para indicar carga de datos.
 * - error: string con mensaje de error de carga o guardado.
 * - modoEdicion: boolean para activar la creación de nuevas estancias.
 * - draw: objeto con estado de dibujo activo y coordenadas del polígono en edición.
 * - nuevo: objeto con datos de la nueva estancia (código, descripción, totalllaves).
 * - modalLlaves: objeto para controlar la apertura del diálogo de gestión de llaves.
 * - size: dimensiones actuales del plano para escalar los polígonos correctamente.
 *
 * Funciones auxiliares:
 * - parseListResponse(resp): normaliza respuestas JSON de la API.
 * - apiListarEstancias(planta): obtiene estancias de la API para la planta.
 * - apiGuardarEstancia(planta, estancia): guarda una nueva estancia mediante POST a la API.
 * - apiListarPrestamosLlaves(): obtiene préstamos de llaves agrupados por profesor.
 * - estadoEstancia(estancia): calcula llaves prestadas, libres y estado visual de la estancia.
 * - startOrAddPoint(evt), finishPolygon(), cancelDraw(): manejan la creación de polígonos de estancias.
 * - polyToPath(pts), scalePoints(pts): convierten coordenadas relativas en paths SVG escalados.
 * - abrirModalLlaves(estancia), cerrarModalLlaves(): controlan el diálogo de préstamos de llaves.
 * - refrescarPrestamos(): recarga la lista de préstamos activos tras cambios.
 *
 * UI/UX:
 * - Plano SVG escalable con polígonos interactivos para cada estancia.
 * - Círculo de color en cada estancia indicando estado de llaves:
 *     - Gris: ninguna llave prestada.
 *     - Amarillo: parcial.
 *     - Rojo: todas prestadas.
 * - Panel lateral con listado de préstamos activos y controles de edición.
 * - Modo edición permite dibujar polígonos, ingresar código, descripción y número de llaves.
 * - Click en plano fuera de modo edición abre `DialogoGestionLlaves`.
 *
 * Dependencias:
 * - React (useState, useEffect, useMemo, useRef)
 * - DialogoGestionLlaves.jsx
 * - Fetch API para llamadas a backend
 *
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { DialogoGestionLlaves } from "./DialogoGestionLlaves";

import { useAuth } from "@/context/AuthContext";

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
  console.log ("Estancia", estancia);
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
      ? `${import.meta.env.BASE_URL}PLANTA_PRIMERA.svg`
      : planta === "segunda"
        ? `${import.meta.env.BASE_URL}PLANTA_SEGUNDA.svg`
        : `${import.meta.env.BASE_URL}PLANTA_BAJA.svg`;

  const [estancias, setEstancias] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [draw, setDraw] = useState({ activo: false, coordenadas: [] });

  // Para filtrar que modo edición de estancias es solo para el admin
  const { user } = useAuth();

  // Para guardar nueva estancia
  const [nuevo, setNuevo] = useState({
    codigo: "",
    descripcion: "",
    totalllaves: 1,
    armario: "",
    codigollave: "",
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

  // ------------------- Carga de estancias y préstamos -------------------
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
          // solo préstamos activos
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
    const estNueva = {
      codigo: nuevo.codigo,
      descripcion: nuevo.descripcion,
      totalllaves: Math.max(1, Number(nuevo.totalllaves) || 1),
      coordenadas: draw.coordenadas,
      armario: nuevo.armario,
      codigollave: nuevo.codigollave,
    };
    try {
      setCargando(true);
      setError("");
      const guardada = await apiGuardarEstancia(planta, estNueva);
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
      };
      setEstancias((prev) => {
        const i = prev.findIndex((e) => e.id === norma.id);
        if (i === -1) return [...prev, norma];
        const copia = prev.slice();
        copia[i] = norma;
        return copia;
      });
      // reseteamos despues de guardar
      setDraw({ activo: false, coordenadas: [] });
      setNuevo({ codigo: "", descripcion: "", totalllaves: 1 });
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

  const abrirModalLlaves = (estancia) => {
    const prestamosEstancia = prestamos.flatMap((p) =>
      p.prestamos
        .filter((pr) => pr.idestancia === estancia.id && !pr.fechadevolucion)
        .map((pr) => ({ ...pr, nombre: p.nombre }))
    );
    setModalLlaves({ open: true, estancia, prestamosEstancia });
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
  // Sacar todos los préstamos de todos los profesores en un array plano
  const prestamosPlanos = prestamos.flatMap((profesor) => profesor.prestamos);

  // Filtra los que no tienen devolución: son los préstamos activos.
  const prestamosActivos = prestamos.flatMap((profesor) =>
    profesor.prestamos
      .filter((p) => p.fechadevolucion === null)
      .map((p) => ({ ...p, profesor: profesor.nombre }))
  );

  return (
    <div style={{ padding: 12 }}>
      {/* Panel lateral y plano */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Plano */}
        <div
          ref={wrapperRef}
          style={{
            position: "relative",
            flex: 1,
            maxWidth: "1400px", // antes 1014px
            maxHeight: "1200px", // antes 860px
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
        <div style={{ width: 340 }}>
          {/* Préstamos */}
          <h3 style={{ margin: 0 }}>Préstamos activos</h3>
          <div style={{ marginTop: 8 }}>
            {prestamosActivos.length === 0 ? (
              <p style={{ color: "#6b7280" }}>No hay préstamos activos.</p>
            ) : (
              <ul style={{ paddingLeft: 0 }}>
                {prestamosActivos.map((p, i) => (
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
                      {estancias.find((e) => e.id === p.idestancia)?.codigo ||
                        p.codigoEstancia ||
                        p.idestancia}
                    </div>
                    <div style={{ fontSize: 13, color: "#374151" }}>
                      {p.codigoEstancia} · {p.unidades} llave(s) — {p.profesor}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <hr style={{ margin: "12px 0" }} />

          {/* Edición */}
          {user?.perfil === "administrador" && (
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
                      Código de la estancia
                    </label>
                    <input
                      placeholder="ej. Aula 1.01"
                      value={nuevo.codigo}
                      onChange={(e) =>
                        setNuevo((n) => ({ ...n, codigo: e.target.value }))
                      }
                    />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", fontSize: 13 }}>
                      Descripción
                    </label>
                    <input
                      placeholder="Ej: Aula de informática"
                      value={nuevo.descripcion}
                      onChange={(e) =>
                        setNuevo((n) => ({ ...n, descripcion: e.target.value }))
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
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", fontSize: 13 }}>
                      Código de la llave
                    </label>
                    <input
                      placeholder="Ej: Aula de informática"
                      value={nuevo.codigollave}
                      onChange={(e) =>
                        setNuevo((n) => ({ ...n, codigollave: e.target.value }))
                      }
                    />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", fontSize: 13 }}>
                      Llavera
                    </label>
                    <select
                      value={nuevo.armario}
                      onChange={(e) =>
                        setNuevo((n) => ({ ...n, armario: e.target.value }))
                      }
                    >
                      <option value="">Selecciona un armario</option>
                      <option value="Llavera 1">Llavera 1</option>
                      <option value="Llavera 2">Llavera 2</option>
                    </select>
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
          )}
        </div>
      </div>

      {/* Diálogos */}
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
