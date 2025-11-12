export function esReservaFutura(fechaReserva, horaFin) {
  try {
    if (!fechaReserva || !horaFin) return false;

    // fechaReserva viene en UTC, convertimos a Date
    const fecha = new Date(fechaReserva);
    if (isNaN(fecha.getTime())) return false;

    // horaFin: "HH:MM:SS"
    const [h, min, s] = horaFin.split(":").map((x) => parseInt(x, 10));

    // Creamos fecha final de la reserva en hora local
    const fechaFinReserva = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      h || 0,
      min || 0,
      s || 0,
      0
    );

    return fechaFinReserva > new Date();
  } catch (err) {
    console.error("[esReservaFutura] Error:", err);
    return false;
  }
}
