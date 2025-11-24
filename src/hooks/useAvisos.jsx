/**
 * useAvisos.jsx - Hook para obtener y cachear avisos.
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
 * Hook basado en React Query para obtener los avisos desde el
 * backend y mantenerlos en caché. Permite filtrar por módulo.
 *
 * Uso:
 * const { data: avisos, isLoading } = useAvisos();               // todos
 * const { data: avisosExtra } = useAvisos("extraescolares");    // filtrados
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useAvisos() {
  return useQuery({
    queryKey: ["avisos"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/avisos`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error obteniendo los avisos");

      const data = await res.json();

      // Normalización ligera opcional
      return (data || []).map((a) => ({
        id: Number(a.id),
        modulo: a.modulo,
        emails: Array.isArray(a.emails) ? a.emails : [],
      }));
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
