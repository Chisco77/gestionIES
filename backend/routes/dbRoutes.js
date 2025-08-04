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
 // getPrestamosEnriquecidos,
  insertarPrestamosMasivo,
  getPrestamosAgrupados,
  devolverPrestamos,
  prestarPrestamos,
  prestarUsuario,
  eliminarPrestamosAlumno,
} = require("../controllers/db/prestamosController");

router.get("/prestamos/agrupados", getPrestamosAgrupados);
//router.get("/prestamos", getPrestamosEnriquecidos);
router.post("/prestamos/devolver", devolverPrestamos);
router.post("/prestamos/prestar", prestarPrestamos);
router.post ("/prestamos/insertarMasivo", insertarPrestamosMasivo);
router.post("/prestamos/prestarUsuario", prestarUsuario);
router.post ("/prestamos/eliminarUnAlumno", eliminarPrestamosAlumno);

module.exports = router;