const db = require("../../db");

exports.getCursos = async (req, res) => {
  console.log ("llega a get cursos");
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


  console.log("🛠️ PUT recibido - ID:", id, "Curso:", curso);
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

exports.deleteCurso = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM cursos WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar curso:", error);
    res.status(500).json({ message: "Error interno al eliminar" });
  }
};
