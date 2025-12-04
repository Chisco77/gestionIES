// hooks/usePermisosPropios.js
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function usePermisosUid(uid) {
  return useQuery({
    queryKey: ["panel", "permisos", uid],
    queryFn: async () => {
      // Tu código original lee text y hace JSON.parse por si viene mal formado.
      const res = await fetch(`${API_BASE}/permisos?uid=${uid}`, {
        credentials: "include",
      });

      if (!res.ok) {
        // si el servidor responde 204 o similar, tratamos como array vacío
        if (res.status === 204) return [];
        throw new Error("Error cargando asuntos propios");
      }

      const text = await res.text();
      if (!text) return []; // respuesta vacía -> array vacío

      try {
        const data = JSON.parse(text);
        // PanelReservas usa data.asuntos
        return Array.isArray(data?.asuntos) ? data.asuntos : [];
      } catch (err) {
        console.error("usePermisosPropios: error parseando JSON:", err, "texto:", text);
        // fallback: intentar usar res.json (por si acaso)
        try {
          const fallback = await (await fetch(`${API_BASE}/permisos?uid=${uid}`, { credentials: "include" })).json();
          return Array.isArray(fallback?.asuntos) ? fallback.asuntos : [];
        } catch (err2) {
          // si seguimos sin poder, devolvemos array vacío
          return [];
        }
      }
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });
}
