/**
 * ================================================================
 *  Rutas: dbRoutes.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Rutas relacionadas con la base de datos PostgreSQL.
 *    Incluyen gestión de cursos, libros, estancias, préstamos de libros,
 *    préstamos de llaves y restricciones de configuración.
 *
 *  Autor: Francisco Damian Mendez Palma
 *  Email: adminies.franciscodeorellana@educarex.es
 *  GitHub: https://github.com/Chisco77
 *  Repositorio: https://github.com/Chisco77/gestionIES.git
 *  IES Francisco de Orellana - Trujillo
 *
 *  Fecha de creación: 2025
 * ================================================================
 */

/*const express = require("express");

const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { validarTokenPublico } = require("../middleware/authPublico");

function check(fn, name) {
  if (typeof fn !== "function") {
    console.error(`❌ ERROR: ${name} es undefined`);
  }
}

/**
 * LÓGICA AUTOMÁTICA HACIA PUBLIC
 * __dirname está en: /app/backend/routes (en Docker) o ./backend/routes (en local)
 * "../../" nos sube a la raíz del proyecto.
 * Luego entramos en "public/planos".
 */
/*const rootPath = path.resolve(__dirname, "../../");
const uploadPath = path.join(rootPath, "public", "planos");

// DEBUG para confirmar en consola durante el arranque
console.log("📍 Los planos se guardarán en:", uploadPath);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// 3. Configuración de almacenamiento
const storagePlanos = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usamos nuestra variable dinámica
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Nombre: timestamp-nombre_original.svg
    const nombreLimpio =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, nombreLimpio);
  },
});

const uploadPlano = multer({
  storage: storagePlanos,
  fileFilter: (req, file, cb) => {
    const isSvg =
      file.mimetype === "image/svg+xml" ||
      path.extname(file.originalname).toLowerCase() === ".svg";
    if (isSvg) {
      cb(null, true);
    } else {
      cb(new Error("Es necesario subir un archivo svg"), false);
    }
  },
});

// 4. Configuración para Logos del Centro
const logosPath = path.join(rootPath, "public", "logos");
if (!fs.existsSync(logosPath)) {
  fs.mkdirSync(logosPath, { recursive: true });
}

const storageLogos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logosPath);
  },
  filename: (req, file, cb) => {
    // Usamos el fieldname (logo_centro, logo_miies, etc) para que sea descriptivo
    const ext = path.extname(file.originalname);
    const nombreLimpio = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, nombreLimpio);
  },
});

const uploadLogos = multer({ storage: storageLogos });

// --- Controladores ---
const {
  getPeriodosHorarios,
  insertPeriodo,
  updatePeriodo,
  deletePeriodo,
} = require("../controllers/db/periodosHorariosController");

// --- Controlador de tokens de acceso (Proyecciones) ---
const {
  getTokens,
  insertToken,
  updateToken,
  deleteToken,
} = require("../controllers/db/accessTokensController");

// --- Controlador de Planos ---
const {
  getPlanos,
  insertPlano,
  updatePlano,
  deletePlano,
  getEstanciasPorPlano,
} = require("../controllers/db/planosController");

// --- Controlador de Configuración del Centro ---
const {
  getConfiguracionCentro,
  insertConfiguracion,
  updateConfiguracion,
} = require("../controllers/db/configuracionCentroController");

// --- Controlador de guardias de profesorado ---
const {
  simularGuardiasDia,
  confirmarGuardias,
  cancelarAutoasignacion,
  getProfesoresDeGuardia,
  autoasignarGuardia,
  getGuardiasEnriquecidas,
} = require("../controllers/db/guardiasController");

// --- Controlador de ausencias de profesorado ---
const {
  getAusenciasEnriquecidas,
  insertAusencia,
  updateAusencia,
  deleteAusencia,
} = require("../controllers/db/ausenciasController");

// --- Controlador de avisos ---
const {
  getAvisos,
  insertAviso,
  updateAviso,
  deleteAviso,
  getAvisosSMTP,
  insertAvisoSMTP,
  updateAvisoSMTP,
} = require("../controllers/db/avisosController");

// --- Controlador de Extraescolares ---
const {
  getExtraescolaresEnriquecidos,
  updateEstadoExtraescolar,
  insertExtraescolar,
  deleteExtraescolar,
  updateExtraescolar,
} = require("../controllers/db/extraescolaresController");

const {
  getReservasEstancias,
  insertReservaEstancia,
  deleteReservaEstancia,
  getReservasEstanciasPorDia,
  getReservasFiltradas,
  updateReservaEstancia,
  insertReservaEstanciaPeriodica,
} = require("../controllers/db/reservasEstanciasController");

// --- Controlador de cursos ---
const {
  getCursos,
  insertCurso,
  updateCurso,
  deleteCurso,
} = require("../controllers/db/cursosController");

// --- Controlador de materias ---
const {
  getMaterias,
  insertMateria,
  updateMateria,
  deleteMateria,
} = require("../controllers/db/materiasController");

// --- Controlador de horario del profesorado
const {
  getHorarioProfesoradoEnriquecido,
  insertHorarioProfesorado,
  updateHorarioProfesorado,
  deleteHorarioProfesorado,
  duplicarHorarioProfesorado,
  insertCuadranteGuardias,
} = require("../controllers/db/horarioProfesoradoController");

// --- Controlador de libros ---
const {
  getLibros,
  insertLibro,
  updateLibro,
  deleteLibro,
  getLibrosDisponibles,
} = require("../controllers/db/librosController");

// --- Controlador de préstamos de libros ---
const {
  asignarLibrosMasivo,
  accionDocCompromisoMasivo,
  accionLibrosMasivo,
  getPrestamosAgrupados,
  devolverPrestamos,
  prestarPrestamos,
  asignarUsuario,
  eliminarPrestamosItems,
  actualizarPrestamoItem,
  eliminarPrestamo,
  updatePrestamoCompleto,
} = require("../controllers/db/prestamosController");

// --- Controlador de estancias / planos ---
const {
  getEstanciasByTipoEstancia,
  getAllEstancias,
  insertEstancia,
  updateEstancia,
  deleteEstancia,
  getEstanciasFiltradas,
  filtrarEstancias,
} = require("../controllers/db/estanciasController");

// --- Controlador de préstamos de llaves ---
const {
  getPrestamosLlavesAgrupados,
  prestarLlave,
  devolverLlave,
} = require("../controllers/db/prestamosLlavesController");

// --- Controlador de perfiles de usuario ---
const {
  getPerfiles,
  getPerfilUsuario,
  setPerfilUsuario,
  updatePerfilUsuario,
  deletePerfilUsuario,
} = require("../controllers/db/perfilesUsuarioController");

// --- Controlador de restricciones ---
const {
  getRestricciones,
  insertRestriccionesAsuntos,
  updateRestriccion,
  deleteRestriccion,
  getRestriccionesAsuntos,
  getRangosBloqueados,
  addRangoBloqueado,
  deleteRangoBloqueado,

  // Restricción entrega de llaves
  getRestriccionLlaves,
  createRestriccionLlaves,
  updateRestriccionLlaves,
  deleteRestriccionLlaves,
  getExcepcionesLlaves,
  addExcepcionLlaves,
  deleteExcepcionLlaves,
} = require("../controllers/db/restriccionesController");

// --- Controlador de asuntos propios unificado ---
const {
  getPermisos,
  insertAsuntoPropio,
  insertPermiso,
  updatePermiso,
  deletePermiso,
  getPermisosEnriquecidos,
  updateEstadoPermiso,
} = require("../controllers/db/permisosController");

// --- Controlador de asuntos permitidos (desbloqueos de peticiones de APs - sin restricciones) ---
const {
  getAsuntosPermitidos,
  insertAsuntoPermitido,
  deleteAsuntoPermitido,
} = require("../controllers/db/asuntosPermitidosController");

const {
  getPanelReservas,
} = require("../controllers/db/panelReservasController");
router.get("/panel/reservas", getPanelReservas);

// ================================================================
//   Rutas de Estancias
// ================================================================
router.get("/planos/estancias", getEstanciasByTipoEstancia);
router.post("/planos/estancias", insertEstancia);
router.put("/estancias/:id", updateEstancia);
router.delete("/planos/estancias/:planta/:id", deleteEstancia);
router.get("/estancias", getAllEstancias);
router.get("/estancias/filtradas", getEstanciasFiltradas);

// ================================================================
//   Rutas de Préstamos de libros
// ================================================================
router.get("/prestamos/agrupados", getPrestamosAgrupados);
router.post("/prestamos/devolver", devolverPrestamos);
router.post("/prestamos/prestar", prestarPrestamos);
router.post("/prestamos/asignarLibrosMasivo", asignarLibrosMasivo);
router.post("/prestamos/accionDocCompromisoMasivo", accionDocCompromisoMasivo);
router.post("/prestamos/accionLibrosMasivo", accionLibrosMasivo);
router.post("/prestamos/asignarUsuario", asignarUsuario);
router.post("/prestamos/eliminarUnAlumno", eliminarPrestamosItems);
router.post("/prestamos/update", actualizarPrestamoItem);
router.post("/prestamos/eliminar", eliminarPrestamo);
router.put("/prestamos/:id", updatePrestamoCompleto);

// ================================================================
//   Rutas de Préstamos de llaves
// ================================================================
router.get("/prestamos-llaves/agrupados", getPrestamosLlavesAgrupados);
router.post("/prestamos-llaves/prestar", prestarLlave);
router.post("/prestamos-llaves/devolver", devolverLlave);

// ================================================================
//   Rutas de Perfiles de usuario
// ================================================================
router.get("/perfiles", getPerfiles);
router.get("/perfiles/:uid", getPerfilUsuario);
router.post("/perfiles", setPerfilUsuario);
router.put("/perfiles/:uid", updatePerfilUsuario);
router.delete("/perfiles/:uid", deletePerfilUsuario);

// ================================================================
//   Rutas de Restricciones
// ================================================================
router.get("/restricciones", getRestricciones);
router.post("/restricciones/asuntos", insertRestriccionesAsuntos);
router.put("/restricciones/llaves", updateRestriccionLlaves);
router.put("/restricciones/:id", updateRestriccion);
router.delete("/restricciones/:id", deleteRestriccion);
router.get("/restricciones/asuntos", getRestriccionesAsuntos);

// Restricción entrega de llaves
router.get("/restricciones/llaves", getRestriccionLlaves);
router.post("/restricciones/llaves", createRestriccionLlaves);
router.delete("/restricciones/llaves", deleteRestriccionLlaves);
router.get("/restricciones/llaves/excepciones", getExcepcionesLlaves);
router.post("/restricciones/llaves/excepciones", addExcepcionLlaves);
router.delete("/restricciones/llaves/excepciones", deleteExcepcionLlaves);

// ================================================================
//   Rutas de Rangos de Asuntos Propios (bloqueos)
// ================================================================
router.get("/restricciones/asuntos/rangos", getRangosBloqueados);
router.post("/restricciones/asuntos/rangos", addRangoBloqueado);
router.delete("/restricciones/asuntos/rangos", deleteRangoBloqueado);

// ================================================================
//   Rutas de Asuntos Propios
// ================================================================
// ================================================================
//   Rutas de Permisos y Asuntos Propios
// ================================================================
router.get("/permisos", getPermisos); // Filtrable por uid, fecha, descripcion

// Asuntos propios (tipo = 13 con restricciones)
router.post("/permisos", insertAsuntoPropio);

// Permisos genéricos sin restricciones
router.post("/permisos/generico", insertPermiso);

router.put("/permisos/:id", updatePermiso);
router.delete("/permisos/:id", deletePermiso);

router.get("/permisos-enriquecidos", getPermisosEnriquecidos);
router.patch("/permisos/estado/:id", updateEstadoPermiso);

// ================================================================
//   Rutas de Periodos Horarios
// ================================================================
router.get("/periodos-horarios", getPeriodosHorarios);
router.post("/periodos-horarios", insertPeriodo);
router.put("/periodos-horarios/:id", updatePeriodo);
router.delete("/periodos-horarios/:id", deletePeriodo);

// ================================================================
//   Rutas de Reservas de estancias
// ================================================================
router.get("/reservas-estancias", getReservasEstancias);
router.get("/reservas-estancias/filtradas", getReservasFiltradas);
router.post("/reservas-estancias", insertReservaEstancia);
router.delete("/reservas-estancias/:id", deleteReservaEstancia);
router.get("/reservas-estancias/dia", getReservasEstanciasPorDia);
router.put("/reservas-estancias/:id", updateReservaEstancia);
router.post("/reservas-estancias/periodicas", insertReservaEstanciaPeriodica);

// ================================================================
//   Rutas de Horarios del profesorado
// ================================================================
router.get(
  "/horario-profesorado/enriquecido",
  getHorarioProfesoradoEnriquecido
);
router.post("/horario-profesorado", insertHorarioProfesorado);
router.put("/horario-profesorado/:id", updateHorarioProfesorado);
router.post("/horario-profesorado/duplicar", duplicarHorarioProfesorado);
router.delete("/horario-profesorado/:id", deleteHorarioProfesorado);
router.post(
  "/horario-profesorado/insertCuadranteGuardias",
  insertCuadranteGuardias
);

// Rutas de cursos
router.get("/cursos", getCursos);
router.post("/cursos", insertCurso);
router.put("/cursos/:id", updateCurso);
router.delete("/cursos/:id", deleteCurso);

// ================================================================
//   Rutas de Materias
// ================================================================
router.get("/materias", getMaterias);
router.post("/materias", insertMateria);
router.put("/materias/:id", updateMateria);
router.delete("/materias/:id", deleteMateria);

// Rutas de libros
// ================================================================
//   Rutas de Libros
// ================================================================
router.get("/libros", getLibros);
router.post("/libros", insertLibro);
router.put("/libros/:id", updateLibro);
router.delete("/libros/:id", deleteLibro);

// Libros disponibles (para préstamos)
//router.get("/libros/disponibles", getLibrosDisponibles);
router.get("/libros/disponibles/:curso/:uid", getLibrosDisponibles);

// ================================================================

// ================================================================
//   Rutas de Actividades Extraescolares
// ================================================================
router.get("/extraescolares/enriquecidos", getExtraescolaresEnriquecidos);
router.post("/extraescolares", insertExtraescolar);
router.put("/extraescolares/:id", updateExtraescolar); // <-- ruta para actualizar toda la actividad
router.put("/extraescolares/:id/estado", updateEstadoExtraescolar);
router.delete("/extraescolares/:id", deleteExtraescolar);

// ================================================================
//   Rutas de Avisos
// ================================================================
router.get("/avisos", getAvisos);
router.post("/avisos", insertAviso);
router.put("/avisos/:id", updateAviso);
router.delete("/avisos/:id", deleteAviso);
router.get("/avisos/smtp", getAvisosSMTP);
router.post("/avisos/smtp", insertAvisoSMTP);
router.put("/avisos/smtp/:id", updateAvisoSMTP);

// ================================================================
//   Rutas de Empleados (profesores)
// ================================================================
const {
  getEmpleado,
  updateEmpleado,
  listEmpleados,
} = require("../controllers/db/empleadosController");

router.get("/empleados/:uid", getEmpleado);
router.put("/empleados/:uid", updateEmpleado);
router.get("/empleados", listEmpleados);

// ================================================================
//   Rutas de Asuntos Propios - Permisos especiales (desbloqueos)
// ================================================================
router.get("/asuntos-permitidos", getAsuntosPermitidos);
router.post("/asuntos-permitidos", insertAsuntoPermitido);
router.delete("/asuntos-permitidos/:id", deleteAsuntoPermitido);

// ================================================================
//   Controlador de Reservas de Estancias con Repetición
// ================================================================
const {
  getReservasEstanciasRepeticion,
  insertReservaEstanciaRepeticion,
  updateReservaEstanciaRepeticion,
  deleteReservaEstanciaRepeticion,
  getReservasEstanciasRepeticionEnriquecidas,
  simularReservaEstanciaRepeticion,
} = require("../controllers/db/reservasEstanciasRepeticionController");

// ================================================================
//   Rutas de Reservas de Estancias con Repetición
// ================================================================
router.get("/reservas-estancias/repeticion", getReservasEstanciasRepeticion);
router.post("/reservas-estancias/repeticion", insertReservaEstanciaRepeticion);
router.put(
  "/reservas-estancias/repeticion/:id",
  updateReservaEstanciaRepeticion
);
router.delete(
  "/reservas-estancias/repeticion/:id",
  deleteReservaEstanciaRepeticion
);
router.get(
  "/reservas-estancias/repeticiones/enriquecidas",
  getReservasEstanciasRepeticionEnriquecidas
);

router.post(
  "/reservas-estancias/repeticion/simular",
  simularReservaEstanciaRepeticion
);

// ================================================================
//   Rutas de Configuración del Centro
// ================================================================
/**
 * GET /configuracion-centro: Obtiene los datos institucionales del IES.
 */
/*router.get("/configuracion-centro", getConfiguracionCentro);

/**
 * POST /configuracion-centro: Inserción inicial de los datos del centro.
 */
/*router.post("/configuracion-centro", insertConfiguracion);

/**
 * PUT /configuracion-centro/:id: Actualización de los datos del centro.
 */
//router.put("/configuracion-centro/:id", updateConfiguracion);
/**
 * PUT /configuracion-centro/:id: Actualización de los datos del centro e imágenes.
 */
/*router.put(
  "/configuracion-centro/:id",
  uploadLogos.fields([
    { name: "logo_miies", maxCount: 1 },
    { name: "logo_centro", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  updateConfiguracion
);

// --- Controlador de Notificaciones Directiva ---
const {
  getPendientesDirectiva,
} = require("../controllers/db/notificacionesDirectivaController");

// ================================================================
//   Rutas de Notificaciones Directiva
// ================================================================
router.get("/directiva/pendientes", getPendientesDirectiva);

// ================================================================
//   Rutas de Ausencias de Profesorado
// ================================================================
/**
 * GET /ausencias-enriquecidas: Obtiene ausencias con nombres de
 * profesor, creador y datos de periodos horarios.
 * Soporta query params: uid_profesor, fecha_inicio, tipo_ausencia.
 */
/*router.get("/ausencias-enriquecidas", getAusenciasEnriquecidas);

/**
 * POST /ausencias: Inserción manual de ausencias (no vinculadas
 * necesariamente a un permiso previo).
 */
/*router.post("/ausencias", insertAusencia);

/**
 * PUT /ausencias/:id: Actualización de datos de una ausencia.
 */
/*router.put("/ausencias/:id", updateAusencia);

router.patch("/ausencias/:id", updateAusencia);

/**
 * DELETE /ausencias/:id: Eliminación de una ausencia.
 */
/*router.delete("/ausencias/:id", deleteAusencia);

// Para la directiva
router.get("/guardias/simular/:fecha", validarTokenPublico, simularGuardiasDia);
router.post("/guardias/confirmar", confirmarGuardias);

// Para los profesores (Autogestión)
router.post("/guardias/autoasignar", autoasignarGuardia);

// Obtiene los profesores que están de guardia y NO están ausentes
router.get("/guardias/disponibles/:fecha/:idperiodo", getProfesoresDeGuardia);
// Usamos DELETE porque estamos eliminando un registro de 'guardias_asignadas'
router.delete(
  "/guardias/cancelar/:id_guardia_asignada",
  cancelarAutoasignacion
);

// guardias enriquecidas
router.get("/guardias-enriquecidas", getGuardiasEnriquecidas);

// ================================================================
//   Rutas de Planos (Gestión Dinámica)
// ================================================================
/**
 * GET /planos: Obtiene la lista de planos configurados (baja, primera, etc.)
 */
/*router.get("/planos", getPlanos);

/**
 * POST /planos: Crea un nuevo plano (subida de SVG y metadatos)
 */
/*router.post("/planos", uploadPlano.single("svg_file"), insertPlano);
/**
 * PUT /planos/:id: Actualiza nombre o archivo de un plano existente
 */
/*router.put("/planos/:id", updatePlano);

/**
 * DELETE /planos/:id: Elimina un plano (si no tiene estancias)
 */
/*router.delete("/planos/:id", deletePlano);

/**
 * GET /planos/:plantaId/estancias: Obtiene todas las estancias de un plano específico
 * Esta ruta sustituye la lógica estática para el componente interactivo.
 */
/*router.get("/planos/:plantaId/estancias", getEstanciasPorPlano);

// Rutas de Tokens de Acceso (Proyecciones / Pantallas)
//  /** * GET /access-tokens: Obtiene la lista de tokens configurados para proyecciones. */
/*router.get("/access-tokens", getTokens);
/** * POST /access-tokens: Registra un nuevo token con sus credenciales LDAP. */
/*router.post("/access-tokens", insertToken);
/** * PUT /access-tokens/:id: Actualiza la configuración de un token o sus credenciales. */
//router.put("/access-tokens/:id", updateToken);
/** * DELETE /access-tokens/:id: Elimina un token de acceso. */
/*router.delete("/access-tokens/:id", deleteToken);

module.exports = router;
*/

/**
 * ================================================================
 *  Rutas: dbRoutes.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Rutas relacionadas con la base de datos PostgreSQL.
 *    Incluyen gestión de cursos, libros, estancias, préstamos de libros,
 *    préstamos de llaves y restricciones de configuración.
 *
 *  Autor: Francisco Damian Mendez Palma
 *  Email: adminies.franciscodeorellana@educarex.es
 *  GitHub: https://github.com/Chisco77
 *  Repositorio: https://github.com/Chisco77/gestionIES.git
 *  IES Francisco de Orellana - Trujillo
 *
 *  Fecha de creación: 2025
 * ================================================================
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { validarTokenPublico } = require("../middleware/authPublico");

function check(fn, name) {
  if (typeof fn !== "function") {
    console.error(`❌ ERROR: ${name} es undefined`);
  }
}

// ================================================================
//   CONFIGURACIÓN DE ALMACENAMIENTO (MULTER)
// ================================================================

const rootPath = path.resolve(__dirname, "../../");

// 1. Configuración de Planos (SVG)
const uploadPath = path.join(rootPath, "public", "planos");
console.log("📍 Los planos se guardarán en:", uploadPath);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storagePlanos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const nombreLimpio =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, nombreLimpio);
  },
});

const uploadPlano = multer({
  storage: storagePlanos,
  fileFilter: (req, file, cb) => {
    const isSvg =
      file.mimetype === "image/svg+xml" ||
      path.extname(file.originalname).toLowerCase() === ".svg";
    if (isSvg) {
      cb(null, true);
    } else {
      cb(new Error("Es necesario subir un archivo svg"), false);
    }
  },
});

// 2. Configuración para Logos del Centro
const logosPath = path.join(rootPath, "public", "logos");
if (!fs.existsSync(logosPath)) {
  fs.mkdirSync(logosPath, { recursive: true });
}

const storageLogos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logosPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombreLimpio = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, nombreLimpio);
  },
});

const uploadLogos = multer({ storage: storageLogos });

// ================================================================
//   IMPORTACIÓN DE CONTROLADORES
// ================================================================

const {
  getPeriodosHorarios,
  insertPeriodo,
  updatePeriodo,
  deletePeriodo,
} = require("../controllers/db/periodosHorariosController");

const {
  getTokens,
  insertToken,
  updateToken,
  deleteToken,
} = require("../controllers/db/accessTokensController");

const {
  getPlanos,
  insertPlano,
  updatePlano,
  deletePlano,
  getEstanciasPorPlano,
} = require("../controllers/db/planosController");

const {
  getConfiguracionCentro,
  saveConfiguracionCentro,
} = require("../controllers/db/configuracionCentroController");

const {
  simularGuardiasDia,
  confirmarGuardias,
  cancelarAutoasignacion,
  getProfesoresDeGuardia,
  autoasignarGuardia,
  getGuardiasEnriquecidas,
} = require("../controllers/db/guardiasController");

const {
  getAusenciasEnriquecidas,
  insertAusencia,
  updateAusencia,
  deleteAusencia,
} = require("../controllers/db/ausenciasController");

const {
  getAvisos,
  insertAviso,
  updateAviso,
  deleteAviso,
  getAvisosSMTP,
  insertAvisoSMTP,
  updateAvisoSMTP,
} = require("../controllers/db/avisosController");

const {
  getExtraescolaresEnriquecidos,
  updateEstadoExtraescolar,
  insertExtraescolar,
  deleteExtraescolar,
  updateExtraescolar,
} = require("../controllers/db/extraescolaresController");

const {
  getReservasEstancias,
  insertReservaEstancia,
  deleteReservaEstancia,
  getReservasEstanciasPorDia,
  getReservasFiltradas,
  updateReservaEstancia,
  insertReservaEstanciaPeriodica,
} = require("../controllers/db/reservasEstanciasController");

const {
  getCursos,
  insertCurso,
  updateCurso,
  deleteCurso,
} = require("../controllers/db/cursosController");

const {
  getMaterias,
  insertMateria,
  updateMateria,
  deleteMateria,
} = require("../controllers/db/materiasController");

const {
  getHorarioProfesoradoEnriquecido,
  insertHorarioProfesorado,
  updateHorarioProfesorado,
  deleteHorarioProfesorado,
  duplicarHorarioProfesorado,
  insertCuadranteGuardias,
} = require("../controllers/db/horarioProfesoradoController");

const {
  getLibros,
  insertLibro,
  updateLibro,
  deleteLibro,
  getLibrosDisponibles,
} = require("../controllers/db/librosController");

const {
  asignarLibrosMasivo,
  accionDocCompromisoMasivo,
  accionLibrosMasivo,
  getPrestamosAgrupados,
  devolverPrestamos,
  prestarPrestamos,
  asignarUsuario,
  eliminarPrestamosItems,
  actualizarPrestamoItem,
  eliminarPrestamo,
  updatePrestamoCompleto,
} = require("../controllers/db/prestamosController");

const {
  getEstanciasByTipoEstancia,
  getAllEstancias,
  insertEstancia,
  updateEstancia,
  deleteEstancia,
  getEstanciasFiltradas,
  filtrarEstancias,
} = require("../controllers/db/estanciasController");

const {
  getPrestamosLlavesAgrupados,
  prestarLlave,
  devolverLlave,
} = require("../controllers/db/prestamosLlavesController");

const {
  getPerfiles,
  getPerfilUsuario,
  setPerfilUsuario,
  updatePerfilUsuario,
  deletePerfilUsuario,
} = require("../controllers/db/perfilesUsuarioController");

const {
  getRestricciones,
  insertRestriccionesAsuntos,
  updateRestriccion,
  deleteRestriccion,
  getRestriccionesAsuntos,
  getRangosBloqueados,
  addRangoBloqueado,
  deleteRangoBloqueado,
  getRestriccionLlaves,
  createRestriccionLlaves,
  updateRestriccionLlaves,
  deleteRestriccionLlaves,
  getExcepcionesLlaves,
  addExcepcionLlaves,
  deleteExcepcionLlaves,
} = require("../controllers/db/restriccionesController");

const {
  getPermisos,
  insertAsuntoPropio,
  insertPermiso,
  updatePermiso,
  deletePermiso,
  getPermisosEnriquecidos,
  updateEstadoPermiso,
} = require("../controllers/db/permisosController");

const {
  getAsuntosPermitidos,
  insertAsuntoPermitido,
  deleteAsuntoPermitido,
} = require("../controllers/db/asuntosPermitidosController");

const {
  getPanelReservas,
} = require("../controllers/db/panelReservasController");

const {
  getEmpleado,
  updateEmpleado,
  listEmpleados,
} = require("../controllers/db/empleadosController");

const {
  getReservasEstanciasRepeticion,
  insertReservaEstanciaRepeticion,
  updateReservaEstanciaRepeticion,
  deleteReservaEstanciaRepeticion,
  getReservasEstanciasRepeticionEnriquecidas,
  simularReservaEstanciaRepeticion,
} = require("../controllers/db/reservasEstanciasRepeticionController");

const {
  getPendientesDirectiva,
} = require("../controllers/db/notificacionesDirectivaController");

// ================================================================
//   DEFINICIÓN DE RUTAS
// ================================================================

// --- Panel General ---
router.get("/panel/reservas", getPanelReservas);

// --- Estancias y Planos ---
router.get("/planos/estancias", getEstanciasByTipoEstancia);
router.post("/planos/estancias", insertEstancia);
router.put("/estancias/:id", updateEstancia);
router.delete("/planos/estancias/:planta/:id", deleteEstancia);
router.get("/estancias", getAllEstancias);
router.get("/estancias/filtradas", getEstanciasFiltradas);

router.get("/planos", getPlanos);
router.post("/planos", uploadPlano.single("svg_file"), insertPlano);
router.put("/planos/:id", updatePlano);
router.delete("/planos/:id", deletePlano);
router.get("/planos/:plantaId/estancias", getEstanciasPorPlano);

// --- Préstamos de libros ---
router.get("/prestamos/agrupados", getPrestamosAgrupados);
router.post("/prestamos/devolver", devolverPrestamos);
router.post("/prestamos/prestar", prestarPrestamos);
router.post("/prestamos/asignarLibrosMasivo", asignarLibrosMasivo);
router.post("/prestamos/accionDocCompromisoMasivo", accionDocCompromisoMasivo);
router.post("/prestamos/accionLibrosMasivo", accionLibrosMasivo);
router.post("/prestamos/asignarUsuario", asignarUsuario);
router.post("/prestamos/eliminarUnAlumno", eliminarPrestamosItems);
router.post("/prestamos/update", actualizarPrestamoItem);
router.post("/prestamos/eliminar", eliminarPrestamo);
router.put("/prestamos/:id", updatePrestamoCompleto);

// --- Préstamos de llaves ---
router.get("/prestamos-llaves/agrupados", getPrestamosLlavesAgrupados);
router.post("/prestamos-llaves/prestar", prestarLlave);
router.post("/prestamos-llaves/devolver", devolverLlave);

// --- Usuarios y Perfiles ---
router.get("/perfiles", getPerfiles);
router.get("/perfiles/:uid", getPerfilUsuario);
router.post("/perfiles", setPerfilUsuario);
router.put("/perfiles/:uid", updatePerfilUsuario);
router.delete("/perfiles/:uid", deletePerfilUsuario);

router.get("/empleados/:uid", getEmpleado);
router.put("/empleados/:uid", updateEmpleado);
router.get("/empleados", listEmpleados);

// --- Restricciones ---
router.get("/restricciones", getRestricciones);
router.post("/restricciones/asuntos", insertRestriccionesAsuntos);
router.put("/restricciones/llaves", updateRestriccionLlaves);
router.put("/restricciones/:id", updateRestriccion);
router.delete("/restricciones/:id", deleteRestriccion);
router.get("/restricciones/asuntos", getRestriccionesAsuntos);

// Restricción entrega de llaves
router.get("/restricciones/llaves", getRestriccionLlaves);
router.post("/restricciones/llaves", createRestriccionLlaves);
router.delete("/restricciones/llaves", deleteRestriccionLlaves);
router.get("/restricciones/llaves/excepciones", getExcepcionesLlaves);
router.post("/restricciones/llaves/excepciones", addExcepcionLlaves);
router.delete("/restricciones/llaves/excepciones", deleteExcepcionLlaves);

// Rangos de Asuntos Propios (bloqueos)
router.get("/restricciones/asuntos/rangos", getRangosBloqueados);
router.post("/restricciones/asuntos/rangos", addRangoBloqueado);
router.delete("/restricciones/asuntos/rangos", deleteRangoBloqueado);

// --- Permisos y Asuntos Propios ---
router.get("/permisos", getPermisos);
router.post("/permisos", insertAsuntoPropio); // Asuntos propios (tipo = 13 con restricciones)
router.post("/permisos/generico", insertPermiso); // Permisos genéricos sin restricciones
router.put("/permisos/:id", updatePermiso);
router.delete("/permisos/:id", deletePermiso);
router.get("/permisos-enriquecidos", getPermisosEnriquecidos);
router.patch("/permisos/estado/:id", updateEstadoPermiso);

router.get("/asuntos-permitidos", getAsuntosPermitidos);
router.post("/asuntos-permitidos", insertAsuntoPermitido);
router.delete("/asuntos-permitidos/:id", deleteAsuntoPermitido);

// --- Periodos Horarios ---
router.get("/periodos-horarios", getPeriodosHorarios);
router.post("/periodos-horarios", insertPeriodo);
router.put("/periodos-horarios/:id", updatePeriodo);
router.delete("/periodos-horarios/:id", deletePeriodo);

// --- Reservas de estancias ---
router.get("/reservas-estancias", getReservasEstancias);
router.get("/reservas-estancias/filtradas", getReservasFiltradas);
router.post("/reservas-estancias", insertReservaEstancia);
router.delete("/reservas-estancias/:id", deleteReservaEstancia);
router.get("/reservas-estancias/dia", getReservasEstanciasPorDia);
router.put("/reservas-estancias/:id", updateReservaEstancia);
router.post("/reservas-estancias/periodicas", insertReservaEstanciaPeriodica);

// Reservas con Repetición
router.get("/reservas-estancias/repeticion", getReservasEstanciasRepeticion);
router.post("/reservas-estancias/repeticion", insertReservaEstanciaRepeticion);
router.put(
  "/reservas-estancias/repeticion/:id",
  updateReservaEstanciaRepeticion
);
router.delete(
  "/reservas-estancias/repeticion/:id",
  deleteReservaEstanciaRepeticion
);
router.get(
  "/reservas-estancias/repeticiones/enriquecidas",
  getReservasEstanciasRepeticionEnriquecidas
);
router.post(
  "/reservas-estancias/repeticion/simular",
  simularReservaEstanciaRepeticion
);

// --- Horarios del profesorado ---
router.get(
  "/horario-profesorado/enriquecido",
  getHorarioProfesoradoEnriquecido
);
router.post("/horario-profesorado", insertHorarioProfesorado);
router.put("/horario-profesorado/:id", updateHorarioProfesorado);
router.post("/horario-profesorado/duplicar", duplicarHorarioProfesorado);
router.delete("/horario-profesorado/:id", deleteHorarioProfesorado);
router.post(
  "/horario-profesorado/insertCuadranteGuardias",
  insertCuadranteGuardias
);

// --- Cursos y Materias ---
router.get("/cursos", getCursos);
router.post("/cursos", insertCurso);
router.put("/cursos/:id", updateCurso);
router.delete("/cursos/:id", deleteCurso);

router.get("/materias", getMaterias);
router.post("/materias", insertMateria);
router.put("/materias/:id", updateMateria);
router.delete("/materias/:id", deleteMateria);

// --- Libros ---
router.get("/libros", getLibros);
router.post("/libros", insertLibro);
router.put("/libros/:id", updateLibro);
router.delete("/libros/:id", deleteLibro);
router.get("/libros/disponibles/:curso/:uid", getLibrosDisponibles);

// --- Actividades Extraescolares ---
router.get("/extraescolares/enriquecidos", getExtraescolaresEnriquecidos);
router.post("/extraescolares", insertExtraescolar);
router.put("/extraescolares/:id", updateExtraescolar);
router.put("/extraescolares/:id/estado", updateEstadoExtraescolar);
router.delete("/extraescolares/:id", deleteExtraescolar);

// --- Avisos ---
router.get("/avisos", getAvisos);
router.post("/avisos", insertAviso);
router.put("/avisos/:id", updateAviso);
router.delete("/avisos/:id", deleteAviso);
router.get("/avisos/smtp", getAvisosSMTP);
router.post("/avisos/smtp", insertAvisoSMTP);
router.put("/avisos/smtp/:id", updateAvisoSMTP);

// --- Configuración del Centro ---
router.get("/configuracion-centro", getConfiguracionCentro);
router.post(
  "/configuracion-centro",
  uploadLogos.fields([
    { name: "logo_miies", maxCount: 1 },
    { name: "logo_centro", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  saveConfiguracionCentro
);

// --- Notificaciones Directiva ---
router.get("/directiva/pendientes", getPendientesDirectiva);

// --- Ausencias y Guardias ---
router.get("/ausencias-enriquecidas", getAusenciasEnriquecidas);
router.post("/ausencias", insertAusencia);
router.put("/ausencias/:id", updateAusencia);
router.patch("/ausencias/:id", updateAusencia);
router.delete("/ausencias/:id", deleteAusencia);

router.get("/guardias/simular/:fecha", validarTokenPublico, simularGuardiasDia);
router.post("/guardias/confirmar", confirmarGuardias);
router.post("/guardias/autoasignar", autoasignarGuardia);
router.get("/guardias/disponibles/:fecha/:idperiodo", getProfesoresDeGuardia);
router.delete(
  "/guardias/cancelar/:id_guardia_asignada",
  cancelarAutoasignacion
);
router.get("/guardias-enriquecidas", getGuardiasEnriquecidas);

// --- Tokens de Acceso ---
router.get("/access-tokens", getTokens);
router.post("/access-tokens", insertToken);
router.put("/access-tokens/:id", updateToken);
router.delete("/access-tokens/:id", deleteToken);

module.exports = router;
