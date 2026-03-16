// backend/controllers/db/importHorariosProfesores.js
const fs = require("fs");
const csv = require("csv-parser");
const db = require("../../db");

/**
 * Valida una fila del CSV y devuelve un array con errores
 */
function validarFila(fila) {
  const errores = [];
  if (!fila.uid) errores.push("uid vacío");
  if (fila.tipo === "lectiva") {
    if (fila.dia_semana == null) errores.push("dia_semana vacío");
    if (fila.idperiodo == null) errores.push("idperiodo vacío");
    if (fila.idestancia == null) errores.push("idestancia vacío");
  }
  if (!fila.curso_academico) errores.push("curso_academico vacío");
  return errores;
}

/**
 * Importar horarios de profesores con SSE
 */
exports.importarHorariosProfesores = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se ha subido ningún archivo" });
    }

    const filePath = req.file.path;
    console.log("📥 Inicio importación horarios:", filePath);

    const resultados = [];

    fs.createReadStream(filePath)
      .pipe(csv({ headers: false }))
      .on("data", (row) => {
        resultados.push(row);
      })
      .on("end", async () => {
        console.log("📄 CSV leído completamente. Filas:", resultados.length);

        const totalFilas = resultados.length;
        let insertadas = 0;
        let erroresCount = 0;
        const filasConErrores = [];

        // 1. Configuración de cabeceras SSE
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        });

        try {
          console.log("🧹 Truncando tabla horario_profesorado...");
          await db.query("TRUNCATE horario_profesorado");
          console.log("✅ Tabla truncada");

          // 2. Procesamos fila a fila
          for (let index = 0; index < totalFilas; index++) {
            const r = resultados[index];
            const filaCSV = Object.values(r);

            console.log("➡️ Procesando fila", index + 1);

            let uid,
              dia_semana,
              idperiodo,
              gidnumber,
              idmateria,
              idestancia,
              curso_academico,
              tipo;

            const hoy = new Date();
            const year = hoy.getFullYear();
            const month = hoy.getMonth() + 1;
            const cursoDefault =
              month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

            if (filaCSV[1]) {
              curso_academico = cursoDefault;
              idestancia = parseInt(filaCSV[2]);
              uid = filaCSV[10];
              gidnumber = filaCSV[11] ? parseInt(filaCSV[11]) : null;
              idmateria = filaCSV[12] ? parseInt(filaCSV[12]) : null;
              dia_semana = filaCSV[6] ? parseInt(filaCSV[6]) : null;
              idperiodo = filaCSV[7] ? parseInt(filaCSV[7]) : null;
              tipo = "lectiva";
            } else {
              curso_academico = cursoDefault;
              idestancia = null;
              uid = filaCSV[10]; // ← AQUÍ estaba el fallo
              gidnumber = null;
              idmateria = filaCSV[12] ? parseInt(filaCSV[12]) : null;
              dia_semana = filaCSV[6] ? parseInt(filaCSV[6]) : null;
              idperiodo = filaCSV[7] ? parseInt(filaCSV[7]) : null;
              tipo = "tutores";
            }

            const filaObj = {
              uid,
              dia_semana,
              idperiodo,
              tipo,
              gidnumber,
              idmateria,
              idestancia,
              curso_academico,
            };

            console.log("🔎 Datos interpretados:", filaObj);

            const erroresFila = validarFila(filaObj);

            if (erroresFila.length > 0) {
              console.log("⚠️ Error validación fila", index + 1, erroresFila);

              erroresCount++;
              filasConErrores.push({ fila: index + 1, errores: erroresFila });
            } else {
              try {
                console.log("📝 Insertando fila", index + 1);

                await db.query(
                  `INSERT INTO horario_profesorado 
           (uid, dia_semana, idperiodo, tipo, gidnumber, idmateria, idestancia, curso_academico)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                  [
                    filaObj.uid,
                    filaObj.dia_semana,
                    filaObj.idperiodo,
                    filaObj.tipo,
                    filaObj.gidnumber,
                    filaObj.idmateria,
                    filaObj.idestancia,
                    filaObj.curso_academico,
                  ]
                );

                insertadas++;
                console.log("✅ Insertada fila", index + 1);
              } catch (err) {
                console.error(
                  "❌ Error insertando fila",
                  index + 1,
                  err.message
                );
                throw err;
              }
            }

            // 3. ENVIAR PROGRESO
            if (index % 10 === 0 || index === totalFilas - 1) {
              console.log(`📡 Enviando progreso: ${index + 1}/${totalFilas}`);

              res.write(
                `data: ${JSON.stringify({
                  procesadas: index + 1,
                  totalFilas,
                })}\n\n`
              );
            }
          }

          // 4. FIN DEL STREAM
          const resumen = {
            insertadas,
            errores: erroresCount,
            total: totalFilas,
          };

          console.log("🏁 Importación finalizada:", resumen);

          res.write(`event: end\ndata: ${JSON.stringify(resumen)}\n\n`);
          res.end();
        } catch (err) {
          console.error("❌ Error en el bucle de inserción:", err);

          res.write(
            `data: ${JSON.stringify({ error: "Error insertando datos" })}\n\n`
          );
          res.end();
        } finally {
          if (fs.existsSync(filePath)) {
            console.log("🗑️ Eliminando archivo temporal:", filePath);
            fs.unlinkSync(filePath);
          }
        }
      });
  } catch (error) {
    console.error("❌ Error importando horarios:", error);

    if (req.file?.path) fs.unlinkSync(req.file.path);

    res.status(500).json({
      message: "Error interno al procesar el archivo",
      error: error.message,
    });
  }
};
