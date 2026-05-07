// src/hooks/Asuntos/usePermisosMes.js
/*import { useQuery } from "@tanstack/react-query";

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
*/

// src/hooks/Asuntos/usePermisosMes.js
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function usePermisosMes({ month, year }) {
  // Calculamos el primer y último día del mes
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const end = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;

  return useQuery({
    // La clave depende del rango exacto para que al cambiar de mes se refresque
    queryKey: ["permisos", "calendario", start, end],
    queryFn: async () => {
      // Pasamos fecha_inicio y fecha_fin para "saltarnos" el filtro por defecto del curso en el backend
      const res = await fetch(
        `${API_BASE}/permisos?fecha_inicio=${start}&fecha_fin=${end}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Error al cargar asuntos propios del mes");
      const data = await res.json();
      return data.asuntos || [];
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 10, // Los permisos pasados no cambian a menudo
  });
}
