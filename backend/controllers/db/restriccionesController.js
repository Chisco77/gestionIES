/**
 * ================================================================
 *  Controller: restriccionesController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de restricciones del sistema.
 *    Permite definir límites y reglas para distintos tipos de
 *    configuraciones, como las de "asuntos propios".
 *
 *  Funcionalidades:
 *    - Obtener todas las restricciones (getRestricciones)
 *    - Obtener restricciones específicas de asuntos propios (getRestriccionesAsuntos)
 *    - Insertar nuevas restricciones por tipo (insertRestriccionesAsuntos)
 *    - Actualizar una restricción (updateRestriccion)
 *    - Eliminar una restricción (deleteRestriccion)
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

/**
 * Obtener todas las restricciones
 */
async function getRestricciones(req, res) {
  try {
    const result = await db.query(
      "SELECT id, tipo, restriccion, descripcion, valor_num, valor_bool FROM restricciones ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener las restricciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

/**
 * Obtener las restricciones específicas de los asuntos propios
 * ================================================================
 * Si se pasa `res`, actúa como endpoint HTTP. Si no, devuelve objeto JS.
 */
async function getRestriccionesAsuntos(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT descripcion, valor_num, valor_bool
       FROM restricciones
       WHERE restriccion = 'asuntos'`
    );

    const restricciones = {};
    for (const r of rows) {
      restricciones[r.descripcion] =
        r.valor_bool !== false ? r.valor_bool : r.valor_num;
    }

    if (res) {
      return res.json({ restricciones });
    }

    return restricciones;
  } catch (error) {
    console.error(
      "❌ Error al obtener restricciones de asuntos propios:",
      error
    );
    if (res) {
      return res
        .status(500)
        .json({ message: "Error al obtener restricciones de asuntos propios" });
    }
    throw new Error("Error al obtener restricciones de asuntos propios");
  }
}

/**
 * Insertar restricciones de tipo "asuntos"
 */
async function insertRestriccionesAsuntos(req, res) {
  const {
    asuntosDisponibles = 0,
    maxPorDia = 0,
    antelacionMinima = 0,
    maxConsecutivos = 0,
    ofuscar = false,
  } = req.body;

  const tipo = "asuntos";

  const restricciones = [
    {
      tipo,
      restriccion: "asuntos",
      descripcion: "dias",
      valor_num: asuntosDisponibles,
      valor_bool: false,
    },
    {
      tipo,
      restriccion: "asuntos",
      descripcion: "concurrentes",
      valor_num: maxPorDia,
      valor_bool: false,
    },
    {
      tipo,
      restriccion: "asuntos",
      descripcion: "antelacion",
      valor_num: antelacionMinima,
      valor_bool: false,
    },
    {
      tipo,
      restriccion: "asuntos",
      descripcion: "consecutivos",
      valor_num: maxConsecutivos,
      valor_bool: false,
    },
    {
      tipo,
      restriccion: "asuntos",
      descripcion: "ofuscar",
      valor_num: 0,
      valor_bool: ofuscar,
    },
  ];

  try {
    await db.query("DELETE FROM restricciones WHERE tipo = $1", [tipo]);
    const results = await Promise.all(
      restricciones.map((r) =>
        db.query(
          `INSERT INTO restricciones (tipo, restriccion, descripcion, valor_num, valor_bool)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [r.tipo, r.restriccion, r.descripcion, r.valor_num, r.valor_bool]
        )
      )
    );

    const inserted = results.map((r) => r.rows[0]);
    res
      .status(201)
      .json({
        message: "Restricciones de asuntos propias guardadas correctamente",
        data: inserted,
      });
  } catch (error) {
    console.error("❌ Error al insertar restricciones de asuntos:", error);
    res
      .status(500)
      .json({ message: "Error interno al insertar restricciones" });
  }
}

/**
 * Actualizar una restricción
 */
async function updateRestriccion(req, res) {
  const { id } = req.params;
  const { valor_num, valor_bool } = req.body;

  if (valor_num === undefined && valor_bool === undefined) {
    return res
      .status(400)
      .json({ message: "Debe especificar un valor_num o valor_bool" });
  }

  try {
    const result = await db.query(
      `UPDATE restricciones
       SET valor_num = COALESCE($1, valor_num),
           valor_bool = COALESCE($2, valor_bool)
       WHERE id = $3
       RETURNING *`,
      [valor_num, valor_bool, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Restricción no encontrada" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar restricción:", error);
    res.status(500).json({ message: "Error interno al actualizar" });
  }
}

/**
 * Eliminar una restricción
 */
async function deleteRestriccion(req, res) {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM restricciones WHERE id = $1", [
      id,
    ]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Restricción no encontrada" });
    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar restricción:", error);
    res.status(500).json({ message: "Error interno al eliminar restricción" });
  }
}

module.exports = {
  getRestricciones,
  getRestriccionesAsuntos,
  insertRestriccionesAsuntos,
  updateRestriccion,
  deleteRestriccion,
};
