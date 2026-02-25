import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

const fetchNotificaciones = async () => {
  const res = await fetch(`${API_BASE}/directiva/pendientes`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error cargando notificaciones");

  const data = await res.json(); // resolver la promesa
  return data;
};

export function useNotificaciones() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["notificacionesDirectiva"],
    queryFn: fetchNotificaciones,
    refetchInterval: 60000, // refresca cada minuto
    staleTime: 30000,       // 30s antes de considerar los datos "viejos"
  });

  // Totales correctamente mapeados
  const permisos = data?.permisos?.total || 0;
  const extraescolares = data?.extraescolares?.total || 0;
  const total = data?.total || 0;

  return {
    permisos,
    extraescolares,
    total,
    isLoading,
    isError,
    error,
    refetch, // opcional
  };
}