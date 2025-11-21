// hooks/useExtraescolaresUid.jsx
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useExtraescolaresUid(uid) {
  return useQuery({
    queryKey: ["extraescolares", "uid", uid],
    queryFn: async () => { 
      const res = await fetch(`${API_BASE}/extraescolares/enriquecidos?uid=${uid}`, {
        credentials: "include",
      });

      // 204 = sin actividades
      if (res.status === 204) return [];

      if (!res.ok) {
        throw new Error("Error cargando actividades extraescolares");
      }

      const data = await res.json();

      // Estructuras posibles
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.actividades)) return data.actividades;
      if (Array.isArray(data?.extraescolares)) return data.extraescolares;

      // Fallback
      return [];
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });
}
