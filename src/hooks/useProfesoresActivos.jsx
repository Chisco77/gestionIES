/**
 * useProfesoresActivos.jsx - Hook para obtener solo los profesores activos (baja = false)
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Descripción:
 * Hook derivado de useProfesoresLdap que devuelve solo los profesores
 * que no están de baja.
 */

import { useMemo } from "react";
import { useProfesoresLdap } from "./useProfesoresLdap";

export function useProfesoresActivos() {
  const { data: profesores, ...rest } = useProfesoresLdap();

  // Memoizamos para que la referencia solo cambie si profesores cambia
  const activos = useMemo(() => {
    return profesores?.filter((p) => !p.baja) ?? [];
  }, [profesores]);

  return { data: activos, ...rest };
}
