// hooks/useReservas.js
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

/**
 * Hook para obtener todas las reservas de estancias.
 * No filtra por usuario.
 */
export function useReservas() {
  return useQuery({
    queryKey: ["reservas", "todas"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/reservas-estancias`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error cargando reservas de aulas");
      const data = await res.json();
      return Array.isArray(data) ? data : []; // según lo que devuelva tu backend
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
