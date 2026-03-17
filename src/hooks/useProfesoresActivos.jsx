/**
 * useProfesoresActivos.jsx - Hook para obtener solo los profesores activos (baja = false)
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Descripción:
 * Hook derivado de useProfesoresLdap que devuelve solo los profesores
 * que no están de baja.
 */

import { useProfesoresLdap } from "./useProfesoresLdap";

export function useProfesoresActivos() {
  const { data: profesores, ...rest } = useProfesoresLdap();

  // Filtramos solo los que no están de baja
  const activos = profesores?.filter((p) => !p.baja);

  return { data: activos, ...rest };
}