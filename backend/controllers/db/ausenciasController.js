/**
 * ================================================================
 * Controller: ausenciasController.js
 * Proyecto: gestionIES
 * ================================================================
 */

const db = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");

/**
 * Obtener ausencias con filtros y datos enriquecidos (Profesor, Creador, Periodos)
 */
async function getAusenciasEnriquecidas(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) {
      return res.status(401).json({ ok: false, error: "No autenticado en LDAP" });
    }

    const { uid_profesor, fecha_inicio, tipo_ausencia } = req.query;
    const filtros = [];
    const vals = [];
    let i = 0;

    if (uid_profesor) filtros.push(`a.uid_profesor = $${++i}`) && vals.push(uid_profesor);
    if (fecha_inicio) filtros.push(`a.fecha_inicio = $${++i}`) && vals.push(fecha_inicio);
    if (tipo_ausencia) filtros.push(`a.tipo_ausencia = $${++i}`) && vals.push(tipo_ausencia);

    const where = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";

    // 1️⃣ Consultar ausencias
    const { rows: ausencias } = await db.query(
      `SELECT 
        a.id, 
        a.uid_profesor, 
        TO_CHAR(a.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
        TO_CHAR(a.fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
        a.idperiodo_inicio,
        a.idperiodo_fin,
        a.tipo_ausencia,
        a.creada_en,
        a.creada_por,
        a.idpermiso
      FROM ausencias_profesorado a
      ${where}
      ORDER BY a.fecha_inicio DESC`,
      vals
    );

    // 2️⃣ Identificar UIDs únicos (profesores y creadores) para buscar en LDAP
    const uidsUnicos = [...new Set([
      ...ausencias.map(a => a.uid_profesor),
      ...ausencias.map(a => a.creada_por)
    ])].filter(Boolean);

    // 3️⃣ Resolver nombres en LDAP (Caché local para la petición)
    const nombreMap = {};
    for (const uid of uidsUnicos) {
      if (!nombreMap[uid]) {
        nombreMap[uid] = await new Promise((resolve) => {
          buscarPorUid(ldapSession, uid, (err, datos) => {
            if (!err && datos)
              resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
            else resolve(uid); // Fallback al UID si no se encuentra
          });
        });
      }
    }

    // 4️⃣ Obtener Periodos Horarios involucrados
    const periodosIds = [...new Set(
      ausencias.flatMap(a => [a.idperiodo_inicio, a.idperiodo_fin]).filter(Boolean)
    )];

    let periodosMap = {};
    if (periodosIds.length > 0) {
      const { rows: periodos } = await db.query(
        `SELECT id, nombre, inicio, fin FROM periodos_horarios WHERE id = ANY($1)`,
        [periodosIds]
      );
      periodosMap = periodos.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});
    }

    // 5️⃣ Construir respuesta final enriquecida
    const ausenciasEnriquecidas = ausencias.map(ausencia => ({
      ...ausencia,
      nombreProfesor: nombreMap[ausencia.uid_profesor] || "Desconocido",
      nombreCreador: nombreMap[ausencia.creada_por] || ausencia.creada_por,
      periodo_inicio: ausencia.idperiodo_inicio ? periodosMap[ausencia.idperiodo_inicio] : null,
      periodo_fin: ausencia.idperiodo_fin ? periodosMap[ausencia.idperiodo_fin] : null,
    }));

    res.json({ ok: true, ausencias: ausenciasEnriquecidas });
  } catch (err) {
    console.error("[getAusenciasEnriquecidas] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo ausencias" });
  }
}

/**
 * Insertar una ausencia manualmente (sin pasar por permisos)
 */
async function insertAusencia(req, res) {
  const { 
    uid_profesor, 
    fecha_inicio, 
    fecha_fin, 
    idperiodo_inicio, 
    idperiodo_fin, 
    tipo_ausencia, 
    creada_por 
  } = req.body;

  if (!uid_profesor || !fecha_inicio) {
    return res.status(400).json({ ok: false, error: "UID y fecha_inicio son obligatorios" });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO ausencias_profesorado 
      (uid_profesor, fecha_inicio, fecha_fin, idperiodo_inicio, idperiodo_fin, tipo_ausencia, creada_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        uid_profesor,
        fecha_inicio,
        fecha_fin || fecha_inicio,
        idperiodo_inicio,
        idperiodo_fin,
        tipo_ausencia || 'otros',
        creada_por || uid_profesor
      ]
    );

    res.status(201).json({ ok: true, ausencia: rows[0] });
  } catch (err) {
    console.error("[insertAusencia] Error:", err);
    res.status(500).json({ ok: false, error: "Error guardando ausencia" });
  }
}

/**
 * Actualizar una ausencia
 */
async function updateAusencia(req, res) {
  const { id } = req.params;
  const campos = req.body;

  const sets = [];
  const vals = [];
  let i = 0;

  Object.keys(campos).forEach(key => {
    if (['fecha_inicio', 'fecha_fin', 'idperiodo_inicio', 'idperiodo_fin', 'tipo_ausencia'].includes(key)) {
      sets.push(`${key} = $${++i}`);
      vals.push(campos[key]);
    }
  });

  if (sets.length === 0) return res.status(400).json({ ok: false, error: "Nada que actualizar" });

  try {
    vals.push(id);
    const { rows } = await db.query(
      `UPDATE ausencias_profesorado SET ${sets.join(", ")} WHERE id = $${++i} RETURNING *`,
      vals
    );

    if (rows.length === 0) return res.status(404).json({ ok: false, error: "Ausencia no encontrada" });

    res.json({ ok: true, ausencia: rows[0] });
  } catch (err) {
    console.error("[updateAusencia] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando ausencia" });
  }
}

/**
 * Eliminar una ausencia
 */
async function deleteAusencia(req, res) {
  const { id } = req.params;
  try {
    // Importante: Si la ausencia viene de un permiso, quizás quieras avisar o controlar 
    // que el estado del permiso también cambie, pero siguiendo tu lógica, 
    // aquí simplemente borramos el registro de la tabla.
    const { rowCount } = await db.query(`DELETE FROM ausencias_profesorado WHERE id = $1`, [id]);
    
    if (!rowCount) return res.status(404).json({ ok: false, error: "Ausencia no encontrada" });

    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteAusencia] Error:", err);
    res.status(500).json({ ok: false, error: "Error eliminando ausencia" });
  }
}

module.exports = {
  getAusenciasEnriquecidas,
  insertAusencia,
  updateAusencia,
  deleteAusencia
};