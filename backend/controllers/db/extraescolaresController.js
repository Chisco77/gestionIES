/**
 * ================================================================
 *  Controller: extraescolaresController.js
 * ================================================================
 */

const db = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");
const mailer = require("../../mailer");

const { obtenerGruposPorTipo } = require("../ldap/gruposController");

/**
 * Obtener actividades extraescolares enriquecidas
 * ================================================================
 */
/*async function getExtraescolaresEnriquecidos(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession)
      return res
        .status(401)
        .json({ ok: false, error: "No autenticado en LDAP" });

    // ========================================
    // Cache por request (usuarios LDAP)
    // ========================================
    const usuariosCache = {};

    const getNombrePorUid = (uid) =>
      new Promise((resolve) => {
        if (!uid) return resolve("Usuario desconocido");

        if (usuariosCache[uid]) return resolve(usuariosCache[uid]);

        buscarPorUid(ldapSession, uid, (err, datos) => {
          const nombre =
            !err && datos
              ? `${datos.sn || ""}, ${datos.givenName || ""}`.trim()
              : "Profesor desconocido";

          usuariosCache[uid] = nombre;
          resolve(nombre);
        });
      });

    // ========================================
    // Cargar departamentos y cursos desde LDAP
    // ========================================
    const [departamentos, cursos] = await Promise.all([
      obtenerGruposPorTipo(ldapSession, "school_department"),
      obtenerGruposPorTipo(ldapSession, "school_class"),
    ]);

    const departamentosMap = Object.fromEntries(
      departamentos.map((d) => [String(d.gidNumber), d.cn])
    );

    const cursosMap = Object.fromEntries(
      cursos.map((c) => [String(c.gidNumber), c.cn])
    );

    // ========================================
    // Filtros
    // ========================================
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

    // ========================================
    // Consulta BD con JOIN a periodos
    // ========================================
    const { rows } = await db.query(
      `SELECT 
        e.id, e.uid, e.gidnumber, e.cursos_gids, e.tipo,
        e.titulo, e.descripcion,
        e.fecha_inicio, e.fecha_fin,
        e.idperiodo_inicio, e.idperiodo_fin,
        e.estado, e.responsables_uids,
        e.ubicacion, e.coords,

        p_ini.nombre AS periodo_inicio_nombre,
        p_fin.nombre AS periodo_fin_nombre

      FROM extraescolares e

      LEFT JOIN periodos_horarios p_ini
        ON e.idperiodo_inicio = p_ini.id

      LEFT JOIN periodos_horarios p_fin
        ON e.idperiodo_fin = p_fin.id

      ${where}
      ORDER BY e.fecha_inicio ASC`,
      vals
    );

    // ========================================
    // 1️⃣ Obtener TODOS los UID únicos
    // ========================================
    const uidsUnicos = new Set();
    for (const item of rows) {
      if (item.uid) uidsUnicos.add(item.uid);
      if (Array.isArray(item.responsables_uids)) {
        item.responsables_uids.forEach((u) => u && uidsUnicos.add(u));
      }
    }

    // ========================================
    // 2️⃣ Resolver nombres LDAP en paralelo
    // ========================================
    await Promise.all(
      Array.from(uidsUnicos).map((uid) => getNombrePorUid(uid))
    );

    // ========================================
    // 3️⃣ Obtener info adicional de empleados en PostgreSQL
    // ========================================
    const { rows: empleadosInfo } = await db.query(
      `SELECT uid, dni, tipo_empleado, cuerpo, grupo
       FROM empleados
       WHERE uid = ANY($1::text[])`,
      [Array.from(uidsUnicos)]
    );

    const empleadosMap = Object.fromEntries(
      empleadosInfo.map((e) => [e.uid, e])
    );

    // ========================================
    // 4️⃣ Enriquecimiento final
    // ========================================
    const enriquecidos = rows.map((item) => {
      const departamento = item.gidnumber
        ? {
            gidNumber: item.gidnumber,
            nombre:
              departamentosMap[String(item.gidnumber)] ||
              "Departamento desconocido",
          }
        : null;

      const cursosActividad = Array.isArray(item.cursos_gids)
        ? item.cursos_gids.map((gid) => ({
            gidNumber: gid,
            nombre: cursosMap[String(gid)] || "Curso desconocido",
          }))
        : [];

      const responsables = Array.isArray(item.responsables_uids)
        ? item.responsables_uids.map((uidResp) => ({
            uid: uidResp,
            nombre: usuariosCache[uidResp] || "Profesor desconocido",
            ...(empleadosMap[uidResp] || {}), // <-- añadimos dni, tipo_empleado, cuerpo, grupo
          }))
        : [];

      return {
        ...item,
        nombreProfesor: usuariosCache[item.uid] || "Profesor desconocido",
        responsables,
        departamento,
        cursos: cursosActividad,
        periodo_inicio: item.idperiodo_inicio
          ? {
              id: item.idperiodo_inicio,
              nombre: item.periodo_inicio_nombre || "Periodo desconocido",
            }
          : null,
        periodo_fin: item.idperiodo_fin
          ? {
              id: item.idperiodo_fin,
              nombre: item.periodo_fin_nombre || "Periodo desconocido",
            }
          : null,
      };
    });

    res.json({ ok: true, extraescolares: enriquecidos });
  } catch (err) {
    console.error("[getExtraescolaresEnriquecidos] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo actividades" });
  }
}*/

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

    // ========================================
    // Cache por request (usuarios LDAP)
    // ========================================
    const usuariosCache = {};

    const getNombrePorUid = (uid) =>
      new Promise((resolve) => {
        if (!uid) return resolve("Usuario desconocido");

        if (usuariosCache[uid]) return resolve(usuariosCache[uid]);

        buscarPorUid(ldapSession, uid, (err, datos) => {
          const nombre =
            !err && datos
              ? `${datos.sn || ""}, ${datos.givenName || ""}`.trim()
              : "Profesor desconocido";

          usuariosCache[uid] = nombre;
          resolve(nombre);
        });
      });

    // ========================================
    // Cargar departamentos y cursos desde LDAP
    // ========================================
    const [departamentos, cursos] = await Promise.all([
      obtenerGruposPorTipo(ldapSession, "school_department"),
      obtenerGruposPorTipo(ldapSession, "school_class"),
    ]);

    const departamentosMap = Object.fromEntries(
      departamentos.map((d) => [String(d.gidNumber), d.cn]),
    );

    const cursosMap = Object.fromEntries(
      cursos.map((c) => [String(c.gidNumber), c.cn]),
    );

    // ========================================
    // Filtros
    // ========================================
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

    // ========================================
    // Consulta BD con JOIN a periodos
    // ========================================
    const { rows } = await db.query(
      `SELECT 
        e.id,
        e.uid,
        e.updated_by,
        e.gidnumber,
        e.cursos_gids,
        e.tipo,
        e.titulo,
        e.descripcion,
        e.fecha_inicio,
        e.fecha_fin,
        e.idperiodo_inicio,
        e.idperiodo_fin,
        e.estado,
        e.responsables_uids,
        e.ubicacion,
        e.coords,
        e.updated_at,

        p_ini.nombre AS periodo_inicio_nombre,
        p_fin.nombre AS periodo_fin_nombre

      FROM extraescolares e

      LEFT JOIN periodos_horarios p_ini
        ON e.idperiodo_inicio = p_ini.id

      LEFT JOIN periodos_horarios p_fin
        ON e.idperiodo_fin = p_fin.id

      ${where}
      ORDER BY e.fecha_inicio ASC`,
      vals,
    );

    // ========================================
    // 1️⃣ Obtener TODOS los UID únicos
    // ========================================
    const uidsUnicos = new Set();

    for (const item of rows) {
      if (item.uid) uidsUnicos.add(item.uid);
      if (item.updated_by) uidsUnicos.add(item.updated_by);

      if (Array.isArray(item.responsables_uids)) {
        item.responsables_uids.forEach((u) => u && uidsUnicos.add(u));
      }
    }

    // ========================================
    // 2️⃣ Resolver nombres LDAP en paralelo
    // ========================================
    await Promise.all(
      Array.from(uidsUnicos).map((uid) => getNombrePorUid(uid)),
    );

    // ========================================
    // 3️⃣ Obtener info adicional de empleados en PostgreSQL
    // ========================================
    const { rows: empleadosInfo } = await db.query(
      `SELECT uid, dni, tipo_empleado, cuerpo, grupo
       FROM empleados
       WHERE uid = ANY($1::text[])`,
      [Array.from(uidsUnicos)],
    );

    const empleadosMap = Object.fromEntries(
      empleadosInfo.map((e) => [e.uid, e]),
    );

    // ========================================
    // 4️⃣ Enriquecimiento final
    // ========================================
    const enriquecidos = rows.map((item) => {
      const departamento = item.gidnumber
        ? {
            gidNumber: item.gidnumber,
            nombre:
              departamentosMap[String(item.gidnumber)] ||
              "Departamento desconocido",
          }
        : null;

      const cursosActividad = Array.isArray(item.cursos_gids)
        ? item.cursos_gids.map((gid) => ({
            gidNumber: gid,
            nombre: cursosMap[String(gid)] || "Curso desconocido",
          }))
        : [];

      const responsables = Array.isArray(item.responsables_uids)
        ? item.responsables_uids.map((uidResp) => ({
            uid: uidResp,
            nombre: usuariosCache[uidResp] || "Profesor desconocido",
            ...(empleadosMap[uidResp] || {}),
          }))
        : [];

      return {
        ...item,

        // Creador
        nombreProfesor: usuariosCache[item.uid] || "Profesor desconocido",

        // Última actualización
        actualizadaPor: item.updated_by
          ? usuariosCache[item.updated_by] || "Profesor desconocido"
          : null,

        responsables,
        departamento,
        cursos: cursosActividad,

        periodo_inicio: item.idperiodo_inicio
          ? {
              id: item.idperiodo_inicio,
              nombre: item.periodo_inicio_nombre || "Periodo desconocido",
            }
          : null,

        periodo_fin: item.idperiodo_fin
          ? {
              id: item.idperiodo_fin,
              nombre: item.periodo_fin_nombre || "Periodo desconocido",
            }
          : null,
      };
    });

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
      [estado, id],
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
          `SELECT emails FROM avisos WHERE modulo = 'extraescolares' LIMIT 1`,
        );
        const emailsRaw = avisos[0]?.emails || [];
        const emails = emailsRaw.map((e) => e.trim()).filter(Boolean);
        if (!emails.length) return;

        // Datos del profesor creador
        const ldapSession = req.session?.ldap;
        const datosUsuario = await new Promise((resolve) => {
          buscarPorUid(ldapSession, actividad.uid, (err, datos) =>
            resolve(
              !err && datos ? datos : { givenName: "Desconocido", sn: "" },
            ),
          );
        });

        const nombreProfesor =
          `${datosUsuario.givenName} ${datosUsuario.sn}`.trim();

        const fechaInicioFmt = new Date(
          actividad.fecha_inicio,
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
            <hr>
            <p>
               <a href="https://172.16.218.200/gestionIES/" target="_blank">
                  Pulse aquí para acceder a la aplicación
               </a>
            </p>
          `,
        });

        console.log(
          `[updateEstadoExtraescolar] Email enviado a: ${emails.join(", ")}`,
        );
      } catch (errMail) {
        console.error(
          "[updateEstadoExtraescolar] Error enviando email:",
          errMail,
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
/**
 * Insertar nueva actividad extraescolar o complementaria
 */
async function insertExtraescolar(req, res) {
  try {
    const usuarioSesion = req.session?.user;
    if (!usuarioSesion) {
      return res.status(401).json({ ok: false, error: "No autenticado" });
    }

    // Validación
    const errores = validarActividad(req.body);
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

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
        responsables_uids, ubicacion, coords, updated_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        usuarioSesion.username, // uid desde sesión
        gidnumber,
        cursos_gids,
        tipo,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        idperiodo_inicio || null,
        idperiodo_fin || null,
        responsables_uids,
        ubicacion,
        coords,
        usuarioSesion.username, // updated_by
      ],
    );

    const actividad = rows[0];

    // Respuesta inmediata
    res.status(201).json({ ok: true, actividad });

    // Envío de mail asíncrono
    setImmediate(async () => {
      try {
        const { rows: avisos } = await db.query(
          `SELECT emails FROM avisos WHERE modulo = 'extraescolares' LIMIT 1`,
        );
        const emailsRaw = avisos[0]?.emails || [];
        const emails = emailsRaw.map((e) => e.trim()).filter(Boolean);
        if (!emails.length) return;

        const ldapSession = req.session?.ldap;
        const datosUsuario = await new Promise((resolve) => {
          buscarPorUid(ldapSession, usuarioSesion.username, (err, datos) =>
            resolve(
              !err && datos ? datos : { givenName: "Desconocido", sn: "" },
            ),
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

        let extraCamposHTML = "";
        if (actividad.tipo === "complementaria") {
          extraCamposHTML = `
            <p><b>Periodo de inicio:</b> ${actividad.idperiodo_inicio || "-"}</p>
            <p><b>Periodo de fin:</b> ${actividad.idperiodo_fin || "-"}</p>
          `;
        }

        await mailer.sendMail({
          from: `"Comunicaciones" <comunicaciones@iesfcodeorellana.es>`,
          to: emails.join(", "),
          subject: `[EXTRAESCOLARES - Solicitud] ${actividad.titulo} (${fechaInicioFmt})`,
          html: `
            <p><b>Nueva actividad ${actividad.tipo} creada</b></p>
            <p><b>Título:</b> ${actividad.titulo}</p>
            <p><b>Creada por:</b> ${nombreProfesor}</p>
            <p><b>Fecha de inicio:</b> ${fechaInicioFmt}</p>
            <p><b>Fecha de fin:</b> ${fechaFinFmt}</p>
            <p><b>Descripción:</b> ${actividad.descripcion}</p>
            <p><b>Ubicación:</b> ${actividad.ubicacion || "-"}</p>
            ${extraCamposHTML}
            <hr>
            <p>
              <a href="https://172.16.218.200/gestionIES/" target="_blank">
                 Pulse aquí para acceder a la aplicación
              </a>
            </p>
          `,
        });

        console.log(
          `[insertExtraescolar] Email enviado a: ${emails.join(", ")}`,
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
      [id],
    );

    if (rowCount === 0)
      return res.status(404).json({ ok: false, error: "No encontrado" });

    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteExtraescolar] Error:", err);
    res.status(500).json({ ok: false, error: "Error eliminando actividad" });
  }
}

async function updateExtraescolar(req, res) {
  try {
    const id = req.params.id;
    const usuarioSesion = req.session?.user;

    if (!usuarioSesion) {
      return res.status(401).json({ ok: false, error: "No autenticado" });
    }

    // 1️⃣ Validación
    const errores = validarActividad(req.body);
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    // 2️⃣ Obtener actividad actual
    const { rows: actuales } = await db.query(
      `SELECT * FROM extraescolares WHERE id = $1`,
      [id]
    );

    const actividadActual = actuales[0];
    if (!actividadActual) {
      return res.status(404).json({ ok: false, error: "No encontrado" });
    }

    // 3️⃣ Comprobar permisos
    const esPropietario = actividadActual.uid === usuarioSesion.username;
    const esDirectiva = usuarioSesion.perfil === "directiva";
    const esExtraescolares = usuarioSesion.perfil === "extraescolares";

    if (!esPropietario && !esDirectiva && !esExtraescolares) {
      return res.status(403).json({ ok: false, error: "No autorizado" });
    }

    // 4️⃣ Extraer datos del body
    const {
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

    // 5️⃣ Actualizar (sin tocar estado)
    const { rows } = await db.query(
      `UPDATE extraescolares
       SET 
         gidnumber = $1,
         cursos_gids = $2,
         tipo = $3,
         titulo = $4,
         descripcion = $5,
         fecha_inicio = $6,
         fecha_fin = $7,
         idperiodo_inicio = $8,
         idperiodo_fin = $9,
         responsables_uids = $10,
         ubicacion = $11,
         coords = $12,
         updated_by = $13
       WHERE id = $14
       RETURNING *`,
      [
        gidnumber,
        cursos_gids,
        tipo,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        idperiodo_inicio || null,
        idperiodo_fin || null,
        responsables_uids,
        ubicacion,
        coords,
        usuarioSesion.username,
        id,
      ]
    );

    const actividad = rows[0];
    res.json({ ok: true, actividad });

    // 6️⃣ Envío de mail asíncrono
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
          buscarPorUid(ldapSession, usuarioSesion.username, (err, datos) =>
            resolve(!err && datos ? datos : { givenName: "Desconocido", sn: "" })
          );
        });

        const nombreProfesor = `${datosUsuario.givenName} ${datosUsuario.sn}`.trim();
        const fechaInicioFmt = actividad.fecha_inicio
          ? new Date(actividad.fecha_inicio).toLocaleDateString("es-ES")
          : "-";
        const fechaFinFmt = actividad.fecha_fin
          ? new Date(actividad.fecha_fin).toLocaleDateString("es-ES")
          : "-";

        let extraCamposHTML = "";
        if (actividad.tipo === "complementaria") {
          extraCamposHTML = `
            <p><b>Periodo de inicio:</b> ${actividad.idperiodo_inicio || "-"}</p>
            <p><b>Periodo de fin:</b> ${actividad.idperiodo_fin || "-"}</p>
          `;
        }

        await mailer.sendMail({
          from: `"Comunicaciones" <comunicaciones@iesfcodeorellana.es>`,
          to: emails.join(", "),
          subject: `[EXTRAESCOLARES - Actualización] ${actividad.titulo} (${fechaInicioFmt})`,
          html: `
            <p><b>Actividad ${actividad.tipo} actualizada</b></p>
            <p><b>Título:</b> ${actividad.titulo}</p>
            <p><b>Actualizada por:</b> ${nombreProfesor}</p>
            <p><b>Fecha de inicio:</b> ${fechaInicioFmt}</p>
            <p><b>Fecha de fin:</b> ${fechaFinFmt}</p>
            <p><b>Descripción:</b> ${actividad.descripcion}</p>
            <p><b>Ubicación:</b> ${actividad.ubicacion || "-"}</p>
            ${extraCamposHTML}
            <hr>
            <p>
              <a href="https://172.16.218.200/gestionIES/" target="_blank">
                 Pulse aquí para acceder a la aplicación
              </a>
            </p>
          `,
        });

        console.log(`[updateExtraescolar] Email enviado a: ${emails.join(", ")}`);
      } catch (errMail) {
        console.error("[updateExtraescolar] Error enviando email:", errMail);
      }
    });
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

function validarActividad(body) {
  const errores = [];

  // título
  if (
    !body.titulo ||
    typeof body.titulo !== "string" ||
    body.titulo.trim().length < 3
  ) {
    errores.push("El título debe tener al menos 3 caracteres");
  }

  // descripción
  if (
    !body.descripcion ||
    typeof body.descripcion !== "string" ||
    body.descripcion.trim().length < 15
  ) {
    errores.push("La descripción debe tener al menos 15 caracteres");
  }

  // gidnumber
  if (typeof body.gidnumber !== "number" || body.gidnumber < 1) {
    errores.push("Debe seleccionar un departamento");
  }

  // tipo
  if (!["complementaria", "extraescolar"].includes(body.tipo)) {
    errores.push('El tipo debe ser "complementaria" o "extraescolar"');
  }

  // fechas
  if (!body.fecha_inicio || typeof body.fecha_inicio !== "string") {
    errores.push("Debe indicar la fecha de inicio");
  }
  if (!body.fecha_fin || typeof body.fecha_fin !== "string") {
    errores.push("Debe indicar la fecha de fin");
  }

  // cursos_gids → array (puede estar vacío)
  if (!Array.isArray(body.cursos_gids)) {
    errores.push("cursos_gids debe ser un array");
  }

  // responsables_uids → mínimo 1
  if (
    !Array.isArray(body.responsables_uids) ||
    body.responsables_uids.length < 1
  ) {
    errores.push("Debe seleccionar al menos un profesor");
  }

  // ubicación
  if (
    !body.ubicacion ||
    typeof body.ubicacion !== "string" ||
    !body.ubicacion.trim()
  ) {
    errores.push("La ubicación es obligatoria");
  }

  // idperiodo_inicio y idperiodo_fin → opcionales (no validamos aquí)
  // coords → objeto con lat y lng
  if (!body.coords || typeof body.coords !== "object") {
    errores.push("coords es obligatorio");
  } else {
    const { lat, lng } = body.coords;
    if (typeof lat !== "number" || typeof lng !== "number") {
      errores.push("coords debe contener lat y lng numéricos");
    }
  }

  // refine: solo para extraescolar, fecha_fin > fecha_inicio
  if (body.tipo === "extraescolar" && body.fecha_inicio && body.fecha_fin) {
    const fInicio = new Date(body.fecha_inicio);
    const fFin = new Date(body.fecha_fin);
    if (fFin <= fInicio) {
      errores.push("La fecha y hora de fin debe ser posterior a la de inicio");
    }
  }

  return errores;
}
