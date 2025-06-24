/*const pool = require("../../db");
const { obtenerGruposDesdeLdap, buscarAlumnoPorUid } = require("../ldap/usuariosController");

async function obtenerPrestamosEnriquecidos(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // 1. Obtener los préstamos desde PostgreSQL
    const { rows: prestamos } = await pool.query("SELECT * FROM prestamos");

    // 2. Obtener libros desde PostgreSQL
    const { rows: libros } = await pool.query("SELECT * FROM libros");

    // 3. Obtener los grupos LDAP con sesión del usuario autenticado
    const grupos = await obtenerGruposDesdeLdap(ldapSession,'school_class');
    console.log ("Grupos: ",grupos);
    // 4. Para cada préstamo, obtener datos enriquecidos
    const resultado = await Promise.all(
      prestamos.map((p) => {
        return new Promise((resolve) => {
          const libro = libros.find((l) => l.id === p.idlibro);
          const nombreLibro = libro?.libro || "Desconocido";

          const grupo = grupos.find(
            //(g) => Array.isArray(g.memberUid) && g.memberUid.includes(p.uidalumno) && !g.groupType.includes ('students')
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
}

// POST /api/db/prestamos/masivo
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

    const valores = [];

    for (const uid of alumnos) {
      for (const idlibro of libros) {
        valores.push({
          uidalumno: uid,
          idlibro,
          devuelto: false,
          fechaentrega,
          fechadevolucion: null,
        });
      }
    }

    const insertValues = valores
      .map(
        (_, i) =>
          `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
      )
      .join(", ");

    const parametros = valores.flatMap((v) => [
      v.uidalumno,
      v.idlibro,
      v.devuelto,
      v.fechaentrega,
      v.fechadevolucion,
    ]);

    await pool.query(
      `INSERT INTO prestamos (uidalumno, idlibro, devuelto, fechaentrega, fechadevolucion) VALUES ${insertValues}`,
      parametros
    );

    res.json({ success: true, cantidad: valores.length });
  } catch (error) {
    console.error("❌ Error en asignación masiva:", error.message);
    res.status(500).json({ error: "Error al asignar préstamos" });
  }
}


module.exports = {
  obtenerPrestamosEnriquecidos,
  insertarPrestamosMasivo,
};
*/

const pool = require("../../db");
const { obtenerGruposDesdeLdap, buscarAlumnoPorUid } = require("../ldap/usuariosController");

async function obtenerPrestamosEnriquecidos(req, res) {
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
}

async function obtenerPrestamosAgrupados(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { rows: prestamos } = await pool.query("SELECT * FROM prestamos");
    const { rows: libros } = await pool.query("SELECT * FROM libros");
    const grupos = await obtenerGruposDesdeLdap(ldapSession, 'school_class');

    const agrupado = {};

    for (const p of prestamos) {
      const libro = libros.find((l) => l.id === p.idlibro);
      const nombreLibro = libro?.libro || "Desconocido";

      const grupo = grupos.find(
        (g) => Array.isArray(g.memberUid) && g.memberUid.includes(p.uidalumno)
      );
      const curso = grupo?.cn || "Curso desconocido";

      if (!agrupado[p.uidalumno]) {
        const alumno = await new Promise((resolve) => {
          buscarAlumnoPorUid(ldapSession, p.uidalumno, (err, datos) => {
            if (!err && datos) {
              resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
            } else {
              resolve("Alumno desconocido");
            }
          });
        });

        agrupado[p.uidalumno] = {
          uidalumno: p.uidalumno,
          nombreAlumno: alumno,
          curso,
          prestamos: [],
        };
      }

      agrupado[p.uidalumno].prestamos.push({
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

async function devolverPrestamos(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { ids } = req.body; // ids = array de ids de préstamos a devolver
    console.log ("Ids deuveltos: ", ids);

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

    const valores = [];

    for (const uid of alumnos) {
      for (const idlibro of libros) {
        valores.push({
          uidalumno: uid,
          idlibro,
          devuelto: false,
          fechaentrega,
          fechadevolucion: null,
        });
      }
    }

    const insertValues = valores
      .map(
        (_, i) =>
          `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
      )
      .join(", ");

    const parametros = valores.flatMap((v) => [
      v.uidalumno,
      v.idlibro,
      v.devuelto,
      v.fechaentrega,
      v.fechadevolucion,
    ]);

    await pool.query(
      `INSERT INTO prestamos (uidalumno, idlibro, devuelto, fechaentrega, fechadevolucion) VALUES ${insertValues}`,
      parametros
    );

    res.json({ success: true, cantidad: valores.length });
  } catch (error) {
    console.error("❌ Error en asignación masiva:", error.message);
    res.status(500).json({ error: "Error al asignar préstamos" });
  }
}

module.exports = {
  obtenerPrestamosEnriquecidos,
  obtenerPrestamosAgrupados,
  insertarPrestamosMasivo,
  devolverPrestamos,
};
