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
 * Obtener ausencias enriquecidas (Versión corregida manteniendo lógica original)
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

    // 1. Consulta SQL original (sin joins que rompan los periodos)
    const { rows: ausencias } = await db.query(
      `SELECT a.id, a.uid_profesor, 
        TO_CHAR(a.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
        TO_CHAR(a.fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
        a.idperiodo_inicio, a.idperiodo_fin, a.tipo_ausencia,
        a.descripcion, a.creada_en, a.creada_por, a.idpermiso, a.idextraescolar, a.observaciones_guardia,
        e.dni -- <--- Capturamos el DNI de la tabla empleados
      FROM ausencias_profesorado a
      LEFT JOIN empleados e ON a.uid_profesor = e.uid
      ${where}
      ORDER BY a.fecha_inicio DESC`,
      vals
    );

    // 2. Enriquecimiento LDAP (Original)
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

    // 3. Enriquecimiento de Periodos (Original)
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

    // --- NUEVO: Enriquecimiento de Permisos (Siguiendo tu lógica) ---
    const permisosIds = [
      ...new Set(ausencias.map((a) => a.idpermiso).filter(Boolean)),
    ];
    let permisosMap = {};
    if (permisosIds.length > 0) {
      const { rows: permisos } = await db.query(
        `SELECT * FROM permisos WHERE id = ANY($1)`,
        [permisosIds]
      );
      permisosMap = permisos.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});
    }

    // --- NUEVO: Enriquecimiento de Extraescolares (Siguiendo tu lógica) ---
    const extraIds = [
      ...new Set(ausencias.map((a) => a.idextraescolar).filter(Boolean)),
    ];
    let extraMap = {};
    if (extraIds.length > 0) {
      const { rows: extras } = await db.query(
        `SELECT * FROM extraescolares WHERE id = ANY($1)`,
        [extraIds]
      );
      extraMap = extras.reduce((acc, e) => {
        acc[e.id] = e;
        return acc;
      }, {});
    }

    // 4. Mapeo Final (Respetando estructura original y añadiendo los nuevos)
    const ausenciasEnriquecidas = ausencias.map((a) => ({
      ...a,
      nombreProfesor: nombreMap[a.uid_profesor] || "Desconocido",
      nombreCreador: nombreMap[a.creada_por] || a.creada_por,
      periodo_inicio: a.idperiodo_inicio
        ? periodosMap[a.idperiodo_inicio]
        : null,
      periodo_fin: a.idperiodo_fin ? periodosMap[a.idperiodo_fin] : null,
      permiso: a.idpermiso ? permisosMap[a.idpermiso] : null,
      extraescolar: a.idextraescolar ? extraMap[a.idextraescolar] : null,
      dni: a.dni || "---", 
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

async function updateAusencia(req, res) {
  const { id } = req.params;
  const campos = req.body;
  const usuarioSesion = req.session?.user;

  try {
    // 1. Obtener datos actuales
    const { rows: actual } = await db.query(
      "SELECT * FROM ausencias_profesorado WHERE id = $1",
      [id]
    );
    if (actual.length === 0)
      return res.status(404).json({ ok: false, error: "No encontrada" });
    const reg = actual[0];

    const esDirectiva = usuarioSesion?.perfil === "directiva";
    const esPropietario = reg.uid_profesor === usuarioSesion?.username;

    // 2. Control de Permisos
    if (!esDirectiva && !esPropietario) {
      return res.status(403).json({
        ok: false,
        error: "No tienes permiso para modificar esta ausencia",
      });
    }

    // Definimos qué campos puede tocar cada uno
    const allowedAdmin = [
      "fecha_inicio",
      "fecha_fin",
      "idperiodo_inicio",
      "idperiodo_fin",
      "tipo_ausencia",
      "descripcion",
    ];
    const allowedProfe = ["observaciones_guardia"]; // El nuevo campo para las instrucciones

    // Si un profe intenta cambiar campos de admin, lo filtramos o rechazamos
    const camposAActualizar = Object.keys(campos).filter((key) =>
      esDirectiva
        ? [...allowedAdmin, ...allowedProfe].includes(key)
        : allowedProfe.includes(key)
    );

    if (camposAActualizar.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "No se han enviado campos válidos para actualizar",
      });
    }

    // 3. Validación de colisión (SOLO si se cambian fechas o periodos)
    const cambiaHorario = [
      "fecha_inicio",
      "fecha_fin",
      "idperiodo_inicio",
      "idperiodo_fin",
    ].some((k) => campos.hasOwnProperty(k));

    if (esDirectiva && cambiaHorario) {
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
    }

    // --- INICIO DE TRANSACCIÓN ---
    await db.query("BEGIN");

    const sets = [];
    const vals = [];
    let i = 0;

    camposAActualizar.forEach((key) => {
      sets.push(`${key} = $${++i}`);
      vals.push(campos[key]);
    });

    vals.push(id);
    const { rows } = await db.query(
      `UPDATE ausencias_profesorado SET ${sets.join(", ")} WHERE id = $${++i} RETURNING *`,
      vals
    );
    const ausenciaActualizada = rows[0];

    // 4. Limpieza de guardias (SOLO si se ha cambiado el horario y somos admin)
    if (esDirectiva && cambiaHorario) {
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
    }

    await db.query("COMMIT");
    res.json({ ok: true, ausencia: ausenciaActualizada });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("[updateAusencia] Error:", err);
    res.status(500).json({ ok: false, error: "Error interno" });
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
