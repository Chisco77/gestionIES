const db = require("../../db");

// ----------------------------------------
// Insertar un empleado
// ----------------------------------------
exports.insertEmpleado = async ({
  uid,
  tipo_usuario,
  dni,
  asuntos_propios,
  tipo_empleado,
  jornada,
  email,
  telefono,
  cuerpo, // <-- nueva columna
  grupo, // <-- nueva columna
}) => {
  const query = `
    INSERT INTO empleados
      (uid, tipo_usuario, dni, asuntos_propios, tipo_empleado, jornada, email, telefono, cuerpo, grupo)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (uid) DO NOTHING
    RETURNING *;
  `;

  const params = [
    uid,
    tipo_usuario,
    dni,
    asuntos_propios,
    tipo_empleado,
    jornada,
    email,
    telefono,
    cuerpo,
    grupo,
  ];
  console.log("Consulta:", query, "Parámetros:", params);

  try {
    const result = await db.query(query, params);
    return result.rows[0];
  } catch (err) {
    console.error("❌ Error insertando empleado:", err);
    throw err;
  }
};

// ----------------------------------------
// Obtener un empleado por uid
// ----------------------------------------
exports.getEmpleado = async (req, res) => {
  try {
    const { uid } = req.params;
    const result = await db.query(
      `SELECT uid, tipo_usuario, dni, asuntos_propios, tipo_empleado, jornada, email, telefono, cuerpo, grupo
       FROM empleados
       WHERE uid = $1`,
      [uid]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error obteniendo empleado:", err);
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------
// Actualizar un empleado
// ----------------------------------------
exports.updateEmpleado = async (req, res) => {
  try {
    const { uid } = req.params;
    const campos = [];
    const valores = [];
    let i = 1;

    for (const [key, value] of Object.entries(req.body)) {
      if (value !== undefined) {
        campos.push(`${key} = $${i}`);
        valores.push(value);
        i++;
      }
    }

    if (!campos.length) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    const query = `
      UPDATE empleados
      SET ${campos.join(", ")}
      WHERE uid = $${i}
      RETURNING *
    `;

    valores.push(uid);

    const result = await db.query(query, valores);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error actualizando empleado:", err);
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------
// Listar todos los empleados
// ----------------------------------------
exports.listEmpleados = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT uid, tipo_usuario, dni, asuntos_propios, tipo_empleado, jornada, email, telefono, cuerpo, grupo
       FROM empleados`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error obteniendo empleados:", err);
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------
// Helper para obtener datos de un empleado
// ----------------------------------------
async function obtenerEmpleado(uid) {
  const result = await db.query(
    `SELECT uid, tipo_usuario, dni, asuntos_propios, tipo_empleado, jornada, email, telefono, cuerpo, grupo
     FROM empleados
     WHERE uid = $1`,
    [uid]
  );
  if (!result.rows.length) return null;
  return result.rows[0];
}

exports.obtenerEmpleado = obtenerEmpleado;
