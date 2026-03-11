const fs = require("fs");
const path = require("path");
const { pool } = require("../../db"); // tu conexión a PostgreSQL
const csv = require("csv-parser");

async function importarHorariosProfesores(req, res) {
  if (!req.file)
    return res.status(400).json({ message: "No se ha subido ningún archivo" });

  const filePath = req.file.path;
  const filasProcesadas = [];

  try {
    const resultados = [];
    fs.createReadStream(filePath)
      .pipe(csv({ headers: false }))
      .on("data", (row) => resultados.push(row))
      .on("end", async () => {
        for (const r of resultados) {
          const fila = Object.values(r);

          let uid,
            dia_semana,
            idperiodo,
            gidnumber,
            idmateria,
            idestancia,
            curso_academico;

          if (fila[1]) {
            // Fila "normal" con curso
            curso_academico = fila[1];
            idestancia = parseInt(fila[2]);
            uid = fila[10];
            gidnumber = fila[11] ? parseInt(fila[11]) : null;
            idmateria = fila[12] ? parseInt(fila[12]) : null;
            dia_semana = fila[6] ? parseInt(fila[6]) : null;
            idperiodo = fila[7] ? parseInt(fila[7]) : null;
          } else {
            // Fila tipo "REUNIÓN TUTORES" sin curso ni estancia
            curso_academico = "";
            idestancia = -1;
            uid = fila[9];
            gidnumber = null;
            idmateria = fila[11] ? parseInt(fila[11]) : null;
            dia_semana = fila[5] ? parseInt(fila[5]) : null;
            idperiodo = fila[6] ? parseInt(fila[6]) : null;
          }

          // Insertar en la tabla
          await pool.query(
            `INSERT INTO horario_profesorado
             (uid, dia_semana, idperiodo, tipo, gidnumber, idmateria, idestancia, curso_academico)
             VALUES ($1,$2,$3,'lectiva',$4,$5,$6,$7)`,
            [
              uid,
              dia_semana,
              idperiodo,
              gidnumber,
              idmateria,
              idestancia,
              curso_academico,
            ]
          );

          filasProcesadas.push(fila);
        }

        res.json({
          message: "Importación completada",
          filas: filasProcesadas.length,
        });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al procesar el archivo" });
  }
}

module.exports = { importarHorariosProfesores };
