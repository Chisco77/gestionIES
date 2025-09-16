/**
 * usePrestamos.jsx - Hook para obtener y cachear préstamos de libros.
 *                   - Mejora rendimiento manteniendo los datos en caché
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Hook personalizado basado en React Query para obtener los préstamos
 * agrupados de alumnos o profesores desde el backend y mantenerlos en cache.
 *
 * Uso:
 * const { data: prestamos, isLoading, error } = usePrestamos({ esAlumno: true });
 *
 * Dependencias:
 * - @tanstack/react-query
 */


import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export function usePrestamos({ esAlumno = true }) {
  return useQuery({
    queryKey: ["prestamos", esAlumno],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/db/prestamos/agrupados?esalumno=${esAlumno}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Error al obtener los préstamos de ${esAlumno ? "alumnos" : "profesores"}`);
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

