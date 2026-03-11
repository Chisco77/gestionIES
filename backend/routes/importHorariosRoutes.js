const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Configurar carpeta de uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) =>
    cb(null, `horarios_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Controlador
const {
  importarHorariosProfesores,
} = require("../controllers/db/importHorariosProfesores");

// Ruta POST
router.post(
  "/horarios-profesores",
  upload.single("file"),
  importarHorariosProfesores
);

module.exports = router;
