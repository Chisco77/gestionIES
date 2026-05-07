// backend/middleware/cursoContext.js
const { getCursoActual } = require("../utils/fechas");

function setCursoContext(req, res, next) {
  try {
    // Intentamos pillar una fecha de la query (por si el frontend quiere forzar una fecha)
    // o usamos la fecha actual por defecto.
    const fechaRef = req.query.fechaReferencia || new Date();

    // Inyectamos el objeto curso en el request
    req.curso = getCursoActual(fechaRef);

    next();
  } catch (error) {
    console.error("Error en cursoMiddleware:", error);
    next();
  }
}

module.exports = setCursoContext;
