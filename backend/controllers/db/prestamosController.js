const pool = require("../../db");
const {
  obtenerGruposDesdeLdap,
  buscarPorUid,
} = require("../ldap/usuariosController");

/*async function getPrestamosAgrupados(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { esalumno } = req.query;
    const esAlumnoBool = esalumno === "true"; // porque viene como string desde query

    const { rows: prestamos } = await pool.query(
      "SELECT * FROM prestamos WHERE esalumno = $1",
      [esAlumnoBool]
    );

    const { rows: libros } = await pool.query("SELECT * FROM libros");

    const tipoGrupo = esAlumnoBool ? "school_class" : "school_department"; // filtramos grupo
    const grupos = await obtenerGruposDesdeLdap(ldapSession, tipoGrupo);

    const agrupado = {};

    for (const p of prestamos) {
      const libro = libros.find((l) => l.id === p.idlibro);
      const nombreLibro = libro?.libro || "Desconocido";

      const grupo = grupos.find(
        (g) => Array.isArray(g.memberUid) && g.memberUid.includes(p.uid)
      );

      const curso = grupo?.cn || (esAlumnoBool ? "Curso desconocido" : "Departamento desconocido");

      if (!agrupado[p.uid]) {
        const persona = await new Promise((resolve) => {
          //const buscar = esAlumnoBool ? buscarAlumnoPorUid : buscarAlumnoPorUid;
          const buscar = buscarPorUid;
          buscar(ldapSession, p.uid, (err, datos) => {
            if (!err && datos) {
              resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
            } else {
              resolve(esAlumnoBool ? "Alumno desconocido" : "Profesor desconocido");
            }
          });
        });

        agrupado[p.uid] = {
          uid: p.uid,
          nombreUsuario: persona,
          curso,
          prestamos: [],
        };
      }

      agrupado[p.uid].prestamos.push({
        id: p.id,
        libro: nombreLibro,
        devuelto: p.devuelto,
        fechaentrega: p.fechaentrega,
        fechadevolucion: p.fechadevolucion,
      });
    }

    const resultado = Object.values(agrupado);
    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al obtener préstamos agrupados:", error.message);
    res.status(500).json({ error: "Error al obtener resumen de préstamos" });
  }
}

*/


/*
 Obtiene prestamos e items. 

 Retorna JSON con elementos del tipo:
 [
  {
    "id_prestamo": 4321,
    "uid": "usuario1",
    "nombreUsuario": "Pérez, Juan",
    "curso": "1º ESO A",
    "prestamos": [
      {
        "id_item": 123,
        "libro": "Matemáticas 1º ESO",
        "devuelto": false,
        "fechaentrega": "2025-09-01",
        "fechadevolucion": null
      },
      {
        "id_item": 124,
        "libro": "Lengua 1º ESO",
        "devuelto": true,
        "fechaentrega": "2025-09-01",
        "fechadevolucion": "2025-09-10"
      }
    ]
  }
]

 */
async function getPrestamosAgrupados(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { esalumno } = req.query;
    const esAlumnoBool = esalumno === "true"; // porque viene como string desde query

    // Traemos prestamos + items + nombre del libro directamente con JOIN
    const { rows: prestamos } = await pool.query(
      `SELECT 
         p.id AS prestamo_id, 
         p.uid, 
         p.esalumno, 
         pi.id AS item_id, 
         pi.fechaentrega, 
         pi.fechadevolucion, 
         pi.devuelto,
         l.libro AS nombre_libro
       FROM prestamos p
       JOIN prestamos_items pi ON p.id = pi.idprestamo
       LEFT JOIN libros l ON l.id = pi.idlibro
       WHERE p.esalumno = $1`,
      [esAlumnoBool]
    );

    // Grupos desde LDAP (curso o departamento)
    const tipoGrupo = esAlumnoBool ? "school_class" : "school_department";
    const grupos = await obtenerGruposDesdeLdap(ldapSession, tipoGrupo);

    const agrupado = {};

    for (const p of prestamos) {
      const nombreLibro = p.nombre_libro || "Desconocido";

      const grupo = grupos.find(
        (g) => Array.isArray(g.memberUid) && g.memberUid.includes(p.uid)
      );

      const curso =
        grupo?.cn ||
        (esAlumnoBool ? "Curso desconocido" : "Departamento desconocido");

      if (!agrupado[p.prestamo_id]) {
        // Buscar datos de la persona en LDAP
        const persona = await new Promise((resolve) => {
          const buscar = buscarPorUid;
          buscar(ldapSession, p.uid, (err, datos) => {
            if (!err && datos) {
              resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
            } else {
              resolve(
                esAlumnoBool ? "Alumno desconocido" : "Profesor desconocido"
              );
            }
          });
        });

        agrupado[p.prestamo_id] = {
          id_prestamo: p.prestamo_id,
          uid: p.uid,
          nombreUsuario: persona,
          curso,
          prestamos: [],
        };
      }

      agrupado[p.prestamo_id].prestamos.push({
        id_item: p.item_id,
        libro: nombreLibro,
        devuelto: p.devuelto,
        fechaentrega: p.fechaentrega,
        fechadevolucion: p.fechadevolucion,
      });
    }

    const resultado = Object.values(agrupado);
    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al obtener préstamos agrupados:", error.message);
    res.status(500).json({ error: "Error al obtener resumen de préstamos" });
  }
}


// Marta atributo devuelto a true de prestamos
async function devolverPrestamos(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { ids } = req.body; // ids = array de ids de préstamos a devolver

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No se especificaron préstamos" });
    }

    const fechaDevolucion = new Date();

    // Actualizamos devuelto y fechadevolucion para esos ids
    const query = `
      UPDATE prestamos
      SET devuelto = true,
          fechadevolucion = $1
      WHERE id = ANY($2::int[])
    `;

    await pool.query(query, [fechaDevolucion, ids]);

    res.json({ success: true, cantidad: ids.length });
  } catch (error) {
    console.error("❌ Error al devolver préstamos:", error.message);
    res.status(500).json({ error: "Error al devolver préstamos" });
  }
}

// Marca deuvelto a false de prestamos
async function prestarPrestamos(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { ids } = req.body; // ids = array de ids de préstamos a reactivar (prestar de nuevo)

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No se especificaron préstamos" });
    }

    // Revertimos la devolución: devuelto = false, fechadevolucion = null
    const query = `
      UPDATE prestamos
      SET devuelto = false,
          fechadevolucion = NULL
      WHERE id = ANY($1::int[])
    `;

    await pool.query(query, [ids]);

    res.json({ success: true, cantidad: ids.length });
  } catch (error) {
    console.error("❌ Error al prestar préstamos:", error.message);
    res.status(500).json({ error: "Error al prestar préstamos" });
  }
}

// Inserción masiva de prestamos de alumnos. Asigna a cada alumno de alumnos los libros de libros (los marca con devuelto = false)
/*async function insertarPrestamosMasivo(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { alumnos, libros } = req.body;

    if (!Array.isArray(alumnos) || !Array.isArray(libros)) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const fechaentrega = new Date();
    const valoresAInsertar = [];
    const descartados = [];
    // 
    for (const uid of alumnos) {
      for (const idlibro of libros) {
        // Comprobamos si ya existe
        const resultado = await pool.query(
          `SELECT 1 FROM prestamos WHERE uid = $1 AND idlibro = $2`,
          [uid, idlibro]
        );

        if (resultado.rowCount > 0) {
          descartados.push({ uid, idlibro });
        } else {
          valoresAInsertar.push({
            uid,
            idlibro,
            devuelto: false,
            fechaentrega,
            fechadevolucion: null,
            esalumno: true,
          });
        }
      }
    }
    // Insertar prestamos
    if (valoresAInsertar.length > 0) {
      const insertValues = valoresAInsertar
        .map(
          (_, i) =>
            `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
        )
        .join(", ");

      const parametros = valoresAInsertar.flatMap((v) => [
        v.uid,
        v.idlibro,
        v.devuelto,
        v.fechaentrega,
        v.fechadevolucion,
        v.esalumno,
      ]);

      await pool.query(
        `INSERT INTO prestamos (uid, idlibro, devuelto, fechaentrega, fechadevolucion, esalumno)
         VALUES ${insertValues}`,
        parametros
      );
    }

    res.json({
      success: true,
      insertados: valoresAInsertar.length,
      descartados, // devolvemos los registros ya existentes
    });
  } catch (error) {
    console.error("❌ Error en asignación masiva:", error.message);
    res.status(500).json({ error: "Error al asignar préstamos" });
  }
}*/

async function insertarPrestamosMasivo(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) return res.status(401).json({ error: "No autenticado" });

    const { alumnos, libros } = req.body;
    if (!Array.isArray(alumnos) || !Array.isArray(libros)) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const fechaentrega = new Date();
    const insertados = [];
    const descartados = [];

    for (const uid of alumnos) {
      // Insertar cabecera de préstamo
      const resultPrestamo = await pool.query(
        `INSERT INTO prestamos (uid, esalumno, doc_compromiso) 
         VALUES ($1, true, 0) RETURNING id`,
        [uid]
      );
      const idPrestamo = resultPrestamo.rows[0].id;

      // Preparar valores a insertar en prestamos_items
      const itemsAInsertar = [];
      for (const idlibro of libros) {
        const existe = await pool.query(
          `SELECT 1 FROM prestamos_items WHERE idprestamo = $1 AND idlibro = $2`,
          [idPrestamo, idlibro]
        );
        if (existe.rowCount > 0) {
          descartados.push({ uidalumno: uid, idlibro });
        } else {
          itemsAInsertar.push([idPrestamo, idlibro, false, fechaentrega, null]);
        }
      }

      // Insertar items en batch
      if (itemsAInsertar.length > 0) {
        const valuesStr = itemsAInsertar
          .map(
            (_, i) =>
              `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
          )
          .join(", ");
        const params = itemsAInsertar.flat();
        await pool.query(
          `INSERT INTO prestamos_items (idprestamo, idlibro, devuelto, fechaentrega, fechadevolucion)
           VALUES ${valuesStr}`,
          params
        );
        insertados.push({ uidalumno: uid, idlibros: itemsAInsertar.map((i) => i[1]) });
      }
    }

    res.json({ success: true, insertados, descartados });
  } catch (error) {
    console.error("❌ Error en asignación masiva:", error.message);
    res.status(500).json({ error: "Error al asignar préstamos" });
  }
}



async function prestarUsuario(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { uid, libros, esAlumno } = req.body;

    if (!uid || !Array.isArray(libros) || libros.length === 0 || typeof esAlumno !== "boolean") {
      return res.status(400).json({ error: "Datos incompletos o inválidos" });
    }

    const fechaentrega = new Date();
    const valoresAInsertar = [];
    const descartados = [];

    for (const idlibro of libros) {
      const resultado = await pool.query(
        `SELECT 1 FROM prestamos WHERE uid = $1 AND idlibro = $2 AND devuelto = false`,
        [uid, idlibro]
      );

      if (resultado.rowCount > 0) {
        descartados.push({ uid, idlibro });
      } else {
        valoresAInsertar.push({
          uid,
          idlibro,
          devuelto: false,
          fechaentrega,
          fechadevolucion: null,
          esAlumno,
        });
      }
    }

    if (valoresAInsertar.length > 0) {
      const insertValues = valoresAInsertar
        .map(
          (_, i) =>
            `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
        )
        .join(", ");

      const parametros = valoresAInsertar.flatMap((v) => [
        v.uid,
        v.idlibro,
        v.devuelto,
        v.fechaentrega,
        v.fechadevolucion,
        v.esAlumno,
      ]);

      await pool.query(
        `INSERT INTO prestamos (uid, idlibro, devuelto, fechaentrega, fechadevolucion, esalumno)
         VALUES ${insertValues}`,
        parametros
      );
    }

    res.json({
      success: true,
      insertados: valoresAInsertar.length,
      descartados,
    });
  } catch (error) {
    console.error("❌ Error al prestar libros:", error.message);
    res.status(500).json({ error: "Error al prestar libros" });
  }
}


async function eliminarPrestamosAlumno(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No se especificaron préstamos" });
    }

    await pool.query(`DELETE FROM prestamos WHERE id = ANY($1::int[])`, [ids]);

    res.json({ success: true, eliminados: ids.length });
  } catch (error) {
    console.error("❌ Error al eliminar préstamos:", error.message);
    res.status(500).json({ error: "Error al eliminar préstamos" });
  }
}

module.exports = {
  //getPrestamosEnriquecidos,
  getPrestamosAgrupados,
  insertarPrestamosMasivo,
  devolverPrestamos,
  prestarPrestamos,
  prestarUsuario,
  eliminarPrestamosAlumno,
};
