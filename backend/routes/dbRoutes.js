// routes/dbRoutes.js
const express = require("express");
const router = express.Router();

const {
  getCursos,
  insertCurso,
  updateCurso,
  deleteCurso,
} = require("../controllers/db/cursosController");

const {
  getLibros,
  insertLibro,
  updateLibro,
  deleteLibro,
} = require("../controllers/db/librosController");

router.get("/cursos", getCursos);
router.post("/cursos", insertCurso);
router.put("/cursos/:id", updateCurso);
router.delete("/cursos/:id", deleteCurso);

router.get("/libros", getLibros);
router.post("/libros", insertLibro);
router.put("/libros/:id", updateLibro);
router.delete("/libros/:id", deleteLibro);

const {
  asignarLibrosMasivo,
  accionDocCompromisoMasivo,
  accionLibrosMasivo,
  getPrestamosAgrupados,
  devolverPrestamos,
  prestarPrestamos,
  prestarUsuario,
  eliminarPrestamosAlumno,
} = require("../controllers/db/prestamosController");

const {
getEstanciasByPlanta,
upsertEstancia,
updateEstancia,
deleteEstancia,
} = require("../controllers/db/estanciasController");

const {
  getPrestamosLlavesAgrupados,
  prestarLlave,
  devolverLlave,
} = require("../controllers/db/prestamosLlavesController"); // nuevo controlador

router.get("/planos/estancias", getEstanciasByPlanta); // ?planta=baja|primera|segunda
router.post("/planos/estancias", upsertEstancia); // upsert por (planta,codigo)
router.put("/planos/estancias/:planta/:id", updateEstancia); // :id = codigo
router.delete("/planos/estancias/:planta/:id", deleteEstancia); // :id = codigo

router.get("/prestamos/agrupados", getPrestamosAgrupados);
router.post("/prestamos/devolver", devolverPrestamos);
router.post("/prestamos/prestar", prestarPrestamos);
router.post ("/prestamos/asignarLibrosMasivo", asignarLibrosMasivo);
router.post("/prestamos/accionDocCompromisoMasivo", accionDocCompromisoMasivo);
router.post("/prestamos/accionLibrosMasivo", accionLibrosMasivo);
router.post("/prestamos/prestarUsuario", prestarUsuario);
router.post ("/prestamos/eliminarUnAlumno", eliminarPrestamosAlumno);

// --- Prestamos llaves ---
router.get("/prestamos-llaves/agrupados", getPrestamosLlavesAgrupados);
router.post("/prestamos-llaves/prestar", prestarLlave);
router.post("/prestamos-llaves/devolver", devolverLlave);

module.exports = router;