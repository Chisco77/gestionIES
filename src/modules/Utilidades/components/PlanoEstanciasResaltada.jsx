/**
 * PlanoEstanciaResaltada.jsx -
 */

import React, { useEffect, useRef, useState } from "react";
import { PLANOS } from "@/config/planos";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL || "";
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

async function parseListResponse(resp) {
  const j = await resp.json().catch(() => null);
  if (!j) throw new Error(`Respuesta no JSON (${resp.status})`);
  if (Array.isArray(j.estancias)) return j.estancias;
  if (Array.isArray(j.rows)) return j.rows;
  if (Array.isArray(j)) return j;
  return typeof j === "object" ? [j] : [];
}

async function apiListarEstancias(planta) {
  const url = `${API_BASE}/planos/estancias?planta=${encodeURIComponent(planta)}`;
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error(`Error listando estancias (${r.status})`);
  return parseListResponse(r);
}

export default function PlanoEstanciaResaltada({ estancia }) {
  const [estancias, setEstancias] = useState([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const imgRef = useRef(null);

  const planta = estancia?.planta || "baja";
  const plano = PLANOS[planta] ?? PLANOS.baja;
  const svgUrl = `${import.meta.env.BASE_URL}${plano.svg}`;

  // SOLUCIÓN AL ERROR: Definimos la variable que faltaba
  const idEstancia = estancia?.id;

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (imgRef.current) {
        setSize({
          w: imgRef.current.clientWidth,
          h: imgRef.current.clientHeight,
        });
      }
    });
    if (imgRef.current) ro.observe(imgRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const data = await apiListarEstancias(planta);
        if (!cancelado) setEstancias(data);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [planta]);

  const polyToPath = (pts) =>
    pts
      .map((p, i) => (i ? `L ${p[0]} ${p[1]}` : `M ${p[0]} ${p[1]}`))
      .join(" ") + " Z";

  const scalePoints = (pts) => pts.map(([x, y]) => [x * size.w, y * size.h]);

  return (
    <div className="relative w-full h-full min-h-0 flex flex-col overflow-hidden">
      {/* Contenedor que encoge la imagen según altura disponible */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
        <img
          ref={imgRef}
          src={svgUrl}
          alt={`Plano ${planta}`}
          onLoad={() => {
            if (imgRef.current) {
              setSize({
                w: imgRef.current.clientWidth,
                h: imgRef.current.clientHeight,
              });
            }
          }}
          className="max-w-full max-h-full w-auto h-auto object-contain opacity-80"
          style={{ display: "block" }}
        />

        {/* Capa de dibujo centrada exactamente sobre la imagen reescalada */}
        {size.w > 0 && (
          <svg
            className="absolute pointer-events-none"
            style={{
              width: size.w,
              height: size.h,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {estancias.map((s) => {
              const absPts = scalePoints(
                s.coordenadas || s.coordenadas_json || []
              );
              const isSelected = s.id === idEstancia;
              if (absPts.length === 0) return null;

              return (
                <g key={s.id}>
                  {isSelected && (
                    <path
                      d={polyToPath(absPts)}
                      fill="rgba(59, 130, 246, 0.3)"
                      className="animate-pulse"
                    />
                  )}
                  <path
                    d={polyToPath(absPts)}
                    fill={
                      isSelected
                        ? "rgba(59, 130, 246, 0.4)"
                        : "rgba(226, 232, 240, 0.1)"
                    }
                    stroke={isSelected ? "#2563eb" : "#94a3b8"}
                    strokeWidth={isSelected ? 3 : 1}
                    strokeDasharray={isSelected ? "none" : "4 2"}
                  />
                </g>
              );
            })}
          </svg>
        )}

        <Badge
          variant="secondary"
          className="absolute top-2 right-2 bg-white/80 text-[9px] uppercase font-mono"
        >
          Planta {planta}
        </Badge>
      </div>

      {/* Leyenda que ahora sí debería verse siempre */}
      <div className="flex items-center justify-center gap-6 py-2 shrink-0 border-t bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[10px] font-bold text-blue-700 uppercase">
            {estancia?.descripcion || "Seleccionada"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 italic font-medium">
          <div className="w-3 h-3 rounded bg-slate-100 border border-slate-300 border-dashed" />
          <span>Otras</span>
        </div>
      </div>
    </div>
  );
}
