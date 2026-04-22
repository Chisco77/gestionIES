/**
 * useGuardias.jsx - Hook para obtener las guardias asignadas enriquecidas
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useGuardias(filtros = {}) {
  return useQuery({
    queryKey: ["guardias", filtros],
    queryFn: async () => {
      // 1. Construir query string para filtros (por ejemplo: uid_profesor_cubridor, fecha, etc.)
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const queryString = params.toString() ? `?${params.toString()}` : "";
      
      // Asumimos que el endpoint en el backend es /guardias-enriquecidas
      // Este endpoint debería devolver los JOINs con periodos y nombres de profesores
      const res = await fetch(`${API_BASE}/guardias-enriquecidas${queryString}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error obteniendo el histórico de guardias");
      }

      const data = await res.json();
      const lista = data.guardias || [];

      // 2. Normalización de los datos recibidos del backend
      return lista.map((g) => ({
        ...g,
        id: Number(g.id),
        idperiodo: Number(g.idperiodo),
        idausencia: g.idausencia ? Number(g.idausencia) : null,
        confirmada: Boolean(g.confirmada),
        forzada: Boolean(g.forzada),
        generada_automaticamente: Boolean(g.generada_automaticamente),
        // Nos aseguramos de que existan los campos para evitar errores en las columnas
        periodo_nombre: g.periodo_nombre || `Periodo ${g.idperiodo}`,
        periodo_inicio: g.periodo_inicio || "--:--",
        periodo_fin: g.periodo_fin || "--:--",
        nombre_ausente: g.nombre_ausente || g.uid_profesor_ausente,
        nombre_cubridor: g.nombre_cubridor || g.uid_profesor_cubridor,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
    refetchOnWindowFocus: false, // Opcional: evita recargas innecesarias al cambiar de pestaña
  });
}