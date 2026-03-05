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
      `SELECT id, tipo, valor_num, valor_bool, descripcion, rangos_bloqueados_json
       FROM restricciones
       WHERE restriccion = 'asuntos'`
    );

    // Devolver directamente las filas, incluyendo rangos_bloqueados_json
    if (res) {
      return res.json(rows);
    }

    return rows;
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
    throw error;
  }
}

async function insertRestriccionesAsuntos(req, res) {
  const {
    asuntosDisponibles = 0,
    maxPorDia = 0,
    antelacionMinima = 0,
    antelacionMaxima = 0,
    maxConsecutivos = 0,
    ofuscar = false,
    mostrarPeticionesDia = false,
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
      descripcion: "antelacion_min",
      valor_num: antelacionMinima,
      valor_bool: false,
    },
    {
      tipo,
      restriccion: "asuntos",
      descripcion: "antelacion_max",
      valor_num: antelacionMaxima,
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
    {
      tipo,
      restriccion: "asuntos",
      descripcion: "mostrar_peticiones_dia",
      valor_num: 0,
      valor_bool: mostrarPeticionesDia,
    },
  ];

  try {
    // --- Borrar restricciones "normales" ---
    await db.query(
      "DELETE FROM restricciones WHERE tipo = $1 AND descripcion <> 'rangos_bloqueados'",
      [tipo]
    );

    // --- Insertar nuevas restricciones ---
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

    // --- Traer rangos bloqueados actuales ---
    const { rows: rangoRows } = await db.query(
      `SELECT rangos_bloqueados_json
       FROM restricciones
       WHERE restriccion = 'asuntos' AND descripcion = 'rangos_bloqueados'`
    );

    const rangos = rangoRows[0]?.rangos_bloqueados_json?.rango_bloqueado || [];

    res.status(201).json({
      message: "Restricciones de asuntos propias guardadas correctamente",
      data: inserted,
      rangosBloqueados: rangos,
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

/**
 * ================================================================
 *  NUEVA FUNCIÓN: Gestión de rangos bloqueados de asuntos propios
 * ================================================================
 */

/**
 * Obtener todos los rangos bloqueados
 */
async function getRangosBloqueados(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT rangos_bloqueados_json
       FROM restricciones
       WHERE restriccion = 'asuntos' AND descripcion = 'rangos_bloqueados'`
    );

    const rangos = rows[0]?.rangos_bloqueados_json?.rango_bloqueado || [];
    res.json({ rangos });
  } catch (error) {
    console.error("❌ Error al obtener rangos bloqueados:", error);
    res
      .status(500)
      .json({ message: "Error interno al obtener rangos bloqueados" });
  }
}

/**
 * Añadir un nuevo rango bloqueado
 */
async function addRangoBloqueado(req, res) {
  try {
    const { inicio, fin, motivo } = req.body;
    if (!inicio || !fin) {
      return res
        .status(400)
        .json({ message: "Debe especificar fechas de inicio y fin" });
    }

    const { rows } = await db.query(
      `SELECT rangos_bloqueados_json
       FROM restricciones
       WHERE restriccion = 'asuntos' AND descripcion = 'rangos_bloqueados'`
    );

    let rangos_bloqueados_json = rows[0]?.rangos_bloqueados_json || {
      rango_bloqueado: [],
    };
    let rangos = rangos_bloqueados_json.rango_bloqueado || [];

    // --- Comprobar solapes ---
    const nuevoInicio = new Date(inicio);
    const nuevoFin = new Date(fin);
    const haySolape = rangos.some((r) => {
      const ri = new Date(r.inicio);
      const rf = new Date(r.fin);
      return (
        (nuevoInicio >= ri && nuevoInicio <= rf) ||
        (nuevoFin >= ri && nuevoFin <= rf) ||
        (nuevoInicio <= ri && nuevoFin >= rf)
      );
    });

    if (haySolape) {
      return res.status(400).json({
        message: "El rango de fechas se solapa con otro existente",
      });
    }

    // --- Añadir nuevo rango ---
    rangos.push({ inicio, fin, motivo });

    // Si no existía la fila, la insertamos
    const query =
      rows.length === 0
        ? `INSERT INTO restricciones (tipo, restriccion, descripcion, valor_num, valor_bool, rangos_bloqueados_json)
           VALUES ('asuntos', 'asuntos', 'rangos_bloqueados', 0, false, $1)`
        : `UPDATE restricciones
           SET rangos_bloqueados_json = $1
           WHERE restriccion = 'asuntos' AND descripcion = 'rangos_bloqueados'`;

    await db.query(query, [JSON.stringify({ rango_bloqueado: rangos })]);

    res.json({ message: "Rango bloqueado añadido correctamente", rangos });
  } catch (error) {
    console.error("❌ Error al añadir rango bloqueado:", error);
    res
      .status(500)
      .json({ message: "Error interno al añadir rango bloqueado" });
  }
}

/**
 * Eliminar un rango bloqueado por su inicio y fin
 */
async function deleteRangoBloqueado(req, res) {
  try {
    const { inicio, fin } = req.body;
    if (!inicio || !fin) {
      return res.status(400).json({ message: "Debe especificar inicio y fin" });
    }

    const { rows } = await db.query(
      `SELECT rangos_bloqueados_json
       FROM restricciones
       WHERE restriccion = 'asuntos' AND descripcion = 'rangos_bloqueados'`
    );

    let rangos = rows[0]?.rangos_bloqueados_json?.rango_bloqueado || [];
    const originalLength = rangos.length;

    // Filtrar el rango a eliminar
    rangos = rangos.filter((r) => !(r.inicio === inicio && r.fin === fin));

    if (rangos.length === originalLength) {
      return res.status(404).json({ message: "Rango no encontrado" });
    }

    await db.query(
      `UPDATE restricciones
       SET rangos_bloqueados_json = $1
       WHERE restriccion = 'asuntos' AND descripcion = 'rangos_bloqueados'`,
      [JSON.stringify({ rango_bloqueado: rangos })]
    );

    res.json({ message: "Rango bloqueado eliminado correctamente", rangos });
  } catch (error) {
    console.error("❌ Error al eliminar rango bloqueado:", error);
    res
      .status(500)
      .json({ message: "Error interno al eliminar rango bloqueado" });
  }
}

/*
 *
 *    RESTRICCIONES PARA CONTROL DE ENTREGA DE LLAVES
 *
 *    (se usa para forzar que se entregue solo llave a quien ha reservado el aula)
 *
 *
 *
 */

/**
 * Obtener restricción de entrega de llaves (reserva previa)
 */
async function getRestriccionLlaves(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT id, tipo, restriccion, descripcion, valor_num, valor_bool
       FROM restricciones
       WHERE tipo = 'llaves'
         AND restriccion = 'llaves'
         AND descripcion = 'reserva_previa'
       LIMIT 1`
    );

    if (rows.length === 0) {
      return res.json(null); // No existe todavía
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener restricción de llaves:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

/**
 * Crear restricción de entrega de llaves (reserva previa)
 */
async function createRestriccionLlaves(req, res) {
  const { activa = false } = req.body;

  try {
    // Comprobar si ya existe
    const { rows } = await db.query(
      `SELECT id FROM restricciones
       WHERE tipo = 'llaves'
         AND restriccion = 'llaves'
         AND descripcion = 'reserva_previa'
       LIMIT 1`
    );

    if (rows.length > 0) {
      return res.status(400).json({
        message: "La restricción de llaves ya existe",
      });
    }

    const { rows: inserted } = await db.query(
      `INSERT INTO restricciones (tipo, restriccion, descripcion, valor_num, valor_bool)
       VALUES ('llaves', 'llaves', 'reserva_previa', 0, $1)
       RETURNING *`,
      [activa]
    );

    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error("❌ Error al crear restricción de llaves:", error);
    res.status(500).json({ message: "Error interno al crear restricción" });
  }
}

/**
 * Actualizar restricción de entrega de llaves
 */
async function updateRestriccionLlaves(req, res) {
  const { activa } = req.body;

  if (activa === undefined) {
    return res
      .status(400)
      .json({ message: "Debe especificar si la restricción está activa o no" });
  }

  try {
    const result = await db.query(
      `UPDATE restricciones
       SET valor_bool = $1
       WHERE tipo = 'llaves'
         AND restriccion = 'llaves'
         AND descripcion = 'reserva_previa'
       RETURNING *`,
      [activa]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Restricción de llaves no encontrada",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar restricción de llaves:", error);
    res.status(500).json({ message: "Error interno al actualizar" });
  }
}

/**
 * Eliminar restricción de entrega de llaves
 */
async function deleteRestriccionLlaves(req, res) {
  try {
    const result = await db.query(
      `DELETE FROM restricciones
       WHERE tipo = 'llaves'
         AND restriccion = 'llaves'
         AND descripcion = 'reserva_previa'`
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Restricción de llaves no encontrada",
      });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar restricción de llaves:", error);
    res.status(500).json({ message: "Error interno al eliminar" });
  }
}

async function getExcepcionesLlaves(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT rangos_bloqueados_json
       FROM restricciones
       WHERE tipo = 'llaves'
         AND restriccion = 'llaves'
         AND descripcion = 'reserva_previa'
       LIMIT 1`
    );

    const excepciones = rows[0]?.rangos_bloqueados_json?.usuarios || [];
    res.json({ excepciones });
  } catch (error) {
    console.error("❌ Error al obtener excepciones de llaves:", error);
    res.status(500).json({ message: "Error interno al obtener excepciones" });
  }
}

async function addExcepcionLlaves(req, res) {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: "Debe especificar uid" });

    // Traer restricción existente
    const { rows } = await db.query(
      `SELECT id, rangos_bloqueados_json
       FROM restricciones
       WHERE tipo = 'llaves'
         AND restriccion = 'llaves'
         AND descripcion = 'reserva_previa'
       LIMIT 1`
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Restricción de llaves no encontrada" });
    }

    let json = rows[0].rangos_bloqueados_json || { usuarios: [] };
    if (!json.usuarios.includes(uid)) {
      json.usuarios.push(uid);
    }

    await db.query(
      `UPDATE restricciones
       SET rangos_bloqueados_json = $1
       WHERE id = $2`,
      [JSON.stringify(json), rows[0].id]
    );

    res.json({ message: "Excepción añadida", usuarios: json.usuarios });
  } catch (error) {
    console.error("❌ Error al añadir excepción de llaves:", error);
    res.status(500).json({ message: "Error interno al añadir excepción" });
  }
}

async function deleteExcepcionLlaves(req, res) {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: "Debe especificar uid" });

    const { rows } = await db.query(
      `SELECT id, rangos_bloqueados_json
       FROM restricciones
       WHERE tipo = 'llaves'
         AND restriccion = 'llaves'
         AND descripcion = 'reserva_previa'
       LIMIT 1`
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Restricción no encontrada" });

    let json = rows[0].rangos_bloqueados_json || { usuarios: [] };
    json.usuarios = json.usuarios.filter((u) => u !== uid);

    await db.query(
      `UPDATE restricciones
       SET rangos_bloqueados_json = $1
       WHERE id = $2`,
      [JSON.stringify(json), rows[0].id]
    );

    res.json({ message: "Excepción eliminada", usuarios: json.usuarios });
  } catch (error) {
    console.error("❌ Error al eliminar excepción de llaves:", error);
    res.status(500).json({ message: "Error interno al eliminar excepción" });
  }
}

module.exports = {
  getRestricciones,
  getRestriccionesAsuntos,
  insertRestriccionesAsuntos,
  updateRestriccion,
  deleteRestriccion,
  getRangosBloqueados,
  addRangoBloqueado,
  deleteRangoBloqueado,
  // Llaves
  getRestriccionLlaves,
  createRestriccionLlaves,
  updateRestriccionLlaves,
  deleteRestriccionLlaves,
  getExcepcionesLlaves,
  addExcepcionLlaves,
  deleteExcepcionLlaves,
};
