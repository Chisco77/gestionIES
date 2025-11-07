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
 *  Endpoints:
 *
 *    --- Cursos ---
 *    GET /cursos                   -> Obtener todos los cursos
 *    POST /cursos                  -> Insertar un curso
 *    PUT /cursos/:id               -> Actualizar un curso por id
 *    DELETE /cursos/:id            -> Eliminar un curso por id
 *
 *    --- Libros ---
 *    GET /libros                   -> Obtener todos los libros
 *    POST /libros                  -> Insertar un libro
 *    PUT /libros/:id               -> Actualizar libro por id
 *    DELETE /libros/:id            -> Eliminar libro por id
 *    GET /libros/disponibles/:curso/:uid -> Libros disponibles para un curso y usuario
 *
 *    --- Prestamos de libros ---
 *    GET /prestamos/agrupados      -> Obtener préstamos agrupados por usuario
 *    POST /prestamos/devolver      -> Devolver préstamos
 *    POST /prestamos/prestar       -> Prestar libros
 *    POST /prestamos/asignarLibrosMasivo -> Asignar libros masivamente
 *    POST /prestamos/accionDocCompromisoMasivo -> Acciones con doc. compromiso masivo
 *    POST /prestamos/accionLibrosMasivo       -> Acciones con libros masivo
 *    POST /prestamos/asignarUsuario           -> Asignar préstamos a usuario
 *    POST /prestamos/eliminarUnAlumno        -> Eliminar préstamos de un alumno
 *    POST /prestamos/update                   -> Actualizar préstamo individual
 *    POST /prestamos/eliminar                 -> Eliminar préstamo
 *
 *    --- Estancias / planos ---
 *    GET /planos/estancias?planta=<planta>      -> Obtener estancias de una planta
 *    POST /planos/estancias                     -> Insertar o actualizar estancia
 *    PUT /planos/estancias/:planta/:id         -> Actualizar estancia por planta y código
 *    DELETE /planos/estancias/:planta/:id      -> Eliminar estancia por planta y código
 *
 *    --- Prestamos de llaves ---
 *    GET /prestamos-llaves/agrupados   -> Obtener préstamos de llaves agrupados por profesor
 *    POST /prestamos-llaves/prestar    -> Prestar llaves
 *    POST /prestamos-llaves/devolver   -> Devolver llaves
 *
 *    --- Perfiles de usuario ---
 *    GET /perfiles                    -> Obtener todos los perfiles
 *    GET /perfiles/:uid               -> Obtener perfil de un usuario
 *    POST /perfiles                   -> Crear o actualizar perfil (UPSERT)
 *    PUT /perfiles/:uid               -> Actualizar perfil existente
 *    DELETE /perfiles/:uid            -> Eliminar perfil
 *
 *    --- Restricciones ---
 *    GET /restricciones               -> Obtener todas las restricciones
 *    POST /restricciones/asuntos      -> Insertar restricciones de tipo "asuntos propios"
 *    PUT /restricciones/:id           -> Actualizar una restricción
 *    DELETE /restricciones/:id        -> Eliminar una restricción
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

const {
  getPeriodosHorarios,
} = require("../controllers/db/periodosHorariosController");

const {
  getReservasEstancias,
  insertReservaEstancia,
  deleteReservaEstancia,
  getReservasEstanciasPorDia,
  getReservasFiltradas,
  updateReservaEstancia,
} = require("../controllers/db/reservasEstanciasController");

// --- Controlador de asuntos propios ---
const {
  getAsuntos,
  insertAsunto,
  updateAsunto,
  deleteAsunto,
  getNumeroAsuntosPorUsuario,
} = require("../controllers/db/asuntosController");

// --- Controlador de cursos ---
const {
  getCursos,
  insertCurso,
  updateCurso,
  deleteCurso,
} = require("../controllers/db/cursosController");

router.get("/cursos", getCursos);
router.post("/cursos", insertCurso);
router.put("/cursos/:id", updateCurso);
router.delete("/cursos/:id", deleteCurso);

// --- Controlador de libros ---
const {
  getLibros,
  insertLibro,
  updateLibro,
  deleteLibro,
  getLibrosDisponibles,
} = require("../controllers/db/librosController");

router.get("/libros", getLibros);
router.post("/libros", insertLibro);
router.put("/libros/:id", updateLibro);
router.delete("/libros/:id", deleteLibro);
router.get("/libros/disponibles/:curso/:uid", getLibrosDisponibles);

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
} = require("../controllers/db/prestamosController");

// --- Controlador de estancias / planos ---
const {
  getEstanciasByPlanta,
  getEstanciasByTipoEstancia,
  getAllEstancias,
  insertEstancia,
  updateEstancia,
  deleteEstancia,
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
} = require("../controllers/db/restriccionesController");

// ================================================================
//   Rutas de Estancias
// ================================================================
router.get("/planos/estancias", getEstanciasByPlanta);
router.get("/planos/estancias", getEstanciasByTipoEstancia);
router.post("/planos/estancias", insertEstancia);
router.put("/estancias/:id", updateEstancia);
router.delete("/planos/estancias/:planta/:id", deleteEstancia);
router.get("/estancias", getAllEstancias);

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
router.put("/restricciones/:id", updateRestriccion);
router.delete("/restricciones/:id", deleteRestriccion);

// ================================================================
//   Rutas de Asuntos Propios
// ================================================================
router.get("/asuntos-propios", getAsuntos); // Obtener asuntos por mes/año
router.post("/asuntos-propios", insertAsunto); // Insertar nuevo asunto
router.put("/asuntos-propios/:id", updateAsunto); // Actualizar asunto por id
router.delete("/asuntos-propios/:id", deleteAsunto); // Eliminar asunto por id

// Contar asuntos de un usuario
router.get("/asuntos-propios/count", getNumeroAsuntosPorUsuario); // ?uid=<uid>

// ================================================================
//   Rutas de Periodos Horarios
// ================================================================
router.get("/periodos-horarios", getPeriodosHorarios);

// ================================================================
//   Rutas de Reservas de estancias
// ================================================================
router.get("/reservas-estancias", getReservasEstancias);
router.get("/reservas-estancias/filtradas", getReservasFiltradas);
router.post("/reservas-estancias", insertReservaEstancia);
router.delete("/reservas-estancias/:id", deleteReservaEstancia);
router.get("/reservas-estancias/dia", getReservasEstanciasPorDia);
router.put("/reservas-estancias/:id", updateReservaEstancia);


const { getPanelReservas } = require("../controllers/db/panelReservasController");
router.get("/panel/reservas", getPanelReservas);


module.exports = router;
