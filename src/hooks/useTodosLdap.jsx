/**
 * useTodosLdap.jsx - Hook para obtener y cachear todos los usuarios de LDAP.
 *                        - Mejora rendimiento manteniendo los datos en caché
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
 * Hook personalizado basado en React Query para obtener los usuarios
 * tipo "teachers" desde el backend LDAP y mantenerlos en cache.
 *
 * Uso:
 * const { data: todos, isLoading, error } = useTodosLdap();
 *
 * Dependencias:
 * - @tanstack/react-query
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export function useTodosLdap() {
  return useQuery({
    queryKey: ["todos-ldap"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/ldap/usuarios?tipo=all`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Error al obtener los usuarios desde LDAP");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
