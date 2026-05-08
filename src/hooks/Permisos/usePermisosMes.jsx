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
  // 1. Verificamos que existan datos válidos
  const isDataReady = typeof month === "number" && typeof year === "number";

  console.log("Month: ", month);
  console.log("Year: ", year);
  
  // 2. Calculamos fechas solo si tenemos los datos
  // Usamos month + 1 porque JS cuenta meses de 0 a 11, pero la API quiere 01 a 12
  const start = isDataReady
    ? `${year}-${String(month + 1).padStart(2, "0")}-01`
    : null;

  const end = isDataReady
    ? `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`
    : null;

  return useQuery({
    queryKey: ["permisos", "calendario", start, end],
    queryFn: async () => {
      if (!start || !end) return [];

      const res = await fetch(
        `${API_BASE}/permisos?fecha_inicio=${start}&fecha_fin=${end}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Error al cargar asuntos propios del mes");
      const data = await res.json();
      return data.asuntos || [];
    },
    // Si no hay fechas, la query no se dispara
    enabled: !!start && !!end,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 10,
  });
}
