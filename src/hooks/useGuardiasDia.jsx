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

// Ahora recibe un segundo objeto opcional con el token y el intervalo de refresco
export function useGuardiasDia(fechaFmt, options = {}) {
  const { tokenTV = null, refetchInterval = false } = options;

  return useQuery({
    queryKey: ["guardias-dia", fechaFmt],
    queryFn: async () => {
      if (!fechaFmt) return null;

      const headers = {
        "Content-Type": "application/json",
      };

      // Si existe tokenTV, lo inyectamos en la cabecera para el backend
      if (tokenTV && tokenTV !== "null" && tokenTV !== "undefined") {
        headers["x-public-token"] = tokenTV;
      }

      const res = await fetch(`${API_BASE}/guardias/simular/${fechaFmt}`, {
        method: "GET",
        headers: headers,
        credentials: "include", // Importante para mantener la sesión LDAP en navegadores normales
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Error al simular las guardias");
      }

      return result;
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!fechaFmt,
    // Si estamos en modo TV, React Query refrescará los datos automáticamente
    refetchInterval: refetchInterval,
  });
}
