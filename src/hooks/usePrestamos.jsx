// src/hooks/usePrestamosAlumnos.js
/*import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export function usePrestamosAlumnos() {
  return useQuery({
    queryKey: ["prestamos-alumnos"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/db/prestamos/agrupados?esalumno=true`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Error al obtener los préstamos de alumnos");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}*/

// src/hooks/usePrestamos.js
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

