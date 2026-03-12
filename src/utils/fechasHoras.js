// src/utils/cursoAcademico.js

function formatDate(dia, mes, year) {
  return `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${year}`
}

/**
 * Devuelve el curso académico actual en formato dd/mm/yyyy
 * El curso empieza el 1 de septiembre y termina el 30 de junio
 */
export function getCursoActual(fecha = new Date()) {
  const year = fecha.getFullYear()
  const month = fecha.getMonth() + 1 // 1-12

  // Septiembre - Diciembre → curso que empieza este año
  if (month >= 9) {
    return {
      inicioCurso: formatDate(1, 9, year),
      finCurso: formatDate(30, 6, year + 1),
      label: `${year}-${year + 1}`,
      yearInicio: year,
      yearFin: year + 1,
    }
  }

  // Enero - Agosto → curso iniciado el año anterior
  return {
    inicioCurso: formatDate(1, 9, year - 1),
    finCurso: formatDate(30, 6, year),
    label: `${year - 1}-${year}`,
    yearInicio: year - 1,
    yearFin: year,
  }
}

export function ddmmyyyyToISO(fecha) {
  // "01/09/2024" -> "2024-09-01"
  const [dd, mm, yyyy] = fecha.split("/")
  return `${yyyy}-${mm}-${dd}`
}

export function getHoraActualMadrid() {
  const formatter = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());

  const h = parts.find((p) => p.type === "hour").value;
  const m = parts.find((p) => p.type === "minute").value;
  const s = parts.find((p) => p.type === "second").value;

  return `${h}:${m}:${s}`;
}

export function getDiaSemanaMadrid() {
  const formatter = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "long",
  });

  const dia = formatter.format(new Date());

  const mapa = {
    lunes: "Lunes",
    martes: "Martes",
    miércoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sábado: null,
    domingo: null,
  };

  return mapa[dia.toLowerCase()];
}