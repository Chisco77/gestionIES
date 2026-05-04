/*const path = require("path");
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
*/

const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const archiver = require("archiver");
const db = require("../db"); // Importar tu conexión a DB
const { buscarPorUid } = require("./ldap/usuariosController");

const generarDocumentoExcel = async (req, res) => {
  try {
    const actividad = req.body;
    // Necesitamos la sesión LDAP para buscar en el directorio
    const ldapSession = req.session?.ldap;

    if (!ldapSession)
      return res.status(401).json({ ok: false, error: "No autenticado" });

    if (
      !actividad ||
      !actividad.responsables ||
      !Array.isArray(actividad.responsables)
    ) {
      return res
        .status(400)
        .json({ error: "La actividad no tiene responsables válidos" });
    }

    // --- 1. OBTENER DATOS DE LA DIRECTORA ---
    let nombreDirectora = "";
    try {
      // Buscamos el UID en la base de datos
      const { rows } = await db.query(
        "SELECT uid_directora FROM configuracion_centro LIMIT 1"
      );
      const uidDirectora = rows[0]?.uid_directora;

      if (uidDirectora && ldapSession) {
        // Promisificamos la función de búsqueda LDAP
        const directoraLdap = await new Promise((resolve, reject) => {
          buscarPorUid(ldapSession, uidDirectora, (err, user) => {
            if (err) reject(err);
            else resolve(user);
          });
        });

        if (directoraLdap) {
          nombreDirectora = `${directoraLdap.givenName} ${directoraLdap.sn}`;
        }

        console.log("Directora: ", nombreDirectora);
      }
    } catch (err) {
      console.error(
        "⚠️ No se pudo obtener el nombre de la directora:",
        err.message
      );
      // No bloqueamos el proceso, simplemente J33 quedará vacío o con un aviso
    }

    const plantillaPath = path.resolve(__dirname, "../uploads/DIETAS.xlsx");
    if (!fs.existsSync(plantillaPath)) {
      return res
        .status(500)
        .json({ error: "No se encontró la plantilla Excel" });
    }

    const archive = archiver("zip", { zlib: { level: 9 } });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="Dietas.zip"');
    archive.pipe(res);

    // ==========================================
    // Procesar cada responsable
    // ==========================================
    for (const profesor of actividad.responsables) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(plantillaPath);

      const hojaAnverso = workbook.getWorksheet("Anverso");
      const hojaReverso = workbook.getWorksheet("Reverso");
      if (hojaAnverso) {
        const cuerpo = profesor.cuerpo || "";
        const dni = profesor.dni || "";
        const tipoEmpleado = profesor.tipo_empleado || "";
        const letraVinculacion = tipoEmpleado
          .toLowerCase()
          .includes("funcionario")
          ? "F"
          : "L";

        // Datos del profesor
        hojaAnverso.getCell("K3").value = profesor.nombre || "Sin nombre";
        hojaAnverso.getCell("K4").value = cuerpo;
        hojaAnverso.getCell("O4").value = letraVinculacion;
        hojaAnverso.getCell("Q4").value = dni;
        hojaAnverso.getCell("Q3").value = 15;

        // --- 2. ASIGNAR NOMBRE DE LA DIRECTORA ---
        hojaAnverso.getCell("J33").value = nombreDirectora;
        hojaAnverso.getCell("H43").value = nombreDirectora;
      }

      // --- PROCESAR REVERSO ---
      if (hojaReverso) {
        // Asignar nombre de la directora en la celda E50 del Reverso
        hojaReverso.getCell("E50").value = nombreDirectora;
        hojaReverso.getCell("H30").value = profesor.nombre;
      }

      const buffer = await workbook.xlsx.writeBuffer();
      archive.append(buffer, {
        name: `${profesor.uid || "profesor"}_DIETAS.xlsx`,
      });
    }

    await archive.finalize();
  } catch (error) {
    console.error("❌ Error crítico:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error interno" });
    }
  }
};

module.exports = { generarDocumentoExcel };
