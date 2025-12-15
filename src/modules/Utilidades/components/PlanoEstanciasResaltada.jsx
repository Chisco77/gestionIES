/**
 * PlanoEstanciaResaltada.jsx
 *
 * Muestra el plano SVG de una planta, con una estancia resaltada en color.
 */

import React, { useEffect, useRef, useState } from "react";
import { PLANOS } from "@/config/planos";


const API_URL = import.meta.env.VITE_API_URL || "";
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

// ------------------- API -------------------
async function parseListResponse(resp) {
  const j = await resp.json().catch(() => null);
  if (!j) throw new Error(`Respuesta no JSON (${resp.status})`);
  if (Array.isArray(j.estancias)) return j.estancias;
  if (Array.isArray(j.rows)) return j.rows;
  if (Array.isArray(j)) return j;
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

// ------------------- Componente -------------------
export default function PlanoEstanciaResaltada({ estancia }) {
  const [estancias, setEstancias] = useState([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const imgRef = useRef(null);
  const wrapperRef = useRef(null);

  /*const planta = estancia?.planta || "baja";
  const svgUrl =
    planta === "primera"
      ? `${import.meta.env.BASE_URL}PLANTA_PRIMERA.svg`
      : planta === "segunda"
        ? `${import.meta.env.BASE_URL}PLANTA_SEGUNDA.svg`
        : `${import.meta.env.BASE_URL}PLANTA_BAJA.svg`;*/

  const planta = estancia?.planta || "baja";
  const plano = PLANOS[planta] ?? PLANOS.baja;

  const svgUrl = `${import.meta.env.BASE_URL}${plano.svg}`;

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
  }, []);

  // Cargar estancias de esa planta
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

  const idEstancia = estancia?.id;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #e5e7eb",
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
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {size.w > 0 &&
          size.h > 0 &&
          estancias.map((s) => {
            const absPts = scalePoints(
              s.coordenadas || s.coordenadas_json || []
            );
            const isSelected = s.id === idEstancia;

            const strokeColor = isSelected ? "#15803d" : "#94a3b8";
            const strokeWidth = isSelected ? 3 : 1;

            return (
              <path
                key={s.id}
                d={polyToPath(absPts)}
                fill={
                  isSelected ? "rgba(34,197,94,0.5)" : "rgba(148,163,184,0.25)"
                }
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              >
                {isSelected && (
                  <animate
                    attributeName="fill-opacity"
                    values="0.3;0.6;0.3"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
            );
          })}
      </svg>
    </div>
  );
}
