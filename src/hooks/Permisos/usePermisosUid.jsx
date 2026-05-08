// hooks/usePermisosUid.js
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function usePermisosUid(uid) {
  return useQuery({
    // Incluimos "curso-actual" para que la caché se limpie al cambiar de año escolar
    queryKey: ["panel", "permisos", uid, "curso-actual"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/permisos?uid=${uid}`, {
        credentials: "include",
      });

      if (res.status === 204) return [];
      if (!res.ok) throw new Error("Error cargando permisos");

      try {
        const data = await res.json();
        return Array.isArray(data?.asuntos) ? data.asuntos : [];
      } catch (err) {
        console.error("Error parseando JSON de permisos:", err);
        return [];
      }
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });
}
