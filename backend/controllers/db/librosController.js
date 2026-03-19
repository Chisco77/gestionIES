/**
 * ================================================================
 *  Controller: librosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de libros.
 *    Proporciona operaciones CRUD sobre la tabla "libros"
 *    de la base de datos PostgreSQL, así como consultas adicionales
 *    para obtener libros disponibles según usuario y curso.
 *
 *  Funcionalidades:
 *    - Obtener todos los libros, con filtro opcional por curso (getLibros)
 *    - Insertar un nuevo libro (insertLibro)
 *    - Actualizar un libro existente (updateLibro)
 *    - Eliminar un libro con validación de préstamos activos (deleteLibro)
 *    - Obtener libros disponibles para asignar a un usuario (getLibrosDisponibles)
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

exports.getLibros = async (req, res) => {
  try {
    const { curso } = req.query;

    let text = `
      SELECT 
        l.id,
        l.idcurso,
        l.idmateria,
        m.nombre,
        l.libro
      FROM libros l
      LEFT JOIN materias m ON l.idmateria = m.id
    `;

    const params = [];

    if (curso) {
      text += " WHERE l.idcurso = $1";
      params.push(curso);
    }

    text += " ORDER BY l.id";

    const result = await db.query(text, params);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener los libros:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Insertar un nuevo libro
exports.insertLibro = async (req, res) => {
  const { idcurso, idmateria, libro } = req.body;

  if (!idcurso || !idmateria || !libro) {
    return res.status(400).json({
      message: 'Los campos "idcurso", "idmateria" y "libro" son obligatorios',
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO libros (idcurso, idmateria, libro) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [idcurso, idmateria, libro]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al insertar libro:", error);
    res.status(500).json({ message: "Error interno al insertar libro" });
  }
};

// Actualizar un libro
exports.updateLibro = async (req, res) => {
  const { id } = req.params;
  const { idcurso, idmateria, libro } = req.body;

  if (!idcurso || !idmateria || !libro) {
    return res.status(400).json({
      message: 'Los campos "idcurso", "idmateria" y "libro" son obligatorios',
    });
  }

  try {
    const result = await db.query(
      `UPDATE libros 
       SET idcurso = $1, 
           idmateria = $2, 
           libro = $3 
       WHERE id = $4 
       RETURNING *`,
      [idcurso, idmateria, libro, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Libro no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al modificar libro:", error);
    res.status(500).json({ message: "Error interno al modificar libro" });
  }
};

// Eliminar un libro
exports.deleteLibro = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Comprobar si el libro tiene préstamos activos
    const prestamosActivos = await db.query(
      "SELECT COUNT(*) FROM prestamos_items WHERE idlibro = $1",
      [id]
    );

    if (parseInt(prestamosActivos.rows[0].count, 10) > 0) {
      return res.status(400).json({
        message: "No se puede eliminar el libro porque tiene préstamos activos",
      });
    }

    // 2. Eliminar el libro si no tiene préstamos activos
    const result = await db.query("DELETE FROM libros WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Libro no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar libro:", error);
    res.status(500).json({ message: "Error interno al eliminar libro" });
  }
};

// Libros disponibles de un curso para ser asignados a un usuario.
// Son aquellos que no existen en prestamos_items asignados al usuario.
exports.getLibrosDisponibles = async (req, res) => {
  const { curso, uid } = req.params;

  try {
    const query = `
      SELECT 
        l.id,
        l.idcurso,
        l.idmateria,
        m.nombre,
        l.libro
      FROM libros l
      LEFT JOIN materias m ON l.idmateria = m.id
      WHERE l.idcurso = $1
      AND NOT EXISTS (
        SELECT 1
        FROM prestamos_items pi
        JOIN prestamos p ON p.id = pi.idprestamo
        WHERE pi.idlibro = l.id
        AND p.uid = $2
      )
      ORDER BY l.libro
    `;
    console.log("Consulta: ", query);
    console.log ("Parametros curso: ", curso)
    console.log ("Parametros uid: ", uid)
    const result = await db.query(query, [curso, uid]);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener libros disponibles:", error);
    res
      .status(500)
      .json({ message: "Error interno al obtener libros disponibles" });
  }
};
