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
async function getExtraescolaresEnriquecidos(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession)
      return res
        .status(401)
        .json({ ok: false, error: "No autenticado en LDAP" });

    // Cache por request (usuarios LDAP)
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

    // Cargar departamentos y cursos desde LDAP
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

    // Filtros
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

    // Consulta BD con JOIN a periodos (Incluido genera_ausencias)
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
        e.genera_ausencias,

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

    // Resolver UIDs
    const uidsUnicos = new Set();
    for (const item of rows) {
      if (item.uid) uidsUnicos.add(item.uid);
      if (item.updated_by) uidsUnicos.add(item.updated_by);
      if (Array.isArray(item.responsables_uids)) {
        item.responsables_uids.forEach((u) => u && uidsUnicos.add(u));
      }
    }

    await Promise.all(
      Array.from(uidsUnicos).map((uid) => getNombrePorUid(uid))
    );

    // Info empleados en DB
    const { rows: empleadosInfo } = await db.query(
      `SELECT uid, dni, tipo_empleado, cuerpo, grupo
       FROM empleados
       WHERE uid = ANY($1::text[])`,
      [Array.from(uidsUnicos)]
    );

    const empleadosMap = Object.fromEntries(
      empleadosInfo.map((e) => [e.uid, e])
    );

    // Enriquecimiento final
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
        nombreProfesor: usuariosCache[item.uid] || "Profesor desconocido",
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
 * ACTUALIZAR ESTADO (ACEPTAR / RECHAZAR)
 * Sincroniza con ausencias_profesorado solo si genera_ausencias es true
 * Envia mail a directiva
 * ================================================================
 */

async function updateEstadoExtraescolar(req, res) {
  const id = req.params.id;
  const { estado } = req.body;
  const usuarioSesion = req.session?.user;

  if (!usuarioSesion)
    return res.status(401).json({ ok: false, error: "No autenticado" });
  if (usuarioSesion.perfil !== "directiva")
    return res.status(403).json({ ok: false, error: "No autorizado" });
  if (![1, 2].includes(estado))
    return res.status(400).json({ ok: false, error: "Estado inválido" });

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `UPDATE extraescolares 
       SET estado = $1, updated_at = NOW(), updated_by = $2
       WHERE id = $3 
       RETURNING *`,
      [estado, usuarioSesion.username, id]
    );

    if (!rows[0]) {
      throw new Error("Actividad no encontrada");
    }

    const actividad = rows[0];

    // Pasamos el cliente para mantener la transacción
    await sincronizarAusenciasActividad(actividad, client);

    await client.query("COMMIT");
    res.json({ ok: true, actividad });

    setImmediate(() => {
      enviarEmailActividad(actividad, "estado", req.session.ldap);
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[updateEstadoExtraescolar] Error crítico:", err);
    res.status(500).json({ ok: false, error: err.message || "Error interno" });
  } finally {
    client.release();
  }
}

/**
 * Lógica de sincronización con Política de Absorción
 */
async function sincronizarAusenciasActividad(actividad, client) {
  const {
    id,
    estado,
    genera_ausencias,
    responsables_uids,
    titulo,
    fecha_inicio,
    fecha_fin,
    idperiodo_inicio,
    idperiodo_fin,
    uid, // Creador de la actividad
  } = actividad;

  // 1. Limpieza total de ausencias previas de ESTA actividad (por si se re-acepta)
  await client.query(
    `DELETE FROM ausencias_profesorado WHERE idextraescolar = $1`,
    [id]
  );

  // 2. Si está ACEPTADA (1) y GENERA AUSENCIAS, procedemos
  if (estado === 1 && genera_ausencias === true) {
    const responsables = responsables_uids || [];
    const fInicio = new Date(fecha_inicio);
    let fFin = fecha_fin ? new Date(fecha_fin) : fInicio;

    if (fFin < fInicio) fFin = fInicio;

    for (const uidProf of responsables) {
      // 🛡️ POLÍTICA DE ABSORCIÓN:
      // Borramos cualquier ausencia MANUAL solapada para ESTE profesor en particular
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
          uidProf,
          fInicio,
          fFin,
          idperiodo_inicio || null,
          idperiodo_fin || null,
        ]
      );

      // 🛡️ Inserción de la ausencia oficial de la actividad
      await client.query(
        `INSERT INTO ausencias_profesorado (
          uid_profesor, fecha_inicio, fecha_fin, 
          idperiodo_inicio, idperiodo_fin, tipo_ausencia, 
          creada_por, idextraescolar
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          uidProf,
          fInicio,
          fFin,
          idperiodo_inicio,
          idperiodo_fin,
          `Extraescolar: ${titulo}`,
          uid, // El profesor que creó la actividad consta como creador de la ausencia
          id,
        ]
      );
    }
  }
}

/**
 * Insertar nueva actividad extraescolar o complementaria
 */
async function insertExtraescolar(req, res) {
  try {
    const usuarioSesion = req.session?.user;
    if (!usuarioSesion)
      return res.status(401).json({ ok: false, error: "No autenticado" });

    const errores = validarActividad(req.body);
    if (errores.length) return res.status(400).json({ ok: false, errores });

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

    const genera_ausencias =
      tipo === "extraescolar" ? true : (req.body.genera_ausencias ?? false);

    const { rows } = await db.query(
      `INSERT INTO extraescolares (
        uid, gidnumber, cursos_gids, tipo, titulo, descripcion,
        fecha_inicio, fecha_fin, idperiodo_inicio, idperiodo_fin,
        responsables_uids, ubicacion, coords, updated_by, genera_ausencias
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        usuarioSesion.username,
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
        genera_ausencias,
      ]
    );

    const actividad = rows[0];
    res.status(201).json({ ok: true, actividad });

    // Enviamos el mail con el formato "fino"
    setImmediate(() => {
      enviarEmailActividad(actividad, "insercion", req.session.ldap);
    });
  } catch (err) {
    console.error("[insertExtraescolar] Error:", err);
    res.status(500).json({ ok: false, error: "Error insertando actividad" });
  }
}

/**
 * Borrar actividad
 */
/*async function deleteExtraescolar(req, res) {
  try {
    const id = req.params.id;
    // La DB debería tener ON DELETE CASCADE en ausencias_profesorado,
    // si no, habría que borrar las ausencias manualmente aquí primero.
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
}*/

/**
 * ELIMINAR ACTIVIDAD
 * - Impide borrar actividades pasadas y aceptadas (para proteger el histórico)
 * - Limpia las ausencias asociadas antes de borrar
 */
async function deleteExtraescolar(req, res) {
  const id = req.params.id;
  const usuarioSesion = req.session?.user;

  if (!usuarioSesion) {
    return res.status(401).json({ ok: false, error: "No autenticado" });
  }

  const client = await db.connect();

  try {
    // 1. Obtener los datos de la actividad antes de borrar para validar
    const { rows } = await client.query(
      `SELECT estado, fecha_inicio FROM extraescolares WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Actividad no encontrada" });
    }

    const actividad = rows[0];
    const hoy = new Date().toISOString().split("T")[0]; // Fecha actual YYYY-MM-DD
    const fechaActividad = new Date(actividad.fecha_inicio)
      .toISOString()
      .split("T")[0];

    // 2. LÓGICA DE PROTECCIÓN:
    // Si la actividad ya pasó (fecha < hoy) y estaba Aceptada (estado 1)
    if (actividad.estado === 1 && fechaActividad < hoy) {
      return res.status(403).json({
        ok: false,
        error:
          "No se puede eliminar una actividad pasada que ya fue aceptada para no alterar el historial de guardias.",
      });
    }

    // 3. TRANSACCIÓN PARA EL BORRADO
    await client.query("BEGIN");

    // Borramos primero las ausencias (aunque haya CASCADE, esto garantiza limpieza)
    await client.query(
      `DELETE FROM ausencias_profesorado WHERE idextraescolar = $1`,
      [id]
    );

    // Borramos la actividad
    const { rowCount } = await client.query(
      `DELETE FROM extraescolares WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "No encontrado al intentar borrar" });
    }

    res.json({
      ok: true,
      mensaje: "Actividad y ausencias eliminadas correctamente",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[deleteExtraescolar] Error:", err);
    res.status(500).json({ ok: false, error: "Error eliminando actividad" });
  } finally {
    client.release();
  }
}

async function updateExtraescolar(req, res) {
  const client = await db.connect();
  try {
    const id = req.params.id;
    const usuarioSesion = req.session?.user;
    if (!usuarioSesion)
      return res.status(401).json({ ok: false, error: "No autenticado" });

    const errores = validarActividad(req.body);
    if (errores.length) return res.status(400).json({ ok: false, errores });

    const { rows: actuales } = await client.query(
      `SELECT * FROM extraescolares WHERE id = $1`,
      [id]
    );
    const actividadPrevia = actuales[0];
    if (!actividadPrevia)
      return res.status(404).json({ ok: false, error: "No encontrado" });

    // Permisos: Solo el creador o la directiva pueden editar
    if (
      actividadPrevia.uid !== usuarioSesion.username &&
      usuarioSesion.perfil !== "directiva"
    ) {
      return res.status(403).json({ ok: false, error: "No autorizado" });
    }

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

    const genera_ausencias =
      tipo === "extraescolar" ? true : (req.body.genera_ausencias ?? false);
    await client.query("BEGIN");

    const { rows } = await client.query(
      `UPDATE extraescolares
       SET gidnumber = $1, cursos_gids = $2, tipo = $3, titulo = $4,
         descripcion = $5, fecha_inicio = $6, fecha_fin = $7,
         idperiodo_inicio = $8, idperiodo_fin = $9, responsables_uids = $10,
         ubicacion = $11, coords = $12, updated_by = $13, genera_ausencias = $14
       WHERE id = $15 RETURNING *`,
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
        genera_ausencias,
        id,
      ]
    );

    const actividadActualizada = rows[0];

    // Sincronizar ausencias si ya estaba aceptada
    if (actividadPrevia.estado === 1) {
      await client.query(
        `DELETE FROM ausencias_profesorado WHERE idextraescolar = $1`,
        [id]
      );
      if (genera_ausencias) {
        await sincronizarAusenciasActividad(actividadActualizada, client);
      }
    }

    await client.query("COMMIT");
    res.json({ ok: true, actividad: actividadActualizada });

    // --- AVISO POR EMAIL DE LA EDICIÓN ---
    setImmediate(() => {
      enviarEmailActividad(actividadActualizada, "edicion", req.session.ldap);
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[updateExtraescolar] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando" });
  } finally {
    client.release();
  }
}

/**
 * Validación de datos
 */
function validarActividad(body) {
  const errores = [];
  if (!body.titulo || body.titulo.trim().length < 10)
    errores.push("Título corto");
  if (!body.descripcion || body.descripcion.trim().length < 15)
    errores.push("Descripción corta");
  if (typeof body.gidnumber !== "number" || body.gidnumber < 1)
    errores.push("Departamento inválido");
  if (!["complementaria", "extraescolar"].includes(body.tipo))
    errores.push("Tipo inválido");
  if (!body.fecha_inicio || !body.fecha_fin)
    errores.push("Fechas obligatorias");
  if (
    !Array.isArray(body.responsables_uids) ||
    body.responsables_uids.length < 1
  )
    errores.push("Mínimo un profesor");
  if (!body.ubicacion || !body.ubicacion.trim())
    errores.push("Ubicación obligatoria");
  if (!body.coords || typeof body.coords.lat !== "number")
    errores.push("Coordenadas inválidas");

  if (body.tipo === "complementaria") {
    if (!body.idperiodo_inicio || !body.idperiodo_fin)
      errores.push("Periodos obligatorios en complementarias");
  }
  return errores;
}

/*async function sincronizarAusenciasActividad(actividad, client) {
  const {
    id,
    estado,
    genera_ausencias,
    responsables_uids,
    titulo,
    fecha_inicio,
    fecha_fin,
    idperiodo_inicio,
    idperiodo_fin,
    uid,
  } = actividad;

  // 1. Limpieza total siempre: borramos cualquier rastro previo para esta actividad
  await client.query(
    `DELETE FROM ausencias_profesorado WHERE idextraescolar = $1`,
    [id]
  );

  // 2. Si está ACEPTADA y GENERA AUSENCIAS, las creamos de nuevo
  if (estado === 1 && genera_ausencias === true) {
    const responsables = responsables_uids || [];
    const fInicio = new Date(fecha_inicio);
    let fFin = fecha_fin ? new Date(fecha_fin) : fInicio;
    if (fFin < fInicio) fFin = fInicio;

    for (const uidProf of responsables) {
      await client.query(
        `INSERT INTO ausencias_profesorado (
          uid_profesor, fecha_inicio, fecha_fin, 
          idperiodo_inicio, idperiodo_fin, tipo_ausencia, 
          creada_por, idextraescolar
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          uidProf,
          fInicio,
          fFin,
          idperiodo_inicio,
          idperiodo_fin,
          `Extraescolar: ${titulo}`,
          uid,
          id,
        ]
      );
    }
  }
}*/

/**
 * Función unificada para enviar avisos de actividades
 * @param {Object} actividad - El objeto de la actividad desde la DB
 * @param {String} origen - 'insercion', 'edicion' o 'estado'
 * @param {Object} ldapSession - La sesión LDAP para buscar nombres
 */
async function enviarEmailActividad(actividad, origen, ldapSession) {
  try {
    const { rows: avisos } = await db.query(
      `SELECT emails FROM avisos WHERE modulo = 'extraescolares' LIMIT 1`
    );
    const emails = (avisos[0]?.emails || [])
      .map((e) => e.trim())
      .filter(Boolean);
    if (!emails.length) return;

    // 1. Obtener nombres de LDAP
    const nombreOrganizador = await new Promise((resolve) => {
      buscarPorUid(ldapSession, actividad.uid, (err, datos) => {
        resolve(
          !err && datos ? `${datos.sn}, ${datos.givenName}` : actividad.uid
        );
      });
    });

    const nombresParticipantes = await Promise.all(
      (actividad.responsables_uids || []).map(
        (uid) =>
          new Promise((resolve) => {
            buscarPorUid(ldapSession, uid, (err, datos) => {
              resolve(!err && datos ? `${datos.sn}, ${datos.givenName}` : uid);
            });
          })
      )
    );

    // 2. Info de Periodos y Fechas
    let infoPeriodos = "";
    if (actividad.idperiodo_inicio) {
      const { rows: pRows } = await db.query(
        `SELECT id, nombre FROM periodos_horarios WHERE id IN ($1, $2)`,
        [actividad.idperiodo_inicio, actividad.idperiodo_fin]
      );
      const pMap = Object.fromEntries(pRows.map((p) => [p.id, p.nombre]));
      const pIni = pMap[actividad.idperiodo_inicio] || "N/A";
      const pFin = pMap[actividad.idperiodo_fin] || pIni;
      infoPeriodos = pIni === pFin ? pIni : `${pIni} a ${pFin}`;
    }

    const fIni = new Date(actividad.fecha_inicio).toLocaleDateString("es-ES");
    const fFin = actividad.fecha_fin
      ? new Date(actividad.fecha_fin).toLocaleDateString("es-ES")
      : fIni;
    const rangoFechas = fIni === fFin ? fIni : `del ${fIni} al ${fFin}`;

    // 3. Lógica de Personalización y BADGE de estado
    let tituloHeader, subheader, colorEstado, tagAsunto;

    // Configuración del Badge (Etiqueta)
    let textoBadge = "Pendiente";
    let colorBadge = "#f59e0b"; // Naranja por defecto

    if (actividad.estado === 1) {
      textoBadge = "Aceptada";
      colorBadge = "#16a34a"; // Verde
    } else if (actividad.estado === 2) {
      textoBadge = "Rechazada";
      colorBadge = "#dc2626"; // Rojo
    }

    switch (origen) {
      case "insercion":
        tituloHeader = "Nueva Solicitud de Actividad";
        subheader = "Nueva propuesta pendiente de revisión";
        colorEstado = "#f59e0b"; // Ámbar
        tagAsunto = "[SOLICITUD]";
        break;
      case "edicion":
        tituloHeader = "Actividad Actualizada";
        subheader = "Se han modificado los datos";
        colorEstado = "#0ea5e9"; // Azul
        tagAsunto = "[MODIFICADA]";
        break;
      case "estado":
        const aceptada = actividad.estado === 1;
        tituloHeader = "Estado Actualizado";
        subheader = `La solicitud ha sido <b>${aceptada ? "Aceptada" : "Rechazada"}</b>`;
        colorEstado = aceptada ? "#16a34a" : "#dc2626";
        tagAsunto = aceptada ? "[ACEPTADA]" : "[RECHAZADA]";
        break;
      default:
        tituloHeader = "Aviso de Actividad";
        subheader = "Cambio en la actividad";
        colorEstado = "#64748b";
        tagAsunto = "[AVISO]";
    }

    const infoGuardias = actividad.genera_ausencias
      ? `<b style="color: #b45309;">⚠️ SÍ genera ausencias/guardias</b>`
      : `<b style="color: #2563eb;">✅ NO genera ausencias</b>`;

    // 4. Construcción del HTML con el Badge alineado a la derecha
    await mailer.sendMail({
      from: `"Gestión IES" <comunicaciones@iesfcodeorellana.es>`,
      to: emails.join(", "),
      subject: `${tagAsunto} ${actividad.tipo.toUpperCase()}: ${actividad.titulo}`,
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 0 auto;">
          <div style="background-color: ${colorEstado}; color: white; padding: 20px;">
            <h2 style="margin: 0; font-size: 1.2rem; text-align: center;">${tituloHeader}</h2>
            
            <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
              <tr>
                <td style="width: 20%;"></td>
                
                <td style="text-align: center; color: white; opacity: 0.9; font-size: 0.9rem; vertical-align: middle;">
                  ${subheader}
                </td>
                
                <td style="text-align: right; width: 20%; vertical-align: middle;">
                  <span style="background-color: ${colorBadge}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: bold; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.4); display: inline-block; white-space: nowrap;">
                    ${textoBadge}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="padding: 25px;">
            <h3 style="color: #1e293b; margin-top: 0;">${actividad.titulo}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; width: 130px;"><b>📅 Fecha:</b></td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${rangoFechas}</td></tr>
              ${infoPeriodos ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><b>⏰ Horario:</b></td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${infoPeriodos}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><b>👤 Organizador:</b></td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${nombreOrganizador}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;"><b>👥 Participantes:</b></td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${nombresParticipantes.join("<br>")}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><b>📍 Ubicación:</b></td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${actividad.ubicacion}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><b>🛡️ Gestión:</b></td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${infoGuardias}</td></tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px; font-size: 0.9rem;">
              <b>Descripción:</b><br>${actividad.descripcion}
            </div>
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://172.16.218.200/gestionIES/" style="background-color: #334155; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Acceder a la plataforma</a>
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 0.8rem; color: #64748b;">
            Este es un mensaje automático del Sistema de Gestión IES Fco de Orellana.<br>
            <span style="color: #f1f5f9;">ID: ${actividad.id}-${Date.now()}</span>
          </div>
        </div>`,
    });
  } catch (err) {
    console.error("[Email] Error crítico:", err);
  }
}

module.exports = {
  getExtraescolaresEnriquecidos,
  updateEstadoExtraescolar,
  insertExtraescolar,
  deleteExtraescolar,
  updateExtraescolar,
};
