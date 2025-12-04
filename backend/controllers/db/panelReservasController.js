/**
 * ================================================================
 *  Controller: panelReservasController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Devuelve los datos del panel de reservas para un usuario,
 *    combinando distintos tipos de información:
 *      - Reservas de estancias (ya implementado)
 *      - Asuntos propios (pendiente)
 *      - Actividades extraescolares (pendiente)
 *
 * ================================================================
 */

const { getReservasFiltradas } = require("./reservasEstanciasController");

/**
 * Obtiene todas las reservas futuras del usuario autenticado.
 * Devuelve un objeto con:
 *  - reservasEstancias
 *  - asuntosPropios
 *  - actividadesExtraescolares
 */
async function getPanelReservas(req, res) {
  const ldapSession = req.session?.ldap;
  if (!ldapSession)
    return res.status(401).json({ ok: false, error: "No autenticado" });

  try {
    const uid = req.query?.uid || ldapSession.uid;
    if (!uid) {
      return res.status(400).json({ ok: false, error: "Falta el parámetro uid" });
    }

    // =============================================================
    // 1️⃣ Obtener reservas de estancias usando el controlador existente
    // =============================================================
    const reservasEstanciasData = await new Promise((resolve) => {
      // simulamos req y res para reutilizar getReservasFiltradas
      const fakeReq = {
        ...req,
        query: {
          ...req.query,
          uid,
          desde: new Date().toISOString().split("T")[0], // desde hoy
        },
      };
      const fakeRes = {
        json: (data) => resolve(data),
        status: (code) => ({ json: (data) => resolve(data) }),
      };
      getReservasFiltradas(fakeReq, fakeRes);
    });

    const reservasEstancias =
      reservasEstanciasData?.reservas?.length > 0
        ? reservasEstanciasData.reservas
        : [];

    // =============================================================
    // 2️⃣ Asuntos propios (pendiente de implementación)
    // =============================================================
    // const { rows: asuntosPropios } = await pool.query(
    //   `SELECT * FROM permisos WHERE uid = $1 AND fecha >= CURRENT_DATE ORDER BY fecha ASC`,
    //   [uid]
    // );
    const asuntosPropios = []; // Por ahora vacío

    // =============================================================
    // 3️⃣ Actividades extraescolares (pendiente de implementación)
    // =============================================================
    // const { rows: actividadesExtraescolares } = await pool.query(
    //   `SELECT * FROM actividades_extraescolares WHERE uid_responsable = $1 AND fecha >= CURRENT_DATE ORDER BY fecha ASC`,
    //   [uid]
    // );
    const actividadesExtraescolares = []; // Por ahora vacío

    // =============================================================
    // 4️⃣ Devolver todo junto
    // =============================================================
    return res.json({
      ok: true,
      reservasEstancias,
      asuntosPropios,
      actividadesExtraescolares,
    });
  } catch (err) {
    console.error("[getPanelReservas] Error:", err);
    res.status(500).json({ ok: false, error: "Error al obtener panel de reservas" });
  }
}

module.exports = { getPanelReservas };
