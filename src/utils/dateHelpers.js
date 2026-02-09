// src/utils/dateHelpers.js
/*
*   Utilizar cuando en la base de datos tengo timesampt without time zone (fecha más hora)
*
*/
export function getLocalDateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}