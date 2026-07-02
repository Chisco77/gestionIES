import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export function useCursos() {
  return useQuery({
    queryKey: ["cursos"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/db/cursos`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener los cursos");
      return await res.json(); // Nos devolverá un array de objetos ej: { id: "1", curso: "1º ESO" }
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}