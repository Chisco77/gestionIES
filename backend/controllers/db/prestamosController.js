const pool = require("../../db");
const {
  obtenerGruposDesdeLdap,
  buscarPorUid,
} = require("../ldap/usuariosController");

/*
async function getPrestamosEnriquecidos(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { rows: prestamos } = await pool.query("SELECT * FROM prestamos");
    const { rows: libros } = await pool.query("SELECT * FROM libros");
    const grupos = await obtenerGruposDesdeLdap(ldapSession, 'school_class');

    const resultado = await Promise.all(
      prestamos.map((p) => {
        return new Promise((resolve) => {
          const libro = libros.find((l) => l.id === p.idlibro);
          const nombreLibro = libro?.libro || "Desconocido";

          const grupo = grupos.find(
            (g) => Array.isArray(g.memberUid) && g.memberUid.includes(p.uidalumno)
          );

          const curso = grupo?.cn || "Curso desconocido";

          buscarAlumnoPorUid(ldapSession, p.uidalumno, (err, alumno) => {
            let nombreAlumno = "Alumno desconocido";
            if (!err && alumno) {
              nombreAlumno = `${alumno.sn || ""}, ${alumno.givenName || ""}`.trim();
            }

            resolve({
              ...p,
              libro: nombreLibro,
              curso,
              nombreAlumno,
            });
          });
        });
      })
    );
    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al obtener préstamos enriquecidos:", error.message);
    res.status(500).json({ error: "Error al obtener préstamos enriquecidos" });
  }
} */

// Devuelve registros de alumnos con prestamos: uidalumno, nombreAlumno, curso y lista de prestamos
// Obtiene datos de nodo People de LDAP (alumnos tiene atributo "school_class") y tablas libros y prestamos de postgresql.
/*async function getPrestamosAgrupados(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { rows: prestamos } = await pool.query("SELECT * FROM prestamos");
    const { rows: libros } = await pool.query("SELECT * FROM libros");
    const grupos = await obtenerGruposDesdeLdap(ldapSession, "school_class");

    const agrupado = {};

    for (const p of prestamos) {
      const libro = libros.find((l) => l.id === p.idlibro);
      const nombreLibro = libro?.libro || "Desconocido";

      const grupo = grupos.find(
        (g) => Array.isArray(g.memberUid) && g.memberUid.includes(p.uid)
      );
      const curso = grupo?.cn || "Curso desconocido";

      if (!agrupado[p.uid]) {
        const alumno = await new Promise((resolve) => {
          buscarAlumnoPorUid(ldapSession, p.uid, (err, datos) => {
            if (!err && datos) {
              resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
            } else {
              resolve("Alumno desconocido");
            }
          });
        });

        agrupado[p.uid] = {
          uid: p.uid,
          nombreAlumno: alumno,
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
}*/

async function getPrestamosAgrupados(req, res) {
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

    const tipoGrupo = esAlumnoBool ? "school_class" : "school_department"; // o lo que uses para profesores
    const grupos = await obtenerGruposDesdeLdap(ldapSession, tipoGrupo);

    const agrupado = {};

    for (const p of prestamos) {
      const libro = libros.find((l) => l.id === p.idlibro);
      const nombreLibro = libro?.libro || "Desconocido";

      const grupo = grupos.find(
        (g) => Array.isArray(g.memberUid) && g.memberUid.includes(p.uid)
      );
      console.log ("Grupos: ", grupos);
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
          nombreAlumno: persona,
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
async function insertarPrestamosMasivo(req, res) {
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
}

//
async function prestarUnAlumno(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { uid, libros } = req.body;

    if (!uid || !Array.isArray(libros) || libros.length === 0) {
      return res.status(400).json({ error: "Datos incompletos" });
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
          esalumno: true,
        });
      }
    }

    if (valoresAInsertar.length > 0) {
      const insertValues = valoresAInsertar
        .map(
          (_, i) =>
            `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
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
      descartados,
    });
  } catch (error) {
    console.error("❌ Error al prestar libros individualmente:", error.message);
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
  prestarUnAlumno,
  eliminarPrestamosAlumno,
};
