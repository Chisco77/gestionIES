const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  importHorariosUntisController,
} = require("../controllers/db/importHorariosUntisController");

// ======================================================
// Crear carpeta uploads/horarios si no existe
// ======================================================

const uploadPath = path.join(__dirname, "../uploads/horarios");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ======================================================
// Configuración multer
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, `${unique}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.toLowerCase().endsWith(".csv")) {
    return cb(new Error("Solo se permiten archivos CSV"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

// ======================================================
// Ruta importación horarios
// ======================================================

router.post(
  "/horarios-untis",

  upload.fields([
    { name: "horarios", maxCount: 1 },
    { name: "profesores", maxCount: 1 },
    { name: "materias", maxCount: 1 },
  ]),

  importHorariosUntisController
);

module.exports = router;
