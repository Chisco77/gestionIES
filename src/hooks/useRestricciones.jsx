/**
 * useRestriccionesAsuntos.jsx - Hook para obtener y cachear restricciones.
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
 * Hook basado en React Query para obtener las restricciones
 * del módulo de asuntos propios desde el backend y mantenerlas
 * en caché.
 *
 * Uso:
 * const { data: restricciones, isLoading } = useRestriccionesAsuntos();
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useRestriccionesAsuntos() {
  return useQuery({
    queryKey: ["restricciones_asuntos"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/restricciones/asuntos`, {
        credentials: "include",
      });

      if (!res.ok)
        throw new Error("Error obteniendo las restricciones de asuntos");

      const data = await res.json();

      // Devolver directamente el array de filas
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
}
