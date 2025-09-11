const db = require("../../db");

exports.getLibros = async (req, res) => {
  try {
    const { curso } = req.query; // idcurso opcional

    // Construimos la consulta dinámicamente
    let text = "SELECT id, idcurso, libro FROM libros";
    const params = [];

    if (curso) {
      text += " WHERE idcurso = $1"; // filtro por idcurso
      params.push(curso);
    }

    text += " ORDER BY id";

    const result = await db.query(text, params);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener los libros:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Insertar un nuevo libro
exports.insertLibro = async (req, res) => {
  const { idcurso, libro } = req.body;

  if (!idcurso || !libro) {
    return res.status(400).json({
      message: 'Los campos "idcurso" y "libro" son obligatorios',
    });
  }

  try {
    const result = await db.query(
      "INSERT INTO libros (idcurso, libro) VALUES ($1, $2) RETURNING *",
      [idcurso, libro]
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
  const { idcurso, libro } = req.body;

  if (!idcurso || !libro) {
    return res.status(400).json({
      message: 'Los campos "idcurso" y "libro" son obligatorios',
    });
  }

  try {
    const result = await db.query(
      "UPDATE libros SET idcurso = $1, libro = $2 WHERE id = $3 RETURNING *",
      [idcurso, libro, id]
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
      "SELECT COUNT(*) FROM prestamos WHERE id = $1",
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
      SELECT l.*
      FROM libros l
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

    const result = await db.query(query, [curso, uid]);

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener libros disponibles:", error);
    res
      .status(500)
      .json({ message: "Error interno al obtener libros disponibles" });
  }
};
