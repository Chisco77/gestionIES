/**
 * useGuardiasDia.jsx - Hook para obtener y simular el cuadrante de guardias diario.
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2026
 *
 * Descripción:
 * Hook basado en React Query para obtener la simulación de guardias
 * de una fecha concreta, cruzando ausencias con horarios lectivos.
 *
 * Uso:
 * const { data, isLoading } = useGuardiasDia("2026-04-14");
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useGuardiasDia(fechaFmt) {
  return useQuery({
    queryKey: ["guardias-dia", fechaFmt],
    queryFn: async () => {
      if (!fechaFmt) return null;

      const res = await fetch(`${API_BASE}/guardias/simular/${fechaFmt}`, {
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Error al simular las guardias");
      }

      // Devolvemos el objeto completo (que contiene el array 'simulacion')
      return result;
    },
    // Mantenemos los datos frescos pero permitimos refetch si es necesario
    staleTime: 1000 * 60 * 2, // 2 minutos
    enabled: !!fechaFmt,      // No ejecutar si no hay fecha
  });
}