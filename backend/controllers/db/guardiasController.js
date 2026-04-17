const db = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");
const { obtenerGruposPorTipo } = require("../ldap/gruposController");
const { getCursoActual } = require("../../utils/fechas");

/**
 * PASO 5: Criterio de Equidad
 * Obtiene el conteo de guardias confirmadas y activas por profesor
 */
async function getContadorGuardias() {
  const query = `
  SELECT uid_profesor_cubridor, COUNT(DISTINCT (fecha, idperiodo)) as total
  FROM guardias_asignadas
  WHERE confirmada = true AND estado = 'activa'
  GROUP BY uid_profesor_cubridor
`;
  const { rows } = await db.query(query);
  return rows.reduce((acc, r) => {
    acc[r.uid_profesor_cubridor] = parseInt(r.total);
    return acc;
  }, {});
}

async function simularGuardiasDia(req, res) {
  const { fecha } = req.params;

  // LOG
  console.log(
    "LOG 7: [Controller] ¿Existe req.session.ldap?:",
    !!req.session?.ldap
  );
  if (req.session?.ldap) {
    console.log("LOG 8: [Controller] UID en sesión:", req.session.ldap.uid);
  }
  const ldapSession = req.session?.ldap;

  try {
    const diaSemana = new Date(fecha).getDay();
    // Si tu base de datos usa 1 (Lunes) a 7 (Domingo), recuerda ajustar:
    // const diaSemanaISO = diaSemana === 0 ? 7 : diaSemana;

    // 1. Caches para no saturar LDAP/DB
    const usuariosCache = {};
    const gruposCache = {};

    // 2. Cargar Grupos (school_class) para traducir gidnumber
    console.log("LOG 9: [Controller] Llamando a obtenerGruposPorTipo...");
    const grupos = await obtenerGruposPorTipo(ldapSession, "school_class");
    grupos.forEach((g) => {
      gruposCache[String(g.gidNumber)] = g.cn;
    });

    // Función auxiliar para nombres de profesores
    const getNombreProfesor = async (uid) => {
      if (!uid) return "Desconocido";
      if (usuariosCache[uid]) return usuariosCache[uid];
      return new Promise((resolve) => {
        buscarPorUid(ldapSession, uid, (err, datos) => {
          const nombre =
            !err && datos
              ? `${datos.sn || ""}, ${datos.givenName || ""}`.trim()
              : uid;
          usuariosCache[uid] = nombre;
          resolve(nombre);
        });
      });
    };

    // 3. Obtener ausencias y guardias ya confirmadas
    const { rows: ausencias } = await db.query(
      `SELECT a.* FROM ausencias_profesorado a 
       WHERE fecha_inicio <= $1 AND (fecha_fin IS NULL OR fecha_fin >= $1)`,
      [fecha]
    );

    const { rows: confirmadas } = await db.query(
      `SELECT * FROM guardias_asignadas WHERE fecha = $1 AND estado = 'activa'`,
      [fecha]
    );

    // 4. Obtener contadores de guardias para la equidad
    const { rows: contadoresRows } = await db.query(
      `SELECT uid_profesor_cubridor, COUNT(*) as total 
       FROM guardias_asignadas GROUP BY uid_profesor_cubridor`
    );
    const contadores = {};
    contadoresRows.forEach(
      (r) => (contadores[r.uid_profesor_cubridor] = parseInt(r.total))
    );

    let simulacion = [];

    // 5. Procesar cada ausencia
    for (const ausencia of ausencias) {
      // Traemos el horario del ausente para ese día, filtrando por lectiva/guardia
      const { rows: horarioAusente } = await db.query(
        `SELECT h.*, m.nombre AS materia_nombre, e.descripcion AS estancia_nombre, p.nombre as nombre_periodo
         FROM horario_profesorado h
         LEFT JOIN materias m ON h.idmateria = m.id
         LEFT JOIN estancias e ON h.idestancia = e.id
         LEFT JOIN periodos_horarios p ON h.idperiodo = p.id
         WHERE h.uid = $1 AND h.dia_semana = $2 AND (h.tipo = 'lectiva' OR h.tipo = 'guardia')`,
        [ausencia.uid_profesor, diaSemana]
      );

      for (const slot of horarioAusente) {
        // FILTRO: ¿Esta hora está dentro del rango de la ausencia parcial?
        if (
          ausencia.idperiodo_inicio &&
          slot.idperiodo < ausencia.idperiodo_inicio
        )
          continue;
        if (ausencia.idperiodo_fin && slot.idperiodo > ausencia.idperiodo_fin)
          continue;

        // ¿Ya está confirmada?
        const yaConfirmada = confirmadas.find(
          (c) =>
            c.idperiodo === slot.idperiodo &&
            c.uid_profesor_ausente === ausencia.uid_profesor
        );

        if (yaConfirmada) {
          simulacion.push({
            ...yaConfirmada,
            id: yaConfirmada.id,
            tipo: "confirmada",
            nombre_ausente: await getNombreProfesor(ausencia.uid_profesor),
            nombre_cubridor: await getNombreProfesor(
              yaConfirmada.uid_profesor_cubridor
            ),
            materia: slot.materia_nombre || "Guardia",
            aula: slot.estancia_nombre,
            periodo: slot.idperiodo,
            nombre_periodo: slot.nombre_periodo,
          });
          continue;
        }

        // 6. Buscar candidatos (Tienen guardia, no están ausentes y no tienen ya una guardia asignada)
        const { rows: candidatos } = await db.query(
          `SELECT h.uid FROM horario_profesorado h
           WHERE h.dia_semana = $1 AND h.idperiodo = $2 AND h.tipo = 'guardia'
           AND h.uid NOT IN (
              SELECT uid_profesor FROM ausencias_profesorado 
              WHERE fecha_inicio <= $3 AND (fecha_fin IS NULL OR fecha_fin >= $3)
           )
           AND h.uid NOT IN (
              SELECT uid_profesor_cubridor FROM guardias_asignadas
              WHERE fecha = $3 AND idperiodo = $2 AND estado = 'activa'
           )`,
          [diaSemana, slot.idperiodo, fecha]
        );

        const candidatosEnriquecidos = await Promise.all(
          candidatos.map(async (c) => ({
            uid: c.uid,
            nombre: await getNombreProfesor(c.uid),
            guardias: contadores[c.uid] || 0,
          }))
        );

        candidatosEnriquecidos.sort((a, b) => a.guardias - b.guardias);

        // Traducir gidnumber a nombres de grupos
        const nombresGrupos = Array.isArray(slot.gidnumber)
          ? slot.gidnumber.map((g) => gruposCache[String(g)] || `G:${g}`)
          : [];

        simulacion.push({
          tipo: "propuesta",
          idausencia: ausencia.id,
          periodo: slot.idperiodo,
          uid_ausente: ausencia.uid_profesor,
          nombre_periodo: slot.nombre_periodo,
          nombre_ausente: await getNombreProfesor(ausencia.uid_profesor),
          materia:
            slot.materia_nombre ||
            (slot.tipo === "guardia" ? "Guardia propia" : "S/M"),
          aula: slot.estancia_nombre || "---",
          grupo: nombresGrupos.join(", "),
          candidatos: candidatosEnriquecidos,
          propuesta: candidatosEnriquecidos[0] || null,
        });
      }
    }

    // Ordenar simulación por periodo
    simulacion.sort((a, b) => a.periodo - b.periodo);

    res.json({ ok: true, simulacion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * AUTOASIGNACIÓN PARA PROFESORES
 */
async function autoasignarGuardia(req, res) {
  const { fecha, idperiodo, uid_profesor_ausente, idausencia, fuerza_doble } =
    req.body; // <-- Recibimos el flag
  console.log("Datos recibidos en el body:", req.body);
  const usuarioSesion = req.session?.user;

  // 1. Control de acceso básico
  if (!usuarioSesion) {
    return res.status(401).json({ ok: false, error: "No autenticado" });
  }

  const uid_cubridor = usuarioSesion.username;

  try {
    const diaSemana = new Date(fecha).getDay();

    console.log("Diasemana, cubridor,periodo: ", diaSemana);
    console.log("Cubridor: ", uid_cubridor);
    console.log("periodo: ", diaSemana);
    // 2. VALIDACIÓN: ¿Tiene el profesor esa hora de guardia en su horario?
    const { rows: horarioPropio } = await db.query(
      `SELECT id FROM horario_profesorado 
       WHERE uid = $1 AND dia_semana = $2 AND idperiodo = $3 AND tipo = 'guardia'`,
      [uid_cubridor, diaSemana, idperiodo]
    );

    if (horarioPropio.length === 0) {
      return res.status(403).json({
        ok: false,
        error:
          "No puedes asignarte esta guardia: no tienes hora de guardia en tu horario para este periodo.",
      });
    }

    // 3. VALIDACIÓN: ¿El profesor que pretende cubrir está ausente?
    // Comprobamos si hay alguna ausencia registrada para ese profesor en esa fecha y periodo
    const { rows: ausenciaCubridor } = await db.query(
      `SELECT id FROM ausencias_profesorado 
       WHERE uid_profesor = $1 
         AND fecha_inicio <= $2 AND (fecha_fin IS NULL OR fecha_fin >= $2)
         AND (
           (idperiodo_inicio IS NULL AND idperiodo_fin IS NULL) -- Día completo
           OR 
           ($3 BETWEEN COALESCE(idperiodo_inicio, 0) AND COALESCE(idperiodo_fin, 99)) -- Periodo concreto
         )`,
      [uid_cubridor, fecha, idperiodo]
    );

    if (ausenciaCubridor.length > 0) {
      return res.status(403).json({
        ok: false,
        error:
          "No puedes autoasignarte una guardia si tienes una ausencia registrada para esa hora.",
      });
    }

    // 4. VALIDACIÓN: ¿Ya está ocupada por otro? (Doble chequeo de seguridad)
    const { rows: yaAsignada } = await db.query(
      `SELECT id FROM guardias_asignadas 
       WHERE fecha = $1 AND idperiodo = $2 AND uid_profesor_ausente = $3 AND estado = 'activa'`,
      [fecha, idperiodo, uid_profesor_ausente]
    );

    if (yaAsignada.length > 0) {
      return res.status(409).json({
        ok: false,
        error: "Lo sentimos, otro compañero acaba de cubrir esta guardia.",
      });
    }

    // VALIDACIÓN: ¿Este profesor ya se ha asignado ESTA HORA específica de esta ausencia?
    const { rows: yaCubreEsteSlot } = await db.query(
      `SELECT id FROM guardias_asignadas 
   WHERE idausencia = $1 
     AND idperiodo = $2 
     AND uid_profesor_cubridor = $3 
     AND estado = 'activa'`,
      [idausencia, idperiodo, uid_cubridor]
    );

    if (yaCubreEsteSlot.length > 0) {
      return res.status(409).json({
        ok: false,
        error:
          "Ya te has asignado la cobertura de esta ausencia para esta hora concreta.",
      });
    }

    // 5. VALIDACIÓN DE DOBLAR GUARDIA
    const { rows: yaTieneOtraGuardia } = await db.query(
      `SELECT id FROM guardias_asignadas 
       WHERE fecha = $1 AND idperiodo = $2 AND uid_profesor_cubridor = $3 AND estado = 'activa'`,
      [fecha, idperiodo, uid_cubridor]
    );

    if (yaTieneOtraGuardia.length > 0 && !fuerza_doble) {
      return res.status(409).json({
        ok: false,
        code: "CONFIRM_REQUIRED", // Código de error personalizado
        error:
          "Ya tienes asignada otra guardia en este periodo. ¿Estás seguro de que quieres cubrir ambas?",
      });
    }

    // 6. INSERCIÓN
    await db.query(
      `INSERT INTO guardias_asignadas 
       (fecha, idperiodo, uid_profesor_ausente, idausencia, uid_profesor_cubridor, estado, forzada)
VALUES ($1, $2, $3, $4, $5, 'activa', $6)`,
      [
        fecha,
        idperiodo,
        uid_profesor_ausente,
        idausencia,
        uid_cubridor,
        !!fuerza_doble,
      ]
    );

    res.json({ ok: true, mensaje: "Guardia autoasignada con éxito" });
  } catch (err) {
    console.error("[autoasignarGuardia] Error crítico:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error interno al procesar la guardia" });
  }
}

async function cancelarAutoasignacion(req, res) {
  const { id_guardia_asignada } = req.params; // ID de la tabla guardias_asignadas
  const usuarioSesion = req.session?.user;

  if (!usuarioSesion) {
    return res.status(401).json({ ok: false, error: "No autenticado" });
  }

  try {
    // 1. Buscamos la guardia para verificar propiedad
    const { rows } = await db.query(
      `SELECT uid_profesor_cubridor, fecha, idperiodo 
       FROM guardias_asignadas WHERE id = $1`,
      [id_guardia_asignada]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "La asignación no existe." });
    }

    const guardia = rows[0];

    // 2. VALIDACIÓN: Solo el dueño o la directiva pueden cancelar
    if (
      guardia.uid_profesor_cubridor !== usuarioSesion.username &&
      usuarioSesion.perfil !== "directiva"
    ) {
      return res.status(403).json({
        ok: false,
        error: "No tienes permiso para cancelar esta asignación.",
      });
    }

    // OPCIONAL: Podrías añadir una validación para que no se pueda cancelar
    // si la hora ya ha pasado o está en curso.

    // 3. Eliminamos la asignación (o cambiamos estado a 'cancelada')
    await db.query(`DELETE FROM guardias_asignadas WHERE id = $1`, [
      id_guardia_asignada,
    ]);

    res.json({
      ok: true,
      mensaje:
        "Guardia liberada correctamente. Ahora otros compañeros pueden cubrirla.",
    });
  } catch (err) {
    console.error("[cancelarAutoasignacion] Error:", err);
    res.status(500).json({ ok: false, error: "Error al liberar la guardia." });
  }
}
/**
 * CONFIRMACIÓN MASIVA DE GUARDIAS (Jefatura)
 */
async function confirmarGuardias(req, res) {
  try {
    const { guardias } = req.body; // Array de propuestas aceptadas
    const uid_asignador = req.session.ldap.uid;

    // Aquí iría el bucle para insertar en guardias_asignadas
    // Por ahora devolvemos un ok para que no falle el servidor
    res.json({ ok: true, mensaje: "Ruta preparada, lógica pendiente" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * profesores de guardia en fecha y periodo indicados por parámetro.
 * Tiene en cuenta que el profesor no esté ausente.
 * @param {*} req
 * @param {*} res
 */
async function getProfesoresDeGuardia(req, res) {
  const { fecha, idperiodo } = req.params;
  const ldapSession = req.session?.ldap;
  const curso = getCursoActual(new Date(fecha));
  const diaSemana = new Date(fecha).getDay();

  try {
    // 1. Obtenemos solo los UIDs y el conteo de la DB
    const query = `
SELECT 
    h.uid, 
    -- Contamos periodos distintos para la equidad (2 clases en 1 hora = 1 guardia)
    (SELECT COUNT(DISTINCT (ga.fecha, ga.idperiodo)) 
     FROM guardias_asignadas ga 
     WHERE ga.uid_profesor_cubridor = h.uid 
     AND ga.fecha BETWEEN $1 AND $2 
     AND ga.estado = 'activa') as total_guardias,
    -- Contamos cuántas tiene asignadas EN ESTE MOMENTO (0, 1 o más)
    (SELECT COUNT(*) 
     FROM guardias_asignadas ga2
     WHERE ga2.uid_profesor_cubridor = h.uid
       AND ga2.fecha = $5
       AND ga2.idperiodo = $4
       AND ga2.estado = 'activa') as num_asignadas_ahora
  FROM horario_profesorado h
  WHERE h.dia_semana = $3 
    AND h.idperiodo = $4 
    AND h.tipo = 'guardia'
    AND NOT EXISTS (
      SELECT 1 FROM ausencias_profesorado aus
      WHERE aus.uid_profesor = h.uid
        AND aus.fecha_inicio <= $5
        AND (aus.fecha_fin IS NULL OR aus.fecha_fin >= $5)
        AND (
          (aus.idperiodo_inicio IS NULL AND aus.idperiodo_fin IS NULL)
          OR 
          ($4 BETWEEN COALESCE(aus.idperiodo_inicio, 0) AND COALESCE(aus.idperiodo_fin, 99))
        )
    )
  ORDER BY total_guardias ASC -- <--- ORDEN ASCENDENTE POR GUARDIAS
`;

    const { rows: uidsDisponibles } = await db.query(query, [
      curso.inicioCurso,
      curso.finCurso,
      diaSemana,
      idperiodo,
      fecha,
    ]);

    // 2. "Humanizar" los resultados con LDAP
    // Usamos una caché local para esta petición para ser eficientes
    const cacheNombres = {};

    const profesEnriquecidos = await Promise.all(
      uidsDisponibles.map(async (row) => {
        return new Promise((resolve) => {
          buscarPorUid(ldapSession, row.uid, (err, datos) => {
            // Objeto base con los datos de la DB
            const baseData = {
              uid: row.uid,
              total_guardias: parseInt(row.total_guardias),
              // Ahora pasamos ambos datos al frontend:
              num_asignadas_ahora: parseInt(row.num_asignadas_ahora),
              ya_asignado: parseInt(row.num_asignadas_ahora) > 0,
            };

            if (!err && datos) {
              resolve({
                ...baseData,
                nombre: datos.givenName || "",
                apellido1: datos.sn || "",
                apellido2: "",
              });
            } else {
              resolve({
                ...baseData,
                nombre: row.uid,
                apellido1: "",
                apellido2: "",
              });
            }
          });
        });
      })
    );

    res.json(profesEnriquecidos);
  } catch (err) {
    console.error("[getProfesoresDeGuardia] Error:", err);
    res.status(500).json({ error: "Error al consultar disponibilidad real" });
  }
}

module.exports = {
  simularGuardiasDia,
  autoasignarGuardia,
  cancelarAutoasignacion,
  confirmarGuardias,
  getProfesoresDeGuardia,
};
