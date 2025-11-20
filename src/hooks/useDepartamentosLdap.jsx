/**
 * useDepartamentosLdap.jsx - Hook para obtener y cachear departamentos LDAP.
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
 * LDAP del tipo "school_department" y mantenerlos en caché.
 *
 * Uso:
 * const { data: departamentos, isLoading, error } = useDepartamentosLdap();
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export function useDepartamentosLdap() {
  return useQuery({
    queryKey: ["ldap-departamentos"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/ldap/grupos?groupType=school_department`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al obtener los departamentos desde LDAP");
      }

      const data = await res.json();

      // Transformación y ordenación
      return data
        .map((d) => ({ gidNumber: d.gidNumber, nombre: d.cn }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
    },
    staleTime: 1000 * 60 * 60, // 1 hora (ideal para datos poco cambiantes)
  });
}
