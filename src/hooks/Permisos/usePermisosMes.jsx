// src/hooks/Asuntos/usePermisosMes.js
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function usePermisosMes({ month, year }) {
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const end = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;

  return useQuery({
    queryKey: ["permisosMes", start, end],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/permisos?fecha_inicio=${start}&fecha_fin=${end}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al cargar asuntos propios");
      const data = await res.json();
      return data.asuntos || [];
    },
    keepPreviousData: true, // opcional, evita parpadeo al cambiar de mes
  });
}
