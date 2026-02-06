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

async function detectarColisiones({
  idestancia,
  fechas,
  idperiodo_inicio,
  idperiodo_fin,
  client = pool,
}) {
  const fechasLibres = [];
  const fechasConflicto = [];

  for (const fecha of fechas) {
    const { rowCount } = await client.query(
      `
      SELECT 1
      FROM reservas_estancias
      WHERE idestancia = $1
        AND fecha = $2
        AND NOT (
          idperiodo_fin < $3
          OR idperiodo_inicio > $4
        )
      LIMIT 1
      `,
      [idestancia, fecha, idperiodo_inicio, idperiodo_fin]
    );

    if (rowCount > 0) {
      fechasConflicto.push(fecha);
    } else {
      fechasLibres.push(fecha);
    }
  }

  return { fechasLibres, fechasConflicto };
}

function generarFechasDiarias(desde, hasta) {
  const fechas = [];

  let actual = new Date(`${desde}T12:00:00`);
  const fin = new Date(`${hasta}T12:00:00`);

  while (actual <= fin) {
    fechas.push(actual.toISOString().slice(0, 10));
    actual.setDate(actual.getDate() + 1);
  }

  return fechas;
}

function generarFechasSemanales(desde, hasta, diasSemanaInt) {
  const fechas = [];

  let actual = new Date(`${desde}T12:00:00`);
  const fin = new Date(`${hasta}T12:00:00`);

  while (actual <= fin) {
    const dia = (actual.getDay() + 6) % 7; // lunes = 0

    if (diasSemanaInt.includes(dia)) {
      fechas.push(actual.toISOString().slice(0, 10));
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

  try {
    await client.query("BEGIN");

    // 1️⃣ Generar fechas
    let fechas = [];

    if (frecuencia === "diaria") {
      fechas = generarFechasDiarias(fecha_desde, fecha_hasta);
    } else if (frecuencia === "semanal") {
      fechas = generarFechasSemanales(fecha_desde, fecha_hasta, dias_semana);
    }

    if (fechas.length === 0) {
      throw new Error("No se generaron fechas para la repetición");
    }

    // 2️⃣ Insertar PADRE
    const { rows } = await client.query(
      `
      INSERT INTO reservas_estancias_repeticion
      (uid, profesor, idperiodo_inicio, idperiodo_fin,
       fecha_desde, fecha_hasta, descripcion, frecuencia, dias_semana, idestancia)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        uid,
        profesor,
        idperiodo_inicio,
        idperiodo_fin,
        fecha_desde,
        fecha_hasta,
        descripcion,
        frecuencia,
        dias_semana,
        idestancia,
      ]
    );

    const idrepeticion = rows[0].id;

    // 3️⃣ Detectar colisiones (MISMA lógica que /simular)
    const { fechasLibres, fechasConflicto } = await detectarColisiones({
      idestancia,
      fechas,
      idperiodo_inicio,
      idperiodo_fin,
      client,
    });

    // 4️⃣ Insertar SOLO fechas libres
    for (const fecha of fechasLibres) {
      await client.query(
        `
        INSERT INTO reservas_estancias
        (idestancia, uid, fecha,
         idperiodo_inicio, idperiodo_fin,
         descripcion, idrepeticion)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        `,
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

    // 5️⃣ Respuesta rica
    res.status(201).json({
      ok: true,
      idrepeticion,
      total: fechas.length,
      creadas: fechasLibres.length,
      omitidas: fechasConflicto.length,
      fechas_omitidas: fechasConflicto,
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

//
// -------------------------------------------------------------
// Eliminar una repetición por ID (PADRE) y sus hijos futuros
//
async function deleteReservaEstanciaRepeticion(req, res) {
  const { id } = req.params;
  const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Verificar existencia del padre
    const { rows: padres } = await client.query(
      `SELECT * FROM reservas_estancias_repeticion WHERE id = $1`,
      [id]
    );

    if (padres.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ ok: false, error: "Reserva no encontrada" });
    }

    const padre = padres[0];

    // 2️⃣ Eliminar hijos futuros de reservas_estancias
    const { rowCount: hijosEliminados } = await client.query(
      `
      DELETE FROM reservas_estancias
      WHERE idrepeticion = $1
        AND fecha >= $2
      `,
      [id, hoy]
    );

    // 3️⃣ Eliminar el padre
    const { rowCount: padreEliminado } = await client.query(
      `DELETE FROM reservas_estancias_repeticion WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");

    res.json({
      ok: true,
      padreEliminado: padreEliminado === 1,
      hijosEliminados,
      message: "Reserva periódica y sus hijos futuros eliminados correctamente",
      padre,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[deleteReservaEstanciaRepeticion] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error eliminando reserva periódica",
    });
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// Actualizar una repetición existente
async function updateReservaEstanciaRepeticion(req, res) {
  const { id } = req.params;
  const {
    profesor,
    idperiodo_inicio,
    idperiodo_fin,
    fecha_desde,
    fecha_hasta,
    descripcion_reserva = "",
    frecuencia = "diaria",
    dias_semana = [],
  } = req.body || {};

  if (!idperiodo_inicio || !idperiodo_fin || !fecha_desde || !fecha_hasta) {
    return res
      .status(400)
      .json({ ok: false, error: "Faltan datos obligatorios" });
  }

  if (!profesor) {
    return res.status(400).json({ ok: false, error: "Profesor obligatorio" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Obtener el padre actual
    const { rows: existentes } = await client.query(
      `SELECT * FROM reservas_estancias_repeticion WHERE id = $1`,
      [id]
    );

    if (existentes.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ ok: false, error: "Reserva periódica no encontrada" });
    }

    const padre = existentes[0];

    // Fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().slice(0, 10);

    // La fecha efectiva desde la que se pueden modificar reservas
    const fechaDesdeEfectiva = fecha_desde < hoy ? hoy : fecha_desde;

    // 2️⃣ Borrar hijos desde la fecha seleccionada
    const { rowCount: eliminadas } = await client.query(
      `
      DELETE FROM reservas_estancias
      WHERE idrepeticion = $1
        AND fecha >= $2
      `,
      [id, fechaDesdeEfectiva]
    );

    // 3️⃣ Actualizar el padre (NO tocamos fecha_desde)
    const { rows: actualizadoRows } = await client.query(
      `
     UPDATE reservas_estancias_repeticion
SET profesor = $1,
    idperiodo_inicio = $2,
    idperiodo_fin = $3,
    fecha_hasta = $4,
    descripcion = $5,
    frecuencia = $6,
    dias_semana = $7
WHERE id = $8
RETURNING *
      `,
      [
        profesor,
        idperiodo_inicio,
        idperiodo_fin,
        fecha_hasta,
        descripcion_reserva,
        frecuencia,
        dias_semana,
        id,
      ]
    );

    const padreActualizado = actualizadoRows[0];

    // 4️⃣ Generar fechas desde la fecha seleccionada
    let fechas = [];
    if (frecuencia === "diaria") {
      fechas = generarFechasDiarias(fechaDesdeEfectiva, fecha_hasta);
    } else if (frecuencia === "semanal") {
      fechas = generarFechasSemanales(
        fechaDesdeEfectiva,
        fecha_hasta,
        dias_semana
      );
    }

    // 5️⃣ Detectar colisiones
    const { fechasLibres, fechasConflicto } = await detectarColisiones({
      idestancia: padre.idestancia,
      fechas,
      idperiodo_inicio,
      idperiodo_fin,
      client,
    });

    // 6️⃣ Insertar SOLO fechas libres
    for (const fecha of fechasLibres) {
      await client.query(
        `
    INSERT INTO reservas_estancias
    (idestancia, uid, fecha,
     idperiodo_inicio, idperiodo_fin,
     descripcion, idrepeticion)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
        [
          padre.idestancia,
          profesor, // ✅ el nuevo
          fecha,
          idperiodo_inicio,
          idperiodo_fin,
          descripcion_reserva,
          id,
        ]
      );
    }

    await client.query("COMMIT");

    // 7️⃣ Respuesta
    res.json({
      ok: true,
      padre: padreActualizado,
      totalNuevas: fechas.length,
      insertadas: fechasLibres.length,
      omitidas: fechasConflicto.length,
      fechasOmitidas: fechasConflicto,
      hijosEliminados: eliminadas,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[updateReservaEstanciaRepeticion] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error actualizando reserva periódica",
    });
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// Simular una reserva periódica (sin insertar nada)
async function simularReservaEstanciaRepeticion(req, res) {
  const {
    idestancia,
    idperiodo_inicio,
    idperiodo_fin,
    fecha_desde,
    fecha_hasta,
    frecuencia = "diaria",
    dias_semana = [],
  } = req.body || {};

  if (
    !idestancia ||
    !idperiodo_inicio ||
    !idperiodo_fin ||
    !fecha_desde ||
    !fecha_hasta
  ) {
    return res.status(400).json({
      ok: false,
      error: "Faltan datos obligatorios para la simulación",
    });
  }

  try {
    // 1️⃣ Generar fechas
    let fechas = [];

    if (frecuencia === "diaria") {
      fechas = generarFechasDiarias(fecha_desde, fecha_hasta);
    } else if (frecuencia === "semanal") {
      fechas = generarFechasSemanales(fecha_desde, fecha_hasta, dias_semana);
    }

    if (fechas.length === 0) {
      return res.json({
        ok: true,
        total: 0,
        libres: 0,
        conflictos: 0,
        fechas_libres: [],
        fechas_conflicto: [],
      });
    }

    // 2️⃣ Comprobar colisiones
    const fechasLibres = [];
    const fechasConflicto = [];

    for (const fecha of fechas) {
      const { rowCount } = await pool.query(
        `
        SELECT 1
        FROM reservas_estancias
        WHERE idestancia = $1
          AND fecha = $2
          AND NOT (
            idperiodo_fin < $3
            OR idperiodo_inicio > $4
          )
        LIMIT 1
        `,
        [idestancia, fecha, idperiodo_inicio, idperiodo_fin]
      );

      if (rowCount > 0) {
        fechasConflicto.push(fecha);
      } else {
        fechasLibres.push(fecha);
      }
    }

    // 3️⃣ Respuesta
    res.json({
      ok: true,
      total: fechas.length,
      libres: fechasLibres.length,
      conflictos: fechasConflicto.length,
      fechas_libres: fechasLibres,
      fechas_conflicto: fechasConflicto,
    });
  } catch (err) {
    console.error("[simularReservaEstanciaRepeticion] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error simulando reserva periódica",
    });
  }
}

module.exports = {
  getReservasEstanciasRepeticion,
  insertReservaEstanciaRepeticion,
  deleteReservaEstanciaRepeticion,
  updateReservaEstanciaRepeticion,
  getReservasEstanciasRepeticionEnriquecidas,
  simularReservaEstanciaRepeticion,
};
