/*import { useEffect, useState } from "react";

export function RelojPeriodo({ periodos }) {
  const [fechaHora, setFechaHora] = useState(new Date());
  const [periodoActual, setPeriodoActual] = useState(null);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!periodos || periodos.length === 0) return;

    const ahora = fechaHora;
    let actual = null;
    let avance = 0;

    periodos.forEach((p) => {
      const [hi, mi, si] = p.inicio.split(":").map(Number);
      const [hf, mf, sf] = p.fin.split(":").map(Number);

      const inicio = new Date(ahora);
      inicio.setHours(hi, mi, si, 0);

      const fin = new Date(ahora);
      fin.setHours(hf, mf, sf, 0);

      if (ahora >= inicio && ahora <= fin) {
        actual = p;
        const totalSegundos = (fin - inicio) / 1000;
        const transcurrido = (ahora - inicio) / 1000;
        avance = Math.min(
          100,
          Math.max(0, (transcurrido / totalSegundos) * 100)
        );
      }
    });

    setPeriodoActual(actual);
    setProgreso(avance);
  }, [fechaHora, periodos]);

  // Función auxiliar para formato hh:mm
  const formatHora = (horaStr) => {
    const [h, m] = horaStr.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-white pt-1 pb-5 px-5 rounded-2xl shadow-lg text-center">
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <div className="text-2xl md:text-3xl font-bold text-blue-600">
          {fechaHora.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="text-lg md:text-xl font-semibold text-blue-600">
          {periodoActual
            ? `${periodoActual.nombre} (${formatHora(periodoActual.inicio)} – ${formatHora(periodoActual.fin)})`
            : "Fuera de los periodos horarios"}
        </div>
      </div>

      <div className="relative w-full h-5 md:h-6 bg-gray-200 rounded-full overflow-hidden mt-3">
        <div
          className="h-5 md:h-6 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>
    </div>
  );
} */

import { useEffect, useState } from "react";

export function RelojPeriodo({ periodos }) {
  const [fechaHora, setFechaHora] = useState(new Date());
  const [periodoActual, setPeriodoActual] = useState(null);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!periodos || periodos.length === 0) return;

    const ahora = fechaHora;
    let actual = null;
    let avance = 0;

    periodos.forEach((p) => {
      const [hi, mi, si] = p.inicio.split(":").map(Number);
      const [hf, mf, sf] = p.fin.split(":").map(Number);

      const inicio = new Date(ahora);
      inicio.setHours(hi, mi, si, 0);

      const fin = new Date(ahora);
      fin.setHours(hf, mf, sf, 0);

      if (ahora >= inicio && ahora <= fin) {
        actual = p;

        const totalSegundos = (fin - inicio) / 1000;
        const transcurrido = (ahora - inicio) / 1000;

        avance = Math.min(
          100,
          Math.max(0, (transcurrido / totalSegundos) * 100)
        );
      }
    });

    setPeriodoActual(actual);
    setProgreso(avance);
  }, [fechaHora, periodos]);

  const formatHora = (horaStr) => {
    const [h, m] = horaStr.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-6 min-w-[350px]">
      {/* Hora + periodo */}
      <div className="flex items-center gap-4 whitespace-nowrap">
        <div className="text-2xl font-bold text-white">
          {fechaHora.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>

        <div className="text-lg font-semibold truncate max-w-[260px] text-white">
          {periodoActual
            ? `${periodoActual.nombre} (${formatHora(periodoActual.inicio)} – ${formatHora(periodoActual.fin)})`
            : "Fuera de los periodos horarios"}
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="relative w-72 h-4 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progreso}%`,
            background: "white",
          }}
        />
      </div>
    </div>
  );
}
