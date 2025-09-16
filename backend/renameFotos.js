/*

Renombra ficheros de fotos de alumnos de nie.extension a login.extension. Usa archivo Alumnos.xml descargado de rayuela con datos de alumnos.
Deja archivos renombrados en ./uploads/alumnos

Salida: csv con archivos no renombrados.

Ejecucion: node renameFotos.js

*/

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { parse } = require('json2csv');

// Rutas
const xmlPath = './Alumnos.xml';
const fotosDir = './uploads/alumnos/';
const logErroresPath = './fotos_no_encontradas.csv';

// Leer y parsear el XML
fs.readFile(xmlPath, 'utf8', (err, xmlData) => {
  if (err) {
    console.error('❌ Error al leer el archivo XML:', err);
    return;
  }

  xml2js.parseString(xmlData, { explicitArray: false }, (err, result) => {
    if (err) {
      console.error('❌ Error al parsear el XML:', err);
      return;
    }

// Buscar el primer nodo que contenga "alumno"
let listaAlumnos = null;

for (const key of Object.keys(result)) {
  if (result[key]?.alumno) {
    listaAlumnos = result[key].alumno;
    break;
  }
}

if (!listaAlumnos) {
  console.error("❌ No se encontró el nodo 'alumno' en el XML.");
  return;
}

    const alumnos = Array.isArray(listaAlumnos) ? listaAlumnos : [listaAlumnos];

    const errores = [];

    alumnos.forEach((alumno) => {
      const login = alumno?.['datos-usuario-rayuela']?.['login'];
      const foto = alumno?.['foto'];
      const conFoto = foto?.['con-foto'] === 'true';
      const nombreFichero = foto?.['nombre-fichero'];

      if (conFoto && login && nombreFichero) {
        const ext = path.extname(nombreFichero); // .png, .jpg, etc.
        const origen = path.join(fotosDir, nombreFichero);
        const destino = path.join(fotosDir, `${login}${ext}`);

        if (fs.existsSync(origen)) {
          fs.rename(origen, destino, (err) => {
            if (err) {
              console.error(`❌ Error al renombrar ${origen}:`, err.message);
              errores.push({ login, nombreFichero, motivo: err.message });
            } else {
              console.log(`✅ ${nombreFichero} → ${login}${ext}`);
            }
          });
        } else {
          console.warn(`⚠️ Archivo no encontrado: ${origen}`);
          errores.push({ login, nombreFichero, motivo: 'Archivo no encontrado' });
        }
      }
    });

    // Espera unos ms para asegurar que renames hayan terminado
    setTimeout(() => {
      if (errores.length > 0) {
        const csv = parse(errores, { fields: ['login', 'nombreFichero', 'motivo'] });
        fs.writeFileSync(logErroresPath, csv, 'utf8');
        console.log(`📄 Log de errores guardado en: ${logErroresPath}`);
      } else {
        console.log('🎉 Todos los archivos fueron renombrados correctamente.');
      }
    }, 1000);
  });
});
