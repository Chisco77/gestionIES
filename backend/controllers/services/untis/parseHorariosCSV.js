const fs = require("fs");
const csv = require("csv-parser");

exports.parseHorariosCSV = (filePath) => {

  return new Promise((resolve, reject) => {

    const horarios = [];

    fs.createReadStream(filePath)
      .pipe(csv({
        headers: false,
        separator: ","
      }))

      .on("data", (row) => {

        const fila = Object.values(row);

        horarios.push({

          grupo: fila[1]?.trim(),

          codigoProfesor:
            fila[2]?.trim(),

          codigoMateria:
            fila[3]?.trim(),

          dia:
            parseInt(fila[5]),

          periodo:
            parseInt(fila[6]),
        });
      })

      .on("end", () => resolve(horarios))

      .on("error", reject);
  });
};