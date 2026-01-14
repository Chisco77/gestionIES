/**
 * ================================================================
 *  Controller: asuntosPermitidosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de desbloqueos de restricciones
 *    de asuntos propios por usuario y día concreto.
 *
 *    Tabla: asuntos_permitidos
 *
 *  Funcionalidades:
 *    - Obtener permisos especiales (getAsuntosPermitidos)
 *    - Insertar un permiso especial (insertAsuntoPermitido)
 *    - Eliminar un permiso especial (deleteAsuntoPermitido)
 *
 *  Autor: Francisco Damian Mendez Palma
 *  IES Francisco de Orellana - Trujillo
 * ================================================================
 */

const db = require("../../db");

// ================================================================
// Obtener permisos especiales (opcionalmente filtrados)
// ================================================================
exports.getAsuntosPermitidos = async (req, res) => {
  const { uid, fecha } = req.query;

  let query = `
    SELECT id, uid, fecha, created_at
    FROM asuntos_permitidos
    WHERE 1 = 1
  `;
  const values = [];
  let idx = 1;

  if (uid) {
    query += ` AND uid = $${idx++}`;
    values.push(uid);
  }

  if (fecha) {
    query += ` AND fecha = $${idx++}`;
    values.push(fecha);
  }

  query += " ORDER BY fecha DESC, uid";

  try {
    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener asuntos permitidos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ================================================================
// Insertar permiso especial
// ================================================================
exports.insertAsuntoPermitido = async (req, res) => {
  const { uid, fecha } = req.body;

  if (!uid || !fecha) {
    return res.status(400).json({
      message: 'Los campos "uid" y "fecha" son obligatorios',
    });
  }

  try {
    // Evitar duplicados
    const existe = await db.query(
      `SELECT 1 FROM asuntos_permitidos WHERE uid = $1 AND fecha = $2`,
      [uid, fecha]
    );

    if (existe.rowCount > 0) {
      return res.status(400).json({
        message: "Ya se ha desbloqueado la petición de AP para este usuario y fecha",
      });
    }

    const result = await db.query(
      `
      INSERT INTO asuntos_permitidos (uid, fecha)
      VALUES ($1, $2)
      RETURNING *
      `,
      [uid, fecha]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al insertar asunto permitido:", error);
    res.status(500).json({ message: "Error interno al insertar" });
  }
};

// ================================================================
// Eliminar permiso especial
// ================================================================
exports.deleteAsuntoPermitido = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM asuntos_permitidos WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Permiso especial no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar asunto permitido:", error);
    res.status(500).json({ message: "Error interno al eliminar" });
  }
};
