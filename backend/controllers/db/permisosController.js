/**
 * ================================================================
 *  Controller: permisosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de asuntos propios.
 *    Proporciona operaciones CRUD sobre la tabla "permisos"
 *    de la base de datos PostgreSQL.
 *
 *  Funcionalidades:
 *    - Obtener asuntos propios con filtros (getAsuntosPropios)
 *    - Insertar un asunto propio con validaciones (insertAsuntoPropio)
 *    - Actualizar parcialmente un asunto propio (updateAsuntoPropio)
 *    - Eliminar un asunto propio (deleteAsuntoPropio)
 *
 *  Autor: Francisco Damian Mendez Palma
 *  Email: adminies.franciscodeorellana@educarex.es
 *  GitHub: https://github.com/Chisco77
 *  Repositorio: https://github.com/Chisco77/gestionIES.git
 *  IES Francisco de Orellana - Trujillo
 *
 *  Fecha de creación: 2025
 * ================================================================
 */

const db = require("../../db");
const { getRestriccionesAsuntos } = require("./restriccionesController");
const { buscarPorUid } = require("../ldap/usuariosController");
const mailer = require("../../mailer");

const { obtenerEmpleado } = require("./empleadosController");

const MAPA_TIPOS = {
  2: "(Art. 2) Fallecimiento, accidente o enfermedad grave, hospitalización o intervención quirúrgica",
  3: "(Art. 3) Enfermedad propia",
  4: "(Art. 4) Traslado de domicilio",
  7: "(Art. 7) Exámenes prenatales y técnicas de preparación al parto",
  11: "(Art. 11) Deber inexcusable de carácter público o personal",
  14: "(Art. 14) Funciones sindicales / representación del personal",
  15: "(Art. 15) Exámenes finales o pruebas selectivas",
  32: "(Art. 32) Reducción de jornada para mayores de 55 años",
  0: "Otros",
};

/**
 * Obtener asuntos propios con filtros opcionales
 */
async function getPermisos(req, res) {
  try {
    const { uid, fecha, descripcion, estado, tipo } = req.query;

    const filtros = [];
    const vals = [];
    let i = 0;

    if (uid) filtros.push(`uid = $${++i}`) && vals.push(uid);
    if (fecha) filtros.push(`fecha = $${++i}`) && vals.push(fecha);
    if (descripcion)
      filtros.push(`descripcion ILIKE $${++i}`) &&
        vals.push(`%${descripcion}%`);
    if (typeof estado !== "undefined")
      filtros.push(`estado = $${++i}`) && vals.push(Number(estado));
    if (typeof tipo !== "undefined")
      filtros.push(`tipo = $${++i}`) && vals.push(Number(tipo));

    const where = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";

    const { rows } = await db.query(
      `SELECT id, uid, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha, descripcion, estado, tipo
       FROM permisos
       ${where}
       ORDER BY fecha ASC`,
      vals
    );

    res.json({ ok: true, asuntos: rows });
  } catch (err) {
    console.error("[getPermisos] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo permisos" });
  }
}

/**
 * Obtener asuntos propios enriquecidos con nombre del profesor y asuntos_propios
 * ⚠ Evita recursion excesiva llamando LDAP en batch y enriqueciendo localmente
 */
async function getPermisosEnriquecidos(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession)
      return res
        .status(401)
        .json({ ok: false, error: "No autenticado en LDAP" });

    const { uid, fecha, descripcion, estado, tipo } = req.query;
    const filtros = [];
    const vals = [];
    let i = 0;

    if (uid) filtros.push(`ap.uid = $${++i}`) && vals.push(uid);
    if (fecha) filtros.push(`ap.fecha = $${++i}`) && vals.push(fecha);
    if (descripcion)
      filtros.push(`ap.descripcion ILIKE $${++i}`) &&
        vals.push(`%${descripcion}%`);
    if (typeof estado !== "undefined")
      filtros.push(`ap.estado = $${++i}`) && vals.push(Number(estado));
    if (typeof tipo !== "undefined")
      filtros.push(`ap.tipo = $${++i}`) && vals.push(Number(tipo));

    const where = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";

    // 1️⃣ Obtener permisos
    const { rows: permisos } = await db.query(
      `SELECT ap.id, ap.uid, TO_CHAR(ap.fecha, 'YYYY-MM-DD') AS fecha, ap.descripcion, ap.estado, ap.tipo
       FROM permisos ap
       ${where}
       ORDER BY ap.fecha ASC`,
      vals
    );

    // 2️⃣ Obtener asuntos_propios de empleados
    const uids = [...new Set(permisos.map((p) => p.uid))];
    let empleadosMap = {};
    if (uids.length > 0) {
      const { rows: empleados } = await db.query(
        `SELECT uid, asuntos_propios FROM empleados WHERE uid = ANY($1)`,
        [uids]
      );
      empleadosMap = empleados.reduce((acc, emp) => {
        acc[emp.uid] = emp;
        return acc;
      }, {});
    }

    // 3️⃣ Obtener nombres de profesores del LDAP EN BATCH (evita Promise.all masivo)
    const nombreMap = {};
    for (const p of permisos) {
      if (!nombreMap[p.uid]) {
        nombreMap[p.uid] = await new Promise((resolve) => {
          buscarPorUid(ldapSession, p.uid, (err, datos) => {
            if (!err && datos)
              resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
            else resolve("Profesor desconocido");
          });
        });
      }
    }

    // 4️⃣ Enriquecer los permisos
    const asuntosEnriquecidos = permisos.map((permiso) => ({
      ...permiso,
      nombreProfesor: nombreMap[permiso.uid],
      asuntos_propios: empleadosMap[permiso.uid]?.asuntos_propios ?? 0,
    }));

    res.json({ ok: true, asuntos: asuntosEnriquecidos });
  } catch (err) {
    console.error("[getPermisosEnriquecidos] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error obteniendo permisos enriquecidos",
    });
  }
}

/**
 * Insertar un asunto propio con comprobaciones de restricciones
 */
async function insertAsuntoPropio(req, res) {
  const { uid, fecha, descripcion, tipo } = req.body || {};

  if (!uid || !fecha || !descripcion || tipo === undefined)
    return res.status(400).json({
      ok: false,
      error: "UID, fecha, descripción y tipo son obligatorios",
    });

  try {
    const restricciones = await getRestriccionesAsuntos();

    // ❌ No hay restricciones definidas
    if (!restricciones || !restricciones.length) {
      return res.status(400).json({
        ok: false,
        error:
          "No hay restricciones definidas para asuntos propios. Deben configurarse antes de realizar solicitudes.",
      });
    }

    // Mapeamos restricciones
    const restriccionesMap = restricciones.reduce((acc, r) => {
      acc[r.descripcion] = r;
      return acc;
    }, {});

    // Restricciones obligatorias (excepto ofuscar)
    const requeridas = [
      "concurrentes",
      "antelacion_min",
      "antelacion_max",
      "consecutivos",
      "dias",
    ];

    const faltan = requeridas.filter((r) => !restriccionesMap[r]);

    if (faltan.length) {
      return res.status(400).json({
        ok: false,
        error: `Faltan restricciones obligatorias: ${faltan.join(
          ", "
        )}. Deben definirse antes de solicitar asuntos propios.`,
      });
    }

    // Extraemos valores con seguridad
    const concurrentes = restriccionesMap.concurrentes.valor_num;
    const antelacion_min = restriccionesMap.antelacion_min.valor_num;
    const antelacion_max = restriccionesMap.antelacion_max.valor_num;
    const consecutivos = restriccionesMap.consecutivos.valor_num;
    const dias = restriccionesMap.dias.valor_num;
    const ofuscar = restriccionesMap.ofuscar?.valor_bool ?? false;

    const fechaSolicitada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // === Comprobar si hay autorización especial para esa fecha y usuario
    const { rows: autorizaciones } = await db.query(
      `SELECT id FROM asuntos_permitidos WHERE uid = $1 AND fecha = $2`,
      [uid, fecha]
    );
    const tieneAutorizacion = autorizaciones.length > 0;

    const empleado = await obtenerEmpleado(uid);
    if (!empleado)
      return res
        .status(404)
        .json({ ok: false, error: "Empleado no encontrado" });

    // Días máximos asignados
    let maxDias = empleado.asuntos_propios;
    if (!maxDias || maxDias === 0) maxDias = dias;

    // Comprobar máximo de días del usuario. Solo cuento aquellos APs cuyo estado es aceptado (1)
    const { rows: totalCurso } = await db.query(
      `SELECT COUNT(*)::int AS total FROM permisos WHERE uid = $1 AND tipo = 13 AND estado = 1`,
      [uid]
    );
    if (totalCurso[0].total >= maxDias)
      return res.status(400).json({
        ok: false,
        error: `Ya has solicitado el máximo de ${maxDias} días de asuntos propios este curso.`,
      });

    // --- Si NO tiene autorización, aplicamos todas las restricciones normales ---
    if (!tieneAutorizacion) {
      const diffDias = Math.ceil(
        (fechaSolicitada - hoy) / (1000 * 60 * 60 * 24)
      );

      // Antelación mínima
      if (diffDias < antelacion_min)
        return res.status(400).json({
          ok: false,
          error: `Debes solicitar el asunto propio con al menos ${antelacion_min} días de antelación.`,
        });

      // Antelación máxima
      if (diffDias > antelacion_max)
        return res.status(400).json({
          ok: false,
          error: `No puedes solicitar el asunto propio con más de ${antelacion_max} días de antelación.`,
        });

      // Concurrencia
      const { rows: concurrencia } = await db.query(
        `SELECT COUNT(*)::int AS total FROM permisos WHERE fecha = $1 AND tipo = 13`,
        [fecha]
      );

      if (concurrencia[0].total >= concurrentes)
        return res.status(400).json({
          ok: false,
          error: `Ya hay ${concurrentes} profesores con peticiones de asuntos propios ese día.`,
        });

      // Consecutivos
      const { rows: diasCercanos } = await db.query(
        `SELECT fecha FROM permisos
         WHERE uid = $1
         AND fecha BETWEEN ($2::date - INTERVAL '10 days')
                       AND ($2::date + INTERVAL '10 days')
         ORDER BY fecha`,
        [uid, fecha]
      );

      const fechas = diasCercanos.map((r) => new Date(r.fecha).getTime());
      fechas.push(fechaSolicitada.getTime());
      fechas.sort((a, b) => a - b);

      let maxConsecutivos = 1;
      let consecutivosActual = 1;

      for (let i = 1; i < fechas.length; i++) {
        const diff = Math.round(
          (fechas[i] - fechas[i - 1]) / (1000 * 60 * 60 * 24)
        );
        consecutivosActual = diff === 1 ? consecutivosActual + 1 : 1;
        if (consecutivosActual > maxConsecutivos)
          maxConsecutivos = consecutivosActual;
      }

      if (maxConsecutivos > consecutivos)
        return res.status(400).json({
          ok: false,
          error: `No puedes solicitar más de ${consecutivos} días consecutivos de asuntos propios.`,
        });
    }

    // --- Insertar asunto propio ---
    const { rows } = await db.query(
      `INSERT INTO permisos (uid, fecha, descripcion, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, uid, fecha, descripcion, tipo`,
      [uid, fecha, descripcion, tipo]
    );

    // Responder antes de enviar email
    res.status(201).json({ ok: true, asunto: rows[0], ofuscar });

    // Envío de email asíncrono
    setImmediate(async () => {
      try {
        const { rows: avisos } = await db.query(
          `SELECT emails FROM avisos WHERE modulo = 'asuntos-propios' LIMIT 1`
        );

        const emails = (avisos[0]?.emails || [])
          .map((e) => e.trim())
          .filter(Boolean);

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
          `${datosUsuario.givenName || ""} ${datosUsuario.sn || ""}`.trim();

        const fechaFmt = new Date(rows[0].fecha).toLocaleDateString("es-ES");

        await mailer.sendMail({
          from: `"Comunicaciones" <comunicaciones@iesfcodeorellana.es>`,
          to: emails.join(", "),
          subject: `[ASUNTOS PROPIOS - Solicitud] Solicitud asunto propio (${fechaFmt})`,
          html: `<p>Profesor: ${nombreProfesor}</p>
                 <p>Fecha: ${fechaFmt}</p>
                 <p>Descripción: ${descripcion}</p>`,
        });

        console.log(
          `[insertAsuntoPropio] Email enviado a: ${emails.join(", ")}`
        );
      } catch (errMail) {
        console.error("[insertAsuntoPropio] Error enviando email:", errMail);
      }
    });
  } catch (err) {
    console.error("[insertAsuntoPropio] Error:", err);
    res.status(500).json({ ok: false, error: "Error guardando asunto propio" });
  }
}

/**
 *
 *  PARA INSERCIÓN DE PERMISOS DISTINTOS DE ASUNTOS PROPIOS
 *  NO HAY RESTRICCIONES PARA PEDIR ESTE TIPO DE PERMISOS
 *
 * /*/
async function insertPermiso(req, res) {
  const { uid, fecha, descripcion, tipo } = req.body || {};

  // Validación mínima
  if (!uid || !fecha || !descripcion || tipo === null || tipo === undefined) {
    return res.status(400).json({
      ok: false,
      error: "UID, fecha, descripción y tipo son obligatorios",
    });
  }

  try {
    console.log("[insertPermiso] Insertando permiso sin restricciones:", {
      uid,
      fecha,
      tipo,
      descripcion,
    });

    const { rows } = await db.query(
      `INSERT INTO permisos (uid, fecha, descripcion, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, uid, fecha, descripcion, tipo`,
      [uid, fecha, descripcion, tipo]
    );

    // Respuesta inmediata
    res.status(201).json({
      ok: true,
      permiso: rows[0],
    });

    setImmediate(async () => {
      try {
        const { rows: avisos } = await db.query(
          `SELECT emails FROM avisos WHERE modulo = 'permisos' LIMIT 1`
        );

        const emailsRaw = avisos[0]?.emails || [];
        const emails = emailsRaw.map((e) => e.trim()).filter(Boolean);
        if (!emails.length) return;

        const ldapSession = req.session?.ldap;
        const datosUsuario = await new Promise((resolve) => {
          buscarPorUid(ldapSession, uid, (err, datos) =>
            resolve(datos || { givenName: "Desconocido", sn: "" })
          );
        });

        const nombreProfesor =
          `${datosUsuario.givenName || ""} ${datosUsuario.sn || ""}`.trim();

        const fechaFmt = new Date(rows[0].fecha).toLocaleDateString("es-ES");

        // mapeo del tipo
        const tipoTexto = MAPA_TIPOS[tipo] || "Otros";

        await mailer.sendMail({
          from: `"Comunicaciones" <comunicaciones@iesfcodeorellana.es>`,
          to: emails.join(", "),
          subject: `[PERMISOS] Nueva solicitud (${fechaFmt})`,
          html: `
        <p><b>Profesor:</b> ${nombreProfesor}</p>
        <p><b>Fecha:</b> ${fechaFmt}</p>
        <p><b>Descripción:</b> ${descripcion}</p>
        <p><b>Tipo:</b> ${tipoTexto}</p>
      `,
        });

        console.log(`[insertPermiso] Email enviado a: ${emails.join(", ")}`);
      } catch (err) {
        console.error("[insertPermiso] Error enviando email:", err);
      }
    });
  } catch (err) {
    console.error("[insertPermiso] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error guardando permiso",
    });
  }
}

/**
 * Actualizar parcialmente un asunto propio
 */
async function updatePermiso(req, res) {
  const id = req.params.id;
  const { fecha, descripcion, tipo } = req.body || {};

  const sets = [];
  const vals = [];
  let i = 0;
  if (fecha) sets.push(`fecha = $${++i}`) && vals.push(fecha);
  if (descripcion) sets.push(`descripcion = $${++i}`) && vals.push(descripcion);
  if (tipo !== undefined) {
    sets.push(`tipo = $${++i}`);
    vals.push(tipo);
  }

  console.log("fecha", fecha);
  console.log("descripcion", descripcion);
  console.log("tipo", tipo);
  console.log("Sets: ", sets);
  if (!sets.length)
    return res.status(400).json({ ok: false, error: "Nada que actualizar" });

  try {
    const query = `UPDATE permisos SET ${sets.join(", ")} WHERE id = $${++i} RETURNING id, uid, fecha, descripcion, tipo`;
    vals.push(id);
    const { rows } = await db.query(query, vals);
    if (!rows[0])
      return res
        .status(404)
        .json({ ok: false, error: "Permiso no encontrado" });

    res.json({ ok: true, asunto: rows[0] });
  } catch (err) {
    console.error("[updatePermiso] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando permiso" });
  }
}

/**
 * Eliminar un asunto propio
 */
async function deletePermiso(req, res) {
  const id = req.params.id;
  try {
    const { rowCount } = await db.query(`DELETE FROM permisos WHERE id = $1`, [
      id,
    ]);
    if (!rowCount)
      return res
        .status(404)
        .json({ ok: false, error: "Asunto propio no encontrado" });

    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteAsuntoPropio] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error eliminando asunto propio" });
  }
}

/**
 * Actualizar solo el estado de un asunto propio (para la directiva)
 */
async function updateEstadoPermiso(req, res) {
  const id = req.params.id;
  const { estado } = req.body; // 1 = Aceptado, 2 = Rechazado
  if (![1, 2].includes(estado))
    return res.status(400).json({ ok: false, error: "Estado inválido" });

  try {
    // ===============================
    // VALIDACIÓN DE ASUNTOS PROPIOS
    // ===============================
    if (estado === 1) {
      // Obtener el permiso que se quiere aceptar
      const { rows: permisoRows } = await db.query(
        `SELECT uid, tipo, estado FROM permisos WHERE id = $1`,
        [id]
      );

      const permiso = permisoRows[0];
      if (!permiso)
        return res
          .status(404)
          .json({ ok: false, error: "Asunto propio no encontrado" });

      if (estado === 1 && permiso.tipo === 13 && permiso.estado !== 1) {
        const empleado = await obtenerEmpleado(permiso.uid);
        if (!empleado)
          return res
            .status(404)
            .json({ ok: false, error: "Empleado no encontrado" });

        let maxDias = empleado.asuntos_propios;
        if (!maxDias || maxDias === 0) {
          const restricciones = await getRestriccionesAsuntos();
          const diasRestriccion = restricciones.find(
            (r) => r.descripcion === "dias"
          );
          maxDias = diasRestriccion?.valor_num ?? 0;
        }

        if (!maxDias || maxDias <= 0)
          return res.status(400).json({
            ok: false,
            error: "No está configurado el número máximo de asuntos propios",
          });

        const { rows: concedidos } = await db.query(
          `SELECT COUNT(*)::int AS total
     FROM permisos
     WHERE uid = $1 AND tipo = 13 AND estado = 1`,
          [permiso.uid]
        );

        if (concedidos[0].total >= maxDias)
          return res.status(400).json({
            ok: false,
            error: `No se puede aceptar el asunto propio. El empleado ya ha alcanzado el máximo de ${maxDias} días de asuntos propios.`,
          });
      }
    }

    const query = `UPDATE permisos SET estado = $1 WHERE id = $2 RETURNING id, uid, fecha, descripcion, estado, tipo`;
    const { rows } = await db.query(query, [estado, id]);
    if (!rows[0])
      return res
        .status(404)
        .json({ ok: false, error: "Asunto propio no encontrado" });

    const asunto = rows[0];

    // ✅ Responder al frontend antes de enviar correo
    res.json({ ok: true, asunto });

    // Enviar email asíncrono
    setImmediate(async () => {
      try {
        const { rows: avisos } = await db.query(
          `SELECT emails FROM avisos WHERE modulo = 'asuntos-propios' LIMIT 1`
        );
        const emailsRaw = avisos[0]?.emails || [];
        const emails = emailsRaw.map((e) => e.trim()).filter(Boolean);
        if (!emails.length) return;

        const ldapSession = req.session?.ldap;
        const datosUsuario = await new Promise((resolve) => {
          buscarPorUid(ldapSession, asunto.uid, (err, datos) =>
            resolve(
              !err && datos ? datos : { givenName: "Desconocido", sn: "" }
            )
          );
        });

        const nombreProfesor =
          `${datosUsuario.givenName || ""} ${datosUsuario.sn || ""}`.trim();
        const fechaFmt = new Date(asunto.fecha).toLocaleDateString("es-ES");
        const estadoTexto = estado === 1 ? "Aceptado" : "Rechazado";
        const subjectPrefix =
          estado === 1
            ? "[ASUNTO PROPIO ACEPTADO]"
            : "[ASUNTO PROPIO RECHAZADO]";

        await mailer.sendMail({
          from: `"Comunicaciones" <comunicaciones@iesfcodeorellana.es>`,
          to: emails.join(", "),
          subject: `${subjectPrefix} Estado actualizado (${fechaFmt})`,
          html: `<p>Profesor: ${nombreProfesor}</p><p>Fecha: ${fechaFmt}</p><p>Descripción: ${asunto.descripcion}</p><p>Estado: ${estadoTexto}</p>`,
        });

        console.log(
          `[updateEstadoPermiso] Email enviado a: ${emails.join(", ")}`
        );
      } catch (errMail) {
        console.error("[updateEstadoPermiso] Error enviando email:", errMail);
      }
    });
  } catch (err) {
    console.error("[updateEstadoPermiso] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando estado" });
  }
}

/**
 * ================================================================
 *  Exportación de funciones
 * ================================================================
 */
module.exports = {
  getPermisos,
  insertAsuntoPropio,
  insertPermiso,
  updatePermiso,
  deletePermiso,
  getPermisosEnriquecidos,
  updateEstadoPermiso,
};
