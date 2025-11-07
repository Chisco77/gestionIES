// useReservasPanel.jsx
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useReservasPanel(uid) {
  return useQuery({
    queryKey: ["reservasPanel", uid],
    queryFn: async () => {
      if (!uid) return {
        reservasEstancias: [],
        asuntosPropios: [],
        actividadesExtraescolares: [],
        estancias: [],
        periodos: [],
      };

      const [resReservas, resEstancias, resPeriodos] = await Promise.all([
        fetch(`${API_BASE}/panel/reservas?uid=${uid}`, { credentials: "include" }),
        fetch(`${API_BASE}/estancias`, { credentials: "include" }),
        fetch(`${API_BASE}/periodos-horarios`, { credentials: "include" }),
      ]);

      if (!resReservas.ok) throw new Error("Error al obtener reservas del panel");
      if (!resEstancias.ok) throw new Error("Error al obtener estancias");
      if (!resPeriodos.ok) throw new Error("Error al obtener periodos");

      const dataReservas = await resReservas.json();
      const dataEstancias = await resEstancias.json();
      const dataPeriodos = await resPeriodos.json();

      return {
        reservasEstancias: dataReservas.reservasEstancias || [],
        asuntosPropios: dataReservas.asuntosPropios || [],
        actividadesExtraescolares: dataReservas.actividadesExtraescolares || [],
        estancias: Array.isArray(dataEstancias) ? dataEstancias : [],
        periodos: dataPeriodos?.periodos ?? [],
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
}
