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
  const { label, orden } = req.body;

  // 1. Verificación de archivo (Multer)
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message: "Es necesario subir un archivo SVG.",
    });
  }

  const filename = req.file.filename;

  // 2. Validación de campos obligatorios
  if (!label || label.trim() === "") {
    return res.status(400).json({
      ok: false,
      message: "La etiqueta (label) del plano es obligatoria.",
    });
  }

  const ordenNum = parseInt(orden) || 0;

  try {
    // VALIDACIÓN DE ORDEN ---
    const checkQuery = "SELECT id FROM planos WHERE orden = $1";
    const { rowCount } = await db.query(checkQuery, [ordenNum]);

    if (rowCount > 0) {
      return res.status(400).json({
        ok: false,
        message: `Ya existe un plano con el orden ${ordenNum}. Por favor, elige una posición diferente.`,
      });
    }
    // ---------------------------------

    const svg_url = `/gestionIES/public/planos/${filename}`;

    const query = `
      INSERT INTO planos (label, svg_url, orden) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;

    const values = [label, svg_url, ordenNum];
    const { rows } = await db.query(query, values);

    res.status(201).json({
      ok: true,
      plano: rows[0],
    });
  } catch (error) {
    console.error("❌ Error al insertar plano:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno al guardar el plano en la base de datos.",
    });
  }
};

// Actualizar un plano existente
exports.updatePlano = async (req, res) => {
  const { id } = req.params;
  const { label, orden } = req.body;

  // 1. Validación de campos obligatorios
  if (!label || label.trim() === "") {
    return res.status(400).json({
      ok: false,
      message: "La etiqueta (label) es obligatoria.",
    });
  }

  const ordenNum = parseInt(orden) || 0;

  try {
    // 2. VALIDACIÓN DE ORDEN (Excluyendo al propio plano actual)
    // Buscamos si hay OTRO plano (id != $2) que ya use ese orden
    const checkQuery = "SELECT id FROM planos WHERE orden = $1 AND id != $2";
    const checkResult = await db.query(checkQuery, [ordenNum, id]);

    if (checkResult.rowCount > 0) {
      return res.status(400).json({
        ok: false,
        message: `Ya existe otro plano con el orden ${ordenNum}. Por favor, elige una posición diferente.`,
      });
    }

    // 3. Ejecutar la actualización
    const query = `
      UPDATE planos 
      SET label = $1, 
          orden = $2 
      WHERE id = $3 
      RETURNING *
    `;

    const result = await db.query(query, [label, ordenNum, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: "Plano no encontrado.",
      });
    }

    res.json({
      ok: true,
      message: "Plano actualizado correctamente",
      plano: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al modificar plano:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno al modificar el plano.",
    });
  }
};

// Eliminar un plano
exports.deletePlano = async (req, res) => {
  const { id } = req.params; // Este id es el entero de la secuencia

  try {
    // 1. Validar si existen estancias asociadas al plano
    const estanciasAsociadas = await db.query(
      "SELECT COUNT(*) FROM estancias WHERE idplano = $1",
      [id]
    );

    if (parseInt(estanciasAsociadas.rows[0].count, 10) > 0) {
      return res.status(400).json({
        message:
          "No se puede eliminar el plano porque tiene estancias asociadas. Por seguridad, debe borrar o reasignar las estancias primero.",
      });
    }

    // 2. Eliminar el plano
    const result = await db.query("DELETE FROM planos WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Plano no encontrado" });
    }

    // Si todo va bien, devolvemos 204 No Content
    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar plano:", error);
    res.status(500).json({ message: "Error interno al eliminar el plano" });
  }
};

/**
 * Obtiene las estancias asociadas a un plano específico.
 * Se usa para alimentar el componente PlanoEstanciasEdicion.jsx
 */
exports.getEstanciasPorPlano = async (req, res) => {
  const { plantaId } = req.params; // Este vendrá como número del frontend

  try {
    const query = `
      SELECT 
        id, idplano, codigo, descripcion, totalllaves, 
        coordenadas_json, armario, codigollave, 
        reservable, tipoestancia, numero_ordenadores
      FROM estancias
      WHERE idplano = $1  
      ORDER BY codigo ASC
    `;
    const result = await db.query(query, [plantaId]);
    res.json(result.rows);
  } catch (error) {
    console.error(
      `❌ Error al obtener estancias del plano ${plantaId}:`,
      error
    );
    res.status(500).json({ message: "Error al obtener estancias" });
  }
};
