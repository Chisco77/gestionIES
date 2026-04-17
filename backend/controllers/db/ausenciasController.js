const db = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");

/**
 * Función de utilidad para verificar solapamientos
 * Se asegura de que no haya otra ausencia para el mismo profesor en el mismo tiempo.
 */

async function verificarColision(
  uid_profesor,
  f_inicio,
  f_fin,
  p_inicio,
  p_fin,
  excluirId = null
) {
  const fechaFin = f_fin || f_inicio;

  const query = `
    SELECT id, tipo_ausencia, idpermiso, idextraescolar, 
           TO_CHAR(fecha_inicio, 'DD/MM/YYYY') as fecha_fmt
    FROM ausencias_profesorado
    WHERE uid_profesor = $1
      AND id != COALESCE($6::int, -1) -- Cast a int
      AND fecha_inicio <= $3 
      AND fecha_fin >= $2
      AND (
        -- Forzamos el tipo con ::int para que Postgres no se queje si es NULL
        (idperiodo_inicio IS NULL) OR ($4::int IS NULL)
        OR
        ($4::int <= idperiodo_fin AND $5::int >= idperiodo_inicio)
      )
    LIMIT 1
  `;

  // Ejecutamos con los valores asegurando que p_inicio/p_fin sean números o null
  const { rows } = await db.query(query, [
    uid_profesor,
    f_inicio,
    fechaFin,
    p_inicio ? Number(p_inicio) : null,
    p_fin ? Number(p_fin) : null,
    excluirId ? Number(excluirId) : null,
  ]);

  return rows.length > 0 ? rows[0] : null;
}

/**
 * Obtener ausencias enriquecidas (Se mantiene igual que tu código original)
 */
async function getAusenciasEnriquecidas(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession)
      return res.status(401).json({ ok: false, error: "No autenticado" });

    const { uid_profesor, fecha_inicio, tipo_ausencia } = req.query;
    const filtros = [];
    const vals = [];
    let i = 0;

    if (uid_profesor)
      filtros.push(`a.uid_profesor = $${++i}`) && vals.push(uid_profesor);
    if (fecha_inicio)
      filtros.push(`a.fecha_inicio = $${++i}`) && vals.push(fecha_inicio);
    if (tipo_ausencia)
      filtros.push(`a.tipo_ausencia = $${++i}`) && vals.push(tipo_ausencia);

    const where = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";

    const { rows: ausencias } = await db.query(
      `SELECT a.id, a.uid_profesor, 
        TO_CHAR(a.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
        TO_CHAR(a.fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
        a.idperiodo_inicio, a.idperiodo_fin, a.tipo_ausencia,
        a.descripcion, a.creada_en, a.creada_por, a.idpermiso, a.idextraescolar
      FROM ausencias_profesorado a
      ${where}
      ORDER BY a.fecha_inicio DESC`,
      vals
    );

    const uidsUnicos = [
      ...new Set([
        ...ausencias.map((a) => a.uid_profesor),
        ...ausencias.map((a) => a.creada_por),
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

    const periodosIds = [
      ...new Set(
        ausencias
          .flatMap((a) => [a.idperiodo_inicio, a.idperiodo_fin])
          .filter(Boolean)
      ),
    ];
    let periodosMap = {};
    if (periodosIds.length > 0) {
      const { rows: periodos } = await db.query(
        `SELECT id, nombre FROM periodos_horarios WHERE id = ANY($1)`,
        [periodosIds]
      );
      periodosMap = periodos.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});
    }

    const ausenciasEnriquecidas = ausencias.map((a) => ({
      ...a,
      nombreProfesor: nombreMap[a.uid_profesor] || "Desconocido",
      nombreCreador: nombreMap[a.creada_por] || a.creada_por,
      periodo_inicio: a.idperiodo_inicio
        ? periodosMap[a.idperiodo_inicio]
        : null,
      periodo_fin: a.idperiodo_fin ? periodosMap[a.idperiodo_fin] : null,
    }));

    res.json({ ok: true, ausencias: ausenciasEnriquecidas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error obteniendo ausencias" });
  }
}

/**
 * Insertar una ausencia manualmente (CON VALIDACIÓN)
 */
async function insertAusencia(req, res) {
  const {
    uid_profesor,
    fecha_inicio,
    fecha_fin,
    idperiodo_inicio,
    idperiodo_fin,
    tipo_ausencia,
    descripcion,
    creada_por,
  } = req.body;

  if (!uid_profesor || !fecha_inicio) {
    return res
      .status(400)
      .json({ ok: false, error: "UID y fecha_inicio son obligatorios" });
  }

  try {
    // 🛡️ VALIDACIÓN DE COLISIONES
    const colision = await verificarColision(
      uid_profesor,
      fecha_inicio,
      fecha_fin,
      idperiodo_inicio,
      idperiodo_fin
    );
    if (colision) {
      return res.status(409).json({
        ok: false,
        error: `El profesor ya tiene una ausencia (${colision.tipo_ausencia}) registrada para ese periodo el día ${colision.fecha_fmt}.`,
      });
    }

    const { rows } = await db.query(
      `INSERT INTO ausencias_profesorado 
      (uid_profesor, fecha_inicio, fecha_fin, idperiodo_inicio, idperiodo_fin, tipo_ausencia, descripcion, creada_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        uid_profesor,
        fecha_inicio,
        fecha_fin || fecha_inicio,
        idperiodo_inicio || null,
        idperiodo_fin || null,
        tipo_ausencia || "otros",
        descripcion || null,
        creada_por || uid_profesor,
      ]
    );

    res.status(201).json({ ok: true, ausencia: rows[0] });
  } catch (err) {
    console.error("[insertAusencia] Error:", err);
    res.status(500).json({ ok: false, error: "Error guardando ausencia" });
  }
}

/**
 * Actualizar una ausencia (CON VALIDACIÓN)
 */
async function updateAusencia(req, res) {
  const { id } = req.params;
  const campos = req.body;

  try {
    // 1. Obtener datos actuales
    const { rows: actual } = await db.query(
      "SELECT * FROM ausencias_profesorado WHERE id = $1",
      [id]
    );
    if (actual.length === 0)
      return res.status(404).json({ ok: false, error: "No encontrada" });
    const reg = actual[0];

    // 2. Validación de colisión
    const colision = await verificarColision(
      reg.uid_profesor,
      campos.fecha_inicio || reg.fecha_inicio,
      campos.fecha_fin || reg.fecha_fin,
      campos.hasOwnProperty("idperiodo_inicio")
        ? campos.idperiodo_inicio
        : reg.idperiodo_inicio,
      campos.hasOwnProperty("idperiodo_fin")
        ? campos.idperiodo_fin
        : reg.idperiodo_fin,

      id
    );
    if (colision)
      return res.status(409).json({ ok: false, error: "Colisión detectada" });

    // --- INICIO DE TRANSACCIÓN ---
    await db.query("BEGIN");

    // 3. Update
    const sets = [];
    const vals = [];
    let i = 0;
    const allowed = [
      "fecha_inicio",
      "fecha_fin",
      "idperiodo_inicio",
      "idperiodo_fin",
      "tipo_ausencia",
      "descripcion",
    ];
    Object.keys(campos).forEach((key) => {
      if (allowed.includes(key)) {
        sets.push(`${key} = $${++i}`);
        vals.push(campos[key]);
      }
    });

    if (sets.length === 0) {
      await db.query("ROLLBACK");
      return res.status(400).json({ ok: false, error: "Nada que actualizar" });
    }

    vals.push(id);
    const { rows } = await db.query(
      `UPDATE ausencias_profesorado SET ${sets.join(", ")} WHERE id = $${++i} RETURNING *`,
      vals
    );
    const ausenciaActualizada = rows[0];

    // 4. Limpieza de guardias
    await db.query(
      `DELETE FROM guardias_asignadas 
       WHERE idausencia = $1 
       AND (
         fecha < $2 OR fecha > $3 
         OR ($4::int IS NOT NULL AND idperiodo < $4) 
         OR ($5::int IS NOT NULL AND idperiodo > $5)
       )`,
      [
        id,
        ausenciaActualizada.fecha_inicio,
        ausenciaActualizada.fecha_fin || "9999-12-31",
        ausenciaActualizada.idperiodo_inicio,
        ausenciaActualizada.idperiodo_fin,
      ]
    );

    await db.query("COMMIT");
    // --- FIN DE TRANSACCIÓN ---

    res.json({ ok: true, ausencia: ausenciaActualizada });
  } catch (err) {
    await db.query("ROLLBACK"); 
    console.error("[updateAusencia] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando" });
  }
}

/**
 * Eliminar
 */
async function deleteAusencia(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT idpermiso, idextraescolar FROM ausencias_profesorado WHERE id = $1`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ ok: false, error: "No encontrada" });

    if (rows[0].idpermiso !== null || rows[0].idextraescolar !== null) {
      return res.status(403).json({
        ok: false,
        error:
          "No se puede borrar una ausencia vinculada a un permiso oficial.",
      });
    }
    // Al borrar la ausencia, borramos primero sus guardias (o el ON DELETE CASCADE de la DB lo hará)
    await db.query("DELETE FROM guardias_asignadas WHERE idausencia = $1", [
      id,
    ]);
    await db.query(`DELETE FROM ausencias_profesorado WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error eliminando" });
  }
}

module.exports = {
  getAusenciasEnriquecidas,
  insertAusencia,
  updateAusencia,
  deleteAusencia,
};
