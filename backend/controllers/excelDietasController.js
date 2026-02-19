const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const archiver = require("archiver");

const generarDocumentoExcel = async (req, res) => {
  try {
    const actividad = req.body;

    // 1. Verificación de datos recibidos
    if (!actividad || !actividad.responsables || !Array.isArray(actividad.responsables)) {
      console.error("❌ Datos de actividad inválidos:", actividad);
      return res.status(400).json({ error: "La actividad no tiene responsables válidos" });
    }

    // 2. Ruta de la plantilla (Usamos path.resolve para evitar errores de ruta relativa)
    const plantillaPath = path.resolve(__dirname, "../uploads/DIETAS.xlsx");
    
    if (!fs.existsSync(plantillaPath)) {
      console.error("❌ Plantilla no encontrada en:", plantillaPath);
      return res.status(500).json({ error: "No se encontró la plantilla Excel en el servidor" });
    }

    // 3. Configuración del ZIP
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Si hay un error en el streaming del zip, lo capturamos
    archive.on("error", (err) => {
      console.error("❌ Error en Archiver:", err);
      throw err; 
    });

    // 4. Headers: IMPORTANTE enviarlos antes de empezar el pipe
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="Dietas.zip"');

    // El archive envía los datos directamente al objeto response (res)
    archive.pipe(res);

    // 5. Procesar cada profesor
    for (const profesor of actividad.responsables) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(plantillaPath);

      const hoja = workbook.getWorksheet("Anverso");
      if (hoja) {
        // Asegúrate de que profesor.nombre exista
        hoja.getCell("K3").value = profesor.nombre || "Sin nombre";
      }

      // En lugar de escribir a un archivo, escribimos a un Buffer en memoria
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Añadimos el buffer al ZIP
      archive.append(buffer, { name: `${profesor.uid || 'profesor'}_DIETAS.xlsx` });
    }

    // 6. Finalizar
    await archive.finalize();
    console.log("✅ ZIP enviado correctamente");

  } catch (error) {
    console.error("❌ Error crítico en generarDocumentoExcel:", error);
    
    // Si el error ocurre antes de que el pipe empiece, enviamos un 500
    if (!res.headersSent) {
      res.status(500).json({ error: "Error interno al generar el ZIP" });
    } else {
      // Si ya se habían enviado headers, cerramos la conexión
      res.end();
    }
  }
};

module.exports = { generarDocumentoExcel };