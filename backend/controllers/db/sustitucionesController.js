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
  excluirId = null,
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

    const { rows: sustituciones } = await db.query(
      `SELECT id, uid_titular, uid_sustituto, 
              TO_CHAR(fecha_inicio, 'YYYY-MM-DD') as fecha_inicio, 
              TO_CHAR(fecha_fin, 'YYYY-MM-DD') as fecha_fin, 
              observaciones, creada_en
       FROM sustituciones 
       ORDER BY fecha_inicio DESC`,
    );

    // Enriquecimiento LDAP para ambos UIDs
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

    res.json({ ok: true, sustituciones: resultado });
  } catch (err) {
    console.error(err);
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

  if (!uid_titular || !uid_sustituto || !fecha_inicio) {
    return res
      .status(400)
      .json({ ok: false, error: "Datos obligatorios faltantes" });
  }

  try {
    // 1. Validar colisiones
    const colision = await verificarColisionSustitucion(
      uid_titular,
      fecha_inicio,
      fecha_fin,
    );
    if (colision) {
      return res.status(409).json({
        ok: false,
        error: `El titular ya tiene una sustitución activa desde el ${colision.fecha_fmt}`,
      });
    }

    // 2. Insertar
    const { rows } = await db.query(
      `INSERT INTO sustituciones (uid_titular, uid_sustituto, fecha_inicio, fecha_fin, observaciones)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        uid_titular,
        uid_sustituto,
        fecha_inicio,
        fecha_fin || null,
        observaciones,
      ],
    );

    // 3. Limpieza de guardias futuras o del mismo día de inicio
    // Eliminamos cualquier guardia asignada (esté confirmada o no) porque el sustituto ya cubre ese horario
    const { rowCount: borradas } = await db.query(
      `DELETE FROM guardias_asignadas 
       WHERE uid_profesor_ausente = $1 
         AND fecha >= $2::date 
         AND estado = 'activa'`,
      [uid_titular, fecha_inicio],
    );

    console.log(
      `✅ Sustitución creada: ${borradas} guardias eliminadas para el titular ${uid_titular}`,
    );

    res.status(201).json({
      ok: true,
      sustitucion: rows[0],
      mensaje:
        borradas > 0
          ? `Sustitución registrada y se han liberado ${borradas} guardias asignadas.`
          : "Sustitución registrada correctamente.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error al crear la sustitución" });
  }
}

/**
 * Finalizar una sustitución (poner fecha_fin)
 */
async function finalizarSustitucion(req, res) {
  const { id } = req.params;
  const { fecha_fin } = req.body;

  try {
    const { rowCount } = await db.query(
      `UPDATE sustituciones SET fecha_fin = $1::date WHERE id = $2`,
      [fecha_fin || new Date().toISOString().split("T")[0], id],
    );

    if (rowCount === 0)
      return res.status(404).json({ ok: false, error: "No encontrada" });

    res.json({ ok: true, message: "Sustitución finalizada" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ ok: false, error: "Error al finalizar la sustitución" });
  }
}

/**
 * Eliminar registro (Solo si hubo un error administrativo)
 */
async function deleteSustitucion(req, res) {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM sustituciones WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error al eliminar" });
  }
}

module.exports = {
  getSustituciones,
  insertSustitucion,
  finalizarSustitucion,
  deleteSustitucion,
};
