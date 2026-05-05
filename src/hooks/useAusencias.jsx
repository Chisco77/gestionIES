/**
 * useAusencias.jsx - Hook para obtener las ausencias enriquecidas
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useAusencias(filtros = {}) {
  return useQuery({
    queryKey: ["ausencias", filtros],
    queryFn: async () => {
      // Construir query string si hay filtros
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params.append(key, value);
      });

      const queryString = params.toString() ? `?${params.toString()}` : "";
      
      const res = await fetch(`${API_BASE}/ausencias-enriquecidas${queryString}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error obteniendo las ausencias");
      }

      const data = await res.json();
      const lista = data.ausencias || [];

      console.log ("Lista del hook: ", lista);

      // Normalización para asegurar tipos consistentes en la tabla
      return lista.map((a) => ({
        ...a,
        id: Number(a.id),
        idperiodo_inicio: a.idperiodo_inicio ? Number(a.idperiodo_inicio) : null,
        idperiodo_fin: a.idperiodo_fin ? Number(a.idperiodo_fin) : null,
        idpermiso: a.idpermiso ? Number(a.idpermiso) : null,
        // Las fechas vienen como 'YYYY-MM-DD' del backend (TO_CHAR), las dejamos así
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}