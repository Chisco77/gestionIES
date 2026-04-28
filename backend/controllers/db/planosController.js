/**
 * ================================================================
 * Controller: planosController.js
 * Proyecto: gestionIES
 * ================================================================
 *
 * Descripción:
 * Controlador para la gestión dinámica de planos de las instalaciones.
 * Proporciona operaciones CRUD sobre la tabla "planos" y 
 * gestiona la relación con las estancias.
 *
 * Funcionalidades:
 * - Obtener todos los planos (getPlanos)
 * - Insertar un nuevo plano (insertPlano)
 * - Actualizar datos de un plano (updatePlano)
 * - Eliminar un plano (validando si tiene estancias) (deletePlano)
 * - Obtener estancias vinculadas a una planta/plano (getEstanciasPorPlano)
 *
 * Autor: Francisco Damian Mendez Palma
 * IES Francisco de Orellana - Trujillo
 * ================================================================
 */

const db = require("../../db");

// Obtener todos los planos ordenados
exports.getPlanos = async (req, res) => {
  try {
    const text = `
      SELECT id, label, svg_url, orden 
      FROM planos 
      ORDER BY orden ASC, id ASC
    `;
    const result = await db.query(text);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener los planos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Insertar un nuevo plano
exports.insertPlano = async (req, res) => {
  const { id, label, svg_url, orden } = req.body;

  if (!id || !label || !svg_url) {
    return res.status(400).json({
      message: 'Los campos "id", "label" y "svg_url" son obligatorios',
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO planos (id, label, svg_url, orden) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [id, label, svg_url, orden || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al insertar plano:", error);
    res.status(500).json({ message: "Error interno al insertar plano" });
  }
};

// Actualizar un plano existente
exports.updatePlano = async (req, res) => {
  const { id } = req.params; // El ID actual del plano
  const { label, svg_url, orden } = req.body;

  try {
    const result = await db.query(
      `UPDATE planos 
       SET label = $1, 
           svg_url = $2, 
           orden = $3 
       WHERE id = $4 
       RETURNING *`,
      [label, svg_url, orden, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Plano no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al modificar plano:", error);
    res.status(500).json({ message: "Error interno al modificar plano" });
  }
};

// Eliminar un plano
exports.deletePlano = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Validar si existen estancias asociadas a esta planta
    const estanciasAsociadas = await db.query(
      "SELECT COUNT(*) FROM estancias WHERE planta = $1",
      [id]
    );

    if (parseInt(estanciasAsociadas.rows[0].count, 10) > 0) {
      return res.status(400).json({
        message: "No se puede eliminar el plano porque tiene estancias asociadas. Borre las estancias primero.",
      });
    }

    // 2. Eliminar el plano
    const result = await db.query("DELETE FROM planos WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Plano no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar plano:", error);
    res.status(500).json({ message: "Error interno al eliminar plano" });
  }
};

/**
 * Obtiene las estancias asociadas a un plano específico.
 * Se usa para alimentar el componente PlanoEstanciasEdicion.jsx
 */
exports.getEstanciasPorPlano = async (req, res) => {
  const { plantaId } = req.params;

  try {
    const query = `
      SELECT 
        id, planta, codigo, descripcion, totalllaves, 
        coordenadas_json, armario, codigollave, 
        reservable, tipoestancia, numero_ordenadores
      FROM estancias
      WHERE planta = $1
      ORDER BY codigo ASC
    `;
    const result = await db.query(query, [plantaId]);
    res.json(result.rows);
  } catch (error) {
    console.error(`❌ Error al obtener estancias de la planta ${plantaId}:`, error);
    res.status(500).json({ message: "Error al obtener estancias del plano" });
  }
};