const express = require("express");
const router = express.Router();

const { generarDocumentoExcel } = require("../controllers/excelDietasController");

router.post("/generar-excel", generarDocumentoExcel);

module.exports = router;
