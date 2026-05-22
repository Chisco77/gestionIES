/**
 * ================================================================
 *  Controller: extraescolaresController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión completa de actividades extraescolares
 *    y complementarias. Integra la reserva inteligente de estancias,
 *    la sincronización en tiempo real con el cuadrante de ausencias del
 *    profesorado, la consulta concurrente de grupos/departamentos LDAP
 *    y notificaciones automáticas por correo electrónico.
 *
 *  Funcionalidades:
 *    - Gestión automática de reservas y control estricto de conflictos
 *      horarios en espacios reservables (gestionarReservaEstancia)
 *    - Obtención y enriquecimiento  de actividades cruzando
 *      los límites del año académico con datos de la BD y LDAP para obtener
 *      datos de profesores.
 *      (getExtraescolaresEnriquecidos)
 *    - Modificación de estado (Aceptar/Rechazar) por parte del equipo directivo,
 *      con mecanismos de liberación automática de recursos ante rechazos
 *      (updateEstadoExtraescolar)
 *    - Sincronización avanzada bajo la "Política de Absorción" (elimina ausencias
 *      manuales previas del profesor para evitar duplicidades al generar la
 *      ausencia oficial de la actividad) (sincronizarAusenciasActividad)
 *    - Inserción de nuevas actividades evaluando restricciones geográficas
 *      (dentro/fuera del centro) y casuísticas multidía (insertExtraescolar)
 *    - Protección del histórico de guardias impidiendo el borrado de
 *      actividades pasadas ya consolidadas (deleteExtraescolar)
 *    - Actualización integral de parámetros de la actividad con reevaluación
 *      de reservas previas y refresco de ausencias (updateExtraescolar)
 *    - Envío asíncrono de correos informativos sobre inserciones, ediciones
 *      y cambios de estado administrativos (enviarEmailActividad [Omitido]) a directiva
 *      y participantes en la actividad.
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
const { buscarPorUid } = require("../ldap/usuariosController");
const mailer = require("../../mailer");
const { obtenerGruposPorTipo } = require("../ldap/gruposController");

/**
 * Intenta reservar una estancia para una actividad de un solo día.
 * Devuelve el id de la reserva o null si no se pudo (ocupada o no reservable).
 * Si la estancia es reservable, intenta crear la reserva de dicha estancia. si no
 * puede, informa al frontend y no deja guardar la actividad, obligando al usuario a escoger
 * un slot libre para la estancai reservable u otra estancia (o dejar la estancia en blanco.)
 */
async function gestionarReservaEstancia(client, actividad, usuario) {
  const { idestancia, fecha_inicio, idperiodo_inicio, idperiodo_fin, titulo } =
    actividad;

  if (!idestancia) return { id_reserva: null, conflicto: false };

  // 1. Comprobar si la estancia es reservable
  const { rows: estancia } = await client.query(
    "SELECT reservable FROM estancias WHERE id = $1",
    [idestancia]
  );

  if (!estancia[0]?.reservable) {
    console.log(`Estancia ${idestancia} no es reservable. Omitiendo reserva.`);
    return { id_reserva: null, conflicto: false };
  }

  // 2. Si es reservable, comprobamos disponibilidad
  const { rows: solapamientos } = await client.query(
    `SELECT id FROM reservas_estancias 
     WHERE idestancia = $1 
     AND fecha = $2 
     AND NOT (idperiodo_fin < $3 OR idperiodo_inicio > $4)`,
    [idestancia, fecha_inicio, idperiodo_inicio, idperiodo_fin]
  );

  if (solapamientos.length > 0) {
    return { id_reserva: null, conflicto: true };
  }

  // 3. Crear la reserva usando el título de la extraescolar
  const { rows: nuevaReserva } = await client.query(
    `INSERT INTO reservas_estancias (
      idestancia, 
      fecha, 
      idperiodo_inicio, 
      idperiodo_fin, 
      uid, 
      descripcion, 
      idrepeticion
   )
   VALUES ($1, $2, $3, $4, $5, $6, NULL)
   RETURNING id`,
    [
      idestancia, // $1
      fecha_inicio, // $2
      idperiodo_inicio, // $3
      idperiodo_fin, // $4
      usuario, // $5 (el dueño de la actividad)
      titulo, // $6 (ahora la descripción es el título)
    ]
  );

  return { id_reserva: nuevaReserva[0].id, conflicto: false };
}

/**
 * Obtener actividades extraescolares enriquecidas
 * ================================================================
 */
async function getExtraescolaresEnriquecidos(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession)
      return res.status(401).json({ ok: false, error: "No autenticado" });

    // Obtenemos los límites del curso del middleware
    const { inicioCurso, finCurso } = req.curso;

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
    const { estado, tipo, uid, fecha } = req.query;
    const filtros = [];
    const vals = [];
    let i = 0;

    // --- LÓGICA DE CURSO ---
    if (fecha) {
      // Si buscan actividades de un día concreto
      filtros.push(`e.fecha_inicio <= $${++i} AND e.fecha_fin >= $${i}`);
      vals.push(fecha);
    } else {
      // Por defecto, actividades que se solapen con el curso actual
      filtros.push(`e.fecha_inicio <= $${++i} AND e.fecha_fin >= $${++i}`);
      vals.push(finCurso, inicioCurso);
    }

    // --- LÓGICA DE FILTRADO POR USUARIO (Creador o Responsable) ---
    if (uid) {
      // Buscamos donde el uid sea el creador O esté contenido en el array de responsables
      filtros.push(`(e.uid = $${++i} OR $${i} = ANY(e.responsables_uids))`);
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
  e.fuera_del_centro,
  e.updated_at,
  e.genera_ausencias,
  e.idestancia,  

  p_ini.nombre AS periodo_inicio_nombre,
  p_fin.nombre AS periodo_fin_nombre,

  est.id AS estancia_id,                 
  est.descripcion AS estancia_descripcion,
  est.reservable AS estancia_reservable,
  est.idplano AS estancia_idplano

FROM extraescolares e

LEFT JOIN periodos_horarios p_ini
  ON e.idperiodo_inicio = p_ini.id

LEFT JOIN periodos_horarios p_fin
  ON e.idperiodo_fin = p_fin.id

LEFT JOIN estancias est                
  ON e.idestancia = est.id

${where}
ORDER BY 
  e.fecha_inicio ASC,
  -- 1. Forzamos que las de "Todo el día" (idperiodo_inicio es NULL) salgan arriba
  (e.idperiodo_inicio IS NOT NULL) ASC, 
  -- 2. Ordenamos el resto cronológicamente por la hora de inicio del periodo
  p_ini.inicio ASC`,
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

      const estancia = item.idestancia
        ? {
            id: item.estancia_id,
            descripcion: item.estancia_descripcion,
            reservable: item.estancia_reservable,
            idplano: item.estancia_idplano,
          }
        : null;

      return {
        ...item,
        nombreProfesor: usuariosCache[item.uid] || "Profesor desconocido",
        actualizadaPor: item.updated_by
          ? usuariosCache[item.updated_by] || "Profesor desconocido"
          : null,
        responsables,
        departamento,
        cursos: cursosActividad,
        estancia,
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

    // --- LÓGICA DE RECHAZO (Estado 2): Borrar reserva y limpiar referencias ---
    if (estado === 2) {
      // Si tiene una reserva de estancia asociada, la borramos de su tabla
      if (actividad.id_reserva_estancia) {
        await client.query(`DELETE FROM reservas_estancias WHERE id = $1`, [
          actividad.id_reserva_estancia,
        ]);
        const { rows: rowsUpdate } = await client.query(
          `UPDATE extraescolares 
           SET id_reserva_estancia = NULL, idestancia = NULL 
           WHERE id = $1 
           RETURNING *`,
          [id]
        );
        actividad = rowsUpdate[0]; // Refrescamos el objeto actividad
      }
    }

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
  const client = await db.connect();
  try {
    const usuarioSesion = req.session?.user;
    if (!usuarioSesion)
      return res.status(401).json({ ok: false, error: "No autenticado" });

    const errores = validarActividad(req.body);
    if (errores.length) return res.status(400).json({ ok: false, errores });

    const data = req.body;
    const esFuera =
      data.fuera_del_centro === true || data.fuera_del_centro === "true";
    const finalEstancia = esFuera ? null : data.idestancia || null;
    const esMultidia = data.fecha_inicio !== data.fecha_fin;

    await client.query("BEGIN");

    let idReserva = null;
    let avisoExtra = null;

    // --- Dentro de updateExtraescolar (y también en insert) ---

    if (!esFuera && finalEstancia) {
      // 1. Primero comprobamos si es reservable
      const { rows: estanciaInfo } = await client.query(
        "SELECT reservable FROM estancias WHERE id = $1",
        [finalEstancia]
      );
      const esReservable = estanciaInfo[0]?.reservable || false;

      if (esReservable) {
        // 2. SOLO si es reservable, aplicamos las restricciones
        if (esMultidia) {
          throw new Error(
            "Las actividades multidía con estancias RESERVABLES requieren gestión manual. Por favor, desmarca la estancia o cambia las fechas."
          );
        } else {
          console.log("Rama UN SOLO DÍA (Reservable): Gestionando reserva...");
          const { id_reserva, conflicto } = await gestionarReservaEstancia(
            client,
            data,
            usuarioSesion.username
          );

          if (conflicto) {
            throw new Error(
              "La estancia seleccionada ya está ocupada para esa fecha/hora. Elige otra o cambia el horario."
            );
          }
          idReserva = id_reserva;
        }
      } else {
        // 3. Si NO es reservable, no hacemos nada más. idReserva se queda en null
        // y se guardará la actividad asociada a la estancia sin crear reserva.
        console.log(
          "Estancia no reservable. Se asocia sin crear reserva en calendario."
        );
      }
    }

    // El resto del código sigue igual, el catch se encargará de responder con el error.

    const { rows } = await client.query(
      `INSERT INTO extraescolares (
        uid, gidnumber, cursos_gids, tipo, titulo, descripcion,
        fecha_inicio, fecha_fin, idperiodo_inicio, idperiodo_fin,
        responsables_uids, ubicacion, coords, updated_by, genera_ausencias, 
        idestancia, fuera_del_centro, id_reserva_estancia
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, $18)
      RETURNING *`,
      [
        usuarioSesion.username,
        data.gidnumber,
        data.cursos_gids,
        data.tipo,
        data.titulo,
        data.descripcion,
        data.fecha_inicio,
        data.fecha_fin,
        data.idperiodo_inicio || null,
        data.idperiodo_fin || null,
        data.responsables_uids,
        esFuera ? data.ubicacion : "",
        esFuera ? data.coords : null,
        usuarioSesion.username,
        data.tipo === "extraescolar" ? true : (data.genera_ausencias ?? false),
        finalEstancia,
        esFuera,
        idReserva,
      ]
    );

    await client.query("COMMIT");
    const actividad = rows[0];

    res.status(201).json({
      ok: true,
      actividad,
      aviso: avisoExtra,
    });

    setImmediate(() => {
      enviarEmailActividad(actividad, "insercion", req.session.ldap);
    });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("[Backend Error]:", err.message);

    res.status(500).json({
      ok: false,
      // Enviamos el mensaje del throw new Error() o uno genérico
      error: err.message || "Error interno del servidor",
    });
  } finally {
    if (client) client.release();
  }
}

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
    // 1. Obtener los datos de la actividad incluyendo id_reserva_estancia
    const { rows } = await client.query(
      `SELECT estado, fecha_inicio, id_reserva_estancia FROM extraescolares WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Actividad no encontrada" });
    }

    const actividad = rows[0];
    const hoy = new Date().toISOString().split("T")[0];
    const fechaActividad = new Date(actividad.fecha_inicio)
      .toISOString()
      .split("T")[0];

    // 2. LÓGICA DE PROTECCIÓN HISTÓRICA
    if (actividad.estado === 1 && fechaActividad < hoy) {
      return res.status(403).json({
        ok: false,
        error:
          "No se puede eliminar una actividad pasada que ya fue aceptada para no alterar el historial de guardias.",
      });
    }

    // 3. TRANSACCIÓN PARA EL BORRADO
    await client.query("BEGIN");

    // Borramos primero las ausencias
    await client.query(
      `DELETE FROM ausencias_profesorado WHERE idextraescolar = $1`,
      [id]
    );

    // Borrar la reserva de la estancia si existía vinculada
    if (actividad.id_reserva_estancia) {
      await client.query(`DELETE FROM reservas_estancias WHERE id = $1`, [
        actividad.id_reserva_estancia,
      ]);
    }

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
      mensaje:
        "Actividad, ausencias y reserva de estancia eliminadas correctamente",
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

    if (
      actividadPrevia.uid !== usuarioSesion.username &&
      usuarioSesion.perfil !== "directiva"
    ) {
      return res.status(403).json({ ok: false, error: "No autorizado" });
    }

    const data = req.body;

    const esFuera =
      data.fuera_del_centro === true || data.fuera_del_centro === "true";
    const finalEstancia = esFuera ? null : data.idestancia || null;

    // LOG CRÍTICO: Comparación de fechas

    const esMultidia = data.fecha_inicio !== data.fecha_fin;

    await client.query("BEGIN");

    // 1. Eliminar reserva antigua si existía
    if (actividadPrevia.id_reserva_estancia) {
      await client.query(`DELETE FROM reservas_estancias WHERE id = $1`, [
        actividadPrevia.id_reserva_estancia,
      ]);
    }

    // 2. Intentar nueva reserva
    let idReserva = null;
    let avisoExtra = null;

    if (!esFuera && finalEstancia) {
      // 1. Primero comprobamos si es reservable
      const { rows: estanciaInfo } = await client.query(
        "SELECT reservable FROM estancias WHERE id = $1",
        [finalEstancia]
      );
      const esReservable = estanciaInfo[0]?.reservable || false;

      if (esReservable) {
        // 2. SOLO si es reservable, aplicamos las restricciones
        if (esMultidia) {
          throw new Error(
            "Las actividades multidía con estancias RESERVABLES requieren gestión manual. Por favor, desmarca la estancia o cambia las fechas."
          );
        } else {
          console.log("Rama UN SOLO DÍA (Reservable): Gestionando reserva...");
          const { id_reserva, conflicto } = await gestionarReservaEstancia(
            client,
            data,
            actividadPrevia.uid
          );

          if (conflicto) {
            throw new Error(
              "La estancia seleccionada ya está ocupada para esa fecha/hora. Elige otra o cambia el horario."
            );
          }
          idReserva = id_reserva;
        }
      } else {
        // 3. Si NO es reservable, no hacemos nada más. idReserva se queda en null
        // y se guardará la actividad asociada a la estancia sin crear reserva.
        console.log(
          "Estancia no reservable. Se asocia sin crear reserva en calendario."
        );
      }
    } else {
      console.log(
        "No se intenta reserva: es fuera del centro o no hay estancia."
      );
    }
    // 3. Update de la actividad
    const { rows } = await client.query(
      `UPDATE extraescolares
       SET gidnumber = $1, cursos_gids = $2, tipo = $3, titulo = $4,
           descripcion = $5, fecha_inicio = $6, fecha_fin = $7,
           idperiodo_inicio = $8, idperiodo_fin = $9, responsables_uids = $10,
           ubicacion = $11, coords = $12, updated_by = $13, genera_ausencias = $14,
           idestancia = $15, fuera_del_centro = $16, id_reserva_estancia = $17
       WHERE id = $18 RETURNING *`,
      [
        data.gidnumber,
        data.cursos_gids,
        data.tipo,
        data.titulo,
        data.descripcion,
        data.fecha_inicio,
        data.fecha_fin,
        data.idperiodo_inicio || null,
        data.idperiodo_fin || null,
        data.responsables_uids,
        esFuera ? data.ubicacion : "",
        esFuera ? data.coords : null,
        usuarioSesion.username,
        data.tipo === "extraescolar" ? true : (data.genera_ausencias ?? false),
        finalEstancia,
        esFuera,
        idReserva,
        id,
      ]
    );

    const actividadActualizada = rows[0];

    // Sincronizar ausencias si ya estaba aceptada
    if (actividadPrevia.estado === 1) {
      console.log("Sincronizando ausencias...");
      await client.query(
        `DELETE FROM ausencias_profesorado WHERE idextraescolar = $1`,
        [id]
      );
      if (actividadActualizada.genera_ausencias) {
        await sincronizarAusenciasActividad(actividadActualizada, client);
      }
    }

    await client.query("COMMIT");
    console.log("COMMIT realizado. Aviso final a enviar:", avisoExtra);
    console.log("--- DEBUG UPDATE END ---");

    res.json({ ok: true, actividad: actividadActualizada, aviso: avisoExtra });

    setImmediate(() => {
      enviarEmailActividad(actividadActualizada, "edicion", req.session.ldap);
    });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("[Backend Error]:", err.message);

    res.status(500).json({
      ok: false,
      // Enviamos el mensaje del throw new Error() o uno genérico
      error: err.message || "Error interno del servidor",
    });
  } finally {
    if (client) client.release();
  }
}

/**
 * Validación de datos
 */
function validarActividad(body) {
  const errores = [];

  // =========================
  // CAMPOS BÁSICOS
  // =========================
  if (!body.titulo || body.titulo.trim().length < 10) {
    errores.push("El título es demasiado corto (mínimo 10 caracteres)");
  }

  if (!body.descripcion || body.descripcion.trim().length < 15) {
    errores.push("La descripción es demasiado corta (mínimo 15 caracteres)");
  }

  if (typeof body.gidnumber !== "number" || body.gidnumber < 1) {
    errores.push("Departamento inválido");
  }

  if (!["complementaria", "extraescolar"].includes(body.tipo)) {
    errores.push("Tipo de actividad inválido");
  }

  if (!body.fecha_inicio || !body.fecha_fin) {
    errores.push("Fechas obligatorias");
  }

  // =========================
  // RESPONSABLES
  // =========================
  const responsablesValidos = Array.isArray(body.responsables_uids)
    ? body.responsables_uids.filter(
        (uid) => typeof uid === "string" && uid.trim() !== ""
      )
    : [];

  if (responsablesValidos.length === 0) {
    errores.push("Debe indicar al menos un profesor responsable");
  }

  // =========================
  // UBICACIÓN
  // =========================
  // Forzamos que fuera_del_centro sea booleano (si viene como string del form)
  const esFuera =
    body.fuera_del_centro === true || body.fuera_del_centro === "true";

  if (!esFuera) {
    // CASO: DENTRO DEL CENTRO
    // Puede tener estancia o no
    // Pero si la tiene, debe ser un número válido
    if (body.idestancia && isNaN(Number(body.idestancia))) {
      errores.push("La estancia seleccionada no es válida");
    }

    // Forzamos limpieza de datos de fuera (opcional, pero recomendado)
    // Si es en el centro, ignoramos ubicación y coordenadas
  } else {
    // CASO: FUERA DEL CENTRO
    if (!body.ubicacion || body.ubicacion.trim().length < 5) {
      errores.push(
        "Para actividades fuera del centro, debe indicar una ubicación o dirección válida"
      );
    }
    // para validar coordenadas
    if (!body.coords || (body.coords.lat === 0 && body.coords.lng === 0)) {
      // errores.push("Debe marcar el punto en el mapa");
    }
  }

  // =========================
  // PERIODOS
  // =========================
  if (body.tipo === "complementaria") {
    if (!body.idperiodo_inicio || !body.idperiodo_fin) {
      errores.push("Debe indicar periodos en actividades complementarias");
    }
  }

  return errores;
}

/**
 * Función unificada para enviar avisos de actividades
 * @param {Object} actividad - El objeto de la actividad desde la DB
 * @param {String} origen - 'insercion', 'edicion' o 'estado'
 * @param {Object} ldapSession - La sesión LDAP para buscar nombres
 */
async function enviarEmailActividad(actividad, origen, ldapSession) {
  try {
    // 1. Obtener configuración de avisos
    const { rows: avisos } = await db.query(
      `SELECT emails, avisar_profesores FROM avisos WHERE modulo = 'extraescolares' LIMIT 1`
    );

    const configAviso = avisos[0] || {};
    const emailsDirectiva = (configAviso.emails || [])
      .map((e) => e.trim())
      .filter(Boolean);
    const avisarProfe = configAviso.avisar_profesores === true;

    // 2. Obtener emails de todos los implicados (Organizador + Responsables)
    // Combinamos uid (organizador) con los elementos del array responsables_uids
    const todosUids = [actividad.uid, ...(actividad.responsables_uids || [])];

    // Eliminamos duplicados por si el organizador también está en responsables_uids
    const uidsUnicos = [...new Set(todosUids)];

    // Buscamos los emails de todos ellos en una sola consulta
    const { rows: empRows } = await db.query(
      "SELECT email FROM empleados WHERE uid = ANY($1)",
      [uidsUnicos]
    );

    const emailsProfesores = empRows
      .map((r) => r.email)
      .filter((email) => email && email.includes("@"));

    // 3. Preparar destinatarios
    let destinatarios = [...emailsDirectiva];

    // Solo añadimos a los profes si es cambio de estado y el flag está activo
    if (avisarProfe && origen === "estado") {
      destinatarios.push(...emailsProfesores);
    }

    // Eliminamos duplicados en la lista final (por si un email está en Directiva y también es Profe)
    destinatarios = [...new Set(destinatarios)];

    if (!destinatarios.length) return;

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

    // 2.5 Lógica de Ubicación para el Email
    let textoUbicacion = "";
    if (actividad.fuera_del_centro) {
      textoUbicacion = `🚶 <b>Fuera del centro:</b> ${actividad.ubicacion || "Ubicación no especificada"}`;
    } else {
      // Si es en el centro, intentamos obtener el nombre de la estancia
      let nombreEstancia = "Recinto del centro";
      if (actividad.idestancia) {
        const { rows: stRows } = await db.query(
          `SELECT descripcion FROM estancias WHERE id = $1`,
          [actividad.idestancia]
        );
        if (stRows.length > 0) nombreEstancia = stRows[0].descripcion;
      }
      textoUbicacion = `🏫 <b>En el centro:</b> ${nombreEstancia}`;
    }

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
      from: `"Gestión IES"`,
      to: destinatarios.join(", "),
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
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; width: 130px;"><b>📍 Ubicación:</b></td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${textoUbicacion}</td></tr>
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
            Este es un mensaje automático del Sistema de Gestión.<br>
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
