// backend/utils/fechas.js

/*const formatDate = (day, month, year) => 
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

function getCursoActual(fechaReferencia = new Date()) {
  const fecha = new Date(fechaReferencia);
  const year = fecha.getFullYear();
  const month = fecha.getMonth() + 1;

  if (month >= 9) {
    return {
      inicioCurso: formatDate(1, 9, year),
      finCurso: formatDate(30, 6, year + 1)
    };
  }

  return {
    inicioCurso: formatDate(1, 9, year - 1),
    finCurso: formatDate(30, 6, year)
  };
}

module.exports = { getCursoActual };*/

// backend/utils/fechas.js

const formatDate = (day, month, year) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

function getCursoActual(fechaReferencia = new Date()) {
  const fecha = new Date(fechaReferencia);
  const year = fecha.getFullYear();
  const month = fecha.getMonth() + 1; // 1-12

  // Si estamos en Septiembre o después (hasta Diciembre)
  if (month >= 9) {
    return {
      inicioCurso: formatDate(1, 9, year),
      finCurso: formatDate(31, 8, year + 1), // Cambiado a 31 de agosto para cubrir todo el año
      label: `${year}-${year + 1}`,
    };
  }

  // Si estamos entre Enero y Agosto
  return {
    inicioCurso: formatDate(1, 9, year - 1),
    finCurso: formatDate(31, 8, year),
    label: `${year - 1}-${year}`,
  };
}

module.exports = { getCursoActual };
