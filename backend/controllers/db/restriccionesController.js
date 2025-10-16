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
 * ================================================================
 */
exports.getRestricciones = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, tipo, restriccion, descripcion, valor_num, valor_bool FROM restricciones ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener las restricciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Insertar restricciones de tipo "asuntos"
 * ================================================================
 * Espera en el body:
 *  {
 *    asuntosDisponibles: number,
 *    maxPorDia: number,
 *    antelacionMinima: number,
 *    maxConsecutivos: number,
 *    ofuscar: boolean
 *  }
 */
exports.insertRestriccionesAsuntos = async (req, res) => {
  const {
    asuntosDisponibles = 0,
    maxPorDia = 0,
    antelacionMinima = 0,
    maxConsecutivos = 0,
    ofuscar = false,
  } = req.body;

  const tipo = "asuntos";

  // Mapeo de las restricciones que se van a insertar
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
    // Eliminar las restricciones anteriores de tipo "asuntos" antes de insertar nuevas
    await db.query("DELETE FROM restricciones WHERE tipo = $1", [tipo]);

    // Insertar todas las nuevas restricciones
    const insertPromises = restricciones.map((r) =>
      db.query(
        `INSERT INTO restricciones 
          (tipo, restriccion, descripcion, valor_num, valor_bool)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [r.tipo, r.restriccion, r.descripcion, r.valor_num, r.valor_bool]
      )
    );

    const results = await Promise.all(insertPromises);
    const inserted = results.map((r) => r.rows[0]);

    res.status(201).json({
      message: "Restricciones de asuntos propias guardadas correctamente",
      data: inserted,
    });
  } catch (error) {
    console.error("❌ Error al insertar restricciones de asuntos:", error);
    res.status(500).json({ message: "Error interno al insertar restricciones" });
  }
};

/**
 * Actualizar una restricción
 * ================================================================
 */
exports.updateRestriccion = async (req, res) => {
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

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Restricción no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar restricción:", error);
    res.status(500).json({ message: "Error interno al actualizar" });
  }
};

/**
 * Eliminar una restricción
 * ================================================================
 */
exports.deleteRestriccion = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM restricciones WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Restricción no encontrada" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar restricción:", error);
    res.status(500).json({ message: "Error interno al eliminar restricción" });
  }
};
