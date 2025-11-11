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
 *    - Insertar un asunto propio (insertAsuntoPropio)
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

// GET /db/asuntos-propios?uid=...&fecha=...&descripcion=...
async function getAsuntosPropios(req, res) {
  try {
    const { uid, fecha, descripcion } = req.query;

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

    const where = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";

    const { rows } = await db.query(
      `SELECT id, uid, fecha, descripcion
       FROM asuntos_propios
       ${where}
       ORDER BY fecha DESC`,
      vals
    );

    res.json({ ok: true, asuntos: rows });
  } catch (err) {
    console.error("[getAsuntosPropios] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo asuntos propios" });
  }
}

// POST /db/asuntos-propios
// body: { uid, fecha, descripcion }
async function insertAsuntoPropio(req, res) {
  const { uid, fecha, descripcion } = req.body || {};

  if (!uid || !descripcion) {
    return res.status(400).json({ ok: false, error: "UID y descripción son obligatorios" });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO asuntos_propios (uid, fecha, descripcion)
       VALUES ($1, $2, $3)
       RETURNING id, uid, fecha, descripcion`,
      [uid, fecha || null, descripcion]
    );

    res.status(201).json({ ok: true, asunto: rows[0] });
  } catch (err) {
    console.error("[insertAsuntoPropio] Error:", err);
    res.status(500).json({ ok: false, error: "Error guardando asunto propio" });
  }
}

// PUT /db/asuntos-propios/:id
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
      return res.status(404).json({ ok: false, error: "Asunto propio no encontrado" });
    }

    res.json({ ok: true, asunto: rows[0] });
  } catch (err) {
    console.error("[updateAsuntoPropio] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando asunto propio" });
  }
}

// DELETE /db/asuntos-propios/:id
async function deleteAsuntoPropio(req, res) {
  const id = req.params.id;
  try {
    const { rowCount } = await db.query(
      `DELETE FROM asuntos_propios WHERE id = $1`,
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ ok: false, error: "Asunto propio no encontrado" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteAsuntoPropio] Error:", err);
    res.status(500).json({ ok: false, error: "Error eliminando asunto propio" });
  }
}

module.exports = {
  getAsuntosPropios,
  insertAsuntoPropio,
  updateAsuntoPropio,
  deleteAsuntoPropio,
};
