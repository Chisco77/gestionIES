/**
 * ================================================================
 *  Controller: avisosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de avisos.
 *    Proporciona operaciones CRUD sobre la tabla "avisos"
 *    de la base de datos PostgreSQL.
 *
 *  Funcionalidades:
 *    - Obtener avisos con filtro opcional por módulo (getAvisos)
 *    - Insertar un nuevo aviso (insertAviso)
 *    - Actualizar un aviso existente (updateAviso)
 *    - Eliminar un aviso (deleteAviso)
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

// ================================================================
// Obtener avisos (con filtro opcional por módulo)
// GET /db/avisos?modulo=permisos
// ================================================================
exports.getAvisos = async (req, res) => {
  try {
    const { modulo } = req.query;

    let text = "SELECT id, modulo, emails FROM avisos";
    const params = [];

    if (modulo) {
      text += " WHERE modulo = $1";
      params.push(modulo);
    }

    text += " ORDER BY id";

    const result = await db.query(text, params);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener avisos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ================================================================
// Obtener avisos SMTP (incluye app_password)
// GET /db/avisos/smtp?modulo=permisos
// ================================================================
exports.getAvisosSMTP = async (req, res) => {
  try {
    const { modulo } = req.query;

    let text = "SELECT id, modulo, emails, app_password FROM avisos";
    const params = [];

    if (modulo) {
      text += " WHERE modulo = $1";
      params.push(modulo);
    }

    text += " ORDER BY id";

    const result = await db.query(text, params);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener avisos SMTP:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ================================================================
// Insertar aviso → ahora incluye app_password = ""
// POST /db/avisos
// Body: { modulo: "...", emails: ["a@b.com","c@d.com"] }
// ================================================================
exports.insertAviso = async (req, res) => {
  const { modulo, emails } = req.body;

  if (!modulo || !emails || !Array.isArray(emails)) {
    return res.status(400).json({
      message: 'Los campos "modulo" y "emails" (array) son obligatorios',
    });
  }

  try {
    const result = await db.query(
      "INSERT INTO avisos (modulo, emails, app_password) VALUES ($1, $2, $3) RETURNING *",
      [modulo, emails, ""]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al insertar aviso:", error);
    res.status(500).json({ message: "Error interno al insertar aviso" });
  }
};

// ================================================================
// Insertar aviso SMTP (incluye app_password explícito)
// POST /db/avisos/smtp
// Body: { modulo: "...", emails: [...], app_password: "xxxx" }
// ================================================================
exports.insertAvisoSMTP = async (req, res) => {
  const { modulo, emails, app_password } = req.body;

  if (!modulo || !emails || !Array.isArray(emails) || !app_password) {
    return res.status(400).json({
      message:
        'Los campos "modulo", "emails" (array) y "app_password" son obligatorios',
    });
  }

  try {
    const result = await db.query(
      "INSERT INTO avisos (modulo, emails, app_password) VALUES ($1, $2, $3) RETURNING *",
      [modulo, emails, app_password]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al insertar aviso SMTP:", error);
    res.status(500).json({ message: "Error interno al insertar aviso SMTP" });
  }
};

// ================================================================
// Actualizar aviso SMTP (incluye app_password)
// PUT /db/avisos/smtp/:id
// ================================================================
exports.updateAvisoSMTP = async (req, res) => {
  const { id } = req.params;
  const { modulo, emails, app_password } = req.body;

  if (!modulo || !emails || !Array.isArray(emails) || !app_password) {
    return res.status(400).json({
      message:
        'Los campos "modulo", "emails" (array) y "app_password" son obligatorios',
    });
  }

  try {
    const result = await db.query(
      "UPDATE avisos SET modulo = $1, emails = $2, app_password = $3 WHERE id = $4 RETURNING *",
      [modulo, emails, app_password, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Aviso no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al modificar aviso SMTP:", error);
    res.status(500).json({ message: "Error interno al modificar aviso SMTP" });
  }
};

exports.updateAviso = async (req, res) => {
  const { id } = req.params;
  const { modulo, emails } = req.body;
  if (!modulo || !emails || !Array.isArray(emails)) {
    return res
      .status(400)
      .json({
        message: 'Los campos "modulo" y "emails" (array) son obligatorios',
      });
  }
  try {
    const result = await db.query(
      "UPDATE avisos SET modulo = $1, emails = $2 WHERE id = $3 RETURNING *",
      [modulo, emails, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Aviso no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al modificar aviso:", error);
    res.status(500).json({ message: "Error interno al modificar aviso" });
  }
};

// ================================================================
// Eliminar aviso
// ================================================================
exports.deleteAviso = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM avisos WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Aviso no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar aviso:", error);
    res.status(500).json({ message: "Error interno al eliminar aviso" });
  }
};
