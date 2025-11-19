/**
 * ================================================================
 *  Controller: extraescolaresController.js
 * ================================================================
 */

const db = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");

/**
 * Obtener actividades extraescolares enriquecidas
 * ================================================================
 */
async function getExtraescolaresEnriquecidos(req, res) {
  try {
    const ldapSession = req.session?.ldap;

    if (!ldapSession)
      return res.status(401).json({ ok: false, error: "No autenticado en LDAP" });

    const { estado, tipo, uid } = req.query;

    const filtros = [];
    const vals = [];
    let i = 0;

    if (uid) {
      filtros.push(`e.uid = $${++i}`);
      vals.push(uid);
    }
    if (tipo) {
      filtros.push(`e.tipo ILIKE $${++i}`);
      vals.push(`%${tipo}%`);
    }
    if (typeof estado !== "undefined") {
      filtros.push(`e.estado = $${++i}`);
      vals.push(Number(estado));
    }

    const where = filtros.length ? "WHERE " + filtros.join(" AND ") : "";

    const { rows } = await db.query(
      `SELECT 
        e.id, e.uid, e.gidnumber, e.cursos_gids, e.tipo,
        e.titulo, e.descripcion,
        e.fecha_inicio, e.fecha_fin,
        e.idperiodo_inicio, e.idperiodo_fin,
        e.estado
      FROM extraescolares e
      ${where}
      ORDER BY e.fecha_inicio ASC`,
      vals
    );

    const enriquecidos = [];

    for (const item of rows) {
      const nombreProfesor = await new Promise((resolve) => {
        buscarPorUid(ldapSession, item.uid, (err, datos) => {
          if (!err && datos) {
            resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
          } else {
            resolve("Profesor desconocido");
          }
        });
      });

      enriquecidos.push({ ...item, nombreProfesor });
    }

    res.json({ ok: true, extraescolares: enriquecidos });
  } catch (err) {
    console.error("[getExtraescolaresEnriquecidos] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo actividades" });
  }
}

/**
 * Actualizar estado (aceptar / rechazar)
 * ================================================================
 */
async function updateEstadoExtraescolar(req, res) {
  try {
    const id = req.params.id;
    const { estado } = req.body;

    const { rows } = await db.query(
      `UPDATE extraescolares
       SET estado = $1
       WHERE id = $2
       RETURNING *`,
      [estado, id]
    );

    if (!rows[0])
      return res.status(404).json({ ok: false, error: "No encontrado" });

    res.json({ ok: true, actividad: rows[0] });
  } catch (err) {
    console.error("[updateEstadoExtraescolar] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando estado" });
  }
}

/**
 * CRUD opcional: insertar / borrar / actualizar
 * ================================================================
 */
async function insertExtraescolar(req, res) {
  try {
    const {
      uid, gidnumber, cursos_gids,
      tipo, titulo, descripcion,
      fecha_inicio, fecha_fin,
      idperiodo_inicio, idperiodo_fin,
    } = req.body;

    const { rows } = await db.query(
      `INSERT INTO extraescolares (
        uid, gidnumber, cursos_gids, tipo, titulo, descripcion,
        fecha_inicio, fecha_fin, idperiodo_inicio, idperiodo_fin
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        uid, gidnumber, cursos_gids, tipo, titulo, descripcion,
        fecha_inicio, fecha_fin, idperiodo_inicio, idperiodo_fin,
      ]
    );

    res.status(201).json({ ok: true, actividad: rows[0] });
  } catch (err) {
    console.error("[insertExtraescolar] Error:", err);
    res.status(500).json({ ok: false, error: "Error insertando actividad" });
  }
}

async function deleteExtraescolar(req, res) {
  try {
    const id = req.params.id;

    const { rowCount } = await db.query(
      `DELETE FROM extraescolares WHERE id = $1`,
      [id]
    );

    if (rowCount === 0)
      return res.status(404).json({ ok: false, error: "No encontrado" });

    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteExtraescolar] Error:", err);
    res.status(500).json({ ok: false, error: "Error eliminando actividad" });
  }
}

module.exports = {
  getExtraescolaresEnriquecidos,
  updateEstadoExtraescolar,
  insertExtraescolar,
  deleteExtraescolar,
};
