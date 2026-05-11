// frontend/src/hooks/useReservas.jsx

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useReservas() {
  return useQuery({
    //  el "curso actual" es el contexto por defecto.
    queryKey: ["reservas", "curso-actual"],
    queryFn: async () => {
      // Llamamos a /reservas-estancias a secas.
      // El backend aplicará automáticamente el filtro del curso actual.
      const res = await fetch(`${API_BASE}/reservas-estancias`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error cargando reservas de estancias");

      const data = await res.json();
      return data.reservas || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
