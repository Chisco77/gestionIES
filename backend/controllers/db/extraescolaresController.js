/**
 * ================================================================
 *  Controller: extraescolaresController.js
 * ================================================================
 */

const db = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");
const mailer = require("../../mailer");

/**
 * Obtener actividades extraescolares enriquecidas
 * ================================================================
 */
async function getExtraescolaresEnriquecidos(req, res) {
  try {
    const ldapSession = req.session?.ldap;

    if (!ldapSession)
      return res
        .status(401)
        .json({ ok: false, error: "No autenticado en LDAP" });

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
        e.estado, e.responsables_uids,
        e.ubicacion, e.coords
      FROM extraescolares e
      ${where}
      ORDER BY e.fecha_inicio ASC`,
      vals
    );

    const enriquecidos = [];

    for (const item of rows) {
      // Nombre del profesor que creó la actividad
      const nombreProfesor = await new Promise((resolve) => {
        buscarPorUid(ldapSession, item.uid, (err, datos) => {
          if (!err && datos) {
            resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
          } else {
            resolve("Profesor desconocido");
          }
        });
      });

      // Nombres de los responsables
      const responsables = [];
      if (Array.isArray(item.responsables_uids)) {
        for (const uidResp of item.responsables_uids) {
          const nombre = await new Promise((resolve) => {
            buscarPorUid(ldapSession, uidResp, (err, datos) => {
              if (!err && datos) {
                resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
              } else {
                resolve("Profesor desconocido");
              }
            });
          });
          responsables.push({ uid: uidResp, nombre });
        }
      }

      enriquecidos.push({ ...item, nombreProfesor, responsables });
    }

    res.json({ ok: true, extraescolares: enriquecidos });
  } catch (err) {
    console.error("[getExtraescolaresEnriquecidos] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo actividades" });
  }
}

/**
 * ================================================================
 *  ACTUALIZAR ESTADO (ACEPTAR / RECHAZAR)
 * ================================================================
 */
async function updateEstadoExtraescolar(req, res) {
  try {
    const id = req.params.id;
    const { estado } = req.body; // 1 = Aceptado, 2 = Rechazado

    if (![1, 2].includes(estado))
      return res.status(400).json({ ok: false, error: "Estado inválido" });

    const { rows } = await db.query(
      `
      UPDATE extraescolares
      SET estado = $1
      WHERE id = $2
      RETURNING *
    `,
      [estado, id]
    );

    if (!rows[0])
      return res.status(404).json({ ok: false, error: "No encontrado" });

    const actividad = rows[0];

    // 👉 Respuesta inmediata al frontend
    res.json({ ok: true, actividad });

    // ============================================================
    //  ENVÍO DEL EMAIL ASÍNCRONO
    // ============================================================
    setImmediate(async () => {
      try {
        // Emails de avisos para este módulo
        const { rows: avisos } = await db.query(
          `SELECT emails FROM avisos WHERE modulo = 'extraescolares' LIMIT 1`
        );
        const emailsRaw = avisos[0]?.emails || [];
        const emails = emailsRaw.map((e) => e.trim()).filter(Boolean);
        if (!emails.length) return;

        // Datos del profesor creador
        const ldapSession = req.session?.ldap;
        const datosUsuario = await new Promise((resolve) => {
          buscarPorUid(ldapSession, actividad.uid, (err, datos) =>
            resolve(
              !err && datos ? datos : { givenName: "Desconocido", sn: "" }
            )
          );
        });

        const nombreProfesor =
          `${datosUsuario.givenName} ${datosUsuario.sn}`.trim();

        const fechaInicioFmt = new Date(
          actividad.fecha_inicio
        ).toLocaleDateString("es-ES");
        const estadoTxt = estado === 1 ? "Aceptada" : "Rechazada";
        const subjectPrefix =
          estado === 1 ? "[EXTRAESCOLAR ACEPTADA]" : "[EXTRAESCOLAR RECHAZADA]";

        await mailer.sendMail({
          from: `"Comunicaciones" <comunicaciones@iesfcodeorellana.es>`,
          to: emails.join(", "),
          subject: `${subjectPrefix} ${actividad.titulo} (${fechaInicioFmt})`,
          html: `
            <p><b>Actividad:</b> ${actividad.titulo}</p>
            <p><b>Profesor responsable:</b> ${nombreProfesor}</p>
            <p><b>Fecha de inicio:</b> ${fechaInicioFmt}</p>
            <p><b>Estado:</b> ${estadoTxt}</p>
            <p><b>Descripción:</b> ${actividad.descripcion}</p>
          `,
        });

        console.log(
          `[updateEstadoExtraescolar] Email enviado a: ${emails.join(", ")}`
        );
      } catch (errMail) {
        console.error(
          "[updateEstadoExtraescolar] Error enviando email:",
          errMail
        );
      }
    });
  } catch (err) {
    console.error("[updateEstadoExtraescolar] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando estado" });
  }
}

/**
 * Insertar nueva actividad extraescolar
 * ================================================================
 */
async function insertExtraescolar(req, res) {
  try {
    const {
      uid,
      gidnumber,
      cursos_gids,
      tipo,
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      idperiodo_inicio,
      idperiodo_fin,
      responsables_uids = [],
      ubicacion,
      coords,
    } = req.body;

    const { rows } = await db.query(
      `INSERT INTO extraescolares (
        uid, gidnumber, cursos_gids, tipo, titulo, descripcion,
        fecha_inicio, fecha_fin, idperiodo_inicio, idperiodo_fin,
        responsables_uids, ubicacion, coords
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        uid,
        gidnumber,
        cursos_gids,
        tipo,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        idperiodo_inicio,
        idperiodo_fin,
        responsables_uids,
        ubicacion,
        coords,
      ]
    );

    const actividad = rows[0];

    // 👉 Respuesta inmediata
    res.status(201).json({ ok: true, actividad });

    // ============================================================
    //  ENVÍO EMAIL ASÍNCRONO (Nueva actividad)
    // ============================================================
    setImmediate(async () => {
      try {
        const { rows: avisos } = await db.query(
          `SELECT emails FROM avisos WHERE modulo = 'extraescolares' LIMIT 1`
        );
        const emailsRaw = avisos[0]?.emails || [];
        const emails = emailsRaw.map((e) => e.trim()).filter(Boolean);
        if (!emails.length) return;

        const ldapSession = req.session?.ldap;

        const datosUsuario = await new Promise((resolve) => {
          buscarPorUid(ldapSession, uid, (err, datos) =>
            resolve(
              !err && datos ? datos : { givenName: "Desconocido", sn: "" }
            )
          );
        });

        const nombreProfesor =
          `${datosUsuario.givenName} ${datosUsuario.sn}`.trim();

        const fechaInicioFmt = actividad.fecha_inicio
          ? new Date(actividad.fecha_inicio).toLocaleDateString("es-ES")
          : "-";

        const fechaFinFmt = actividad.fecha_fin
          ? new Date(actividad.fecha_fin).toLocaleDateString("es-ES")
          : "-";

        // ============================
        //  CONTENIDO VARIABLE DEL EMAIL
        // ============================
        let extraCamposHTML = "";

        if (actividad.tipo === "complementaria") {
          extraCamposHTML = `
        <p><b>Periodo de inicio:</b> ${actividad.idperiodo_inicio || "-"}</p>
        <p><b>Periodo de fin:</b> ${actividad.idperiodo_fin || "-"}</p>
      `;
        }

        // ============================
        //  ENVÍO DEL EMAIL FINAL
        // ============================
        await mailer.sendMail({
          from: `"Comunicaciones" <comunicaciones@iesfcodeorellana.es>`,
          to: emails.join(", "),
          subject: `[EXTRAESCOLARES - Solicitud] ${actividad.titulo} (${fechaInicioFmt})`,
          html: `
        <p><b>Nueva actividad ${actividad.tipo} creada</b></p>
        <p><b>Título:</b> ${actividad.titulo}</p>
        <p><b>Profesor responsable:</b> ${nombreProfesor}</p>
        <p><b>Fecha de inicio:</b> ${fechaInicioFmt}</p>
        <p><b>Fecha de fin:</b> ${fechaFinFmt}</p>        
        <p><b>Descripción:</b> ${actividad.descripcion}</p>
        <p><b>Ubicación:</b> ${actividad.ubicacion || "-"}</p>
        ${extraCamposHTML}
      `,
        });

        console.log(
          `[insertExtraescolar] Email enviado a: ${emails.join(", ")}`
        );
      } catch (errMail) {
        console.error("[insertExtraescolar] Error enviando email:", errMail);
      }
    });
  } catch (err) {
    console.error("[insertExtraescolar] Error:", err);
    res.status(500).json({ ok: false, error: "Error insertando actividad" });
  }
}

/**
 * Borrar actividad extraescolar
 * ================================================================
 */
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

/**
 * Actualizar actividad extraescolar
 * ================================================================
 */
async function updateExtraescolar(req, res) {
  try {
    const id = req.params.id;
    const {
      uid,
      gidnumber,
      cursos_gids,
      tipo,
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      idperiodo_inicio,
      idperiodo_fin,
      responsables_uids = [],
      estado,
      ubicacion,
      coords,
    } = req.body;

    const { rows } = await db.query(
      `UPDATE extraescolares
       SET 
         uid = $1,
         gidnumber = $2,
         cursos_gids = $3,
         tipo = $4,
         titulo = $5,
         descripcion = $6,
         fecha_inicio = $7,
         fecha_fin = $8,
         idperiodo_inicio = $9,
         idperiodo_fin = $10,
         responsables_uids = $11,
         estado = $12,
         ubicacion = $13,
         coords = $14
       WHERE id = $15
       RETURNING *`,
      [
        uid,
        gidnumber,
        cursos_gids,
        tipo,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        idperiodo_inicio,
        idperiodo_fin,
        responsables_uids,
        estado,
        ubicacion,
        coords,
        id,
      ]
    );

    if (!rows[0])
      return res.status(404).json({ ok: false, error: "No encontrado" });

    res.json({ ok: true, actividad: rows[0] });
  } catch (err) {
    console.error("[updateExtraescolar] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando actividad" });
  }
}

module.exports = {
  getExtraescolaresEnriquecidos,
  updateEstadoExtraescolar,
  insertExtraescolar,
  deleteExtraescolar,
  updateExtraescolar,
};
