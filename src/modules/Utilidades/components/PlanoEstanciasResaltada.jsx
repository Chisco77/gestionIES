import React, { useEffect, useRef, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { usePlanos } from "@/hooks/usePlanos"; // Tu hook de planos dinámicos

const API_URL = import.meta.env.VITE_API_URL || "";
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

// Función de ayuda para obtener estancias por ID de plano
async function apiListarEstanciasPorPlano(idplano) {
  const url = `${API_BASE}/planos/${idplano}/estancias`;
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error(`Error listando estancias (${r.status})`);
  const data = await r.json();
  return Array.isArray(data) ? data : data.rows || [];
}

export default function PlanoEstanciaResaltada({ estancia }) {
  const { data: listaPlanos = [] } = usePlanos();
  const [estancias, setEstancias] = useState([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const imgRef = useRef(null);

  // 1. Buscamos el plano correspondiente al idplano de la estancia
  const planoActual = useMemo(() => {
    return listaPlanos.find((p) => p.id === estancia?.idplano);
  }, [listaPlanos, estancia?.idplano]);

  const svgUrl = planoActual?.svgUrl || "";
  const idEstanciaSeleccionada = estancia?.id;

  // Carga de todas las estancias del mismo plano para dibujarlas de fondo
  useEffect(() => {
    if (!estancia?.idplano) return;

    let cancelado = false;
    (async () => {
      try {
        const data = await apiListarEstanciasPorPlano(estancia.idplano);
        if (!cancelado) setEstancias(data);
      } catch (e) {
        console.error("Error cargando estancias del plano:", e);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [estancia?.idplano]);

  // Observer para reescalado
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

  const polyToPath = (pts) =>
    pts
      .map((p, i) => (i ? `L ${p[0]} ${p[1]}` : `M ${p[0]} ${p[1]}`))
      .join(" ") + " Z";

  const scalePoints = (pts) => pts.map(([x, y]) => [x * size.w, y * size.h]);

  return (
    <div className="relative w-full h-full min-h-0 flex flex-col overflow-hidden">
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
        {svgUrl ? (
          <img
            ref={imgRef}
            src={svgUrl}
            alt={planoActual?.label}
            onLoad={() => {
              setSize({
                w: imgRef.current.clientWidth,
                h: imgRef.current.clientHeight,
              });
            }}
            className="max-w-full max-h-full w-auto h-auto object-contain opacity-60"
          />
        ) : (
          <p className="text-slate-400 italic text-sm">Cargando plano...</p>
        )}

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
                s.coordenadas_json || s.coordenadas || []
              );
              const isSelected = s.id === idEstanciaSeleccionada;
              if (absPts.length === 0) return null;

              return (
                <g key={s.id}>
                  {isSelected && (
                    <path
                      d={polyToPath(absPts)}
                      className="fill-blue-500/30 animate-pulse"
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

        {planoActual && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-white/80 text-[9px] uppercase font-mono border-slate-300"
          >
            {planoActual.label}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 py-3 shrink-0 border-t bg-slate-50/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
            {estancia?.codigo || "Seleccionada"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 italic font-medium uppercase tracking-tight">
          <div className="w-3 h-3 rounded bg-slate-100 border border-slate-300 border-dashed" />
          <span>Resto de la planta</span>
        </div>
      </div>
    </div>
  );
}
