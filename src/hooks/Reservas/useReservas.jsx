/**
 * Hook para obtener todas las reservas de estancias
 * filtradas por el curso académico actual
 */

/*import { useQuery } from "@tanstack/react-query";
import { getCursoActual, ddmmyyyyToISO } from "@/utils/fechasHoras"


const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";


export function useReservas() {
  const { inicioCurso, finCurso, label } = getCursoActual()

  const fechaDesde = ddmmyyyyToISO(inicioCurso)
  const fechaHasta = ddmmyyyyToISO(finCurso)


  return useQuery({
    queryKey: ["reservas", "curso", label],
    queryFn: async () => {
      const params = new URLSearchParams({
        fechaDesde,
        fechaHasta,
      })

      const res = await fetch(
        `${API_BASE}/reservas-estancias?${params.toString()}`,
        { credentials: "include" }
      )

      if (!res.ok) throw new Error("Error cargando reservas de estancias")

      const data = await res.json()
      return data.reservas || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}*/

// frontend/src/hooks/useReservas.jsx

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useReservas() {
  return useQuery({
    // La queryKey puede ser simple ahora,
    // ya que el "curso actual" es el contexto por defecto.
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
