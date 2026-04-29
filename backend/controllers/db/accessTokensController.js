/**
 * ================================================================
 * Controller: accessTokensController.js
 * Proyecto: gestionIES
 * ================================================================
 *
 * Descripción:
 * Controlador para la gestión de tokens de acceso público.
 * Permite configurar dinámicamente los usuarios LDAP y tokens
 * utilizados para las proyecciones (Modo TV).
 *
 * Funcionalidades:
 * - Obtener todos los tokens (getTokens)
 * - Insertar nuevo token con credenciales LDAP (insertToken)
 * - Actualizar token o credenciales existentes (updateToken)
 * - Eliminar token de acceso (deleteToken)
 *
 * Autor: Francisco Damian Mendez Palma
 * ================================================================
 */

const db = require("../../db");

// Obtener todos los tokens de acceso
exports.getTokens = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nombre, token, rol, ldap_user, ldap_pass
       FROM access_tokens
       ORDER BY id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener los tokens de acceso:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Insertar nuevo token de acceso
exports.insertToken = async (req, res) => {
  const { nombre, token, rol, ldap_user, ldap_pass } = req.body;

  // Validación de campos obligatorios
  if (!nombre || !token || !rol || !ldap_user || !ldap_pass) {
    return res.status(400).json({
      message:
        "Todos los campos son obligatorios para configurar la proyección",
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO access_tokens (nombre, token, rol, ldap_user, ldap_pass, id)
       VALUES ($1, $2, $3, $4, $5, (SELECT COALESCE(MAX(id), 0) + 1 FROM access_tokens))
       RETURNING *`,
      [nombre, token, rol, ldap_user, ldap_pass]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al insertar el token de acceso:", error);
    res.status(500).json({ message: "Error interno al insertar el token" });
  }
};

// Actualizar un token existente
exports.updateToken = async (req, res) => {
  const { id } = req.params;
  const { nombre, token, rol, ldap_user, ldap_pass } = req.body;

  if (!nombre || !token || !rol) {
    return res.status(400).json({
      message: "Nombre, Token y Rol son campos obligatorios",
    });
  }

  try {
    const result = await db.query(
      `UPDATE access_tokens
       SET nombre = $1, token = $2, rol = $3, ldap_user = $4, ldap_pass = $5
       WHERE id = $6
       RETURNING *`,
      [nombre, token, rol, ldap_user, ldap_pass, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Token de acceso no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al modificar el token de acceso:", error);
    res.status(500).json({ message: "Error interno al modificar" });
  }
};

// Eliminar un token de acceso
exports.deleteToken = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM access_tokens WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Token no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar el token de acceso:", error);
    res.status(500).json({ message: "Error interno al eliminar el token" });
  }
};
