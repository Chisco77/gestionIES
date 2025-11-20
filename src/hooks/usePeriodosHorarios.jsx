/**
 * usePeriodosHorarios.jsx - Hook para obtener y cachear periodos horarios.
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
 * Hook basado en React Query para obtener los periodos
 * horarios del backend y mantenerlos en cache.
 *
 * Uso:
 * const { data: periodos, isLoading } = usePeriodosHorarios();
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function usePeriodosHorarios() {
  return useQuery({
    queryKey: ["periodos-horarios"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/periodos-horarios`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error obteniendo los periodos horarios");

      const data = await res.json();

      return (data.periodos || []).map((p) => ({
        id: Number(p.id),
        nombre: p.nombre,
      }));
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}
