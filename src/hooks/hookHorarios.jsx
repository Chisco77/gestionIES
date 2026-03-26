// hooks/useHorarioProfesorado.jsx
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useHorarioProfesorado(filtros = {}, enabled = false) {
  return useQuery({
    queryKey: ["horario-profesorado", filtros],
    queryFn: async () => {
      const params = new URLSearchParams();
      // Si recibimos un array de UIDs, los añadimos uno a uno (el backend espera ?uid=...&uid=...)
      if (Array.isArray(filtros.uid)) {
        filtros.uid.forEach(u => params.append("uid", u));
      }
      if (filtros.curso_academico) params.append("curso_academico", filtros.curso_academico);
      if (filtros.dia_semana) params.append("dia_semana", filtros.dia_semana);

      const res = await fetch(`${API_BASE}/horario-profesorado/enriquecido?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error obteniendo horarios");
      const data = await res.json();
      return data.horario || [];
    },
    enabled: enabled && !!filtros.curso_academico, // Solo se dispara cuando lo necesitemos
  });
}