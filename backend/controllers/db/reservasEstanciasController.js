/**
 * ================================================================
 *  Controller: reservasEstanciasController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de reservas de estancias.
 *    Maneja operaciones sobre la tabla "reservas_estancias"
 *    de PostgreSQL, vinculando estancias con usuarios
 *    obtenidos desde LDAP.
 *
 *  Funcionalidades:
 *    - Obtener reservas por estancia y fecha (getReservasEstancias)
 *    - Insertar nueva reserva (insertReservaEstancia)
 *    - Eliminar reserva (deleteReservaEstancia)
 *    - Obtener reservas por día y tipo de estancia con nombres LDAP (getReservasEstanciasPorDia)
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

const pool = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");
//const { getEstanciasFiltradas } = require("../db/estanciasController");
const { filtrarEstancias } = require("../db/estanciasController");

function formatearFecha(reservas) {
  return reservas.map((r) => ({
    ...r,
    fecha: r.fecha.toISOString().split("T")[0], // "YYYY-MM-DD"
  }));
}

// Obtiene reservas filtradas por fecha y estancia
async function getReservasEstancias(req, res) {
  const { fecha, idestancia } = req.query;

  const filtros = [];
  const vals = [];
  let i = 0;

  if (fecha) {
    filtros.push(`fecha = $${++i}`);
    vals.push(fecha);
  }

  if (idestancia) {
    filtros.push(`idestancia = $${++i}`);
    vals.push(Number(idestancia));
  }

  const where = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";

  try {
    const { rows } = await pool.query(
      `SELECT id, idestancia, idperiodo_inicio, idperiodo_fin, uid, fecha, descripcion
       FROM reservas_estancias
       ${where}
       ORDER BY fecha ASC, idperiodo_inicio ASC`,
      vals
    );

    res.json({ ok: true, reservas: rows });
  } catch (err) {
    console.error("[getReservasEstancias] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo reservas" });
  }
}

// Inserta una nueva reserva
// Inserta una nueva reserva (versión depurada)
async function insertReservaEstancia(req, res) {
  const {
    idestancia,
    idperiodo_inicio,
    idperiodo_fin,
    uid,
    fecha,
    descripcion = "",
  } = req.body || {};

  if (!uid) {
    return res.status(401).json({ ok: false, error: "Usuario no autenticado" });
  }

  if (!idestancia || !idperiodo_inicio || !idperiodo_fin || !uid || !fecha) {
    return res
      .status(400)
      .json({ ok: false, error: "Datos obligatorios faltan" });
  }

  console.log("Intentando insertar reserva:", {
    idestancia,
    idperiodo_inicio,
    idperiodo_fin,
    uid,
    fecha,
    descripcion,
  });

  try {
    console.log("=== Intentando insertar reserva ===");
    console.log({
      idestancia,
      idperiodo_inicio,
      idperiodo_fin,
      uid,
      fecha,
      descripcion,
    });

    // 1️⃣ Verificar solape
    const { rows: existentes } = await pool.query(
      `SELECT id, idperiodo_inicio, idperiodo_fin
   FROM reservas_estancias
   WHERE idestancia = $1 AND fecha = $2
   AND NOT (idperiodo_fin < $3 OR idperiodo_inicio > $4)`,
      [idestancia, fecha, idperiodo_inicio, idperiodo_fin]
    );
    console.log("Reservas existentes que podrían solapar:", existentes);
    if (existentes.length > 0) {
      return res.status(409).json({
        ok: false,
        error: `La reserva se solapa con otra existente: ${existentes
          .map((e) => `[${e.idperiodo_inicio}-${e.idperiodo_fin}]`)
          .join(", ")}`,
      });
    }

    // 2️⃣ Insertar reserva
    const { rows } = await pool.query(
      `INSERT INTO reservas_estancias
   (idestancia, idperiodo_inicio, idperiodo_fin, uid, fecha, descripcion)
   VALUES ($1, $2, $3, $4, $5, $6)
   RETURNING *`,
      [idestancia, idperiodo_inicio, idperiodo_fin, uid, fecha, descripcion]
    );

    console.log("Reserva insertada correctamente:", rows[0]);

    res.status(201).json({ ok: true, reserva: rows[0] });
  } catch (err) {
    console.error("[insertReservaEstancia] Error:", err);
    res.status(500).json({ ok: false, error: "Error insertando reserva" });
  }
}

// Elimina una reserva por ID
async function deleteReservaEstancia(req, res) {
  const id = req.params.id;
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM reservas_estancias WHERE id = $1`,
      [id]
    );
    if (rowCount === 0)
      return res
        .status(404)
        .json({ ok: false, error: "Reserva no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteReservaEstancia] Error:", err);
    res.status(500).json({ ok: false, error: "Error eliminando reserva" });
  }
}

async function getReservasEstanciasPorDia(req, res) {
  const ldapSession = req.session?.ldap;
  if (!ldapSession)
    return res.status(401).json({ ok: false, error: "No autenticado" });

  const { fecha, tipoestancia } = req.query;

  if (!fecha || !tipoestancia) {
    return res
      .status(400)
      .json({ ok: false, error: "fecha y tipoestancia son obligatorios" });
  }

  try {
    // 1️⃣ Obtener periodos horarios
    const { rows: periodos } = await pool.query(
      `SELECT id, nombre, inicio, fin
       FROM periodos_horarios
       ORDER BY id`
    );

    // 2️⃣ Obtener estancias filtradas (solo reservables)
    const estanciasResult = await filtrarEstancias({
      tipoestancia,
      reservable: true,
    });

    if (!estanciasResult.ok) {
      return res
        .status(500)
        .json({ ok: false, error: "Error obteniendo estancias" });
    }

    const estancias = estanciasResult.estancias;
    const idsEstancias = estancias.map((e) => e.id);

    if (idsEstancias.length === 0) {
      return res.json({ ok: true, periodos, estancias: [], reservas: [] });
    }

    // 3️⃣ Obtener reservas de ese día y esas estancias
    const { rows: reservas } = await pool.query(
      `SELECT id, idestancia, idperiodo_inicio, idperiodo_fin, uid, descripcion
       FROM reservas_estancias
       WHERE fecha = $1
       AND idestancia = ANY($2::int[])
       ORDER BY idperiodo_inicio`,
      [fecha, idsEstancias]
    );

    // 4️⃣ Añadir nombres LDAP a las reservas
    const cacheNombres = new Map();
    for (const r of reservas) {
      if (!cacheNombres.has(r.uid)) {
        const nombre = await new Promise((resolve) => {
          buscarPorUid(ldapSession, r.uid, (err, datos) => {
            if (!err && datos)
              resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
            else resolve("Profesor desconocido");
          });
        });
        cacheNombres.set(r.uid, nombre);
      }
      r.nombre = cacheNombres.get(r.uid);
    }

    res.json({ ok: true, periodos, estancias, reservas });
  } catch (err) {
    console.error("[getReservasEstanciasPorDia] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error obteniendo reservas por día" });
  }
}

async function getReservasFiltradas(req, res) {
  const ldapSession = req.session?.ldap;
  if (!ldapSession)
    return res.status(401).json({ ok: false, error: "No autenticado" });

  const { fecha, desde, hasta, idestancia, tipoestancia, uid } = req.query;

  try {
    // 1️⃣ Construir filtros dinámicos para reservas
    const filtros = [];
    const vals = [];
    let i = 0;

    if (fecha) {
      filtros.push(`fecha = $${++i}`);
      vals.push(fecha);
    }
    if (desde) {
      filtros.push(`fecha >= $${++i}`);
      vals.push(desde);
    }
    if (hasta) {
      filtros.push(`fecha <= $${++i}`);
      vals.push(hasta);
    }
    if (idestancia) {
      filtros.push(`idestancia = $${++i}`);
      vals.push(Number(idestancia));
    }
    if (uid) {
      filtros.push(`uid = $${++i}`);
      vals.push(uid);
    }

    // 2️⃣ Si hay tipoestancia, obtener estancias filtradas
    let estancias = [];
    let idsEstancias = [];
    if (tipoestancia) {
      const estanciasResult = await filtrarEstancias({
        tipoestancia,
        reservable: true,
      });

      if (!estanciasResult.ok) {
        return res
          .status(500)
          .json({ ok: false, error: "Error obteniendo estancias" });
      }

      estancias = estanciasResult.estancias;
      idsEstancias = estancias.map((e) => e.id);

      if (idsEstancias.length > 0) {
        filtros.push(`idestancia = ANY($${++i}::int[])`);
        vals.push(idsEstancias);
      } else {
        // No hay estancias que cumplan el filtro
        return res.json({
          ok: true,
          periodos: [],
          estancias: [],
          reservas: [],
        });
      }
    }

    const where = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";

    // 3️⃣ Obtener reservas
    const { rows: reservas } = await pool.query(
      `SELECT id, idestancia, idperiodo_inicio, idperiodo_fin, uid, fecha, descripcion
       FROM reservas_estancias
       ${where}
       ORDER BY fecha ASC, idperiodo_inicio ASC`,
      vals
    );

    // 4️⃣ Añadir nombres LDAP
    const cacheNombres = new Map();
    for (const r of reservas) {
      if (!cacheNombres.has(r.uid)) {
        const nombre = await new Promise((resolve) => {
          buscarPorUid(ldapSession, r.uid, (err, datos) => {
            if (!err && datos)
              resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
            else resolve("Profesor desconocido");
          });
        });
        cacheNombres.set(r.uid, nombre);
      }
      r.nombre = cacheNombres.get(r.uid);
    }

    // 5️⃣ Obtener periodos horarios
    const { rows: periodos } = await pool.query(
      `SELECT id, nombre, inicio, fin
       FROM periodos_horarios
       ORDER BY id`
    );

    res.json({ ok: true, periodos, estancias, reservas });
  } catch (err) {
    console.error("[getReservasFiltradas] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo reservas" });
  }
}

// Actualiza una reserva existente
async function updateReservaEstancia(req, res) {
  const { id } = req.params;
  const { idperiodo_inicio, idperiodo_fin, descripcion = "" } = req.body || {};

  if (!idperiodo_inicio || !idperiodo_fin) {
    return res
      .status(400)
      .json({ ok: false, error: "Faltan periodos de inicio o fin" });
  }

  try {
    // Primero obtenemos la reserva actual
    const { rows: existentes } = await pool.query(
      `SELECT id, idestancia, fecha, uid
       FROM reservas_estancias
       WHERE id = $1`,
      [id]
    );

    if (existentes.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Reserva no encontrada" });
    }

    const { idestancia, fecha } = existentes[0];

    // Comprobamos solape con otras reservas de la misma estancia/fecha
    const { rows: solapes } = await pool.query(
      `SELECT id FROM reservas_estancias
       WHERE idestancia = $1 AND fecha = $2
       AND id <> $3
       AND NOT (idperiodo_fin < $4 OR idperiodo_inicio > $5)
       LIMIT 1`,
      [idestancia, fecha, id, idperiodo_inicio, idperiodo_fin]
    );

    if (solapes.length > 0) {
      return res.status(409).json({
        ok: false,
        error: "La reserva se solapa con otra reserva existente",
      });
    }

    // Actualizamos
    const { rows } = await pool.query(
      `UPDATE reservas_estancias
       SET idperiodo_inicio = $1,
           idperiodo_fin = $2,
           descripcion = $3
       WHERE id = $4
       RETURNING *`,
      [idperiodo_inicio, idperiodo_fin, descripcion, id]
    );

    res.json({ ok: true, reserva: rows[0] });
  } catch (err) {
    console.error("[updateReservaEstancia] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando reserva" });
  }
}

module.exports = {
  getReservasEstancias,
  insertReservaEstancia,
  deleteReservaEstancia,
  getReservasEstanciasPorDia,
  getReservasFiltradas,
  updateReservaEstancia,
};
