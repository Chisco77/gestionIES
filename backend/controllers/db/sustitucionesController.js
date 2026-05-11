const db = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");

/**
 * Verifica si un titular ya tiene una sustitución activa en esas fechas
 * para evitar duplicados.
 */
async function verificarColisionSustitucion(
  uid_titular,
  fecha_inicio,
  fecha_fin,
  excluirId = null
) {
  const query = `
    SELECT id, TO_CHAR(fecha_inicio, 'DD/MM/YYYY') as fecha_fmt
    FROM sustituciones
    WHERE uid_titular = $1
      AND id != COALESCE($4::int, -1)
      -- Comparamos fechas forzando el tipo ::date
      AND (fecha_fin IS NULL OR fecha_fin >= $2::date)
      AND fecha_inicio <= COALESCE($3::date, '9999-12-31'::date)
    LIMIT 1
  `;
  const { rows } = await db.query(query, [
    uid_titular,
    fecha_inicio,
    fecha_fin || null,
    excluirId,
  ]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Obtener sustituciones con nombres de LDAP
 */
async function getSustituciones(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession)
      return res.status(401).json({ ok: false, error: "No autenticado" });

    // 1. Extraemos el curso del middleware
    const curso_academico = req.curso?.label;

    if (!curso_academico) {
      return res.status(400).json({ ok: false, error: "Curso no definido" });
    }

    // 2. Filtramos la consulta por el curso actual
    const { rows: sustituciones } = await db.query(
      `SELECT id, uid_titular, uid_sustituto, 
              TO_CHAR(fecha_inicio, 'YYYY-MM-DD') as fecha_inicio, 
              TO_CHAR(fecha_fin, 'YYYY-MM-DD') as fecha_fin, 
              observaciones, creada_en
       FROM sustituciones 
       WHERE curso_academico = $1
       ORDER BY fecha_inicio DESC`,
      [curso_academico]
    );

    // 3. Enriquecimiento LDAP
    const uidsUnicos = [
      ...new Set([
        ...sustituciones.map((s) => s.uid_titular),
        ...sustituciones.map((s) => s.uid_sustituto),
      ]),
    ].filter(Boolean);

    const nombreMap = {};
    for (const uid of uidsUnicos) {
      nombreMap[uid] = await new Promise((resolve) => {
        buscarPorUid(ldapSession, uid, (err, datos) => {
          if (!err && datos)
            resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
          else resolve(uid);
        });
      });
    }

    const resultado = sustituciones.map((s) => ({
      ...s,
      nombreTitular: nombreMap[s.uid_titular] || s.uid_titular,
      nombreSustituto: nombreMap[s.uid_sustituto] || s.uid_sustituto,
    }));

    res.json({
      ok: true,
      sustituciones: resultado,
      curso: curso_academico, // Enviamos el curso para que el frontend sepa qué está viendo
    });
  } catch (err) {
    console.error("[getSustituciones] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error al obtener sustituciones" });
  }
}

/**
 * Crear una nueva sustitución
 */
async function insertSustitucion(req, res) {
  const { uid_titular, uid_sustituto, fecha_inicio, fecha_fin, observaciones } =
    req.body;

  // Extraemos del middleware
  const curso_academico = req.curso?.label;

  if (!uid_titular || !uid_sustituto || !fecha_inicio) {
    return res
      .status(400)
      .json({ ok: false, error: "Datos obligatorios faltantes" });
  }

  try {
    // 1. Validar colisiones (Pasamos el curso para filtrar si fuera necesario)
    const colision = await verificarColisionSustitucion(
      uid_titular,
      fecha_inicio,
      fecha_fin
    );

    if (colision) {
      return res.status(409).json({
        ok: false,
        error: `El titular ya tiene una sustitución activa desde el ${colision.fecha_fmt}`,
      });
    }

    // 2. Insertar incluyendo el curso académico
    const { rows } = await db.query(
      `INSERT INTO sustituciones (uid_titular, uid_sustituto, fecha_inicio, fecha_fin, observaciones, curso_academico)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        uid_titular,
        uid_sustituto,
        fecha_inicio,
        fecha_fin || null,
        observaciones,
        curso_academico,
      ]
    );

    // 3. Limpieza de guardias (Mantenemos tu lógica actual)
    const { rowCount: borradas } = await db.query(
      `DELETE FROM guardias_asignadas 
       WHERE uid_profesor_ausente = $1 
         AND fecha >= $2::date 
         AND estado = 'activa'`,
      [uid_titular, fecha_inicio]
    );

    res.status(201).json({
      ok: true,
      sustitucion: rows[0],
      mensaje:
        borradas > 0
          ? `Sustitución registrada (${curso_academico}) y se han liberado ${borradas} guardias.`
          : `Sustitución registrada correctamente para el curso ${curso_academico}.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error al crear la sustitución" });
  }
}

/**
 * Finalizar una sustitución (poner fecha_fin)
 */
/**
 * Finalizar una sustitución (poner fecha_fin)
 * También limpia el horario del sustituto ya que su labor termina.
 */
async function finalizarSustitucion(req, res) {
  const { id } = req.params;
  const { fecha_fin } = req.body;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. Obtener el UID del sustituto antes de actualizar
    const { rows } = await client.query(
      `SELECT uid_sustituto FROM sustituciones WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ ok: false, error: "Sustitución no encontrada" });
    }

    const { uid_sustituto } = rows[0];

    // 2. Actualizar la fecha de fin (usando la de Madrid si no viene en el body)
    const hoyMadrid = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Europe/Madrid",
    });
    await client.query(
      `UPDATE sustituciones SET fecha_fin = $1::date WHERE id = $2`,
      [fecha_fin || hoyMadrid, id]
    );

    // 3. Eliminar el horario del sustituto
    const { rowCount: horarioBorrado } = await client.query(
      `DELETE FROM horario_profesorado WHERE uid = $1`,
      [uid_sustituto]
    );

    await client.query("COMMIT");

    console.log(
      `✅ Sustitución ${id} finalizada. Horario de ${uid_sustituto} eliminado (${horarioBorrado} filas).`
    );

    res.json({
      ok: true,
      mensaje: "Sustitución finalizada y horario del sustituto retirado.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al finalizar sustitución:", err);
    res.status(500).json({
      ok: false,
      error: "Error al procesar el cierre de la sustitución",
    });
  } finally {
    client.release();
  }
}

/**
 * Eliminar registro (Solo si hubo un error administrativo)
 * También limpia el horario clonado del sustituto para no dejar datos huérfanos.
 */
async function deleteSustitucion(req, res) {
  const { id } = req.params;

  // Iniciamos una transacción para asegurar que si falla el borrado de horario,
  // no se borre la sustitución (o viceversa)
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. Obtener los datos antes de borrar para saber a quién limpiar el horario
    const { rows } = await client.query(
      `SELECT uid_sustituto FROM sustituciones WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ ok: false, error: "Sustitución no encontrada" });
    }

    const { uid_sustituto } = rows[0];

    // 2. Borrar el registro de la sustitución
    await client.query(`DELETE FROM sustituciones WHERE id = $1`, [id]);

    // 3. Eliminar el horario del sustituto
    // Nota: Esto borra TODO su horario. Si el sustituto tuviera horas propias previas
    // a la sustitución (raro pero posible), este delete sería más complejo.
    // Asumimos que su horario actual es íntegramente el clonado.
    const { rowCount: horarioBorrado } = await client.query(
      `DELETE FROM horario_profesorado WHERE uid = $1`,
      [uid_sustituto]
    );

    await client.query("COMMIT");

    console.log(
      `🗑️ Registro ${id} eliminado. Horario de ${uid_sustituto} limpiado (${horarioBorrado} filas).`
    );

    res.json({
      ok: true,
      mensaje:
        "Registro eliminado y horario del sustituto limpiado correctamente.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al eliminar sustitución:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error interno al eliminar el registro" });
  } finally {
    client.release();
  }
}

async function updateSustitucion(req, res) {
  const { id } = req.params;
  const { fecha_inicio, observaciones } = req.body;

  try {
    // 1. Validación de entrada básica
    if (!id || !fecha_inicio) {
      return res.status(400).json({
        ok: false,
        error: "El ID y la fecha de inicio son campos obligatorios.",
      });
    }

    // 2. Intento de actualización
    const resultado = await db.query(
      `UPDATE sustituciones 
       SET fecha_inicio = $1, observaciones = $2 
       WHERE id = $3
       RETURNING fecha_fin`, // Retornamos fecha_fin para log o debug
      [fecha_inicio, observaciones, id]
    );

    if (resultado.rowCount === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Registro no encontrado." });
    }

    res.json({ ok: true, mensaje: "Cambios guardados correctamente." });
  } catch (err) {
    // Registro del error técnico en la consola del servidor
    console.error("❌ Error en updateSustitucion:", err.message);

    // 3. Manejo de errores de restricciones (Constraints) de PostgreSQL
    if (err.message.includes("chk_fechas_sustitucion")) {
      return res.status(400).json({
        ok: false,
        error:
          "Conflicto de fechas: La fecha de inicio no puede ser posterior a la fecha de finalización ya registrada.",
      });
    }

    if (err.message.includes("chk_sustituto_distinto")) {
      return res.status(400).json({
        ok: false,
        error: "El titular y el sustituto deben ser personas distintas.",
      });
    }

    // Error genérico para otros fallos de base de datos
    res.status(500).json({
      ok: false,
      error: "Error interno al intentar actualizar el registro.",
    });
  }
}

module.exports = {
  getSustituciones,
  insertSustitucion,
  finalizarSustitucion,
  deleteSustitucion,
  updateSustitucion,
};
