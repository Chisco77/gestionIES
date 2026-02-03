// src/hooks/Reservas/useReservasPeriodicasTodas.js
import { useQuery } from "@tanstack/react-query";

export function useReservasPeriodicasTodas() {
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

  return useQuery({
    queryKey: ["reservas-periodicas-directiva"],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/reservas-estancias/repeticiones/enriquecidas`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error obteniendo reservas");
      console.log ("Reservas periódicas:", data.reservas);
      return data.reservas ?? [];
    },
  });
}
