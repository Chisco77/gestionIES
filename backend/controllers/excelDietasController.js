// controllers/excelDietasController.js

const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const archiver = require("archiver");

const generarDocumentoExcel = async (req, res) => {
  try {
    const actividad = req.body;

    const plantillaPath = path.join(__dirname, "../uploads/DIETAS.xlsx");

    if (!fs.existsSync(plantillaPath)) {
      return res.status(500).json({ error: "No se encontró la plantilla Excel" });
    }

    // Crear carpeta tmp si no existe
    const tmpDir = path.join(__dirname, "../tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    // Archivo ZIP final
    const zipPath = path.join(tmpDir, "Dietas.zip");

    // Crear ZIP en streaming
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(output);

    const ubicacion = actividad.ubicacion;

    for (const profesor of actividad.responsables) {
      const uid = profesor.uid;
      const nombreProfesor = profesor.nombre;

      // Leer plantilla por cada profesor
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(plantillaPath);

      const hoja = workbook.getWorksheet("Anverso");
      if (!hoja) {
        return res.status(500).json({ error: "La hoja 'Anverso' no existe en la plantilla" });
      }

      // Rellenar celdas
      //hoja.getCell("D3").value = ubicacion;
      hoja.getCell("K3").value = nombreProfesor;

      // Nombre del archivo para este profesor
      const fileName = `${uid}_DIETAS.xlsx`;
      const filePath = path.join(tmpDir, fileName);

      // Guardar el archivo individual
      await workbook.xlsx.writeFile(filePath);

      // Añadir al ZIP
      archive.file(filePath, { name: fileName });
    }

    // Finalizar el ZIP
    await archive.finalize();

    // Esperar a que termine el stream y enviar al usuario
    output.on("close", () => {
      res.download(zipPath, "Dietas.zip", (err) => {
        if (err) console.error("Error enviando ZIP:", err);
      });
    });

  } catch (error) {
    console.error("Error en generarDocumentoExcel:", error);
    res.status(500).json({ error: "Error generando documento Excel" });
  }
};

module.exports = { generarDocumentoExcel };
