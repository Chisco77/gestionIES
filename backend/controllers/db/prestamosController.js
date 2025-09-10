const pool = require("../../db");
const {
  obtenerGruposDesdeLdap,
  buscarPorUid,
} = require("../ldap/usuariosController");

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
         p.doc_compromiso, 
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
          doc_compromiso: p.doc_compromiso,
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
    console.log(req.body);
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No se especificaron préstamos" });
    }

    const fechaDevolucion = new Date();

    // Actualizamos devuelto y fechadevolucion para esos ids
    const query = `
      UPDATE prestamos_items
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
      UPDATE prestamos_items
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

async function asignarLibrosMasivo(req, res) {
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
      // Comprobar si ya existe un préstamo para este alumno
      const existePrestamo = await pool.query(
        `SELECT 1 FROM prestamos WHERE uid = $1`,
        [uid]
      );

      /*if (existePrestamo.rowCount > 0) {
        // No se crea ningún registro, informar al frontend
        descartados.push({ uidalumno: uid, motivo: "Ya existe un préstamo" });
        continue;
      }*/

      if (existePrestamo.rowCount > 0) {
        descartados.push({
          uidalumno: uid,
          idlibros: libros, // 👈 añadimos también los libros que intentaba asignar
          motivo: "Ya existe un préstamo",
        });
        continue;
      }

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
        itemsAInsertar.push([idPrestamo, idlibro, false, fechaentrega, null]);
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
        insertados.push({ uidalumno: uid, idlibros: libros });
      }
    }
    console.log("Insertados: ", insertados);
    console.log("Descartados: ", descartados);

    res.json({ success: true, insertados, descartados });
  } catch (error) {
    console.error("❌ Error en asignación masiva:", error.message);
    res.status(500).json({ error: "Error al asignar préstamos" });
  }
}

// Marcar documento compromiso de prestamos de libros de alumnos de forma masiva, como entregado o recibido
async function accionDocCompromisoMasivo(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) return res.status(401).json({ error: "No autenticado" });

    const { tipo, alumnos } = req.body;
    if (
      !Array.isArray(alumnos) ||
      alumnos.length === 0 ||
      !["entregar", "recibir"].includes(tipo)
    ) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const fecha = new Date();
    const actualizaciones = [];

    for (const uid of alumnos) {
      // Buscar préstamo del usuario
      const { rows } = await pool.query(
        `SELECT id, doc_compromiso FROM prestamos WHERE uid = $1`,
        [uid]
      );
      if (rows.length === 0) continue;
      const { id, doc_compromiso } = rows[0];

      if (tipo === "entregar") {
        if (doc_compromiso > 0) continue; // ya entregado
        await pool.query(
          `UPDATE prestamos SET doc_compromiso = 1, fechaentregadoc = $1 WHERE id = $2`,
          [fecha, id]
        );
      } else if (tipo === "recibir") {
        if (doc_compromiso !== 1) continue; // no se puede recibir si no fue entregado
        await pool.query(
          `UPDATE prestamos SET doc_compromiso = 2, fecharecepciondoc = $1 WHERE id = $2`,
          [fecha, id]
        );
      }

      actualizaciones.push(uid);
    }

    res.json({
      success: true,
      actualizados: actualizaciones.length,
      uids: actualizaciones,
    });
  } catch (error) {
    console.error("❌ Error en acción de documentos:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
}

// Prestar o devolver libros de forma masiva a alumnos. Libros previamente asignados.
async function accionLibrosMasivo(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) return res.status(401).json({ error: "No autenticado" });

    const { tipo, alumnos } = req.body;

    if (!Array.isArray(alumnos) || alumnos.length === 0) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const fecha = new Date();
    const actualizados = [];
    const descartados = [];

    for (const uid of alumnos) {
      // Obtener id del préstamo del usuario
      const { rows } = await pool.query(
        `SELECT id FROM prestamos WHERE uid = $1`,
        [uid]
      );
      if (rows.length === 0) continue; // Si no hay préstamo, saltar
      const idprestamo = rows[0].id;

      if (tipo === "entregar") {
        // Marcar todos los libros como entregados (devuelto = false, fechaentrega = hoy)
        const { rowCount } = await pool.query(
          `UPDATE prestamos_items
           SET fechaentrega = $1, devuelto = false, entregado = true
           WHERE idprestamo = $2`,
          [fecha, idprestamo]
        );
        if (rowCount > 0)
          actualizados.push({ uid, librosActualizados: rowCount });
        else descartados.push({ uid });
      } else if (tipo === "devolver") {
        // Marcar todos los libros como devueltos
        const { rowCount } = await pool.query(
          `UPDATE prestamos_items
           SET devuelto = true, fechadevolucion = $1
           WHERE idprestamo = $2 AND devuelto = false`,
          [fecha, idprestamo]
        );
        if (rowCount > 0)
          actualizados.push({ uid, librosActualizados: rowCount });
        else descartados.push({ uid });
      }
    }

    res.json({ success: true, actualizados, descartados });
  } catch (error) {
    console.error("❌ Error en acción de libros:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
}

/*async function accionLibrosMasivo(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) return res.status(401).json({ error: "No autenticado" });

    const { tipo, alumnos } = req.body;

    if (
      !Array.isArray(alumnos) ||
      alumnos.length === 0 ||

    ) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const fecha = new Date();
    const insertados = [];
    const actualizados = [];
    const descartados = [];

    for (const uid of alumnos) {
      // Obtener id del préstamo del usuario
      const { rows } = await pool.query(
        `SELECT id FROM prestamos WHERE uid = $1`,
        [uid]
      );
      if (rows.length === 0) continue;
      const idprestamo = rows[0].id;

      for (const idlibro of libros) {
        if (tipo === "entregar") {
          // Verificar si ya existe un préstamo activo
          const { rowCount } = await pool.query(
            `SELECT 1 FROM prestamos_items WHERE idprestamo = $1 AND idlibro = $2 AND devuelto = false`,
            [idprestamo, idlibro]
          );
          if (rowCount > 0) {
            descartados.push({ uid, idlibro });
            continue;
          }

          const { rows: insertRow } = await pool.query(
            `INSERT INTO prestamos_items (idprestamo, idlibro, fechaentrega, fechadevolucion, devuelto)
             VALUES ($1, $2, $3, NULL, false)
             RETURNING id`,
            [idprestamo, idlibro, fecha]
          );
          insertados.push({ uid, idlibro });
        } else if (tipo === "devolver") {
          const { rowCount } = await pool.query(
            `UPDATE prestamos_items
             SET devuelto = true, fechadevolucion = $1
             WHERE idprestamo = $2 AND idlibro = $3 AND devuelto = false`,
            [fecha, idprestamo, idlibro]
          );
          if (rowCount > 0) actualizados.push({ uid, idlibro });
        }
      }
    }

    res.json({ success: true, insertados, actualizados, descartados });
  } catch (error) {
    console.error("❌ Error en acción de libros:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
}*/

/*
    Funcion para asignar libros a un usuario.
*/
async function prestarUsuario(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { uid, libros, esAlumno } = req.body;

    console.log("uid:", uid, "libros:", libros);

    if (
      !uid ||
      !Array.isArray(libros) ||
      libros.length === 0 ||
      typeof esAlumno !== "boolean"
    ) {
      return res.status(400).json({ error: "Datos incompletos o inválidos" });
    }

    const fechaentrega = new Date();
    const descartados = [];
    const insertados = [];

    // 1. Buscar si ya existe un préstamo para este usuario
    const prestamoExistente = await pool.query(
      `SELECT id, doc_compromiso 
       FROM prestamos 
       WHERE uid = $1`,
      [uid]
    );

    let idprestamo;

    if (prestamoExistente.rowCount === 0) {
      // No existe → crear uno nuevo
      const nuevoPrestamo = await pool.query(
        `INSERT INTO prestamos (uid, esalumno, doc_compromiso, fechaentregadoc, fecharecepciondoc)
         VALUES ($1, $2, 0, NULL, NULL)
         RETURNING id`,
        [uid, esAlumno]
      );
      idprestamo = nuevoPrestamo.rows[0].id;
    } else {
      const { id, doc_compromiso } = prestamoExistente.rows[0];
      idprestamo = id;

      if (doc_compromiso > 0) {
        // Ya tiene documento entregado o recibido → no se puede añadir nada
        return res.status(400).json({
          error:
            "El documento de compromiso ya ha sido entregado. No se pueden añadir más libros.",
        });
      }
    }

    // 2. Recorrer libros y añadirlos en prestamos_items
    for (const idlibro of libros) {
      // Comprobar si ya hay un préstamo activo (no devuelto) de ese libro para este usuario
      const resultado = await pool.query(
        `SELECT 1
         FROM prestamos_items pi
         INNER JOIN prestamos p ON p.id = pi.idprestamo
         WHERE p.uid = $1 AND pi.idlibro = $2 AND pi.devuelto = false`,
        [uid, idlibro]
      );

      if (resultado.rowCount > 0) {
        descartados.push({ uid, idlibro });
      } else {
        const insertado = await pool.query(
          `INSERT INTO prestamos_items (idprestamo, idlibro, fechaentrega, fechadevolucion, devuelto)
           VALUES ($1, $2, $3, NULL, false)
           RETURNING id, idlibro`,
          [idprestamo, idlibro, fechaentrega]
        );
        insertados.push(insertado.rows[0]);
      }
    }

    return res.json({
      ok: true,
      idprestamo,
      insertados,
      descartados,
    });
  } catch (error) {
    console.error("Error en prestarUsuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
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

    await pool.query(`DELETE FROM prestamos_items WHERE id = ANY($1::int[])`, [
      ids,
    ]);

    res.json({ success: true, eliminados: ids.length });
  } catch (error) {
    console.error("❌ Error al eliminar préstamos:", error.message);
    res.status(500).json({ error: "Error al eliminar préstamos" });
  }
}

module.exports = {
  getPrestamosAgrupados,
  asignarLibrosMasivo,
  accionDocCompromisoMasivo,
  accionLibrosMasivo,
  devolverPrestamos,
  prestarPrestamos,
  prestarUsuario,
  eliminarPrestamosAlumno,
};
