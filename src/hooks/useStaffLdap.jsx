/**
 * useStaffesLdap.jsx - Hook para obtener y cachear profesores LDAP.
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
 * const { data: profesores, isLoading, error } = useProfesoresLdap();
 *
 * Dependencias:
 * - @tanstack/react-query
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
// Login externo o interno

export function useStaffLdap() {
  return useQuery({
    queryKey: ["staff-ldap"],
    queryFn: async () => {
      // Traemos los profesores desde LDAP
      const res = await fetch(`${API_URL}/ldap/usuarios?tipo=staff`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener personal no docente desde LDAP");
      const staffLDAP = await res.json();

      // Para cada profesor, traemos los datos de empleados
      const staffEnriquecidos = await Promise.all(
        staffLDAP.map(async (empleado) => {
          try {
            const resEmp = await fetch(`${API_URL}/db/empleados/${empleado.uid}`, {
              credentials: "include",
            });
            if (!resEmp.ok) return empleado; // si no existe, devolvemos solo LDAP
            const empleado = await resEmp.json();
            return { ...empleado, ...empleado };
          } catch {
            return empleado; // en caso de error, devolvemos solo LDAP
          }
        })
      );

      return staffEnriquecidos;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}