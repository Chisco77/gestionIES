const { Pool } = require("pg");

// Reutilizamos la configuración del pool desde el entorno
const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

/**
 * Registra una nueva impresión enviada desde el script de tea4cups/CUPS
 */
async function insertRegistroImpresion(req, res) {
  try {
    const { uid, impresora, jobid, equipo, titulo, paginas, copias, tamanio } =
      req.body;

    // Validación básica
    if (!uid || !impresora || !paginas) {
      return res.status(400).json({
        error: "Faltan parámetros obligatorios (uid, impresora, paginas)",
      });
    }

    const numPaginas = parseInt(paginas, 10) || 1;
    const numCopias = parseInt(copias, 10) || 1;
    const totalPaginas = numPaginas * numCopias;
    const jobIdInt = parseInt(jobid, 10) || null;

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
        tamanio
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, fecha;
    `;

    const values = [
      uid,
      impresora,
      jobIdInt,
      equipo || null,
      titulo || "Sin título",
      numPaginas,
      numCopias,
      totalPaginas,
      tamanio || "A4",
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
 * Obtiene el listado de impresiones registradas (para el panel de gestión)
 */
async function getRegistrosImpresiones(req, res) {
  try {
    const query = `
      SELECT 
        r.id,
        r.uid,
        r.impresora,
        r.job_id,
        r.equipo,
        r.titulo_documento,
        r.paginas_copia,
        r.copias,
        r.total_paginas,
        r.tamanio,
        r.fecha
      FROM registro_impresiones r
      ORDER BY r.fecha DESC
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
