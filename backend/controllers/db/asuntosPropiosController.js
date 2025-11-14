/**
 * ================================================================
 *  Controller: asuntosPropiosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de asuntos propios.
 *    Proporciona operaciones CRUD sobre la tabla "asuntos_propios"
 *    de la base de datos PostgreSQL.
 *
 *  Funcionalidades:
 *    - Obtener asuntos propios con filtros (getAsuntosPropios)
 *    - Insertar un asunto propio con validaciones (insertAsuntoPropio)
 *    - Actualizar parcialmente un asunto propio (updateAsuntoPropio)
 *    - Eliminar un asunto propio (deleteAsuntoPropio)
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

const db = require("../../db");
const { getRestriccionesAsuntos } = require("./restriccionesController");
const { buscarPorUid } = require("../ldap/usuariosController");

/**
 * Obtener asuntos propios con filtros opcionales
 * ================================================================
 */
async function getAsuntosPropios(req, res) {
  try {
    const { uid, fecha, descripcion, estado } = req.query;

    const filtros = [];
    const vals = [];
    let i = 0;

    if (uid) {
      filtros.push(`uid = $${++i}`);
      vals.push(uid);
    }
    if (fecha) {
      filtros.push(`fecha = $${++i}`);
      vals.push(fecha);
    }
    if (descripcion) {
      filtros.push(`descripcion ILIKE $${++i}`);
      vals.push(`%${descripcion}%`);
    }
    if (typeof estado !== "undefined") {
      filtros.push(`estado = $${++i}`);
      vals.push(Number(estado));
    }

    const where = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";

    const { rows } = await db.query(
      `SELECT id, uid, fecha, descripcion, estado
       FROM asuntos_propios
       ${where}
       ORDER BY fecha ASC`,
      vals
    );

    res.json({ ok: true, asuntos: rows });
  } catch (err) {
    console.error("[getAsuntosPropios] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error obteniendo asuntos propios" });
  }
}

/**
 * Obtener asuntos propios con información enriquecida (nombre del profesor)
 * ================================================================
 */
async function getAsuntosPropiosEnriquecidos(req, res) {
  console.log("Llego a asuntos propios enriquecidos");

  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res
        .status(401)
        .json({ ok: false, error: "No autenticado en LDAP" });
    }

    const { uid, fecha, descripcion, estado } = req.query;

    const filtros = [];
    const vals = [];
    let i = 0;

    if (uid) {
      filtros.push(`ap.uid = $${++i}`);
      vals.push(uid);
    }
    if (fecha) {
      filtros.push(`ap.fecha = $${++i}`);
      vals.push(fecha);
    }
    if (descripcion) {
      filtros.push(`ap.descripcion ILIKE $${++i}`);
      vals.push(`%${descripcion}%`);
    }
    if (typeof estado !== "undefined") {
      filtros.push(`ap.estado = $${++i}`);
      vals.push(Number(estado));
    }

    const where = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";

    // Consulta de los asuntos propios
    const { rows: asuntos } = await db.query(
      `SELECT ap.id, ap.uid, ap.fecha, ap.descripcion, ap.estado
       FROM asuntos_propios ap
       ${where}
       ORDER BY ap.fecha ASC`,
      vals
    );

    // Enriquecemos cada registro con nombre del profesor
    const asuntosEnriquecidos = [];

    for (const asunto of asuntos) {
      const nombreProfesor = await new Promise((resolve) => {
        buscarPorUid(ldapSession, asunto.uid, (err, datos) => {
          if (!err && datos) {
            resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
          } else {
            resolve("Profesor desconocido");
          }
        });
      });

      asuntosEnriquecidos.push({
        ...asunto,
        nombreProfesor,
      });
    }
    console.log("Devuelvo: ", asuntosEnriquecidos);
    res.json({ ok: true, asuntos: asuntosEnriquecidos });
  } catch (err) {
    console.error("[getAsuntosPropiosEnriquecidos] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error obteniendo asuntos propios enriquecidos",
    });
  }
}

/**
 * Insertar un asunto propio con comprobaciones de restricciones
 * ================================================================
 */
async function insertAsuntoPropio(req, res) {
  const { uid, fecha, descripcion } = req.body || {};

  if (!uid || !fecha || !descripcion) {
    return res.status(400).json({
      ok: false,
      error: "UID, fecha y descripción son obligatorios",
    });
  }

  try {
    // 1️⃣ Obtener las restricciones configuradas para los asuntos propios
    const restricciones = await getRestriccionesAsuntos();
    const { dias, concurrentes, ofuscar, antelacion, consecutivos } =
      restricciones;

    const fechaSolicitada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Limpiamos horas para comparar bien

    // 2️⃣ Comprobar antelación mínima
    const diffDias = Math.ceil((fechaSolicitada - hoy) / (1000 * 60 * 60 * 24));
    if (diffDias < antelacion) {
      return res.status(400).json({
        ok: false,
        error: `Debes solicitar el asunto propio con al menos ${antelacion} días de antelación.`,
      });
    }

    // 3️⃣ Comprobar máximo de días totales en el curso
    const { rows: totalCurso } = await db.query(
      `SELECT COUNT(*)::int AS total
       FROM asuntos_propios
       WHERE uid = $1`,
      [uid]
    );

    if (totalCurso[0].total >= dias) {
      return res.status(400).json({
        ok: false,
        error: `Ya has solicitado el máximo de ${dias} días de asuntos propios este curso.`,
      });
    }

    // 4️⃣ Comprobar concurrencia máxima en la misma fecha
    const { rows: concurrencia } = await db.query(
      `SELECT COUNT(*)::int AS total
       FROM asuntos_propios
       WHERE fecha = $1`,
      [fecha]
    );

    if (concurrencia[0].total >= concurrentes) {
      return res.status(400).json({
        ok: false,
        error: `Ya hay ${concurrentes} profesores con asuntos propios ese día.`,
      });
    }

    // 5️⃣ Comprobar máximo de días consecutivos
    const { rows: diasCercanos } = await db.query(
      `SELECT fecha
   FROM asuntos_propios
   WHERE uid = $1
     AND fecha BETWEEN ($2::date - INTERVAL '10 days')
                   AND ($2::date + INTERVAL '10 days')
   ORDER BY fecha`,
      [uid, fecha]
    );

    // Convertimos todas las fechas a milisegundos y añadimos la nueva
    const fechas = diasCercanos.map((r) => new Date(r.fecha).getTime());
    fechas.push(fechaSolicitada.getTime());
    fechas.sort((a, b) => a - b);

    // Contar la secuencia consecutiva más larga
    let maxConsecutivos = 1;
    let consecutivosActual = 1;

    for (let i = 1; i < fechas.length; i++) {
      const diffDias = Math.round(
        (fechas[i] - fechas[i - 1]) / (1000 * 60 * 60 * 24)
      );
      if (diffDias === 1) {
        consecutivosActual++;
        if (consecutivosActual > maxConsecutivos) {
          maxConsecutivos = consecutivosActual;
        }
      } else {
        consecutivosActual = 1;
      }
    }

    if (maxConsecutivos > consecutivos) {
      return res.status(400).json({
        ok: false,
        error: `No puedes solicitar más de ${consecutivos} días consecutivos de asuntos propios.`,
      });
    }

    // 6️⃣ Si todas las comprobaciones son correctas, insertar el registro
    const { rows } = await db.query(
      `INSERT INTO asuntos_propios (uid, fecha, descripcion)
       VALUES ($1, $2, $3)
       RETURNING id, uid, fecha, descripcion`,
      [uid, fecha, descripcion]
    );

    res.status(201).json({
      ok: true,
      asunto: rows[0],
      ofuscar,
    });
  } catch (err) {
    console.error("[insertAsuntoPropio] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error guardando asunto propio",
    });
  }
}

/**
 * Actualizar parcialmente un asunto propio
 * ================================================================
 */
async function updateAsuntoPropio(req, res) {
  const id = req.params.id;
  const { fecha, descripcion } = req.body || {};

  const sets = [];
  const vals = [];
  let i = 0;

  if (fecha) {
    sets.push(`fecha = $${++i}`);
    vals.push(fecha);
  }
  if (descripcion) {
    sets.push(`descripcion = $${++i}`);
    vals.push(descripcion);
  }

  if (sets.length === 0) {
    return res.status(400).json({ ok: false, error: "Nada que actualizar" });
  }

  try {
    const query = `
      UPDATE asuntos_propios
      SET ${sets.join(", ")}
      WHERE id = $${++i}
      RETURNING id, uid, fecha, descripcion
    `;
    vals.push(id);

    const { rows } = await db.query(query, vals);

    if (!rows[0]) {
      return res
        .status(404)
        .json({ ok: false, error: "Asunto propio no encontrado" });
    }

    res.json({ ok: true, asunto: rows[0] });
  } catch (err) {
    console.error("[updateAsuntoPropio] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error actualizando asunto propio" });
  }
}

/**
 * Eliminar un asunto propio
 * ================================================================
 */
async function deleteAsuntoPropio(req, res) {
  const id = req.params.id;

  try {
    const { rowCount } = await db.query(
      `DELETE FROM asuntos_propios WHERE id = $1`,
      [id]
    );

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Asunto propio no encontrado" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteAsuntoPropio] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error eliminando asunto propio" });
  }
}

/**
 * ================================================================
 *  Exportación de funciones
 * ================================================================
 */
module.exports = {
  getAsuntosPropios,
  insertAsuntoPropio,
  updateAsuntoPropio,
  deleteAsuntoPropio,
  getAsuntosPropiosEnriquecidos,
};
