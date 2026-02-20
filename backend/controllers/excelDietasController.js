const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const archiver = require("archiver");

const generarDocumentoExcel = async (req, res) => {
  try {
    const actividad = req.body;

    if (
      !actividad ||
      !actividad.responsables ||
      !Array.isArray(actividad.responsables)
    ) {
      console.error("❌ Datos de actividad inválidos:", actividad);
      return res
        .status(400)
        .json({ error: "La actividad no tiene responsables válidos" });
    }

    const plantillaPath = path.resolve(__dirname, "../uploads/DIETAS.xlsx");

    if (!fs.existsSync(plantillaPath)) {
      console.error("❌ Plantilla no encontrada en:", plantillaPath);
      return res
        .status(500)
        .json({ error: "No se encontró la plantilla Excel en el servidor" });
    }

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      console.error("❌ Error en Archiver:", err);
      throw err;
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="Dietas.zip"');

    archive.pipe(res);

    // ==========================================
    // Procesar cada responsable
    // ==========================================
    for (const profesor of actividad.responsables) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(plantillaPath);

      const hoja = workbook.getWorksheet("Anverso");

      if (hoja) {
        const cuerpo = profesor.cuerpo || "";
        const dni = profesor.dni || "";
        const tipoEmpleado = profesor.tipo_empleado || "";

        const letraVinculacion = tipoEmpleado
          .toLowerCase()
          .includes("funcionario")
          ? "F"
          : "L";

        hoja.getCell("K3").value = profesor.nombre || "Sin nombre";
        hoja.getCell("K4").value = cuerpo;
        hoja.getCell("O4").value = letraVinculacion;
        hoja.getCell("Q4").value = dni;
        hoja.getCell("Q3").value = 15;
      }

      const buffer = await workbook.xlsx.writeBuffer();

      archive.append(buffer, {
        name: `${profesor.uid || "profesor"}_DIETAS.xlsx`,
      });
    }

    await archive.finalize();
    console.log("✅ ZIP enviado correctamente");
  } catch (error) {
    console.error("❌ Error crítico en generarDocumentoExcel:", error);

    if (!res.headersSent) {
      res.status(500).json({ error: "Error interno al generar el ZIP" });
    } else {
      res.end();
    }
  }
};

module.exports = { generarDocumentoExcel };
