// useProfesoresStaff.jsx
import { useMemo, useCallback } from "react";
import { useProfesoresLdap } from "./useProfesoresLdap";
import { useStaffLdap } from "./useStaffLdap";

/**
 * Hook que devuelve todos los usuarios activos (profesores y staff)
 * Filtra automáticamente los que tengan baja = true
 * Optimizado para evitar re-renderizados innecesarios y loops infinitos
 */
export function useProfesoresStaff() {
  const { data: profesores = [], ...restProfesores } = useProfesoresLdap();
  const { data: staff = [], ...restStaff } = useStaffLdap();

  // Memoizamos la combinación de profesores y staff activos
  const activos = useMemo(() => {
    if (!profesores.length && !staff.length) return [];
    return [...profesores, ...staff].filter((u) => !u.baja);
  }, [profesores, staff]);

  // Refetch combinado, memoizado con useCallback para mantener referencia estable
  const refetch = useCallback(async () => {
    await Promise.all([restProfesores.refetch?.(), restStaff.refetch?.()]);
  }, [restProfesores.refetch, restStaff.refetch]);

  // Estado de carga y error combinados, sin recalcular en cada render
  const isLoading = restProfesores.isLoading || restStaff.isLoading;
  const error = restProfesores.error || restStaff.error;

  return { data: activos, isLoading, error, refetch };
}