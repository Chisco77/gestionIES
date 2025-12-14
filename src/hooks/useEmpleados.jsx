/**
 * useEmpleados.jsx - Hook para obtener y cachear todos los empleados
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Descripción:
 * Hook basado en React Query para obtener todos los empleados
 * desde la base de datos PostgreSQL y mantenerlos en caché.
 *
 * Uso:
 * const { data: empleados, isLoading, refetch } = useEmpleados();
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useEmpleados() {
  return useQuery({
    queryKey: ["empleados"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/empleados`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error obteniendo los empleados");

      const data = await res.json();

      // Normalización ligera: asegurar tipos y valores por defecto
      return (data || []).map((e) => ({
        uid: e.uid,
        tipo_usuario: Number(e.tipo_usuario ?? 0),
        dni: e.dni ?? "",
        asuntos_propios: Number(e.asuntos_propios ?? 0),
        tipo_empleado: e.tipo_empleado ?? "",
        jornada: Number(e.jornada ?? 0),
      }));
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
