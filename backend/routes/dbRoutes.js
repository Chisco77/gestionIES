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

// --- Controladores ---
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

// --- Controlador de cursos ---
const {
  getCursos,
  insertCurso,
  updateCurso,
  deleteCurso,
} = require("../controllers/db/cursosController");

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
} = require("../controllers/db/prestamosController");

// --- Controlador de estancias / planos ---
const {
  getEstanciasByPlanta,
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
} = require("../controllers/db/restriccionesController");

// --- Controlador de asuntos propios unificado ---
const {
  getAsuntosPropios,
  insertAsuntoPropio,
  updateAsuntoPropio,
  deleteAsuntoPropio,
} = require("../controllers/db/asuntosPropiosController");

// ================================================================
//   Rutas de Estancias
// ================================================================
router.get("/planos/estancias", getEstanciasByPlanta);
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
router.get("/restricciones/asuntos", getRestriccionesAsuntos);

// ================================================================
//   Rutas de Asuntos Propios
// ================================================================
router.get("/asuntos-propios", getAsuntosPropios); // Filtrable por uid, fecha, descripcion
router.post("/asuntos-propios", insertAsuntoPropio);
router.put("/asuntos-propios/:id", updateAsuntoPropio);
router.delete("/asuntos-propios/:id", deleteAsuntoPropio);

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

// ================================================================
const {
  getPanelReservas,
} = require("../controllers/db/panelReservasController");
router.get("/panel/reservas", getPanelReservas);

module.exports = router;
