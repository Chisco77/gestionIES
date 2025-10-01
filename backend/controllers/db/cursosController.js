/**
 * ================================================================
 *  Controller: cursosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de cursos.
 *    Proporciona operaciones CRUD sobre la tabla "cursos"
 *    de la base de datos PostgreSQL.
 *
 *  Funcionalidades:
 *    - Obtener todos los cursos (getCursos)
 *    - Insertar un nuevo curso (insertCurso)
 *    - Actualizar un curso existente (updateCurso)
 *    - Eliminar un curso (deleteCurso) con validación de libros asociados
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

exports.getCursos = async (req, res) => {
  try {
    const result = await db.query("SELECT id, curso FROM cursos ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.insertCurso = async (req, res) => {
  const { curso } = req.body;
  if (!curso) {
    return res.status(400).json({ message: 'El campo "curso" es obligatorio' });
  }

  try {
    const result = await db.query(
      "INSERT INTO cursos (curso) VALUES ($1) RETURNING *",
      [curso]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al insertar curso:", error);
    res.status(500).json({ message: "Error interno al insertar" });
  }
};

exports.updateCurso = async (req, res) => {
  const { id } = req.params;
  const { curso } = req.body;

  if (!curso) {
    return res.status(400).json({ message: 'El campo "curso" es obligatorio' });
  }

  try {
    const result = await db.query(
      "UPDATE cursos SET curso = $1 WHERE id = $2 RETURNING *",
      [curso, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al modificar curso:", error);
    res.status(500).json({ message: "Error interno al modificar" });
  }
};

// Eliminar un curso
exports.deleteCurso = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Comprobar si hay libros asociados al curso
    const librosAsociados = await db.query(
      "SELECT COUNT(*) FROM libros WHERE idcurso = $1",
      [id]
    );

    if (parseInt(librosAsociados.rows[0].count, 10) > 0) {
      return res.status(400).json({
        message: "No se puede eliminar el curso porque tiene libros asociados",
      });
    }

    // 2. Eliminar el curso si no tiene libros asociados
    const result = await db.query("DELETE FROM cursos WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar curso:", error);
    res.status(500).json({ message: "Error interno al eliminar curso" });
  }
};
