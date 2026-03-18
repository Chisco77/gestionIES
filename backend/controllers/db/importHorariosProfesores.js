const fs = require("fs");
const csv = require("csv-parser");
const db = require("../../db");

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

exports.importarHorariosProfesores = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ message: "No se ha subido ningún archivo" });

    const filePath = req.file.path;
    const resultadosRaw = [];

    // 1. LEER CSV
    fs.createReadStream(filePath)
      .pipe(csv({ headers: false }))
      .on("data", (row) => {
        resultadosRaw.push(row);
      })
      .on("end", async () => {
        const mapaHorario = new Map();
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = hoy.getMonth() + 1;
        const cursoDefault =
          month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

        // 2. AGRUPAR (Aquí es donde convertimos múltiples filas en arrays de gidnumber)
        resultadosRaw.forEach((r) => {
          const filaCSV = Object.values(r);
          const uid = filaCSV[10];
          const dia = filaCSV[6] ? parseInt(filaCSV[6]) : null;
          const periodo = filaCSV[7] ? parseInt(filaCSV[7]) : null;

          if (!uid || !dia || !periodo) return;

          const clave = `${uid}-${dia}-${periodo}-${cursoDefault}`;

          if (!mapaHorario.has(clave)) {
            mapaHorario.set(clave, {
              uid,
              dia_semana: dia,
              idperiodo: periodo,
              tipo: filaCSV[1] ? "lectiva" : "tutores",
              gidnumbers: filaCSV[11] ? [parseInt(filaCSV[11])] : [],
              idmateria: filaCSV[12] ? parseInt(filaCSV[12]) : null,
              idestancia: filaCSV[1] ? parseInt(filaCSV[2]) : null,
              curso_academico: cursoDefault,
            });
          } else {
            const existente = mapaHorario.get(clave);
            if (filaCSV[11]) {
              const gid = parseInt(filaCSV[11]);
              if (!existente.gidnumbers.includes(gid))
                existente.gidnumbers.push(gid);
            }
          }
        });

        const datosFinales = Array.from(mapaHorario.values());
        const total = datosFinales.length;
        let insertadas = 0;

        // 3. RESPUESTA SSE
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        });

        try {
          await db.query("TRUNCATE horario_profesorado RESTART IDENTITY");

          for (let i = 0; i < total; i++) {
            const f = datosFinales[i];
            const errores = validarFila(f);

            if (errores.length === 0) {
              await db.query(
                `INSERT INTO horario_profesorado 
                 (uid, dia_semana, idperiodo, tipo, gidnumber, idmateria, idestancia, curso_academico)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [
                  f.uid,
                  f.dia_semana,
                  f.idperiodo,
                  f.tipo,
                  f.gidnumbers,
                  f.idmateria,
                  f.idestancia,
                  f.curso_academico,
                ]
              );
              insertadas++;
            }

            if (i % 10 === 0 || i === total - 1) {
              res.write(
                `data: ${JSON.stringify({ procesadas: i + 1, totalFilas: total })}\n\n`
              );
            }
          }

          res.write(
            `event: end\ndata: ${JSON.stringify({ insertadas, total })}\n\n`
          );
          res.end();
        } catch (err) {
          res.write(
            `data: ${JSON.stringify({ error: "Error en base de datos" })}\n\n`
          );
          res.end();
        } finally {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
  } catch (error) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ ok: false, error: error.message });
  }
};
