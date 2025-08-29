// controllers/db/estanciasController.js
const db = require("../../db"); // Debe exponer db.query(sql, params)

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
      `SELECT id, codigo, descripcion, totalllaves, coordenadas_json
FROM estancias
WHERE planta = $1
ORDER BY descripcion ASC`,
      [planta]
    );

    const estancias = rows.map((r) => ({
      id: r.codigo,
      nombre: r.descripcion,
      keysTotales: r.totalllaves,
      puntos: r.coordenadas_json,
    }));

    res.json({ ok: true, planta, estancias });
  } catch (err) {
    console.error("[getEstanciasByPlanta] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo estancias" });
  }
}

// POST /db/planos/estancias (upsert por (planta,codigo))
// body: { planta, id (=>codigo), nombre(=>descripcion), keysTotales(=>totalllaves), puntos(=>coordenadas_json) }
async function upsertEstancia(req, res) {
  const {
    planta = "baja",
    id,
    nombre,
    keysTotales = 1,
    puntos,
  } = req.body || {};
  if (!id || !nombre || !isValidCoordenadas(puntos)) {
    return res
      .status(400)
      .json({
        ok: false,
        error: "Datos inválidos (id, nombre, puntos>=3 obligatorios)",
      });
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO estancias (planta, codigo, descripcion, totalllaves, coordenadas_json)
VALUES ($1,$2,$3,$4,$5)
RETURNING planta, codigo, descripcion, totalllaves, coordenadas_json`,
      [
        planta.toLowerCase(),
        id,
        nombre,
        Number(keysTotales),
        JSON.stringify(puntos),
      ]
    );

    const r = rows[0];
    res.status(201).json({
      ok: true,
      estancia: {
        id: r.codigo,
        nombre: r.descripcion,
        keysTotales: r.totalllaves,
        puntos: r.coordenadas_json,
      },
    });
  } catch (err) {
    console.error("[upsertEstancia] Error:", err);
    res.status(500).json({ ok: false, error: "Error guardando estancia" });
  }
}
// PUT /db/planos/estancias/:planta/:codigo
// body opcional: { nombre?, keysTotales?, puntos? }
async function updateEstancia(req, res) {
  const planta = (req.params.planta || "baja").toLowerCase();
  const codigo = req.params.id; // mantenemos :id en la ruta, pero es 'codigo' en DB
  const { nombre, keysTotales, puntos } = req.body || {};

  if (typeof puntos !== "undefined" && !isValidCoordenadas(puntos)) {
    return res
      .status(400)
      .json({ ok: false, error: "puntos inválidos (>=3 y números)" });
  }

  const sets = [];
  const vals = [];
  let i = 2; // $1 y $2 los usamos para WHERE al final

  if (typeof nombre === "string") {
    sets.push(`descripcion = $${++i}`);
    vals.push(nombre);
  }
  if (typeof keysTotales !== "undefined") {
    sets.push(`totalllaves = $${++i}`);
    vals.push(Number(keysTotales));
  }
  if (typeof puntos !== "undefined") {
    sets.push(`coordenadas_json = $${++i}`);
    vals.push(JSON.stringify(puntos));
  }

  if (sets.length === 0) {
    return res.status(400).json({ ok: false, error: "Nada que actualizar" });
  }

  try {
    const { rows } = await db.query(
      `UPDATE estancias
SET ${sets.join(", ")}
WHERE planta = $1 AND codigo = $2
RETURNING codigo, descripcion, totalllaves, coordenadas_json`,
      [planta, codigo, ...vals]
    );
    if (!rows[0])
      return res
        .status(404)
        .json({ ok: false, error: "Estancia no encontrada" });

    const r = rows[0];
    res.json({
      ok: true,
      estancia: {
        id: r.codigo,
        nombre: r.descripcion,
        keysTotales: r.totalllaves,
        puntos: r.coordenadas_json,
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
  const codigo = req.params.id; // param :id representa 'codigo'
  try {
    const { rowCount } = await db.query(
      `DELETE FROM estancias WHERE planta = $1 AND codigo = $2`,
      [planta, codigo]
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

module.exports = {
  getEstanciasByPlanta,
  upsertEstancia,
  updateEstancia,
  deleteEstancia,
};
