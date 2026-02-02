/**
 * ================================================================
 *  Controller: reservasEstanciasRepeticionController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de reservas de estancias con repetición.
 *    Maneja operaciones sobre la tabla "reservas_estancias_repeticion"
 *    de PostgreSQL, vinculando estancias con usuarios obtenidos desde LDAP.
 *
 *  Funcionalidades:
 *    - Obtener reservas repetidas (getReservasEstanciasRepeticion)
 *    - Insertar nueva repetición (insertReservaEstanciaRepeticion)
 *    - Eliminar repetición (deleteReservaEstanciaRepeticion)
 *    - Actualizar repetición (updateReservaEstanciaRepeticion)
 *
 *  Autor: Francisco Damian Mendez Palma
 * ================================================================
 */

const pool = require("../../db");

// Formatea fechas a 'YYYY-MM-DD'
function formatearFecha(reservas) {
  return reservas.map((r) => ({
    ...r,
    fecha_desde: r.fecha_desde.toISOString().split("T")[0],
    fecha_hasta: r.fecha_hasta.toISOString().split("T")[0],
    created_at: r.created_at.toISOString(),
  }));
}

// -------------------------------------------------------------
// Obtener reservas con repetición, filtrando por profesor, uid o fechas
async function getReservasEstanciasRepeticion(req, res) {
  const { profesor, uid, fechaDesde, fechaHasta } = req.query;

  const filtros = [];
  const vals = [];
  let i = 0;

  if (profesor) {
    filtros.push(`profesor = $${++i}`);
    vals.push(profesor);
  }
  if (uid) {
    filtros.push(`uid = $${++i}`);
    vals.push(uid);
  }
  if (fechaDesde && fechaHasta) {
    filtros.push(`fecha_desde <= $${++i} AND fecha_hasta >= $${++i}`);
    vals.push(fechaHasta, fechaDesde);
  }

  const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

  try {
    const { rows } = await pool.query(
      `SELECT id, uid, profesor, idperiodo_inicio, idperiodo_fin,
              fecha_desde, fecha_hasta, descripcion, frecuencia, dias_semana, created_at
       FROM reservas_estancias_repeticion
       ${where}
       ORDER BY fecha_desde ASC`,
      vals,
    );

    res.json({ ok: true, reservas: formatearFecha(rows) });
  } catch (err) {
    console.error("[getReservasEstanciasRepeticion] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error obteniendo reservas repetidas" });
  }
}

// -------------------------------------------------------------
// Insertar una nueva repetición
async function insertReservaEstanciaRepeticion(req, res) {
  const {
    uid,
    profesor,
    idperiodo_inicio,
    idperiodo_fin,
    fecha_desde,
    fecha_hasta,
    descripcion = "",
    frecuencia = "daily",
    dias_semana = [],
  } = req.body || {};

  if (!uid)
    return res.status(401).json({ ok: false, error: "Usuario no autenticado" });
  if (!profesor || !idperiodo_inicio || !idperiodo_fin || !fecha_desde || !fecha_hasta) {
    return res.status(400).json({ ok: false, error: "Faltan datos obligatorios" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO reservas_estancias_repeticion
       (uid, profesor, idperiodo_inicio, idperiodo_fin, fecha_desde, fecha_hasta, descripcion, frecuencia, dias_semana)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [uid, profesor, idperiodo_inicio, idperiodo_fin, fecha_desde, fecha_hasta, descripcion, frecuencia, dias_semana],
    );

    res.status(201).json({ ok: true, reserva: formatearFecha(rows)[0] });
  } catch (err) {
    console.error("[insertReservaEstanciaRepeticion] Error:", err);
    res.status(500).json({ ok: false, error: "Error insertando reserva repetida" });
  }
}

// -------------------------------------------------------------
// Eliminar una repetición por ID
async function deleteReservaEstanciaRepeticion(req, res) {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM reservas_estancias_repeticion WHERE id = $1`,
      [id],
    );
    if (rowCount === 0)
      return res.status(404).json({ ok: false, error: "Reserva no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteReservaEstanciaRepeticion] Error:", err);
    res.status(500).json({ ok: false, error: "Error eliminando reserva repetida" });
  }
}

// -------------------------------------------------------------
// Actualizar una repetición existente
async function updateReservaEstanciaRepeticion(req, res) {
  const { id } = req.params;
  const {
    idperiodo_inicio,
    idperiodo_fin,
    fecha_desde,
    fecha_hasta,
    descripcion,
    frecuencia,
    dias_semana,
  } = req.body || {};

  if (!idperiodo_inicio || !idperiodo_fin || !fecha_desde || !fecha_hasta) {
    return res.status(400).json({ ok: false, error: "Faltan datos obligatorios" });
  }

  try {
    const { rows: existentes } = await pool.query(
      `SELECT * FROM reservas_estancias_repeticion WHERE id = $1`,
      [id],
    );

    if (existentes.length === 0) {
      return res.status(404).json({ ok: false, error: "Reserva no encontrada" });
    }

    const { rows } = await pool.query(
      `UPDATE reservas_estancias_repeticion
       SET idperiodo_inicio = $1,
           idperiodo_fin = $2,
           fecha_desde = $3,
           fecha_hasta = $4,
           descripcion = $5,
           frecuencia = $6,
           dias_semana = $7
       WHERE id = $8
       RETURNING *`,
      [idperiodo_inicio, idperiodo_fin, fecha_desde, fecha_hasta, descripcion, frecuencia, dias_semana, id],
    );

    res.json({ ok: true, reserva: formatearFecha(rows)[0] });
  } catch (err) {
    console.error("[updateReservaEstanciaRepeticion] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando reserva repetida" });
  }
}

module.exports = {
  getReservasEstanciasRepeticion,
  insertReservaEstanciaRepeticion,
  deleteReservaEstanciaRepeticion,
  updateReservaEstanciaRepeticion,
};
