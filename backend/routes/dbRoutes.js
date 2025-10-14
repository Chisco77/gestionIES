/**
 * ================================================================
 *  Rutas: dbRoutes.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Rutas relacionadas con la base de datos PostgreSQL.
 *    Incluyen gestión de cursos, libros, estancias, préstamos de libros
 *    y préstamos de llaves.
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
  getCursos,
  insertCurso,
  updateCurso,
  deleteCurso,
} = require("../controllers/db/cursosController");

router.get("/cursos", getCursos);
router.post("/cursos", insertCurso);
router.put("/cursos/:id", updateCurso);
router.delete("/cursos/:id", deleteCurso);

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

const {
getEstanciasByPlanta,
getAllEstancias,
insertEstancia,
updateEstancia,
deleteEstancia,
} = require("../controllers/db/estanciasController");

const {
  getPrestamosLlavesAgrupados,
  prestarLlave,
  devolverLlave,
} = require("../controllers/db/prestamosLlavesController"); 

// Importar controlador de perfiles
const {
  getPerfiles,
  getPerfilUsuario,
  setPerfilUsuario,
  updatePerfilUsuario,
  deletePerfilUsuario,
} = require("../controllers/db/perfilesUsuarioController");


router.get("/planos/estancias", getEstanciasByPlanta); 
router.post("/planos/estancias", insertEstancia); 
router.put("/estancias/:id", updateEstancia);
router.delete("/planos/estancias/:planta/:id", deleteEstancia);
router.get("/estancias", getAllEstancias); 

router.get("/prestamos/agrupados", getPrestamosAgrupados);
router.post("/prestamos/devolver", devolverPrestamos);
router.post("/prestamos/prestar", prestarPrestamos);
router.post ("/prestamos/asignarLibrosMasivo", asignarLibrosMasivo);
router.post("/prestamos/accionDocCompromisoMasivo", accionDocCompromisoMasivo);
router.post("/prestamos/accionLibrosMasivo", accionLibrosMasivo);
router.post("/prestamos/asignarUsuario", asignarUsuario);
router.post ("/prestamos/eliminarUnAlumno", eliminarPrestamosItems);
router.post("/prestamos/update", actualizarPrestamoItem);
router.post("/prestamos/eliminar", eliminarPrestamo);


// Prestamos llaves
router.get("/prestamos-llaves/agrupados", getPrestamosLlavesAgrupados);
router.post("/prestamos-llaves/prestar", prestarLlave);
router.post("/prestamos-llaves/devolver", devolverLlave);

// --- Rutas de Perfiles de usuario ---
// Obtener todos los perfiles
router.get("/perfiles", getPerfiles);

// Obtener perfil de un usuario por uid
router.get("/perfiles/:uid", getPerfilUsuario);

// Crear o actualizar perfil (UPSERT)
router.post("/perfiles", setPerfilUsuario);

// Actualizar perfil existente
router.put("/perfiles/:uid", updatePerfilUsuario);

// Eliminar perfil
router.delete("/perfiles/:uid", deletePerfilUsuario);


module.exports = router;