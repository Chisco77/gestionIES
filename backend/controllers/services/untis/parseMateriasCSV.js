const fs = require("fs");
const csv = require("csv-parser");

exports.parseMateriasCSV = (filePath) => {

  return new Promise((resolve, reject) => {

    const materias = {};

    fs.createReadStream(filePath)
      .pipe(csv({
        headers: false,
        separator: ","
      }))

      .on("data", (row) => {

        const fila = Object.values(row);

        materias[
          fila[0]?.replace(/"/g, "").trim()
        ] = fila[1]?.replace(/"/g, "").trim();
      })

      .on("end", () => resolve(materias))

      .on("error", reject);
  });
};