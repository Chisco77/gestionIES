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

async function prestarPrestamos(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { ids } = req.body; // ids = array de ids de préstamos a reactivar (prestar de nuevo)
    console.log("Ids re-prestados: ", ids);

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

    for (const uidalumno of alumnos) {
      for (const idlibro of libros) {
        // Comprobamos si ya existe
        const resultado = await pool.query(
          `SELECT 1 FROM prestamos WHERE uidalumno = $1 AND idlibro = $2`,
          [uidalumno, idlibro]
        );

        if (resultado.rowCount > 0) {
          descartados.push({ uidalumno, idlibro });
        } else {
          valoresAInsertar.push({
            uidalumno,
            idlibro,
            devuelto: false,
            fechaentrega,
            fechadevolucion: null,
          });
        }
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
        v.uidalumno,
        v.idlibro,
        v.devuelto,
        v.fechaentrega,
        v.fechadevolucion,
      ]);

      await pool.query(
        `INSERT INTO prestamos (uidalumno, idlibro, devuelto, fechaentrega, fechadevolucion)
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


async function prestarUnAlumno(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { uidalumno, libros } = req.body;

    if (!uidalumno || !Array.isArray(libros) || libros.length === 0) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const fechaentrega = new Date();
    const valoresAInsertar = [];
    const descartados = [];

    for (const idlibro of libros) {
      const resultado = await pool.query(
        `SELECT 1 FROM prestamos WHERE uidalumno = $1 AND idlibro = $2 AND devuelto = false`,
        [uidalumno, idlibro]
      );

      if (resultado.rowCount > 0) {
        descartados.push({ uidalumno, idlibro });
      } else {
        valoresAInsertar.push({
          uidalumno,
          idlibro,
          devuelto: false,
          fechaentrega,
          fechadevolucion: null,
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
        v.uidalumno,
        v.idlibro,
        v.devuelto,
        v.fechaentrega,
        v.fechadevolucion,
      ]);

      await pool.query(
        `INSERT INTO prestamos (uidalumno, idlibro, devuelto, fechaentrega, fechadevolucion)
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
  console.log ("Llega a eliminar");
  console.log ("Req: ", req);
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No se especificaron préstamos" });
    }

    await pool.query(
      `DELETE FROM prestamos WHERE id = ANY($1::int[])`,
      [ids]
    );

    res.json({ success: true, eliminados: ids.length });
  } catch (error) {
    console.error("❌ Error al eliminar préstamos:", error.message);
    res.status(500).json({ error: "Error al eliminar préstamos" });
  }
}



module.exports = {
  obtenerPrestamosEnriquecidos,
  obtenerPrestamosAgrupados,
  insertarPrestamosMasivo,
  devolverPrestamos,
  prestarPrestamos,
  prestarUnAlumno,
  eliminarPrestamosAlumno,
};
