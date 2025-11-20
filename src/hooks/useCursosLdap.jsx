/**
 * useCursosLdap.jsx - Hook para obtener y cachear cursos LDAP.
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
 * Hook personalizado basado en React Query para obtener los grupos
 * LDAP del tipo "school_class" y mantenerlos en caché.
 *
 * Uso:
 * const { data: cursos, isLoading, error } = useCursosLdap();
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export function useCursosLdap() {
  return useQuery({
    queryKey: ["ldap-cursos"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/ldap/grupos?groupType=school_class`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al obtener los cursos desde LDAP");
      }

      const data = await res.json();

      return data
        .map((c) => ({ gid: c.gidNumber, nombre: c.cn }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
