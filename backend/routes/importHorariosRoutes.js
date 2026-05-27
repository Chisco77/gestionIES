const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  importHorariosUntisController,
} = require("../controllers/db/importHorariosUntisController");

// ======================================================
// Forzamos la ruta exacta que mapea tu docker-compose.yml
// ======================================================
const uploadPath = "/public/horarios";

// En entornos Docker de producción, es mucho más seguro meter la creación
// de la carpeta dentro de un bloque try/catch para que NUNCA tire el servidor si hay un problema de permisos.
try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log(`✅ Carpeta de horarios vinculada en: ${uploadPath}`);
  }
} catch (err) {
  console.error(
    `⚠️ Advertencia creando la carpeta de horarios en disco:`,
    err.message
  );
}

// ======================================================
// Configuración multer
// ======================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Si por algún motivo de permisos falló la creación, nos aseguramos aquí de validar
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Limpiamos los espacios en blanco por si acaso
    const nombreLimpio = file.originalname.replace(/\s+/g, "_");
    cb(null, `${unique}-${nombreLimpio}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.toLowerCase().endsWith(".csv")) {
    return cb(new Error("Solo se permiten archivos CSV"), false);
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

// Middleware para que errores de Multer (ej. subir un archivo corrupto o erróneo)
// no provoquen un crash de la app en producción
router.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ OK: false, error: error.message });
  }
  next();
});

module.exports = router;
