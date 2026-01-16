import { useQuery } from "@tanstack/react-query";

export function useAsuntosPermitidosUid(uid) {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

  return useQuery({
    queryKey: ["asuntos_permitidos", uid],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/asuntos-permitidos?uid=${uid}`, {
        credentials: "include",
      });

      if (!res.ok) {
        // si el servidor responde 204 o similar, devolvemos array vacío
        if (res.status === 204) return [];
        throw new Error("Error al obtener permisos especiales");
      }

      const text = await res.text();
      if (!text) return [];

      try {
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("useAsuntosPermitidosUid: error parseando JSON:", err, "texto:", text);
        return [];
      }
    },
    enabled: !!uid,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
