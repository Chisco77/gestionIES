// hooks/Reservas/useReservasDelDia.jsx
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

/**
 * Obtiene las reservas del día filtrando por tipo de estancia.
 * Este hook sustituye al old fetchReservasDia().
 */
export function useReservasDelDia(fecha, tipoEstancia) {
  return useQuery({
    queryKey: ["reservas", "dia", fecha, tipoEstancia],
    queryFn: async () => {
      if (!tipoEstancia) {
        return {
          periodos: [],
          reservas: [],
          estancias: [],
        };
      }

      const res = await fetch(
        `${API_BASE}/reservas-estancias/filtradas?fecha=${fecha}&tipoestancia=${tipoEstancia}&reservable=true`,
        { credentials: "include" }
      );

      if (!res.ok)
        throw new Error("Error obteniendo reservas del día");

      const data = await res.json();

      return {
        periodos: data.periodos?.map((p) => ({ ...p, id: Number(p.id) })) ?? [],
        reservas: data.reservas ?? [],
        estancias: data.estancias?.map((e) => ({
          ...e,
          tipo: e.tipoestancia,
        })) ?? [],
      };
    },
    enabled: !!fecha && tipoEstancia !== undefined,
    staleTime: 1000 * 30, // 30s está bien para datos cambiantes
  });
}
