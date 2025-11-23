// src/hooks/Asuntos/useAsuntosTodos.jsx
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useAsuntosTodos() {
  return useQuery({
    queryKey: ["asuntosPropios", "todos"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/asuntos-propios-enriquecidos`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al cargar todos los asuntos propios");
      const data = await res.json();
      return data.asuntos || [];
    },
    staleTime: 1000 * 60 * 5, // opcional, 5 min antes de refetch
  });
}
