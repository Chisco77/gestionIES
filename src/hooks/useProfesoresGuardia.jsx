import { useQuery } from "@tanstack/react-query";

export function useProfesoresGuardia(fechaFmt, idPeriodo) {
  return useQuery({
    queryKey: ["profes-guardia", fechaFmt, idPeriodo],
    queryFn: async () => {
      if (!fechaFmt || !idPeriodo) return [];
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/db/guardias/disponibles/${fechaFmt}/${idPeriodo}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Error al obtener profes de guardia");
      return res.json();
    },
    enabled: !!fechaFmt && !!idPeriodo,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}