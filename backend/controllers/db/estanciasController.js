/**
 * ================================================================
 *  Controller: estanciasController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de estancias.
 *    Proporciona operaciones CRUD sobre la tabla "estancias"
 *    de la base de datos PostgreSQL, utilizadas en los planos del centro.
 *
 *  Funcionalidades:
 *    - Obtener estancias filtradas por planta (getEstanciasByPlanta)
 *    - Insertar estancia (insertEstancia)
 *    - Actualizar parcialmente una estancia (updateEstancia)
 *    - Eliminar una estancia (deleteEstancia)
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

function isValidCoordenadas(coords) {
  return (
    Array.isArray(coords) &&
    coords.length >= 3 &&
    coords.every(
      (p) =>
        Array.isArray(p) && p.length === 2 && p.every((n) => Number.isFinite(n))
    )
  );
}

// GET /db/planos/estancias?planta=baja
// Devuelve en la forma que espera el front: { id: codigo, nombre: descripcion, keysTotales: totalllaves, puntos: coordenadas_json }
async function getEstanciasByPlanta(req, res) {
  const planta = (req.query.planta || "baja").toLowerCase();
  try {
    const { rows } = await db.query(
      `SELECT id, codigo, descripcion, totalllaves, coordenadas_json, armario, codigollave, reservable
FROM estancias
WHERE planta = $1
ORDER BY descripcion ASC`,
      [planta]
    );

    const estancias = rows.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      descripcion: r.descripcion,
      totalllaves: r.totalllaves,
      armario: r.armario,
      codigollave: r.codigollave,
      coordenadas: r.coordenadas_json,
      reservable: r.reservable,
      tipoestancia: r.tipoestancia,
    }));

    res.json({ ok: true, planta, estancias });
  } catch (err) {
    console.error("[getEstanciasByPlanta] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo estancias" });
  }
}

// POST /db/planos/estancias (upsert por (planta,codigo))
// body: { planta, id (=>codigo), nombre(=>descripcion), keysTotales(=>totalllaves), puntos(=>coordenadas_json) }
async function insertEstancia(req, res) {
  const {
    planta = "baja",
    codigo,
    descripcion,
    totalllaves = 1,
    coordenadas,
    armario = "",
    codigollave = "",
    reservable = "false",
    tipoestancia = "",
  } = req.body || {};

  if (!codigo || !descripcion || !isValidCoordenadas(coordenadas)) {
    return res.status(400).json({
      ok: false,
      error:
        "Datos inválidos (codigo, descripcion, coordenadas>=3 obligatorios)",
    });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO estancias (planta, codigo, descripcion, totalllaves, coordenadas_json, armario, codigollave, reservable, tipoestancia)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, planta, codigo, descripcion, totalllaves, coordenadas_json, armario, codigollave, reservable, tipoestancia`,
      [
        planta.toLowerCase(),
        codigo,
        descripcion,
        Number(totalllaves),
        JSON.stringify(coordenadas),
        armario,
        codigollave,
        reservable,
        tipoestancia,
      ]
    );

    const r = rows[0];
    res.status(201).json({
      ok: true,
      estancia: {
        id: r.id,
        codigo: r.codigo,
        descripcion: r.descripcion,
        totalllaves: r.totalllaves,
        coordenadas: r.coordenadas_json,
        armario: r.armario,
        codigollave: r.codigollave,
        reservable: r.reservable,
        tipoestancia: r.tipoestancia,
      },
    });
  } catch (err) {
    console.error("[insertEstancia] Error:", err);
    res.status(500).json({ ok: false, error: "Error guardando estancia" });
  }
}

// PUT /db/estancias/:id
async function updateEstancia(req, res) {
  const id = req.params.id;
  const {
    codigo,
    descripcion,
    totalllaves,
    coordenadas,
    armario,
    codigollave,
    reservable,
    tipoestancia,
  } = req.body || {};

  if (typeof coordenadas !== "undefined" && !isValidCoordenadas(coordenadas)) {
    return res
      .status(400)
      .json({ ok: false, error: "coordenadas inválidas (>=3 y números)" });
  }

  const sets = [];
  const vals = [];
  let i = 1; // $1 lo usaremos para WHERE al final

  if (typeof codigo === "string") {
    sets.push(`codigo = $${++i}`);
    vals.push(codigo);
  }

  if (typeof descripcion === "string") {
    sets.push(`descripcion = $${++i}`);
    vals.push(descripcion);
  }

  if (typeof totalllaves !== "undefined") {
    sets.push(`totalllaves = $${++i}`);
    vals.push(Number(totalllaves));
  }

  if (typeof armario === "string") {
    sets.push(`armario = $${++i}`);
    vals.push(armario);
  }

  if (typeof codigollave === "string") {
    sets.push(`codigollave = $${++i}`);
    vals.push(codigollave);
  }

  if (typeof coordenadas !== "undefined") {
    sets.push(`coordenadas_json = $${++i}`);
    vals.push(JSON.stringify(coordenadas));
  }

  if (typeof reservable !== "undefined") {
    sets.push(`reservable = $${++i}`);
    vals.push(reservable === true || reservable === "true");
  }

  if (typeof tipoestancia === "string") {
    sets.push(`tipoestancia = $${++i}`);
    vals.push(tipoestancia);
  }

  if (sets.length === 0) {
    return res.status(400).json({ ok: false, error: "Nada que actualizar" });
  }

  try {
    const query = `
      UPDATE estancias
      SET ${sets.join(", ")}
      WHERE id = $1
      RETURNING id, codigo, descripcion, totalllaves, armario, codigollave, coordenadas_json, reservable, tipoestancia
    `;

    const { rows } = await db.query(query, [id, ...vals]);

    if (!rows[0]) {
      return res
        .status(404)
        .json({ ok: false, error: "Estancia no encontrada" });
    }

    const r = rows[0];
    res.json({
      ok: true,
      estancia: {
        id: r.id,
        codigo: r.codigo,
        descripcion: r.descripcion,
        totalllaves: r.totalllaves,
        armario: r.armario,
        codigollave: r.codigollave,
        coordenadas: r.coordenadas_json,
        reservable: r.reservable,
        tipoestancia: r.tipoestancia,
      },
    });
  } catch (err) {
    console.error("[updateEstancia] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando estancia" });
  }
}

// DELETE /db/planos/estancias/:planta/:codigo
async function deleteEstancia(req, res) {
  const planta = (req.params.planta || "baja").toLowerCase();
  const id = req.params.id; // param :id representa 'codigo'
  try {
    const { rowCount } = await db.query(
      `DELETE FROM estancias WHERE planta = $1 AND id = $2`,
      [planta, id]
    );
    if (rowCount === 0)
      return res
        .status(404)
        .json({ ok: false, error: "Estancia no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteEstancia] Error:", err);
    res.status(500).json({ ok: false, error: "Error eliminando estancia" });
  }
}

// GET /db/estancias
// Devuelve todas las estancias sin filtrar por planta
async function getAllEstancias(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT id, planta, codigo, descripcion, totalllaves, coordenadas_json, armario, codigollave, reservable, tipoestancia
       FROM estancias
       ORDER BY planta, descripcion ASC`
    );

    const estancias = rows.map((r) => ({
      id: r.id,
      planta: r.planta,
      codigo: r.codigo,
      descripcion: r.descripcion,
      totalllaves: r.totalllaves,
      coordenadas: r.coordenadas_json,
      armario: r.armario,
      codigollave: r.codigollave,
      reservable: r.reservable,
      tipoestancia: r.tipoestancia,
    }));

    res.json(estancias);
  } catch (err) {
    console.error("[getAllEstancias] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo estancias" });
  }
}

module.exports = {
  getEstanciasByPlanta,
  getAllEstancias,
  insertEstancia,
  updateEstancia,
  deleteEstancia,
};
