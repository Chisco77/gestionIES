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
    const resultados = [];

    fs.createReadStream(filePath)
      .pipe(csv({ headers: false }))
      .on("data", (row) => resultados.push(row))
      // ... (resto del código anterior igual)

      .on("end", async () => {
        const totalFilas = resultados.length;
        let insertadas = 0;
        let erroresCount = 0;
        const filasConErrores = [];

        // 1. Configuración de cabeceras SSE (Añadimos X-Accel-Buffering para evitar bloqueos)
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        });

        try {
          // Truncamos la tabla antes de empezar
          await db.query("TRUNCATE horario_profesorado");

          // 2. Procesamos fila a fila de forma asíncrona
          for (let index = 0; index < totalFilas; index++) {
            const r = resultados[index];
            const filaCSV = Object.values(r);

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
              uid = filaCSV[9];
              gidnumber = null;
              idmateria = filaCSV[11] ? parseInt(filaCSV[11]) : null;
              dia_semana = filaCSV[5] ? parseInt(filaCSV[5]) : null;
              idperiodo = filaCSV[6] ? parseInt(filaCSV[6]) : null;
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
            const erroresFila = validarFila(filaObj);

            if (erroresFila.length > 0) {
              erroresCount++;
              filasConErrores.push({ fila: index + 1, errores: erroresFila });
            } else {
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
            }

            // 3. ENVIAR PROGRESO (Cada 10 filas o al final para no saturar el canal)
            if (index % 10 === 0 || index === totalFilas - 1) {
              res.write(
                `data: ${JSON.stringify({
                  procesadas: index + 1,
                  totalFilas,
                })}\n\n`
              );
            }
          }

          // 4. FIN DEL STREAM: Enviamos el resumen final
          const resumen = {
            insertadas,
            errores: erroresCount,
            total: totalFilas,
          };

          res.write(`event: end\ndata: ${JSON.stringify(resumen)}\n\n`);
          res.end();
        } catch (err) {
          console.error("Error en el bucle de inserción:", err);
          res.write(
            `data: ${JSON.stringify({ error: "Error insertando datos" })}\n\n`
          );
          res.end();
        } finally {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
