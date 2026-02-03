/**
 * ================================================================
 *  Controller: reservasEstanciasRepeticionController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de reservas de estancias con repetición.
 *    Maneja operaciones sobre la tabla "reservas_estancias_repeticion"
 *    de PostgreSQL, vinculando estancias con usuarios obtenidos desde LDAP.
 *
 *  Funcionalidades:
 *    - Obtener reservas repetidas (getReservasEstanciasRepeticion)
 *    - Insertar nueva repetición (insertReservaEstanciaRepeticion)
 *    - Eliminar repetición (deleteReservaEstanciaRepeticion)
 *    - Actualizar repetición (updateReservaEstanciaRepeticion)
 *
 *  Autor: Francisco Damian Mendez Palma
 * ================================================================
 */

const { buscarPorUid } = require("../ldap/usuariosController");
const pool = require("../../db");

function generarFechasDiarias(desde, hasta) {
  const fechas = [];
  let actual = new Date(desde);
  const fin = new Date(hasta);

  while (actual <= fin) {
    fechas.push(actual.toISOString().split("T")[0]);
    actual.setDate(actual.getDate() + 1);
  }
  return fechas;
}

function generarFechasSemanales(desde, hasta, diasSemanaInt) {
  const fechas = [];
  let actual = new Date(desde);
  const fin = new Date(hasta);

  while (actual <= fin) {
    // getDay(): 0 = domingo, 1 = lunes ...
    const dia = actual.getDay() === 0 ? 6 : actual.getDay() - 1; // 0 = lunes
    if (diasSemanaInt.includes(dia)) {
      fechas.push(actual.toISOString().split("T")[0]);
    }
    actual.setDate(actual.getDate() + 1);
  }
  return fechas;
}

// Formatea fechas a 'YYYY-MM-DD'
function formatearFecha(reservas) {
  return reservas.map((r) => ({
    ...r,
    fecha_desde: r.fecha_desde.toISOString().split("T")[0],
    fecha_hasta: r.fecha_hasta.toISOString().split("T")[0],
    created_at: r.created_at.toISOString(),
  }));
}

// -------------------------------------------------------------
// Obtener reservas con repetición, filtrando por profesor, uid o fechas
async function getReservasEstanciasRepeticion(req, res) {
  const { profesor, uid, fechaDesde, fechaHasta } = req.query;

  const filtros = [];
  const vals = [];
  let i = 0;

  if (profesor) {
    filtros.push(`profesor = $${++i}`);
    vals.push(profesor);
  }
  if (uid) {
    filtros.push(`uid = $${++i}`);
    vals.push(uid);
  }
  if (fechaDesde && fechaHasta) {
    filtros.push(`fecha_desde <= $${++i} AND fecha_hasta >= $${++i}`);
    vals.push(fechaHasta, fechaDesde);
  }

  const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

  try {
    const { rows } = await pool.query(
      `SELECT id, uid, profesor, idperiodo_inicio, idperiodo_fin,
              fecha_desde, fecha_hasta, descripcion, frecuencia, dias_semana, created_at
       FROM reservas_estancias_repeticion
       ${where}
       ORDER BY fecha_desde ASC`,
      vals
    );

    res.json({ ok: true, reservas: formatearFecha(rows) });
  } catch (err) {
    console.error("[getReservasEstanciasRepeticion] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error obteniendo reservas repetidas" });
  }
}

async function getReservasEstanciasRepeticionEnriquecidas(req, res) {
  const ldapSession = req.session?.ldap;
  if (!ldapSession)
    return res.status(401).json({ ok: false, error: "No autenticado" });

  try {
    const { rows } = await pool.query(`
      SELECT
        r.id,
        r.uid,
        r.profesor,
        r.idperiodo_inicio,
        r.idperiodo_fin,
        r.fecha_desde,
        r.fecha_hasta,
        r.descripcion AS descripcion_reserva,   -- descripcion de la reserva periódica
        r.frecuencia,
        r.dias_semana,
        r.created_at,
        e.descripcion AS descripcion_estancia   -- descripcion de la estancia
      FROM reservas_estancias_repeticion r
      LEFT JOIN estancias e
        ON e.id = r.idestancia
      ORDER BY r.fecha_desde ASC
    `);

    const cacheNombres = new Map();

    const getNombre = async (uid) => {
      if (!uid) return "—";
      if (cacheNombres.has(uid)) return cacheNombres.get(uid);

      const nombre = await new Promise((resolve) => {
        buscarPorUid(ldapSession, uid, (err, datos) => {
          if (!err && datos)
            resolve(`${datos.givenName || ""} ${datos.sn || ""}`.trim());
          else resolve("Profesor desconocido");
        });
      });

      cacheNombres.set(uid, nombre);
      return nombre;
    };

    const reservas = await Promise.all(
      rows.map(async (r) => ({
        ...r,
        nombreCreador: await getNombre(r.uid),
        nombreProfesor: await getNombre(r.profesor),
      }))
    );

    res.json({ ok: true, reservas });
  } catch (err) {
    console.error("[getReservasEstanciasRepeticionEnriquecidas] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error obteniendo reservas repetidas enriquecidas",
    });
  }
}

// -------------------------------------------------------------
// Insertar una nueva repetición
async function insertReservaEstanciaRepeticion(req, res) {
  const {
    uid,
    profesor,
    idestancia,
    idperiodo_inicio,
    idperiodo_fin,
    fecha_desde,
    fecha_hasta,
    descripcion = "",
    frecuencia = "diaria",
    dias_semana = [],
  } = req.body || {};

  if (!uid)
    return res.status(401).json({ ok: false, error: "Usuario no autenticado" });

  if (
    !profesor ||
    !idestancia ||
    !idperiodo_inicio ||
    !idperiodo_fin ||
    !fecha_desde ||
    !fecha_hasta
  ) {
    return res
      .status(400)
      .json({ ok: false, error: "Faltan datos obligatorios" });
  }

  const client = await pool.connect();
  const MAPA_DIAS = {
    Lun: 0,
    Mar: 1,
    Mié: 2,
    Jue: 3,
    Vie: 4,
  };

  try {
    await client.query("BEGIN");

    // Convertir días de la semana a números (0 = Lunes)
    const diasSemanaInt =
      Array.isArray(dias_semana) && dias_semana.length > 0
        ? dias_semana
            .map((d) => MAPA_DIAS[d])
            .filter((d) => Number.isInteger(d))
        : [];

    // 1️⃣ Insertar padre
    const { rows } = await client.query(
      `INSERT INTO reservas_estancias_repeticion
       (uid, profesor, idperiodo_inicio, idperiodo_fin,
        fecha_desde, fecha_hasta, descripcion, frecuencia, dias_semana, idestancia)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        uid,
        profesor,
        idperiodo_inicio,
        idperiodo_fin,
        fecha_desde,
        fecha_hasta,
        descripcion,
        frecuencia,
        diasSemanaInt,
        idestancia,
      ]
    );

    const repeticion = rows[0];
    const idrepeticion = repeticion.id;

    // 2️⃣ Generar fechas
    let fechas = [];

    if (frecuencia === "diaria") {
      fechas = generarFechasDiarias(fecha_desde, fecha_hasta);
    } else if (frecuencia === "semanal") {
      fechas = generarFechasSemanales(fecha_desde, fecha_hasta, dias_semana);
    }

    if (fechas.length === 0) {
      throw new Error("No se generaron fechas para la repetición");
    }

    // 3️⃣ Insertar hijos
    for (const fecha of fechas) {
      await client.query(
        `INSERT INTO reservas_estancias
         (idestancia, uid, fecha,
          idperiodo_inicio, idperiodo_fin,
          descripcion, idrepeticion)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          idestancia,
          profesor,
          fecha,
          idperiodo_inicio,
          idperiodo_fin,
          descripcion,
          idrepeticion,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      ok: true,
      idrepeticion,
      numReservas: fechas.length,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[insertReservaEstanciaRepeticion] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error insertando reserva periódica",
    });
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// Eliminar una repetición por ID
async function deleteReservaEstanciaRepeticion(req, res) {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM reservas_estancias_repeticion WHERE id = $1`,
      [id]
    );
    if (rowCount === 0)
      return res
        .status(404)
        .json({ ok: false, error: "Reserva no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteReservaEstanciaRepeticion] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error eliminando reserva repetida" });
  }
}

// -------------------------------------------------------------
// Actualizar una repetición existente
async function updateReservaEstanciaRepeticion(req, res) {
  const { id } = req.params;
  const {
    idperiodo_inicio,
    idperiodo_fin,
    fecha_desde,
    fecha_hasta,
    descripcion,
    frecuencia,
    dias_semana,
  } = req.body || {};

  if (!idperiodo_inicio || !idperiodo_fin || !fecha_desde || !fecha_hasta) {
    return res
      .status(400)
      .json({ ok: false, error: "Faltan datos obligatorios" });
  }

  try {
    const { rows: existentes } = await pool.query(
      `SELECT * FROM reservas_estancias_repeticion WHERE id = $1`,
      [id]
    );

    if (existentes.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Reserva no encontrada" });
    }

    const { rows } = await pool.query(
      `UPDATE reservas_estancias_repeticion
       SET idperiodo_inicio = $1,
           idperiodo_fin = $2,
           fecha_desde = $3,
           fecha_hasta = $4,
           descripcion = $5,
           frecuencia = $6,
           dias_semana = $7
       WHERE id = $8
       RETURNING *`,
      [
        idperiodo_inicio,
        idperiodo_fin,
        fecha_desde,
        fecha_hasta,
        descripcion,
        frecuencia,
        dias_semana,
        id,
      ]
    );

    res.json({ ok: true, reserva: formatearFecha(rows)[0] });
  } catch (err) {
    console.error("[updateReservaEstanciaRepeticion] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error actualizando reserva repetida" });
  }
}

module.exports = {
  getReservasEstanciasRepeticion,
  insertReservaEstanciaRepeticion,
  deleteReservaEstanciaRepeticion,
  updateReservaEstanciaRepeticion,
  getReservasEstanciasRepeticionEnriquecidas,
};
