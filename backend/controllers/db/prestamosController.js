/**
 * ================================================================
 *  Controller: prestamosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de préstamos de libros.
 *    Integra operaciones sobre las tablas "prestamos" y
 *    "prestamos_items" de PostgreSQL, combinadas con datos
 *    de usuarios y grupos obtenidos desde LDAP.
 *
 *  Funcionalidades:
 *    - Obtener préstamos agrupados por usuario y curso/departamento (getPrestamosAgrupados)
 *    - Marcar préstamos como devueltos (devolverPrestamos)
 *    - Marcar préstamos como prestados (prestarPrestamos)
 *    - Asignar libros de forma masiva a alumnos en inicio de curso (asignarLibrosMasivo)
 *    - Actualizar estado del documento de compromiso de forma masiva (accionDocCompromisoMasivo)
 *    - Prestar o devolver todos los libros de forma masiva (accionLibrosMasivo)
 *    - Asignar libros a un usuario individual (asignarUsuario)
 *    - Eliminar items de préstamo de un alumno (eliminarPrestamosAlumno)
 *    - Actualizar campos de un item de préstamo (actualizarPrestamoItem)
 *
 *  Autor: Francisco Damian Mendez Palma
 *  Email: adminies.franciscodeorellana@educarex.es
 *  GitHub: https://github.com/Chisco77
 *  Repositorio: https://github.com/Chisco77/gestionIES.git
 *  IES Francisco de Orellana - Trujillo
 *
 *  Fecha de creación: 2025
 * ================================================================
 */


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
         p.iniciocurso, 
         pi.id AS item_id, 
         pi.fechaentrega, 
         pi.fechadevolucion, 
         pi.devuelto,
         pi.entregado,
         l.libro AS nombre_libro
       FROM prestamos p
       JOIN prestamos_items pi ON p.id = pi.idprestamo
       LEFT JOIN libros l ON l.id = pi.idlibro
       WHERE p.esalumno = $1 `,
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
          iniciocurso: p.iniciocurso,
          nombreUsuario: persona,
          curso,
          prestamos: [],
        };
      }

      agrupado[p.prestamo_id].prestamos.push({
        id_item: p.item_id,
        libro: nombreLibro,
        devuelto: p.devuelto,
        entregado: p.entregado,
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

// Marca deuvelto a false y entregado a true de prestamos
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
    const fechaEntrega = new Date();

    // Revertimos la devolución: devuelto = false, fechadevolucion = null
    const query = `
      UPDATE prestamos_items
      SET devuelto = false,
          entregado = true, 
          fechaentrega = $1
      WHERE id = ANY($2::int[])
    `;

    await pool.query(query, [fechaEntrega, ids]);

    res.json({ success: true, cantidad: ids.length });
  } catch (error) {
    console.error("❌ Error al prestar préstamos:", error.message);
    res.status(500).json({ error: "Error al prestar préstamos" });
  }
}
// Crea asignaciones de libros de inicio de curso (iniciocurso = true en prestamos)
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

      if (existePrestamo.rowCount > 0) {
        descartados.push({
          uidalumno: uid,
          idlibros: libros, // añadimos también los libros que intentaba asignar
          motivo: "Ya existe un préstamo",
        });
        continue;
      }

      // Insertar cabecera de préstamo
      const resultPrestamo = await pool.query(
        `INSERT INTO prestamos (uid, esalumno, doc_compromiso, iniciocurso) 
         VALUES ($1, true, 0, true) RETURNING id`,
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

    res.json({ success: true, insertados, descartados });
  } catch (error) {
    console.error("❌ Error en asignación masiva:", error.message);
    res.status(500).json({ error: "Error al asignar préstamos" });
  }
}

// Marcar documento compromiso de prestamos de libros de alumnos de forma masiva, como entregado o recibido.
// Solo para prestamos de inicio de curso
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
        `SELECT id, doc_compromiso FROM prestamos WHERE uid = $1 and iniciocurso = true`,
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

// Prestar o devolver libros de forma masiva a alumnos. Para prestamos con iniciocurso = true.
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
        `SELECT id FROM prestamos WHERE uid = $1 and iniciocurso = true`,
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

/*
    Funcion para asignar libros a un usuario. Si el usuario tiene item en tabla prestamos con doc_compromiso = 0, los libros se asignarán a este item.
    Si no, se creará un nuevo item en prestamos.
*/
async function asignarUsuario(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { uid, libros, esAlumno } = req.body;

    if (
      !uid ||
      !Array.isArray(libros) ||
      libros.length === 0 ||
      typeof esAlumno !== "boolean"
    ) {
      return res.status(400).json({ error: "Datos incompletos o inválidos" });
    }

    const descartados = [];
    const insertados = [];

    // 1. Buscar si ya existe un préstamo para este usuario.
    // Mientras no se haya entregado el documento de compromiso, puedo asignarle libros nuevos.
    // antes: WHERE uid = $1 and iniciocurso = false and doc_compromiso = 0
    const prestamoExistente = await pool.query(
      `SELECT id, doc_compromiso 
       FROM prestamos 
       WHERE uid = $1 and doc_compromiso = 0`,
      [uid]
    );

    let idprestamo;

    if (prestamoExistente.rowCount === 0) {
      // No existe -> crear uno nuevo
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
         WHERE p.uid = $1 AND pi.idlibro = $2 AND pi.entregado = true`,
        [uid, idlibro]
      );

      if (resultado.rowCount > 0) {
        descartados.push({ uid, idlibro });
      } else {
        const insertado = await pool.query(
          `INSERT INTO prestamos_items (idprestamo, idlibro, fechaentrega, fechadevolucion, entregado, devuelto)
           VALUES ($1, $2, NULL, NULL, false, false)
           RETURNING id, idlibro`,
          [idprestamo, idlibro]
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
    console.error("Error en asignarUsuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
}

// Elimina items de prestamo.
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

// Actualizar campos de un item de préstamo (fechaentrega, fechadevolucion, devuelto, entregado...)
async function actualizarPrestamoItem(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { id_item, fechaentrega, fechadevolucion, devuelto, entregado } =
      req.body;

    if (!id_item) {
      return res.status(400).json({ error: "Falta id_item" });
    }

    // Construimos dinámicamente los campos a actualizar
    const updates = [];
    const values = [id_item];
    let idx = 2;

    if (fechaentrega !== undefined) {
      updates.push(`fechaentrega = $${idx++}`);
      values.push(fechaentrega);
    }
    if (fechadevolucion !== undefined) {
      updates.push(`fechadevolucion = $${idx++}`);
      values.push(fechadevolucion);
    }
    if (devuelto !== undefined) {
      updates.push(`devuelto = $${idx++}`);
      values.push(devuelto);
    }
    if (entregado !== undefined) {
      updates.push(`entregado = $${idx++}`);
      values.push(entregado);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    const query = `
      UPDATE prestamos_items
      SET ${updates.join(", ")}
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Préstamo no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar préstamo:", error.message);
    res.status(500).json({ error: "Error al actualizar préstamo" });
  }
}

module.exports = {
  getPrestamosAgrupados,
  asignarLibrosMasivo,
  accionDocCompromisoMasivo,
  accionLibrosMasivo,
  devolverPrestamos,
  prestarPrestamos,
  asignarUsuario,
  eliminarPrestamosAlumno,
  actualizarPrestamoItem,
};
