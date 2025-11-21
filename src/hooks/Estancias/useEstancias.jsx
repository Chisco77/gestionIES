// hooks/useEstancias.js
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useEstancias() {
  return useQuery({
    queryKey: ["estancias"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/estancias`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error cargando estancias");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos (catálogo)
  });
}
