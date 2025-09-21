/**
 * ================================================================
 *  Controller: perfilesUsuarioController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de perfiles de usuario.
 *    Proporciona operaciones CRUD sobre la tabla "perfiles_usuario"
 *    de la base de datos PostgreSQL.
 *
 *  Funcionalidades:
 *    - Obtener todos los perfiles (getAllPerfiles)
 *    - Obtener perfil de un usuario por uid (getPerfilUsuario)
 *    - Crear o actualizar un perfil (setPerfilUsuario)
 *    - Actualizar un perfil existente (updatePerfilUsuario)
 *    - Eliminar un perfil (deletePerfilUsuario)
 *
 *  Autor: Francisco Damian Mendez Palma
 * ================================================================
 */

const db = require("../../db");

// Obtener todos los perfiles
exports.getPerfiles = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM perfiles_usuario ORDER BY uid");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener perfiles:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener perfil de un usuario
exports.getPerfilUsuario = async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await db.query("SELECT * FROM perfiles_usuario WHERE uid = $1", [uid]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(`❌ Error al obtener perfil del usuario ${uid}:`, error);
    res.status(500).json({ message: "Error interno al obtener perfil" });
  }
};

// Crear o actualizar perfil (UPSERT)
exports.setPerfilUsuario = async (req, res) => {
  const { uid, perfil } = req.body;

  if (!uid || !perfil) {
    return res.status(400).json({ message: 'Los campos "uid" y "perfil" son obligatorios' });
  }

  try {
    const result = await db.query(
      `INSERT INTO perfiles_usuario (uid, perfil)
       VALUES ($1, $2)
       ON CONFLICT (uid)
       DO UPDATE SET perfil = EXCLUDED.perfil
       RETURNING *`,
      [uid, perfil]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`❌ Error al crear o actualizar perfil de ${uid}:`, error);
    res.status(500).json({ message: "Error interno al guardar perfil" });
  }
};

// Actualizar perfil existente
exports.updatePerfilUsuario = async (req, res) => {
  const { uid } = req.params;
  const { perfil } = req.body;

  if (!perfil) {
    return res.status(400).json({ message: 'El campo "perfil" es obligatorio' });
  }

  try {
    const result = await db.query(
      "UPDATE perfiles_usuario SET perfil = $1 WHERE uid = $2 RETURNING *",
      [perfil, uid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(`❌ Error al actualizar perfil de ${uid}:`, error);
    res.status(500).json({ message: "Error interno al actualizar perfil" });
  }
};

// Eliminar perfil
exports.deletePerfilUsuario = async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM perfiles_usuario WHERE uid = $1 RETURNING *",
      [uid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.json({ message: "Perfil eliminado correctamente", perfil: result.rows[0] });
  } catch (error) {
    console.error(`❌ Error al eliminar perfil de ${uid}:`, error);
    res.status(500).json({ message: "Error interno al eliminar perfil" });
  }
};
