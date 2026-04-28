/**
 * ================================================================
 * Controller: estanciasController.js
 * Proyecto: gestionIES
 * ================================================================
 * Descripción:
 * Controlador para la gestión de estancias vinculado a planos (idplano).
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

// 1. Obtener estancias por tipo (Infolab, etc.)
async function getEstanciasByTipoEstancia(req, res) {
  const tipoestancia = req.query.tipoestancia || "Infolab";
  try {
    const { rows } = await db.query(
      `SELECT id, idplano, codigo, descripcion, totalllaves, coordenadas_json, armario, codigollave, reservable, tipoestancia, numero_ordenadores
       FROM estancias
       WHERE tipoestancia = $1
       ORDER BY descripcion ASC`,
      [tipoestancia]
    );

    const estancias = rows.map((r) => ({
      id: r.id,
      idplano: r.idplano,
      codigo: r.codigo,
      descripcion: r.descripcion,
      totalllaves: r.totalllaves,
      armario: r.armario,
      codigollave: r.codigollave,
      coordenadas: r.coordenadas_json,
      reservable: r.reservable,
      tipoestancia: r.tipoestancia,
      numero_ordenadores: r.numero_ordenadores,
    }));

    res.json({ ok: true, tipoestancia, estancias });
  } catch (err) {
    console.error("[getEstanciasByTipoEstancia] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo estancias" });
  }
}

// 2. INSERTAR ESTANCIA (Usando idplano)
async function insertEstancia(req, res) {
  const {
    idplano,
    codigo,
    descripcion,
    totalllaves = 1,
    coordenadas,
    armario = "",
    codigollave = "",
    reservable = false,
    tipoestancia = "",
    numero_ordenadores = 0,
  } = req.body || {};

  if (!idplano || !codigo || !descripcion || !isValidCoordenadas(coordenadas)) {
    return res.status(400).json({
      ok: false,
      error:
        "Datos inválidos (idplano, codigo, descripcion y coordenadas obligatorios)",
    });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO estancias (idplano, codigo, descripcion, totalllaves, coordenadas_json, armario, codigollave, reservable, tipoestancia, numero_ordenadores)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, idplano, codigo, descripcion, totalllaves, coordenadas_json, armario, codigollave, reservable, tipoestancia, numero_ordenadores`,
      [
        idplano,
        codigo,
        descripcion,
        Number(totalllaves),
        JSON.stringify(coordenadas),
        armario,
        codigollave,
        reservable === true || reservable === "true",
        tipoestancia,
        numero_ordenadores,
      ]
    );

    res.status(201).json({
      ok: true,
      estancia: { ...rows[0], coordenadas: rows[0].coordenadas_json },
    });
  } catch (err) {
    console.error("[insertEstancia] Error:", err);
    res.status(500).json({ ok: false, error: "Error guardando estancia" });
  }
}

// 3. ACTUALIZAR ESTANCIA
async function updateEstancia(req, res) {
  const id = req.params.id;
  const data = req.body || {};

  if (data.coordenadas && !isValidCoordenadas(data.coordenadas)) {
    return res.status(400).json({ ok: false, error: "coordenadas inválidas" });
  }

  const sets = [];
  const vals = [id];
  let i = 1;

  const mapping = [
    { k: "idplano", d: "idplano", t: "num" },
    { k: "codigo", d: "codigo", t: "str" },
    { k: "descripcion", d: "descripcion", t: "str" },
    { k: "totalllaves", d: "totalllaves", t: "num" },
    { k: "armario", d: "armario", t: "str" },
    { k: "codigollave", d: "codigollave", t: "str" },
    { k: "coordenadas", d: "coordenadas_json", t: "json" },
    { k: "reservable", d: "reservable", t: "bool" },
    { k: "tipoestancia", d: "tipoestancia", t: "str" },
    { k: "numero_ordenadores", d: "numero_ordenadores", t: "num" },
  ];

  mapping.forEach((f) => {
    if (data[f.k] !== undefined) {
      sets.push(`${f.d} = $${++i}`);
      if (f.t === "num") vals.push(Number(data[f.k]));
      else if (f.t === "json") vals.push(JSON.stringify(data[f.k]));
      else if (f.t === "bool")
        vals.push(data[f.k] === true || data[f.k] === "true");
      else vals.push(data[f.k]);
    }
  });

  if (sets.length === 0)
    return res.status(400).json({ ok: false, error: "Nada que actualizar" });

  try {
    const query = `UPDATE estancias SET ${sets.join(", ")} WHERE id = $1 RETURNING *`;
    const { rows } = await db.query(query, vals);
    if (!rows[0])
      return res.status(404).json({ ok: false, error: "No encontrada" });
    res.json({
      ok: true,
      estancia: { ...rows[0], coordenadas: rows[0].coordenadas_json },
    });
  } catch (err) {
    console.error("[updateEstancia]", err);
    res.status(500).json({ ok: false, error: "Error actualizando" });
  }
}

// 4. ELIMINAR ESTANCIA
async function deleteEstancia(req, res) {
  const { id } = req.params;
  try {
    const { rows: resv } = await db.query(
      "SELECT COUNT(*) FROM reservas_estancias WHERE idestancia = $1",
      [id]
    );
    if (parseInt(resv[0].count) > 0)
      return res.status(400).json({ ok: false, error: "Tiene reservas" });

    const { rows: prest } = await db.query(
      "SELECT COUNT(*) FROM prestamos_llaves WHERE idestancia = $1",
      [id]
    );
    if (parseInt(prest[0].count) > 0)
      return res.status(400).json({ ok: false, error: "Tiene préstamos" });

    const result = await db.query("DELETE FROM estancias WHERE id = $1", [id]);
    res.json({ ok: result.rowCount > 0 });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Error eliminando" });
  }
}

// 5. OBTENER TODAS
async function getAllEstancias(req, res) {
  try {
    const { rows } = await db.query(
      "SELECT *, coordenadas_json as coordenadas FROM estancias ORDER BY descripcion ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ ok: false, error: "Error" });
  }
}

// 6. FILTRADO (getEstanciasFiltradas)
async function getEstanciasFiltradas(req, res) {
  const { tipoestancia, reservable } = req.query;
  try {
    const r = await filtrarEstancias({ tipoestancia, reservable });
    res.json(r);
  } catch (err) {
    res.status(500).json({ ok: false, error: "Error en filtro" });
  }
}

// 7. LÓGICA DE FILTRADO REUTILIZABLE
async function filtrarEstancias({ tipoestancia, reservable }) {
  try {
    const filtros = [];
    const vals = [];
    let i = 0;

    if (tipoestancia) {
      filtros.push(`tipoestancia = $${++i}`);
      vals.push(tipoestancia);
    }
    if (reservable !== undefined) {
      filtros.push(`reservable = $${++i}`);
      vals.push(reservable === "true" || reservable === true);
    }

    const where = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";
    const { rows } = await db.query(
      `SELECT *, coordenadas_json as coordenadas FROM estancias ${where} ORDER BY descripcion ASC`,
      vals
    );
    return { ok: true, estancias: rows };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  getEstanciasByTipoEstancia,
  getAllEstancias,
  insertEstancia,
  updateEstancia,
  deleteEstancia,
  getEstanciasFiltradas,
  filtrarEstancias,
};
