/**
 * ================================================================
 *  Controller: materiasController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de materias.
 *    Proporciona operaciones CRUD sobre la tabla "materias"
 *    de la base de datos PostgreSQL.
 *
 *    Ahora cada materia es independiente, sin relación con cursos.
 *
 *  Funcionalidades:
 *    - Obtener todas las materias (getMaterias)
 *    - Insertar una nueva materia (insertMateria)
 *    - Actualizar una materia existente (updateMateria)
 *    - Eliminar una materia (deleteMateria) con validación de libros asociados
 *
 *  Autor: Francisco Damian Mendez Palma
 * ================================================================
 */

const db = require("../../db");

// Obtener todas las materias
exports.getMaterias = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nombre
       FROM materias
       ORDER BY id`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener las materias:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Insertar nueva materia
exports.insertMateria = async (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({
      message: 'El campo "nombre" es obligatorio',
    });
  }

  try {
    const result = await db.query(
      "INSERT INTO materias (nombre) VALUES ($1) RETURNING *",
      [nombre]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al insertar materia:", error);
    res.status(500).json({ message: "Error interno al insertar" });
  }
};

// Actualizar materia
exports.updateMateria = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({
      message: 'El campo "nombre" es obligatorio',
    });
  }

  try {
    const result = await db.query(
      `UPDATE materias
       SET nombre = $1
       WHERE id = $2
       RETURNING *`,
      [nombre, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al modificar materia:", error);
    res.status(500).json({ message: "Error interno al modificar" });
  }
};

// Eliminar materia
exports.deleteMateria = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Comprobar si hay libros asociados a la materia
    const librosAsociados = await db.query(
      "SELECT COUNT(*) FROM libros WHERE idmateria = $1",
      [id]
    );

    if (parseInt(librosAsociados.rows[0].count, 10) > 0) {
      return res.status(400).json({
        message:
          "No se puede eliminar la materia porque tiene libros asociados",
      });
    }

    // 2. NUEVA VALIDACIÓN: Comprobar si hay registros en horario_profesorado
    const horariosAsociados = await db.query(
      "SELECT COUNT(*) FROM horario_profesorado WHERE idmateria = $1",
      [id]
    );

    if (parseInt(horariosAsociados.rows[0].count, 10) > 0) {
      return res.status(400).json({
        message:
          "No se puede eliminar la materia porque está asignada en el horario del profesorado",
      });
    }

    // 3. Eliminar la materia si todo lo anterior es 0
    const result = await db.query("DELETE FROM materias WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar materia:", error);
    res.status(500).json({ message: "Error interno al eliminar materia" });
  }
};
