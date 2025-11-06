/**
 * ================================================================
 *  Controller: periodosHorariosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de "periodos_horarios"
 *    (periodos de clase del IES)
 *
 *  Autor: Francisco Damian Mendez Palma
 *  IES Francisco de Orellana - Trujillo
 * ================================================================
 */

const db = require("../../db");

// GET: /db/periodos-horarios
async function getPeriodosHorarios(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT id, nombre, inicio, fin
       FROM periodos_horarios
       ORDER BY id ASC`
    );
    res.json({ ok: true, periodos: rows });
  } catch (err) {
    console.error("[getPeriodosHorarios] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo periodos" });
  }
}

// INSERT: POST /db/periodos-horarios
async function insertPeriodo(req, res) {
  const { nombre, inicio, fin } = req.body || {};

  if (!nombre || !inicio || !fin) {
    return res.status(400).json({ ok: false, error: "nombre, inicio y fin obligatorios" });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO periodos_horarios (nombre, inicio, fin)
       VALUES ($1,$2,$3)
       RETURNING id, nombre, inicio, fin`,
      [nombre, inicio, fin]
    );
    res.status(201).json({ ok: true, periodo: rows[0] });
  } catch (err) {
    console.error("[insertPeriodo] Error:", err);
    res.status(500).json({ ok: false, error: "Error insertando periodo" });
  }
}

// PUT: /db/periodos-horarios/:id
async function updatePeriodo(req, res) {
  const id = req.params.id;
  const { nombre, inicio, fin } = req.body || {};

  try {
    const { rows } = await db.query(
      `UPDATE periodos_horarios
       SET nombre = COALESCE($2,nombre),
           inicio = COALESCE($3,inicio),
           fin    = COALESCE($4,fin)
       WHERE id = $1
       RETURNING id, nombre, inicio, fin`,
      [id, nombre, inicio, fin]
    );

    if (!rows[0]) return res.status(404).json({ ok: false, error: "Periodo no encontrado" });

    res.json({ ok: true, periodo: rows[0] });
  } catch (err) {
    console.error("[updatePeriodo] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando periodo" });
  }
}

// DELETE: /db/periodos-horarios/:id
async function deletePeriodo(req, res) {
  const id = req.params.id;
  try {
    const { rowCount } = await db.query(`DELETE FROM periodos_horarios WHERE id=$1`, [id]);
    if (rowCount === 0) return res.status(404).json({ ok:false, error:"Periodo no encontrado" });
    res.json({ ok:true });
  } catch (err) {
    console.error("[deletePeriodo] Error:", err);
    res.status(500).json({ ok:false, error:"Error eliminando periodo" });
  }
}

module.exports = {
  getPeriodosHorarios,
  insertPeriodo,
  updatePeriodo,
  deletePeriodo,
};
