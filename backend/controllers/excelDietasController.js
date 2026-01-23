// controllers/excelDietasController.js

const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const archiver = require("archiver");

const generarDocumentoExcel = async (req, res) => {
  console.log("Actividad recibida:", req.body);

  try {
    const actividad = req.body;

    const plantillaPath = path.join(__dirname, "../uploads/DIETAS.xlsx");
    console.log("Ruta de plantilla Excel:", plantillaPath, "Existe:", fs.existsSync(plantillaPath));

    if (!fs.existsSync(plantillaPath)) {
      return res
        .status(500)
        .json({ error: "No se encontró la plantilla Excel" });
    }

    // Crear carpeta tmp si no existe
    const tmpDir = path.join(__dirname, "../tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const zipPath = path.join(tmpDir, "Dietas.zip");

    // Borrar ZIP previo si existía
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

    // Crear ZIP en streaming
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(output);

    for (const profesor of actividad.responsables) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(plantillaPath);

      const hoja = workbook.getWorksheet("Anverso");
      if (!hoja) throw new Error("La hoja 'Anverso' no existe en la plantilla");

      hoja.getCell("K3").value = profesor.nombre;

      const filePath = path.join(tmpDir, `${profesor.uid}_DIETAS.xlsx`);
      await workbook.xlsx.writeFile(filePath);

      archive.file(filePath, { name: `${profesor.uid}_DIETAS.xlsx` });
    }

    await archive.finalize();

    // Esperar a que el ZIP termine de escribirse antes de enviar
    output.on("close", () => {
      res.download(zipPath, "Dietas.zip", (err) => {
        if (err) console.error("Error enviando ZIP:", err);
      });
    });

    output.on("error", (err) => {
      console.error("Error escribiendo ZIP:", err);
      res.status(500).json({ error: "Error creando ZIP" });
    });
  } catch (error) {
    console.error("Error en generarDocumentoExcel:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generarDocumentoExcel };
