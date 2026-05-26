/**
 * ================================================================
 *  Controller: empleadosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de los datos del personal y
 *    empleados del centro educativo. Gestiona el almacenamiento,
 *    actualización y consulta de perfiles en la base de datos PostgreSQL.
 *
 *    La aplicación autentica contra LDAP, pero mantiene esta tabla para
 *    almacenar datos de usuarios (empleados) que no pueden ser almacenados
 *    en LDAP.
 *
 *  Funcionalidades:
 *    - Insertar un nuevo empleado ignorando duplicados (insertEmpleado)
 *    - Obtener la información de un empleado por su UID (getEmpleado)
 *    - Actualizar de forma dinámica cualquier campo de un empleado (updateEmpleado)
 *    - Listar la totalidad de los empleados registrados (listEmpleados)
 *    - Función interna auxiliar para recuperar el perfil del empleado (obtenerEmpleado)
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
  cuerpo,
  grupo,
  personal,
  baja = false,
  acronimo_untis = null, // 👈 NUEVO campo con valor por defecto
}) => {
  const query = `
    INSERT INTO empleados
      (uid, tipo_usuario, dni, asuntos_propios, tipo_empleado, jornada,
       email, telefono, cuerpo, grupo, personal, baja, acronimo_untis) -- 👈 Añadido
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)    -- 👈 Añadido $13
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
    personal,
    baja,
    acronimo_untis, 
  ];

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
      `SELECT uid, tipo_usuario, dni, asuntos_propios, tipo_empleado,
              jornada, email, telefono, cuerpo, grupo, personal, baja, acronimo_untis 
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
      `SELECT uid, tipo_usuario, dni, asuntos_propios, tipo_empleado,
              jornada, email, telefono, cuerpo, grupo, personal, baja, acronimo_untis 
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
    `SELECT uid, tipo_usuario, dni, asuntos_propios, tipo_empleado,
            jornada, email, telefono, cuerpo, grupo, personal, baja, acronimo_untis 
     FROM empleados
     WHERE uid = $1`,
    [uid]
  );

  if (!result.rows.length) return null;
  return result.rows[0];
}

exports.obtenerEmpleado = obtenerEmpleado;
