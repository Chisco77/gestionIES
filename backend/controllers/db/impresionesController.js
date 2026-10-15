/*const { Pool } = require("pg");

const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

/**
 * Registra una nueva impresión enviada desde el script cliente
 */
/*async function insertRegistroImpresion(req, res) {
  try {
    const {
      uid,
      impresora,
      job_id, // <--- Leemos job_id coincidiendo con la columna
      equipo,
      titulo,
      paginas,
      copias,
      formato,
    } = req.body;

    if (!uid || !impresora || !paginas) {
      return res.status(400).json({
        error: "Faltan parámetros obligatorios (uid, impresora, paginas)",
      });
    }

    const numPaginasCopia = parseInt(paginas, 10) || 1;
    const numCopias = parseInt(copias, 10) || 1;
    const totalPaginasCalculado = numPaginasCopia * numCopias;
    const jobIdInt = job_id ? parseInt(job_id, 10) : null;

    const query = `
      INSERT INTO registro_impresiones (
        uid,
        impresora,
        job_id,
        equipo,
        titulo_documento,
        paginas_copia,
        copias,
        total_paginas,
        formato
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, fecha;
    `;

    const values = [
      uid,
      impresora,
      jobIdInt,
      equipo || null,
      titulo || "Sin título",
      numPaginasCopia,
      numCopias,
      totalPaginasCalculado,
      formato || "A4",
    ];

    const { rows } = await pgPool.query(query, values);

    return res.status(201).json({
      status: "ok",
      message: "Impresión registrada correctamente",
      id: rows[0].id,
      fecha: rows[0].fecha,
    });
  } catch (error) {
    console.error("❌ Error insertando registro de impresión:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Obtiene el listado de impresiones registradas
 */
/*async function getRegistrosImpresiones(req, res) {
  try {
    const query = `
      SELECT 
        id,
        uid,
        impresora,
        job_id,
        equipo,
        titulo_documento,
        paginas_copia,
        copias,
        total_paginas,
        formato,
        fecha
      FROM registro_impresiones
      ORDER BY fecha DESC
      LIMIT 500;
    `;

    const { rows } = await pgPool.query(query);
    return res.json(rows);
  } catch (error) {
    console.error("❌ Error consultando impresiones:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  insertRegistroImpresion,
  getRegistrosImpresiones,
};
*/

const db = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");

/**
 * Registra una nueva impresión. Enviada desde el script cliente y programado en el cron (o similar, Jenkins en mi caso)
 */
async function insertRegistroImpresion(req, res) {
  const client = await db.connect();

  try {
    const {
      uid,
      impresora,
      job_id,
      equipo,
      titulo,
      paginas,
      copias,
      formato,
      es_color,
    } = req.body;

    if (!uid || !impresora || !paginas) {
      return res.status(400).json({
        error: "Faltan parámetros obligatorios (uid, impresora, paginas)",
      });
    }

    const numPaginasCopia = parseInt(paginas, 10) || 1;
    const numCopias = parseInt(copias, 10) || 1;
    const totalPaginasCalculado = numPaginasCopia * numCopias;
    const jobIdInt = job_id ? parseInt(job_id, 10) : null;
    const esColorBool = Boolean(es_color);

    const query = `
      INSERT INTO registro_impresiones (
        uid,
        impresora,
        job_id,
        equipo,
        titulo_documento,
        paginas_copia,
        copias,
        total_paginas,
        formato,
        color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, fecha;
    `;

    const values = [
      uid,
      impresora,
      jobIdInt,
      equipo || null,
      titulo || "Sin título",
      numPaginasCopia,
      numCopias,
      totalPaginasCalculado,
      formato || "A4",
      esColorBool,
    ];

    const { rows } = await client.query(query, values);

    return res.status(201).json({
      status: "ok",
      message: "Impresión registrada correctamente",
      id: rows[0].id,
      fecha: rows[0].fecha,
    });
  } catch (error) {
    console.error("❌ Error insertando registro de impresión:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
}

/**
 * Obtiene el listado de impresiones registradas enriquecido con datos de LDAP
 */
async function getRegistrosImpresiones(req, res) {
  const client = await db.connect();

  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) return res.status(401).json({ error: "No autenticado" });

    const query = `
      SELECT 
        id,
        uid,
        impresora,
        job_id,
        equipo,
        titulo_documento,
        paginas_copia,
        copias,
        total_paginas,
        formato,
        color,
        (fecha + INTERVAL '2 hours') AS fecha
      FROM registro_impresiones
      ORDER BY fecha DESC
      LIMIT 500;
    `;

    const { rows } = await client.query(query);

    // Caché temporal para evitar consultas repetidas a LDAP para el mismo UID en la misma petición
    const ldapCache = new Map();

    const registrosEnriquecidos = await Promise.all(
      rows.map(async (row) => {
        let nombre = "";
        let apellidos = "";

        if (row.uid) {
          if (ldapCache.has(row.uid)) {
            const cached = ldapCache.get(row.uid);
            nombre = cached.nombre;
            apellidos = cached.apellidos;
          } else {
            const datosLdap = await new Promise((resolve) => {
              buscarPorUid(ldapSession, row.uid, (err, datos) => {
                if (!err && datos) resolve(datos);
                else resolve(null);
              });
            });

            nombre = datosLdap?.givenName || "";
            apellidos = datosLdap?.sn || "";

            ldapCache.set(row.uid, { nombre, apellidos });
          }
        }

        return {
          ...row,
          nombre,
          apellidos,
        };
      })
    );

    return res.json(registrosEnriquecidos);
  } catch (error) {
    console.error("❌ Error consultando impresiones:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
}

module.exports = {
  insertRegistroImpresion,
  getRegistrosImpresiones,
};
