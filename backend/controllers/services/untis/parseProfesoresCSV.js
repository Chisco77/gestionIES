const fs = require("fs");
const csv = require("csv-parser");

exports.parseProfesoresCSV = (filePath) => {

  return new Promise((resolve, reject) => {

    const profesores = {};

    fs.createReadStream(filePath)
      .pipe(csv({
        headers: false,
        separator: ","
      }))

      .on("data", (row) => {

        const fila = Object.values(row);

        profesores[fila[0]?.replace(/"/g, "").trim()] = {
          codigo: fila[0]?.replace(/"/g, "").trim(),
          nombre: fila[1]?.replace(/"/g, "").trim(),
        };
      })

      .on("end", () => resolve(profesores))

      .on("error", reject);
  });
};