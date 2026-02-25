/**
 * ================================================================
 *  Controlador: notificacionesDirectivaController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Devuelve el número de permisos y actividades extraescolares
 *    pendientes (estado = 0) para la directiva.
 *
 * ================================================================
 */

const db = require("../../db");

async function getPendientesDirectiva(req, res) {
  try {
    const usuarioSesion = req.session?.user;

    if (!usuarioSesion) {
      return res
        .status(401)
        .json({ ok: false, error: "No autenticado" });
    }

    const esDirectiva = usuarioSesion.perfil === "directiva";

    if (!esDirectiva) {
      return res
        .status(403)
        .json({ ok: false, error: "No autorizado" });
    }

    // ⚡ Consultas en paralelo (ligeras y rápidas)
    const [permisosResult, extraResult] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM permisos WHERE estado = 0`),
      db.query(`SELECT COUNT(*) FROM extraescolares WHERE estado = 0`),
    ]);

    const permisos = Number(permisosResult.rows[0].count);
    const extraescolares = Number(extraResult.rows[0].count);

    return res.json({
      ok: true,
      permisos: { total: permisos },
      extraescolares: { total: extraescolares },
      total: permisos + extraescolares,
    });

  } catch (error) {
    console.error("[getPendientesDirectiva] Error:", error);
    return res.status(500).json({
      ok: false,
      error: "Error obteniendo notificaciones de directiva",
    });
  }
}

module.exports = {
  getPendientesDirectiva,
};