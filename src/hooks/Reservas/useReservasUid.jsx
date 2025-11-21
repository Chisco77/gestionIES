// hooks/useReservasUid.js
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

// Saber si una reserva no ha terminado
const esReservaFutura = (reserva) => {
  const ahora = new Date();

  const fecha = new Date(reserva.fecha);
  const [hh, mm] = (reserva.hora_fin || "23:59").split(":").map(Number);
  fecha.setHours(hh, mm, 0, 0);

  return fecha >= ahora;
};
export function useReservasUid(uid) {
  return useQuery({
    queryKey: ["reservas", "uid", uid],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/reservas-estancias/filtradas?uid=${uid}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Error cargando reservas de aulas");

      const data = await res.json();

      // la estructura es: { ok, periodos, estancias, reservas }
      const reservas = Array.isArray(data.reservas) ? data.reservas : [];

      // solo reservas futuras
      return reservas.filter(esReservaFutura);
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });
}
