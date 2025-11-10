// utils/esReservaFutura.js

export function esReservaFutura(fechaReserva, horaFin) {
  try {
    if (!fechaReserva || !horaFin) return false;

    const limpiar = (s = "") => String(s).trim().replace(/\u00A0/g, ""); // elimina espacios y NBSP
    const fechaRaw = limpiar(fechaReserva);
    const horaRaw = limpiar(horaFin);

    // Extraer fecha en formato YYYY-MM-DD
    const fechaParte = fechaRaw.split("T")[0].split(" ")[0];
    const [y, m, d] = fechaParte.split("-").map((x) => parseInt(x, 10));

    if ([y, m, d].some(isNaN)) {
      console.error("[esReservaFutura] Fecha inválida:", fechaReserva);
      return false;
    }

    // Extraer hora, minutos, segundos
    const [hStr = "0", minStr = "0", sStr = "0"] = horaRaw.split(":");
    const h = parseInt(hStr, 10) || 0;
    const min = parseInt(minStr, 10) || 0;
    const s = parseInt(sStr, 10) || 0;

    // Crear fecha completa local
    const fechaHoraFin = new Date(y, m - 1, d, h, min, s, 0);
    if (isNaN(fechaHoraFin.getTime())) {
      console.error("[esReservaFutura] Fecha/hora inválidas:", fechaReserva, horaFin);
      return false;
    }

    const ahora = new Date();
    // si la fecha y hora de la reserva es posterior a la actual, entonces sí es una reserva futura.
    return fechaHoraFin > ahora;
  } catch (err) {
    console.error("[esReservaFutura] Error:", err);
    return false;
  }
}
