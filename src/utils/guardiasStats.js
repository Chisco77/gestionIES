// utils/guardiasStats.js
export const calcularConteoGuardias = (guardiasRealizadas, uid, idPeriodo, fecha) => {
  // Filtramos por profesor, periodo y FECHA EXACTA
  return guardiasRealizadas.filter(g => 
    g.confirmada &&
    g.uid_profesor_cubridor === uid &&
    Number(g.idperiodo) === Number(idPeriodo) &&
    g.fecha === fecha
  ).length;
};