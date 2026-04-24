/**
 * ================================================================
 * Controller: configuracionCentroController.js
 * Proyecto: gestionIES
 * ================================================================
 *
 * Descripción:
 * Controlador para la gestión de los datos del IES
 * (Nombre, dirección, teléfonos, etc. Incluye logos en Base64)
 *
 * Autor: Francisco Damian Mendez Palma
 * IES Francisco de Orellana - Trujillo
 * ================================================================
 */

const db = require("../../db");

// GET: /db/configuracion-centro
// Devuelve la configuración del centro (incluyendo ambos logos)
async function getConfiguracionCentro(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT 
        id, nombre_ies, direccion_linea_1, direccion_linea_2, 
        direccion_linea_3, telefono, fax, email, localidad, 
        provincia, codigo_postal, web_url, logo_miies_url, logo_centro_url
       FROM configuracion_centro
       LIMIT 1`
    );

    if (!rows[0]) {
      return res
        .status(404)
        .json({ ok: false, error: "No hay configuración definida" });
    }

    res.json({ ok: true, centro: rows[0] });
  } catch (err) {
    console.error("[getConfiguracionCentro] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error obteniendo la configuración del centro",
    });
  }
}

// POST: /db/configuracion-centro
async function insertConfiguracion(req, res) {
  const {
    nombre_ies,
    direccion_linea_1,
    direccion_linea_2,
    direccion_linea_3,
    telefono,
    fax,
    email,
    localidad,
    provincia,
    codigo_postal,
    web_url,
    logo_miIES_url,
    logo_centro_url,
  } = req.body || {};

  if (!nombre_ies) {
    return res
      .status(400)
      .json({ ok: false, error: "El nombre del IES es obligatorio" });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO configuracion_centro (
        nombre_ies, direccion_linea_1, direccion_linea_2, direccion_linea_3,
        telefono, fax, email, localidad, provincia, codigo_postal, web_url, 
        logo_miies_url, logo_centro_url
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        nombre_ies,
        direccion_linea_1,
        direccion_linea_2,
        direccion_linea_3,
        telefono,
        fax,
        email,
        localidad,
        provincia,
        codigo_postal,
        web_url,
        logo_miIES_url,
        logo_centro_url,
      ]
    );
    res.status(201).json({ ok: true, centro: rows[0] });
  } catch (err) {
    console.error("[insertConfiguracion] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error insertando la configuración" });
  }
}

// PUT: /db/configuracion-centro/:id
async function updateConfiguracion(req, res) {
  const id = req.params.id;
  const {
    nombre_ies,
    direccion_linea_1,
    direccion_linea_2,
    direccion_linea_3,
    telefono,
    fax,
    email,
    localidad,
    provincia,
    codigo_postal,
    web_url,
    logo_miIES_url,
    logo_centro_url,
  } = req.body || {};

  try {
    const { rows } = await db.query(
      `UPDATE configuracion_centro
       SET nombre_ies        = COALESCE($2, nombre_ies),
           direccion_linea_1 = COALESCE($3, direccion_linea_1),
           direccion_linea_2 = COALESCE($4, direccion_linea_2),
           direccion_linea_3 = COALESCE($5, direccion_linea_3),
           telefono          = COALESCE($6, telefono),
           fax               = COALESCE($7, fax),
           email             = COALESCE($8, email),
           localidad         = COALESCE($9, localidad),
           provincia         = COALESCE($10, provincia),
           codigo_postal     = COALESCE($11, codigo_postal),
           web_url           = COALESCE($12, web_url),
           logo_miies_url    = COALESCE($13, logo_miies_url),
           logo_centro_url   = COALESCE($14, logo_centro_url),
           updated_at        = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [
        id,
        nombre_ies,
        direccion_linea_1,
        direccion_linea_2,
        direccion_linea_3,
        telefono,
        fax,
        email,
        localidad,
        provincia,
        codigo_postal,
        web_url,
        logo_miIES_url,
        logo_centro_url,
      ]
    );

    if (!rows[0]) {
      return res
        .status(404)
        .json({ ok: false, error: "Configuración no encontrada" });
    }

    res.json({ ok: true, centro: rows[0] });
  } catch (err) {
    console.error("[updateConfiguracion] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error actualizando la configuración" });
  }
}

module.exports = {
  getConfiguracionCentro,
  insertConfiguracion,
  updateConfiguracion,
};
