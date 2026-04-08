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
  13: "(Art. 13) Asunto Propio",
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
      `SELECT 
     id,
     uid,
     TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha,
     TO_CHAR(fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
     descripcion,
     estado,
     tipo,
     idperiodo_inicio,
     idperiodo_fin,
     dia_completo
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

    // 1️⃣ Obtener permisos filtrados con created_at
    const { rows: permisos } = await db.query(
      `SELECT 
    ap.id, 
    ap.uid, 
    TO_CHAR(ap.fecha, 'YYYY-MM-DD') AS fecha,
    TO_CHAR(ap.fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
    ap.descripcion, 
    ap.estado, 
    ap.tipo,
    ap.idperiodo_inicio,
    ap.idperiodo_fin,
    ap.dia_completo,
    ap.created_at
   FROM permisos ap
   ${where}`,
      vals
    );

    const uids = [...new Set(permisos.map((p) => p.uid))];

    // 2️⃣ Obtener asuntos_propios de empleados
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

    // 3️⃣ Obtener nombres de profesores del LDAP en batch
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

    // 4️⃣ Calcular fechas de curso escolar
    const fechaPermiso = fecha ? new Date(fecha) : new Date();
    let yearInicioCurso = fechaPermiso.getFullYear();
    if (fechaPermiso.getMonth() < 8) yearInicioCurso -= 1; // antes de septiembre
    const fechaInicioCurso = `${yearInicioCurso}-09-01`;
    const fechaFinCurso = `${yearInicioCurso + 1}-06-30`;

    // 5️⃣ Contar días disfrutados por uid
    let diasMap = {};
    if (uids.length > 0) {
      const { rows: diasDisfrutados } = await db.query(
        `SELECT uid, COUNT(*) AS dias_disfrutados
         FROM permisos
         WHERE uid = ANY($1)
           AND tipo = 13
           AND estado = 1
           AND fecha >= $2
           AND fecha <= $3
         GROUP BY uid`,
        [uids, fechaInicioCurso, fechaFinCurso]
      );
      diasMap = diasDisfrutados.reduce((acc, row) => {
        acc[row.uid] = Number(row.dias_disfrutados);
        return acc;
      }, {});
    }

    // 6️⃣ Obtener todos los periodos de inicio y fin necesarios
    const periodosIds = [
      ...new Set(
        permisos.flatMap((p) =>
          [p.idperiodo_inicio, p.idperiodo_fin].filter(Boolean)
        )
      ),
    ];

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

    // 7️⃣ Enriquecer permisos
    let asuntosEnriquecidos = permisos.map((permiso) => {
      const empleado = empleadosMap[permiso.uid]; // <-- CORRECTO

      const periodo_inicio = permiso.idperiodo_inicio
        ? periodosMap[permiso.idperiodo_inicio]
        : null;
      const periodo_fin = permiso.idperiodo_fin
        ? periodosMap[permiso.idperiodo_fin]
        : null;

      return {
        ...permiso,
        nombreProfesor: nombreMap[permiso.uid],
        dias_disfrutados: diasMap[permiso.uid] ?? 0,
        ap_total: empleado?.asuntos_propios ?? 0,
        periodo_inicio,
        periodo_fin,
      };
    });

    // 7️⃣ Ordenar: primero por dias_disfrutados, luego por created_at
    asuntosEnriquecidos.sort((a, b) => {
      if ((a.dias_disfrutados ?? 0) !== (b.dias_disfrutados ?? 0)) {
        return (a.dias_disfrutados ?? 0) - (b.dias_disfrutados ?? 0);
      }
      return new Date(a.created_at) - new Date(b.created_at);
    });

    res.json({ ok: true, asuntos: asuntosEnriquecidos });
  } catch (err) {
    console.error("[getPermisosEnriquecidos] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error obteniendo permisos enriquecidos" });
  }
}

/**
 * Insertar un asunto propio con comprobaciones de restricciones
 */
async function insertAsuntoPropio(req, res) {
  const { uid, fecha, fecha_fin, descripcion, tipo } = req.body || {};
  const dia_completo = true;
  const idperiodo_inicio = null;
  const idperiodo_fin = null;

  console.log("===== NUEVA SOLICITUD ASUNTO PROPIO =====");
  console.log("UID:", uid);
  console.log("Fecha recibida:", fecha);
  console.log("Descripción:", descripcion);
  console.log("Tipo:", tipo);

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

    console.log("Restricciones:");
    console.log("Antelación mínima:", antelacion_min);
    console.log("Antelación máxima:", antelacion_max);
    console.log("Concurrentes:", concurrentes);

    const fechaSolicitada = new Date(fecha);

    // Log para mostrar fecha de hoy
    const { rows: hoyRows } = await db.query(
      `SELECT TO_CHAR(NOW() AT TIME ZONE 'Europe/Madrid', 'YYYY-MM-DD') AS hoy_pg`
    );
    const hoyPG = hoyRows[0].hoy_pg;
    console.log("Fecha hoy servidor (Postgres, Madrid):", hoyPG);

    console.log("Fecha solicitada (Date JS):", fechaSolicitada);

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
      // Cálculo de días directamente en PostgreSQL usando NOW() para zona horaria correcta
      const { rows: diffRows } = await db.query(
        `SELECT ($1::date - NOW()::date) AS diff_dias`,
        [fecha]
      );

      const diffDias = diffRows[0].diff_dias;

      console.log("------ CÁLCULO DIFERENCIA DÍAS POSTGRES ------");
      console.log("Fecha solicitada:", fecha);
      console.log("Diff días (PostgreSQL):", diffDias);
      console.log("---------------------------------------------");

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

      // Concurrencia - Excluir del recuento los que han sido rechazados, que no ocupan slot
      const { rows: concurrencia } = await db.query(
        `SELECT COUNT(*)::int AS total FROM permisos WHERE fecha = $1 AND tipo = 13 and estado <> 2`,
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
    // --- Comprobar duplicados antes de insertar ---
    const { rows: duplicados } = await db.query(
      `SELECT id, estado FROM permisos WHERE uid = $1 AND fecha = $2 AND tipo = $3`,
      [uid, fecha, tipo]
    );

    if (duplicados.length) {
      // Si el registro existente está rechazado, informamos que hay que borrarlo antes
      return res.status(400).json({
        ok: false,
        error:
          "Ya existe un asunto propio solicitado para este día. Si fue rechazado, elimínalo antes de volver a solicitarlo.",
      });
    }
    // --- Insertar asunto propio ---
    const { rows } = await db.query(
      `INSERT INTO permisos 
   (uid, fecha, fecha_fin, descripcion, tipo, idperiodo_inicio, idperiodo_fin, dia_completo)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   RETURNING id, uid, fecha, fecha_fin, descripcion, tipo, idperiodo_inicio, idperiodo_fin, dia_completo`,
      [
        uid,
        fecha,
        fecha_fin || fecha, // 👈 fallback clave
        descripcion,
        tipo,
        idperiodo_inicio,
        idperiodo_fin,
        dia_completo,
      ]
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

        // mail
        setImmediate(() => {
          enviarEmailPermiso(rows[0], "asunto-propio", req.session.ldap);
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
  const {
    uid,
    fecha,
    fecha_fin,
    descripcion,
    tipo,
    idperiodo_inicio,
    idperiodo_fin,
    dia_completo,
  } = req.body || {};

  // Validación mínima
  if (!uid || !fecha || !descripcion || tipo === null || tipo === undefined) {
    return res.status(400).json({
      ok: false,
      error: "UID, fecha, descripción y tipo son obligatorios",
    });
  }

  if (!dia_completo && (idperiodo_inicio == null || idperiodo_fin == null)) {
    return res.status(400).json({
      ok: false,
      error: "Debe indicar periodo inicio y fin si no es día completo",
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
      `INSERT INTO permisos 
   (uid, fecha, fecha_fin, descripcion, tipo, idperiodo_inicio, idperiodo_fin, dia_completo)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   RETURNING id, uid, fecha, fecha_fin, descripcion, tipo, idperiodo_inicio, idperiodo_fin, dia_completo`,
      [
        uid,
        fecha,
        fecha_fin || fecha,
        descripcion,
        tipo,
        idperiodo_inicio,
        idperiodo_fin,
        dia_completo,
      ]
    );

    // Respuesta inmediata
    res.status(201).json({
      ok: true,
      permiso: rows[0],
    });

    // mail
    setImmediate(() => {
      enviarEmailPermiso(rows[0], "permiso", req.session.ldap);
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

  const {
    fecha,
    fecha_fin,
    descripcion,
    tipo,
    idperiodo_inicio,
    idperiodo_fin,
    dia_completo,
  } = req.body || {};

  const sets = [];
  const vals = [];
  let i = 0;

  if (fecha !== undefined) {
    sets.push(`fecha = $${++i}`);
    vals.push(fecha);
  }

  if (descripcion !== undefined) {
    sets.push(`descripcion = $${++i}`);
    vals.push(descripcion);
  }

  if (tipo !== undefined) {
    sets.push(`tipo = $${++i}`);
    vals.push(tipo);
  }

  if (idperiodo_inicio !== undefined) {
    sets.push(`idperiodo_inicio = $${++i}`);
    vals.push(idperiodo_inicio);
  }

  if (idperiodo_fin !== undefined) {
    sets.push(`idperiodo_fin = $${++i}`);
    vals.push(idperiodo_fin);
  }

  if (dia_completo !== undefined) {
    sets.push(`dia_completo = $${++i}`);
    vals.push(dia_completo);
  }

  if (fecha_fin !== undefined) {
    sets.push(`fecha_fin = $${++i}`);
    vals.push(fecha_fin);
  }

  if (!sets.length)
    return res.status(400).json({ ok: false, error: "Nada que actualizar" });

  try {
    // Añadimos la condición de seguridad: solo actualizar si estado = 0
    const query = `
      UPDATE permisos
      SET ${sets.join(", ")}
      WHERE id = $${++i} AND estado = 0
     RETURNING
  id,
  uid,
  fecha,
  fecha_fin,
  descripcion,
  tipo,
  idperiodo_inicio,
  idperiodo_fin,
  dia_completo,
  estado
    `;

    vals.push(id);

    const { rows } = await db.query(query, vals);

    if (!rows[0])
      return res.status(403).json({
        ok: false,
        error: "No se puede actualizar este permiso (ya aprobado/rechazado)",
      });

    res.json({ ok: true, permiso: rows[0] });
  } catch (err) {
    console.error("[updatePermiso] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando permiso" });
  }
}
/**
 * Eliminar un asunto propio
 */
/*async function deletePermiso(req, res) {
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
}*/

/**
 * ELIMINAR PERMISO / ASUNTO PROPIO
 * - Impide borrar permisos aceptados que ya han pasado (histórico de guardias).
 * - Elimina las ausencias vinculadas en la misma transacción.
 */
async function deletePermiso(req, res) {
  const id = req.params.id;
  const usuarioSesion = req.session?.user;

  if (!usuarioSesion) {
    return res.status(401).json({ ok: false, error: "No autenticado" });
  }

  const client = await db.connect();

  try {
    // 1. Obtener datos del permiso para validar antes de borrar
    const { rows } = await client.query(
      `SELECT estado, fecha FROM permisos WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Permiso no encontrado" });
    }

    const permiso = rows[0];
    const hoy = new Date().toISOString().split("T")[0];
    const fechaPermiso = new Date(permiso.fecha).toISOString().split("T")[0];

    // 2. REGLA DE NEGOCIO: Proteger el histórico
    // Si el estado es Aceptado (1) y la fecha es anterior a hoy, bloqueamos el borrado.
    if (permiso.estado === 1 && fechaPermiso < hoy) {
      return res.status(403).json({
        ok: false,
        error:
          "No se puede eliminar un permiso pasado que ya fue aceptado para no alterar el registro histórico de ausencias.",
      });
    }

    // 3. TRANSACCIÓN DE BORRADO
    await client.query("BEGIN");

    // Borramos las ausencias asociadas (usando idpermiso)
    await client.query(
      `DELETE FROM ausencias_profesorado WHERE idpermiso = $1`,
      [id]
    );

    // Borramos el registro del permiso
    const { rowCount } = await client.query(
      `DELETE FROM permisos WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "No se pudo eliminar el registro" });
    }

    res.json({
      ok: true,
      mensaje: "Permiso y ausencias asociadas eliminados correctamente",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[deletePermiso] Error crítico:", err);
    res.status(500).json({ ok: false, error: "Error eliminando el permiso" });
  } finally {
    client.release();
  }
}

/**
 * Actualizar solo el estado de un asunto propio (para la directiva)
 */

/*async function updateEstadoPermiso(req, res) {
  const id = req.params.id;
  const { estado } = req.body;

  if (![1, 2].includes(estado))
    return res.status(400).json({ ok: false, error: "Estado inválido" });

  let asunto = null;

  try {
    await db.query("BEGIN");

    // ===============================
    // VALIDACIÓN DE ASUNTOS PROPIOS
    // ===============================
    if (estado === 1) {
      const { rows: permisoRows } = await db.query(
        `SELECT uid, tipo, estado FROM permisos WHERE id = $1`,
        [id]
      );

      const permiso = permisoRows[0];

      if (!permiso) {
        await db.query("ROLLBACK");
        return res
          .status(404)
          .json({ ok: false, error: "Asunto propio no encontrado" });
      }

      if (permiso.tipo === 13 && permiso.estado !== 1) {
        const empleado = await obtenerEmpleado(permiso.uid);

        if (!empleado) {
          await db.query("ROLLBACK");
          return res
            .status(404)
            .json({ ok: false, error: "Empleado no encontrado" });
        }

        let maxDias = empleado.asuntos_propios;

        if (!maxDias || maxDias === 0) {
          const restricciones = await getRestriccionesAsuntos();
          const diasRestriccion = restricciones.find(
            (r) => r.descripcion === "dias"
          );
          maxDias = diasRestriccion?.valor_num ?? 0;
        }

        if (!maxDias || maxDias <= 0) {
          await db.query("ROLLBACK");
          return res.status(400).json({
            ok: false,
            error:
              "No está configurado el número máximo de asuntos propios del empleado",
          });
        }

        const { rows: concedidos } = await db.query(
          `SELECT COUNT(*)::int AS total
           FROM permisos
           WHERE uid = $1 AND tipo = 13 AND estado = 1`,
          [permiso.uid]
        );

        if (concedidos[0].total >= maxDias) {
          await db.query("ROLLBACK");
          return res.status(400).json({
            ok: false,
            error: `No se puede aceptar el asunto propio. El empleado ya ha alcanzado el máximo de ${maxDias} días.`,
          });
        }
      }
    }

    // ===============================
    // UPDATE PERMISO
    // ===============================

    const { rows } = await db.query(
      `UPDATE permisos 
       SET estado = $1 
       WHERE id = $2 
       RETURNING id, uid, fecha, fecha_fin, descripcion, estado, tipo, idperiodo_inicio, idperiodo_fin, dia_completo`,
      [estado, id]
    );

    if (!rows[0]) {
      await db.query("ROLLBACK");
      return res
        .status(404)
        .json({ ok: false, error: "Asunto propio no encontrado" });
    }

    asunto = rows[0];
    // Ahora asunto.fecha_fin ya tiene el valor real de la base de datos

    // =====================================
    // SINCRONIZAR AUSENCIAS PROFESORADO
    // =====================================
    if (estado === 1) {
      await db.query(
        `
  INSERT INTO ausencias_profesorado (
    uid_profesor,
    fecha_inicio,
    fecha_fin,
    idperiodo_inicio,
    idperiodo_fin,
    tipo_ausencia,
    creada_por,
    idpermiso
  )
  VALUES ($1, $2, $3, $4, $5, 'permiso', $1, $6)
  ON CONFLICT (idpermiso)
  DO UPDATE SET
    uid_profesor = EXCLUDED.uid_profesor,
    fecha_inicio = EXCLUDED.fecha_inicio,
    fecha_fin = EXCLUDED.fecha_fin,
    idperiodo_inicio = EXCLUDED.idperiodo_inicio,
    idperiodo_fin = EXCLUDED.idperiodo_fin,
    tipo_ausencia = 'permiso',
    creada_por = 'permiso'
  `,
        [
          asunto.uid,
          asunto.fecha,
          asunto.fecha_fin || asunto.fecha, // Por defecto, es de un día
          asunto.idperiodo_inicio,
          asunto.idperiodo_fin,
          asunto.id,
        ]
      );
    }

    if (estado === 2) {
      await db.query(`DELETE FROM ausencias_profesorado WHERE idpermiso = $1`, [
        asunto.id,
      ]);
    }

    // ✅ TODO OK → COMMIT
    await db.query("COMMIT");

    // ✅ RESPUESTA FRONTEND
    res.json({ ok: true, asunto });

    // ===============================
    // EMAIL ASÍNCRONO (fuera transacción)
    // ===============================
    // Dentro de updateEstadoPermiso, al final:
    setImmediate(() => {
      enviarEmailPermiso(asunto, "estado", req.session.ldap);
    });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("[updateEstadoPermiso] Error:", err);

    res.status(500).json({
      ok: false,
      error: "Error actualizando estado",
    });
  }
}*/

/**
 * Actualizar el estado de un permiso (Aceptar/Rechazar) y sincronizar ausencias.
 * Implementa política de absorción: la ausencia oficial elimina la manual previa.
 */
async function updateEstadoPermiso(req, res) {
  const id = req.params.id;
  const { estado } = req.body;

  if (![1, 2].includes(estado)) {
    return res.status(400).json({ ok: false, error: "Estado inválido" });
  }

  // Obtenemos un cliente del pool para manejar la transacción de forma real
  const client = await db.connect();
  let asunto = null;

  try {
    await client.query("BEGIN");

    // ================================================================
    // 1. VALIDACIÓN DE ASUNTOS PROPIOS (Lógica de cupo máximo)
    // ================================================================
    if (estado === 1) {
      const { rows: permisoRows } = await client.query(
        `SELECT uid, tipo, estado FROM permisos WHERE id = $1`,
        [id]
      );

      const permiso = permisoRows[0];

      if (!permiso) {
        throw new Error("Asunto propio no encontrado");
      }

      // Validación específica para Asuntos Propios (Tipo 13)
      if (permiso.tipo === 13 && permiso.estado !== 1) {
        const empleado = await obtenerEmpleado(permiso.uid);

        if (!empleado) {
          throw new Error("Empleado no encontrado");
        }

        let maxDias = empleado.asuntos_propios;

        if (!maxDias || maxDias === 0) {
          const restricciones = await getRestriccionesAsuntos();
          const diasRestriccion = restricciones.find(
            (r) => r.descripcion === "dias"
          );
          maxDias = diasRestriccion?.valor_num ?? 0;
        }

        if (!maxDias || maxDias <= 0) {
          throw new Error(
            "No está configurado el número máximo de asuntos propios"
          );
        }

        const { rows: concedidos } = await client.query(
          `SELECT COUNT(*)::int AS total
           FROM permisos
           WHERE uid = $1 AND tipo = 13 AND estado = 1`,
          [permiso.uid]
        );

        if (concedidos[0].total >= maxDias) {
          throw new Error(
            `Cupo alcanzado: El empleado ya tiene ${maxDias} días concedidos.`
          );
        }
      }
    }

    // ================================================================
    // 2. ACTUALIZACIÓN DEL REGISTRO DE PERMISO
    // ================================================================
    const { rows } = await client.query(
      `UPDATE permisos 
       SET estado = $1 
       WHERE id = $2 
       RETURNING id, uid, fecha, fecha_fin, descripcion, estado, tipo, idperiodo_inicio, idperiodo_fin, dia_completo`,
      [estado, id]
    );

    if (!rows[0]) {
      throw new Error("No se pudo actualizar el registro de permiso");
    }

    asunto = rows[0];

    // ================================================================
    // 3. SINCRONIZAR TABLA DE AUSENCIAS (Política de Absorción)
    // ================================================================
    if (estado === 1) {
      // 🛡️ PASO A: Limpieza preventiva de ausencias manuales solapadas
      // Borramos ausencias que NO tengan idpermiso ni idextraescolar en ese rango
      await client.query(
        `DELETE FROM ausencias_profesorado 
         WHERE uid_profesor = $1 
           AND idpermiso IS NULL 
           AND idextraescolar IS NULL
           AND fecha_inicio <= $3 
           AND fecha_fin >= $2
           AND (
             (idperiodo_inicio IS NULL) OR ($4::int IS NULL)
             OR ($4::int <= idperiodo_fin AND $5::int >= idperiodo_inicio)
           )`,
        [
          asunto.uid,
          asunto.fecha,
          asunto.fecha_fin || asunto.fecha,
          asunto.idperiodo_inicio || null,
          asunto.idperiodo_fin || null,
        ]
      );

      // 🛡️ PASO B: Inserción de la ausencia oficial
      await client.query(
        `INSERT INTO ausencias_profesorado (
          uid_profesor,
          fecha_inicio,
          fecha_fin,
          idperiodo_inicio,
          idperiodo_fin,
          tipo_ausencia,
          creada_por,
          idpermiso
        )
        VALUES ($1, $2, $3, $4, $5, 'permiso', 'sistema_permisos', $6)
        ON CONFLICT (idpermiso)
        DO UPDATE SET
          uid_profesor = EXCLUDED.uid_profesor,
          fecha_inicio = EXCLUDED.fecha_inicio,
          fecha_fin = EXCLUDED.fecha_fin,
          idperiodo_inicio = EXCLUDED.idperiodo_inicio,
          idperiodo_fin = EXCLUDED.idperiodo_fin,
          tipo_ausencia = 'permiso',
          creada_por = 'sistema_permisos'`,
        [
          asunto.uid,
          asunto.fecha,
          asunto.fecha_fin || asunto.fecha,
          asunto.idperiodo_inicio,
          asunto.idperiodo_fin,
          asunto.id,
        ]
      );
    }

    // Si el estado es Rechazado (2), eliminamos la ausencia vinculada
    if (estado === 2) {
      await client.query(
        `DELETE FROM ausencias_profesorado WHERE idpermiso = $1`,
        [id]
      );
    }

    // ✅ TODO CORRECTO -> Confirmamos cambios
    await client.query("COMMIT");

    res.json({ ok: true, asunto });

    // ================================================================
    // 4. PROCESOS POST-TRANSACCIÓN (Emails, etc.)
    // ================================================================
    setImmediate(() => {
      enviarEmailPermiso(asunto, "estado", req.session.ldap);
    });
  } catch (err) {
    // Si algo falla, deshacemos todo lo realizado en la transacción
    await client.query("ROLLBACK");
    console.error("[updateEstadoPermiso] Error crítico:", err);

    res.status(500).json({
      ok: false,
      error: err.message || "Error interno al procesar el estado del permiso",
    });
  } finally {
    // Liberar el cliente para que vuelva al pool de conexiones
    client.release();
  }
}

/**
 * Función unificada para enviar avisos de Permisos y Asuntos Propios
 * @param {Object} permiso - El objeto del permiso (asunto)
 * @param {String} origen - 'insercion' o 'estado'
 * @param {Object} ldapSession - Sesión LDAP
 */
async function enviarEmailPermiso(permiso, origen, ldapSession) {
  try {
    // 1. Determinar el módulo para buscar emails de aviso
    const moduloAvisos = permiso.tipo === 13 ? "asuntos-propios" : "permisos";

    const { rows: avisos } = await db.query(
      `SELECT emails FROM avisos WHERE modulo = $1 LIMIT 1`,
      [moduloAvisos]
    );
    const emails = (avisos[0]?.emails || [])
      .map((e) => e.trim())
      .filter(Boolean);
    if (!emails.length) return;

    // 2. Datos de LDAP (Profesor)
    const nombreProfesor = await new Promise((resolve) => {
      buscarPorUid(ldapSession, permiso.uid, (err, datos) => {
        resolve(
          !err && datos ? `${datos.sn}, ${datos.givenName}` : permiso.uid
        );
      });
    });

    // 3. Info de Periodos y Fechas
    let infoHorario = permiso.dia_completo ? "Día completo" : "Por periodos";
    if (!permiso.dia_completo && permiso.idperiodo_inicio) {
      const { rows: pRows } = await db.query(
        `SELECT id, nombre FROM periodos_horarios WHERE id IN ($1, $2)`,
        [permiso.idperiodo_inicio, permiso.idperiodo_fin]
      );
      const pMap = Object.fromEntries(pRows.map((p) => [p.id, p.nombre]));
      const pIni = pMap[permiso.idperiodo_inicio] || "N/A";
      const pFin = pMap[permiso.idperiodo_fin] || pIni;
      infoHorario = pIni === pFin ? pIni : `${pIni} a ${pFin}`;
    }

    const fIni = new Date(permiso.fecha).toLocaleDateString("es-ES");
    const fFin = permiso.fecha_fin
      ? new Date(permiso.fecha_fin).toLocaleDateString("es-ES")
      : fIni;
    const rangoFechas = fIni === fFin ? fIni : `del ${fIni} al ${fFin}`;

    // 4. Lógica de Personalización (Colores y Textos)
    let tituloHeader, subheader, colorEstado, tagAsunto;
    let textoBadge = "Pendiente";
    let colorBadge = "#f59e0b"; // Naranja

    if (permiso.estado === 1) {
      textoBadge = "Aceptado";
      colorBadge = "#16a34a";
    } else if (permiso.estado === 2) {
      textoBadge = "Rechazado";
      colorBadge = "#dc2626";
    }

    const tipoTexto = MAPA_TIPOS[permiso.tipo] || "Otros";

    switch (origen) {
      case "asunto-propio":
        tituloHeader = "Nueva Solicitud de Asunto Propio";
        subheader = "Se ha registrado una nueva petición";
        colorEstado = "#f59e0b";
        tagAsunto = "[SOLICITUD]";
        break;
      case "permiso":
        tituloHeader = "Nueva Solicitud de Permiso";
        subheader = "Se ha registrado una nueva petición";
        colorEstado = "#f59e0b";
        tagAsunto = "[SOLICITUD]";
        break;
      case "estado":
        const aceptado = permiso.estado === 1;
        if (permiso.tipo === 13)
          tituloHeader = "Estado de Asunto Propio Actualizado";
        else tituloHeader = "Estado de Permiso Actualizado";
        subheader = `La solicitud ha sido <b>${aceptado ? "Aceptada" : "Rechazada"}</b>`;
        colorEstado = aceptado ? "#16a34a" : "#dc2626";
        tagAsunto = aceptado ? "[ACEPTADO]" : "[RECHAZADO]";
        break;
      default:
        tituloHeader = "Aviso de Permiso";
        subheader = "Cambio en la solicitud";
        colorEstado = "#64748b";
        tagAsunto = "[AVISO]";
    }

    // --- TRUCO ANTI-OCULTAMIENTO DE GMAIL ---
    const hashUnico = Math.random().toString(36).substring(2, 8);
    const tokenSeguridad = `${permiso.id}-${Date.now()}-${hashUnico}`;

    // 5. Envío del Mail
    await mailer.sendMail({
      from: `"Gestión IES" <comunicaciones@iesfcodeorellana.es>`,
      to: emails.join(", "),
      subject: `${tagAsunto} ${permiso.tipo === 13 ? "AP" : "Permiso"}: ${nombreProfesor} (${fIni})`,
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 0 auto;">
          <div style="background-color: ${colorEstado}; color: white; padding: 20px;">
            <h2 style="margin: 0; font-size: 1.2rem; text-align: center;">${tituloHeader}</h2>
            <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
              <tr>
                <td style="width: 20%;"></td>
                <td style="text-align: center; color: white; opacity: 0.9; font-size: 0.9rem;">${subheader}</td>
                <td style="text-align: right; width: 20%;">
                  <span style="background-color: ${colorBadge}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.4); display: inline-block; white-space: nowrap;">
                    ${textoBadge}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          <div style="padding: 25px;">
            <h3 style="color: #1e293b; margin-top: 0;">Detalles de la solicitud</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; width: 130px;"><b>👤 Profesor:</b></td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${nombreProfesor}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><b>📅 Fecha:</b></td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${rangoFechas}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><b>⏰ Horario:</b></td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${infoHorario}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;"><b>📝 Tipo:</b></td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${tipoTexto}</td></tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px; font-size: 0.9rem;">
              <b>Descripción/Motivo:</b><br>${permiso.descripcion}
            </div>
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://172.16.218.200/gestionIES/" style="background-color: #334155; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Gestionar en la plataforma</a>
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 0.8rem; color: #64748b;">
            Sistema de Gestión IES Francisco de Orellana<br>
            <span style="color: #f1f5f9; font-size: 1px; display: none !important;">Ref: ${tokenSeguridad}</span>
          </div>
        </div>`,
    });
  } catch (err) {
    console.error("[Email Permisos] Error:", err);
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
