/**
 * useMaterias.jsx
 * ------------------------------------------------------------
 * Hook para obtener y cachear materias desde la API.
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export function useMaterias() {
  return useQuery({
    queryKey: ["materias"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/db/materias`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener las materias");
      const data = await res.json();
      // Formateamos si es necesario
      return data.sort((a, b) => a.nombre.localeCompare(b.nombre));
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}