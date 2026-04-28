/**
 * usePlanos.jsx - Hook para gestionar los planos del centro.
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Descripción:
 * Hook basado en React Query para recuperar la lista de planos
 * dinámicos desde la base de datos.
 *
 * Uso:
 * const { data: planos, isLoading } = usePlanos();
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function usePlanos() {
  return useQuery({
    queryKey: ["planos-centro"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/planos`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error obteniendo la lista de planos");
      }

      const data = await res.json();
      
      // Aseguramos que devolvemos un array y normalizamos campos si fuera necesario
      return data.map(p => ({
        id: p.id,
        label: p.label,
        svgUrl: p.svg_url, // Usamos camelCase para seguir la convención de JS
        orden: p.orden || 0,
        activo: p.activo ?? true
      }));
    },
    // Configuraciones de caché
    staleTime: 1000 * 60 * 30, // 30 minutos (los planos no cambian a menudo)
    gcTime: 1000 * 60 * 60,    // 1 hora de persistencia en caché
    retry: 1,
    refetchOnWindowFocus: false,
  });
}