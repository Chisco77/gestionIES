const db = require("../../db");

// Insertar un empleado
exports.insertEmpleado = async ({
  uid,
  tipo_usuario,
  dni,
  asuntos_propios,
  tipo_empleado,
  jornada,
}) => {
  const query = `
    INSERT INTO empleados (uid, tipo_usuario, dni, asuntos_propios, tipo_empleado, jornada)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (uid) DO NOTHING
    RETURNING *;
  `;

  const params = [uid, tipo_usuario, dni, asuntos_propios, tipo_empleado, jornada];

  try {
    const result = await db.query(query, params);
    return result.rows[0];
  } catch (err) {
    console.error("❌ Error insertando empleado:", err);
    throw err;
  }
};

// Obtener un empleado por uid
exports.getEmpleado = async (req, res) => {
  try {
    const { uid } = req.params;
    const result = await db.query(
      `SELECT uid, tipo_usuario, dni, asuntos_propios, tipo_empleado, jornada
       FROM empleados
       WHERE uid = $1`,
      [uid]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Empleado no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error obteniendo empleado:", err);
    res.status(500).json({ message: err.message });
  }
};

// Actualizar un empleado
exports.updateEmpleado = async (req, res) => {
  try {
    const { uid } = req.params;
    const { dni, asuntos_propios, tipo_empleado, jornada } = req.body;
    const result = await db.query(
      `UPDATE empleados
       SET dni = $1,
           asuntos_propios = $2,
           tipo_empleado = $3,
           jornada = $4
       WHERE uid = $5
       RETURNING *`,
      [dni, asuntos_propios, tipo_empleado, jornada, uid]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error actualizando empleado:", err);
    res.status(500).json({ message: err.message });
  }
};

// empleadosController.js
exports.listEmpleados = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT uid, tipo_usuario, dni, asuntos_propios, tipo_empleado, jornada
       FROM empleados`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error obteniendo empleados:", err);
    res.status(500).json({ message: err.message });
  }
};


// --- Helper para obtener datos de un empleado ---
async function obtenerEmpleado(uid) {
  const result = await db.query(
    `SELECT uid, tipo_usuario, dni, asuntos_propios, tipo_empleado, jornada
     FROM empleados
     WHERE uid = $1`,
    [uid]
  );
  if (!result.rows.length) return null;
  return result.rows[0];
}

// Exportar el helper y el controlador de la ruta
exports.obtenerEmpleado = obtenerEmpleado;
