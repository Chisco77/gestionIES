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
const { filtrarEstancias } = require("../db/estanciasController");

function formatearFecha(reservas) {
  return reservas.map((r) => ({
    ...r,
    fecha: r.fecha.toISOString().split("T")[0], // "YYYY-MM-DD"
  }));
}

async function getReservasEstancias(req, res) {
  // Extraemos lo que viene del cliente
  const { fecha, idestancia } = req.query;

  // Prioridad: 1. Lo que mande el cliente (req.query)
  //            2. Lo que diga el curso actual (req.curso)
  const fechaDesde = req.query.fechaDesde || req.curso.inicioCurso;
  const fechaHasta = req.query.fechaHasta || req.curso.finCurso;

  const filtros = [];
  const vals = [];
  let i = 0;

  if (fecha) {
    filtros.push(`fecha = $${++i}`);
    vals.push(fecha);
  }

  // Ahora esto se ejecutará casi siempre,
  // ya que si no hay query, el middleware rellena req.curso
  if (fechaDesde && fechaHasta) {
    filtros.push(`fecha BETWEEN $${++i} AND $${++i}`);
    vals.push(fechaDesde, fechaHasta);
  }

  if (idestancia) {
    const ids = idestancia.split(",").map((id) => Number(id.trim()));
    if (ids.length === 1) {
      filtros.push(`idestancia = $${++i}`);
      vals.push(ids[0]);
    } else if (ids.length > 1) {
      const placeholders = ids.map(() => `$${++i}`).join(",");
      filtros.push(`idestancia IN (${placeholders})`);
      vals.push(...ids);
    }
  }

  const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

  try {
    const { rows } = await pool.query(
      `SELECT id, idestancia, idperiodo_inicio, idperiodo_fin, uid,
              TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha,
              descripcion, idrepeticion
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
async function insertReservaEstancia(req, res) {
  const {
    idestancia,
    idperiodo_inicio,
    idperiodo_fin,
    uid,
    fecha,
    descripcion = "",
    idrepeticion = null,
  } = req.body || {};

  if (!uid) {
    return res.status(401).json({ ok: false, error: "Usuario no autenticado" });
  }

  if (!idestancia || !idperiodo_inicio || !idperiodo_fin || !uid || !fecha) {
    return res
      .status(400)
      .json({ ok: false, error: "Faltan datos obligatorios para la reserva" });
  }

  try {
    // Comprobar que los IDs de periodo existen de verdad ... a ver si cazo el bug
    const { rows: periodosValidos } = await pool.query(
      "SELECT id FROM periodos_horarios WHERE id IN ($1, $2)",
      [idperiodo_inicio, idperiodo_fin]
    );

    // Si no encuentra los dos IDs, es que uno es inválido
    if (periodosValidos.length < 2 && idperiodo_inicio !== idperiodo_fin) {
      return res.status(400).json({
        ok: false,
        error: "Uno de los periodos seleccionados no es válido.",
      });
    }
    // 1️⃣ Verificar solape
    const { rows: existentes } = await pool.query(
      `SELECT id, idperiodo_inicio, idperiodo_fin
       FROM reservas_estancias
       WHERE idestancia = $1 AND fecha = $2
       AND NOT (idperiodo_fin < $3 OR idperiodo_inicio > $4)`,
      [idestancia, fecha, idperiodo_inicio, idperiodo_fin]
    );
    if (existentes.length > 0) {
      return res.status(409).json({
        ok: false,
        error: `La reserva se solapa con otra existente: ${existentes
          .map((e) => `[${e.idperiodo_inicio}-${e.idperiodo_fin}]`)
          .join(", ")}`,
      });
    }

    //
    //  HARDCODE con variable de entorno
    //
    const CONTROL_OPTATIVA4 = process.env.CONTROL_OPTATIVA4 === "true";
    const { confirmar = false } = req.body;

    // 🔹 CONTROL OPTATIVA 4 (solo si está activado)
    if (CONTROL_OPTATIVA4 && idestancia === 47 && !confirmar) {
      const otrasEstancias = [41, 43, 45];

      const { rows: libres } = await pool.query(
        `SELECT id
     FROM estancias
     WHERE id = ANY($1::int[])
     AND id NOT IN (
        SELECT idestancia
        FROM reservas_estancias
        WHERE fecha = $2
        AND NOT (idperiodo_fin < $3 OR idperiodo_inicio > $4)
     )`,
        [otrasEstancias, fecha, idperiodo_inicio, idperiodo_fin]
      );

      if (libres.length > 0) {
        return res.json({
          ok: true,
          requiereConfirmacion: true,
          estanciasLibres: libres.map((e) => e.id),
        });
      }
    }

    // 2️⃣ Insertar reserva
    const { rows } = await pool.query(
      `INSERT INTO reservas_estancias
       (idestancia, idperiodo_inicio, idperiodo_fin, uid, fecha, descripcion, idrepeticion)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        idestancia,
        idperiodo_inicio,
        idperiodo_fin,
        uid,
        fecha,
        descripcion,
        idrepeticion,
      ]
    );

    res.status(201).json({ ok: true, reserva: rows[0] });
  } catch (err) {
    console.error("[insertReservaEstancia] Error:", err);
    res.status(500).json({ ok: false, error: "Error insertando reserva" });
  }
}

// Elimina una reserva por ID con protección de actividades extraescolares
async function deleteReservaEstancia(req, res) {
  const id = req.params.id;
  try {
    // 1. Comprobar si la reserva está vinculada a alguna actividad extraescolar
    const { rows: vinculadas } = await pool.query(
      `SELECT titulo, fecha_inicio 
       FROM extraescolares 
       WHERE id_reserva_estancia = $1`,
      [id]
    );

    if (vinculadas.length > 0) {
      const actividad = vinculadas[0];
      // Formateamos la fecha para que sea legible (DD/MM/YYYY)
      const fechaFormateada = new Date(
        actividad.fecha_inicio
      ).toLocaleDateString("es-ES");

      return res.status(400).json({
        ok: false,
        error: `No se puede eliminar: esta reserva está vinculada a la actividad "${actividad.titulo}" del día ${fechaFormateada}. Debes modificar o eliminar la actividad directamente.`,
      });
    }

    // 2. Si no hay vínculos, procedemos al borrado normal
    const { rowCount } = await pool.query(
      `DELETE FROM reservas_estancias WHERE id = $1`,
      [id]
    );

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Reserva no encontrada" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteReservaEstancia] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error interno al intentar eliminar la reserva",
    });
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
       WHERE TO_CHAR(fecha, 'YYYY-MM-DD') = $1
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
              resolve(`${datos.givenName || ""} ${datos.sn || ""}`.trim());
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

  // 1. Extraemos parámetros. Quitamos 'desde' y 'hasta' de la desestructuración directa
  // para gestionarlos con la lógica del curso actual.
  const { fecha, idestancia, tipoestancia, uid } = req.query;

  // Si vienen en la query los usamos (flexibilidad), si no, usamos el curso actual.
  const fechaDesde = req.query.desde || req.curso.inicioCurso;
  const fechaHasta = req.query.hasta || req.curso.finCurso;

  try {
    const filtros = [];
    const vals = [];
    let i = 0;

    if (fecha) {
      filtros.push(`TO_CHAR(fecha, 'YYYY-MM-DD') = $${++i}`);
      vals.push(fecha);
    }

    // 2. Usamos nuestras variables fechaDesde y fechaHasta
    if (fechaDesde) {
      filtros.push(`fecha >= $${++i}`);
      vals.push(fechaDesde);
    }
    if (fechaHasta) {
      filtros.push(`fecha <= $${++i}`);
      vals.push(fechaHasta);
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
      `SELECT 
    r.id, 
    r.idestancia, 
    r.idperiodo_inicio, 
    r.idperiodo_fin, 
    r.uid, 
    TO_CHAR(r.fecha, 'YYYY-MM-DD') AS fecha, 
    r.descripcion, 
    r.idrepeticion,
    e.descripcion AS nombre_estancia -- Añadimos el nombre de la estancia
   FROM reservas_estancias r
   LEFT JOIN estancias e ON r.idestancia = e.id -- Hacemos el JOIN
   ${where}
   ORDER BY r.fecha ASC, r.idperiodo_inicio ASC, r.idestancia ASC`,
      vals
    );

    // 4️⃣ Añadir nombres LDAP
    const cacheNombres = new Map();
    for (const r of reservas) {
      if (!cacheNombres.has(r.uid)) {
        const nombre = await new Promise((resolve) => {
          buscarPorUid(ldapSession, r.uid, (err, datos) => {
            if (!err && datos)
              resolve(`${datos.givenName || ""} ${datos.sn || ""}`.trim());
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
    // Comprobar que los IDs de periodo existen de verdad ... a ver si cazo el bug
    const { rows: periodosValidos } = await pool.query(
      "SELECT id FROM periodos_horarios WHERE id IN ($1, $2)",
      [idperiodo_inicio, idperiodo_fin]
    );

    // Si no encuentra los dos IDs, es que uno es inválido
    if (periodosValidos.length < 2 && idperiodo_inicio !== idperiodo_fin) {
      return res.status(400).json({
        ok: false,
        error: "Uno de los periodos seleccionados no es válido.",
      });
    }
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

// reservasEstanciasController.jsx
async function insertReservaEstanciaPeriodica(req, res) {
  const {
    idestancia,
    idperiodo_inicio,
    idperiodo_fin,
    uid,
    fecha, // fecha de inicio 'YYYY-MM-DD'
    descripcion = "",
    repeticion = "diaria", // 'diaria' o 'semanal'
    diasSemana = [], // solo si semanal
    fechaLimite, // 'YYYY-MM-DD'
  } = req.body || {};

  if (!uid)
    return res.status(401).json({ ok: false, error: "Usuario no autenticado" });
  if (!idestancia || !idperiodo_inicio || !idperiodo_fin || !fecha) {
    return res
      .status(400)
      .json({ ok: false, error: "Datos obligatorios faltan" });
  }

  try {
    // 🔹 1️⃣ Crear registro en tabla reservas_estancias_repeticion
    const { rows: repRows } = await pool.query(
      `INSERT INTO reservas_estancias_repeticion
       (uid, profesor, idperiodo_inicio, idperiodo_fin, idestancia,
        fecha_desde, fecha_hasta, descripcion, frecuencia)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        uid,
        uid, // profesor
        idperiodo_inicio,
        idperiodo_fin,
        idestancia,
        fecha,
        fechaLimite,
        descripcion,
        repeticion === "diaria" ? "daily" : "weekly",
      ]
    );
    const idRepeticion = repRows[0].id;

    // 🔹 2️⃣ Generar fechas según frecuencia
    const diasMap = { Lun: 1, Mar: 2, Mié: 3, Jue: 4, Vie: 5 };
    const nextDay = (str) => {
      const [y, m, d] = str.split("-").map(Number);
      const next = new Date(y, m - 1, d + 1);
      return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
    };

    let currentDateStr = fecha;
    const fechasAInsertar = [];

    while (currentDateStr <= fechaLimite) {
      if (repeticion === "diaria") fechasAInsertar.push(currentDateStr);
      else if (repeticion === "semanal") {
        const [y, m, d] = currentDateStr.split("-").map(Number);
        const day = new Date(y, m - 1, d).getDay();
        if (diasSemana.some((dia) => diasMap[dia] === day))
          fechasAInsertar.push(currentDateStr);
      }
      currentDateStr = nextDay(currentDateStr);
    }

    // 🔹 3️⃣ Insertar reservas con idrepeticion
    const reservasInsertadas = [];
    for (const f of fechasAInsertar) {
      const { rows: existentes } = await pool.query(
        `SELECT id FROM reservas_estancias
         WHERE idestancia = $1
           AND fecha = $2
           AND idperiodo_inicio <= $4
           AND idperiodo_fin >= $3`,
        [idestancia, f, idperiodo_inicio, idperiodo_fin]
      );

      if (existentes.length > 0) continue;

      const { rows } = await pool.query(
        `INSERT INTO reservas_estancias
         (idestancia, idperiodo_inicio, idperiodo_fin, uid, fecha, descripcion, idrepeticion)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [
          idestancia,
          idperiodo_inicio,
          idperiodo_fin,
          uid,
          f,
          descripcion,
          idRepeticion,
        ]
      );
      reservasInsertadas.push(rows[0]);
    }

    res.status(201).json({
      ok: true,
      idRepeticion,
      reservas: reservasInsertadas,
      message: `Se insertaron ${reservasInsertadas.length} reservas con idrepeticion ${idRepeticion}`,
    });
  } catch (err) {
    console.error("[insertReservaEstanciaPeriodica] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error insertando reservas periódicas" });
  }
}

module.exports = {
  getReservasEstancias,
  insertReservaEstancia,
  deleteReservaEstancia,
  getReservasEstanciasPorDia,
  getReservasFiltradas,
  updateReservaEstancia,
  insertReservaEstanciaPeriodica,
};
