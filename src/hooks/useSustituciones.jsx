/**
 * useSustituciones.jsx - Hook para gestionar el histórico de sustituciones (bajas)
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useSustituciones(filtros = {}) {
  return useQuery({
    // La clave incluye los filtros para invalidar la caché automáticamente si cambian
    queryKey: ["sustituciones", "curso-actual", filtros],

    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const res = await fetch(`${API_BASE}/sustituciones${queryString}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Error obteniendo el listado de sustituciones",
        );
      }

      const data = await res.json();
      const lista = data.sustituciones || [];

      // Normalización de datos para la UI
      return lista.map((s) => ({
        ...s,
        id: Number(s.id),
        // Si fecha_fin es null, el titular sigue de baja (Sustitución Activa)
        activa: !s.fecha_fin,
        // Nombres amigables para las columnas de la tabla
        nombreTitular: s.nombreTitular || s.uid_titular,
        nombreSustituto: s.nombreSustituto || s.uid_sustituto,
        // Aseguramos formato string para las fechas (vienen como YYYY-MM-DD)
        fecha_inicio: s.fecha_inicio,
        fecha_fin: s.fecha_fin || null,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
    refetchOnWindowFocus: false,
  });
}
