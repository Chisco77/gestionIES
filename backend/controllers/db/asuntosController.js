/**
 * ================================================================
 *  Controller: asuntosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de asuntos propios.
 *    Proporciona operaciones CRUD sobre la tabla "asuntospropios"
 *    de la base de datos PostgreSQL.
 *
 *  Funcionalidades:
 *    - Obtener asuntos propios (getAsuntos)
 *    - Insertar un nuevo asunto propio (insertAsunto)
 *    - Actualizar un asunto propio existente (updateAsunto)
 *    - Eliminar un asunto propio (deleteAsunto)
 *    - Contar asuntos propios de un usuario (getNumeroAsuntosPorUsuario)
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

// Obtener asuntos propios de un mes y año concretos
exports.getAsuntos = async (req, res) => {
  const { mes, anio } = req.query;

  if (!mes || !anio) {
    return res.status(400).json({ message: "Se requieren mes y año" });
  }

  try {
    const result = await db.query(
      `SELECT id, uid, descripcion, fecha
       FROM asuntos
       WHERE EXTRACT(MONTH FROM fecha) = $1
         AND EXTRACT(YEAR FROM fecha) = $2
       ORDER BY fecha`,
      [mes, anio]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener asuntos propios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Insertar un nuevo asunto propio
exports.insertAsunto = async (req, res) => {
  const { uid, descripcion, fecha } = req.body;

  if (!uid || !descripcion || !fecha) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  try {
    const result = await db.query(
      `INSERT INTO asuntos (uid, descripcion, fecha)
       VALUES ($1, $2, $3) RETURNING *`,
      [uid, descripcion, fecha]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al insertar asunto propio:", error);
    res.status(500).json({ message: "Error interno al insertar" });
  }
};

// Actualizar un asunto propio existente
exports.updateAsunto = async (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;

  if (!descripcion) {
    return res.status(400).json({ message: "La descripción es obligatoria" });
  }

  try {
    const result = await db.query(
      "UPDATE asuntos SET descripcion = $1 WHERE id = $2 RETURNING *",
      [descripcion, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Asunto propio no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al modificar asunto propio:", error);
    res.status(500).json({ message: "Error interno al modificar" });
  }
};

// Eliminar un asunto propio
exports.deleteAsunto = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM asuntos WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Asunto propio no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar asunto propio:", error);
    res.status(500).json({ message: "Error interno al eliminar asunto propio" });
  }
};

// Contar el número de asuntos propios de un usuario
exports.getNumeroAsuntosPorUsuario = async (req, res) => {
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ message: "Se requiere el uid del usuario" });
  }

  try {
    const result = await db.query(
      "SELECT COUNT(*) AS total FROM asuntos WHERE uid = $1",
      [uid]
    );
    res.json({ uid, total: parseInt(result.rows[0].total, 10) });
  } catch (error) {
    console.error("Error al contar asuntos propios:", error);
    res.status(500).json({ message: "Error interno al contar asuntos propios" });
  }
};
