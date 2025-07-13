const db = require("../../db");

exports.getLibros = async (req, res) => {
  try {
    const { curso } = req.query;               // idcurso opcional

    // Construimos la consulta dinámicamente
    let text   = "SELECT id, idcurso, libro FROM libros";
    const params = [];

    if (curso) {
      text  += " WHERE idcurso = $1";          // filtro por idcurso
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
