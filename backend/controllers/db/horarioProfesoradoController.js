/**
 * ================================================================
 * Controller: horarioProfesoradoController.js
 * ================================================================
 */

const db = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");
const { obtenerGruposPorTipo } = require("../ldap/gruposController");

/**
 * Obtener horario del profesorado enriquecido
 */
// Backend: getHorarioProfesoradoEnriquecido.js

async function getHorarioProfesoradoEnriquecido(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession)
      return res
        .status(401)
        .json({ ok: false, error: "No autenticado en LDAP" });

    const usuariosCache = {};
    const gruposCache = {};

    const getNombreProfesor = (uid) =>
      new Promise((resolve) => {
        if (!uid) return resolve("Profesor desconocido");
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

    // Obtenemos los grupos del tipo school_class
    const grupos = await obtenerGruposPorTipo(ldapSession, "school_class");
    grupos.forEach((g) => {
      gruposCache[String(g.gidNumber)] = g.cn;
    });

    // Obtenemos los parámetros de consulta
    let { uid, gidnumber, curso_academico, dia_semana } = req.query;

    // Aseguramos que uid sea un array
    if (!uid) uid = [];
    else if (!Array.isArray(uid)) uid = [uid];

    const filtros = [];
    const vals = [];
    let i = 0;

    // Filtro por UIDs usando IN
    if (uid.length) {
      const placeholders = uid.map(() => `$${++i}`).join(", ");
      filtros.push(`h.uid IN (${placeholders})`);
      vals.push(...uid);
    }

    // Filtro por gidnumber (usa ANY para arrays)
    if (gidnumber) {
      filtros.push(`$${++i} = ANY(h.gidnumber)`);
      vals.push(Number(gidnumber));
    }

    // Filtro por curso_academico
    if (curso_academico) {
      filtros.push(`h.curso_academico = $${++i}`);
      vals.push(curso_academico);
    }

    // Filtro por dia_semana
    if (dia_semana) {
      filtros.push(`h.dia_semana = $${++i}`);
      vals.push(Number(dia_semana));
    }

    const where = filtros.length ? "WHERE " + filtros.join(" AND ") : "";


    // Consulta principal con ordenación cronológica real
    const { rows } = await db.query(
      `SELECT h.*, 
          m.nombre AS materia_nombre,
          e.descripcion AS estancia_descripcion,
          p.inicio, 
          p.fin,
          p.nombre AS periodo_nombre
   FROM horario_profesorado h
   INNER JOIN periodos_horarios p ON h.idperiodo = p.id
   LEFT JOIN materias m ON h.idmateria = m.id
   LEFT JOIN estancias e ON h.idestancia = e.id
   ${where}
   ORDER BY h.uid, h.dia_semana, p.inicio ASC`,
      vals,
    );

    // Obtenemos los nombres de los profesores desde LDAP
    const uidsUnicos = Array.from(
      new Set(rows.map((r) => r.uid).filter(Boolean)),
    );
    await Promise.all(uidsUnicos.map((u) => getNombreProfesor(u)));

    // Enriquecemos los datos
    const enriquecido = rows.map((item) => {
      let nombresGrupos = [];
      if (Array.isArray(item.gidnumber)) {
        nombresGrupos = item.gidnumber.map(
          (g) => gruposCache[String(g)] || `Grupo ${g}`,
        );
      }

      return {
        ...item,
        nombreProfesor: usuariosCache[item.uid] || "Profesor desconocido",
        grupos_nombres: nombresGrupos,
        grupo: nombresGrupos.join(", ") || null,
        materia: item.materia_nombre || "Materia desconocida",
        estancia: item.estancia_descripcion || "Estancia desconocida",
      };
    });

    res.json({ ok: true, horario: enriquecido });
  } catch (err) {
    console.error("[getHorarioProfesoradoEnriquecido] Error:", err);
    res.status(500).json({ ok: false, error: "Error obteniendo horario" });
  }
}

module.exports = { getHorarioProfesoradoEnriquecido };

/**
 * Insertar nueva fila
 */
async function insertHorarioProfesorado(req, res) {
  try {
    const {
      uid,
      dia_semana,
      idperiodo,
      tipo,
      gidnumber,
      idmateria,
      idestancia,
      curso_academico,
    } = req.body;

    if (!uid || !dia_semana || !idperiodo) {
      return res.status(400).json({
        ok: false,
        error: "uid, dia_semana e idperiodo son obligatorios",
      });
    }

    // CAMBIO: Asegurar que gidnumber sea un array si viene informado
    let gid = Array.isArray(gidnumber)
      ? gidnumber
      : gidnumber
        ? [Number(gidnumber)]
        : null;

    // Lógica de limpieza según tipo
    if (["tutores", "guardia", "departamento"].includes(tipo)) {
      gid = null;
    }

    if (tipo === "lectiva" && (!gid || gid.length === 0)) {
      return res.status(400).json({
        ok: false,
        error: "Las sesiones lectivas requieren al menos un grupo",
      });
    }

    const { rows } = await db.query(
      `INSERT INTO horario_profesorado (
        uid, dia_semana, idperiodo, tipo, gidnumber, idmateria, idestancia, curso_academico
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        uid,
        dia_semana,
        idperiodo,
        tipo,
        gid,
        idmateria || null,
        idestancia || null,
        curso_academico,
      ],
    );

    res.status(201).json({ ok: true, fila: rows[0] });
  } catch (err) {
    console.error("[insertHorarioProfesorado] Error:", err);
    res.status(500).json({ ok: false, error: "Error insertando fila" });
  }
}

/**
 * Actualizar fila
 */
async function updateHorarioProfesorado(req, res) {
  try {
    const id = req.params.id;
    const {
      uid,
      dia_semana,
      idperiodo,
      tipo,
      gidnumber,
      idmateria,
      idestancia,
      curso_academico,
    } = req.body;

    // CAMBIO: Normalizar gidnumber a array
    let gid = Array.isArray(gidnumber)
      ? gidnumber
      : gidnumber
        ? [Number(gidnumber)]
        : null;

    if (["tutores", "guardia", "departamento"].includes(tipo)) gid = null;

    const { rows } = await db.query(
      `UPDATE horario_profesorado
       SET uid=$1, dia_semana=$2, idperiodo=$3, tipo=$4, gidnumber=$5, idmateria=$6, idestancia=$7, curso_academico=$8
       WHERE id=$9
       RETURNING *`,
      [
        uid,
        dia_semana,
        idperiodo,
        tipo,
        gid,
        idmateria || null,
        idestancia || null,
        curso_academico,
        id,
      ],
    );

    res.json({ ok: true, fila: rows[0] });
  } catch (err) {
    console.error("[updateHorarioProfesorado] Error:", err);
    res.status(500).json({ ok: false, error: "Error actualizando fila" });
  }
}

/**
 * Duplicar horario de un profesor a otro con validaciones
 */
async function duplicarHorarioProfesorado(req, res) {
  try {
    const usuarioSesion = req.session?.user;
    if (!usuarioSesion)
      return res.status(401).json({ ok: false, error: "No autenticado" });

    const { uidOrigen, uidDestino, curso_academico } = req.body;

    if (!uidOrigen || !uidDestino || !curso_academico) {
      return res.status(400).json({
        ok: false,
        error: "uidOrigen, uidDestino y curso_academico son obligatorios",
      });
    }

    if (uidOrigen === uidDestino) {
      return res.status(400).json({
        ok: false,
        error: "El profesor origen y destino no pueden ser el mismo",
      });
    }

    // 1. Obtener el horario del profesor origen
    const { rows: filasOrigen } = await db.query(
      `SELECT * FROM horario_profesorado WHERE uid = $1 AND curso_academico = $2`,
      [uidOrigen, curso_academico],
    );

    if (filasOrigen.length === 0) {
      return res.status(404).json({
        ok: false,
        error:
          "No se encontró horario para el profesor origen en el curso especificado",
      });
    }

    // 2. Validar que el profesor destino NO tenga ya un horario (evitar colisiones)
    const { rows: filasDestino } = await db.query(
      `SELECT id FROM horario_profesorado WHERE uid = $1 AND curso_academico = $2 LIMIT 1`,
      [uidDestino, curso_academico],
    );

    if (filasDestino.length > 0) {
      return res.status(409).json({
        ok: false,
        error:
          "El profesor destino ya tiene un horario asignado en este curso. Bórralo primero si quieres duplicar.",
      });
    }

    // 3. Ejecutar las inserciones
    // Nota: f.gidnumber ya viene como array desde la DB, así que se inserta directamente de forma correcta.
    const insertPromises = filasOrigen.map((f) => {
      return db.query(
        `INSERT INTO horario_profesorado (
          uid, dia_semana, idperiodo, tipo, gidnumber, idmateria, idestancia, curso_academico
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          uidDestino,
          f.dia_semana,
          f.idperiodo,
          f.tipo,
          f.gidnumber, // Se mantiene como array integer[]
          f.idmateria,
          f.idestancia,
          f.curso_academico,
        ],
      );
    });

    const resultados = await Promise.all(insertPromises);

    res.status(201).json({
      ok: true,
      mensaje: `Se han duplicado ${resultados.length} sesiones correctamente`,
      total: resultados.length,
      filas: resultados.map((r) => r.rows[0]),
    });
  } catch (err) {
    console.error("[duplicarHorarioProfesorado] Error:", err);
    res.status(500).json({
      ok: false,
      error: "Error interno al intentar duplicar el horario",
    });
  }
}

/**
 * Borrar fila de horario
 */
async function deleteHorarioProfesorado(req, res) {
  try {
    const id = req.params.id;
    const usuarioSesion = req.session?.user;

    if (!usuarioSesion)
      return res.status(401).json({ ok: false, error: "No autenticado" });

    // 🔍 comprobar existencia previa
    const { rows } = await db.query(
      `SELECT * FROM horario_profesorado WHERE id=$1`,
      [id],
    );

    if (!rows[0]) {
      return res.status(404).json({
        ok: false,
        error: "Fila no encontrada",
      });
    }

    await db.query(`DELETE FROM horario_profesorado WHERE id=$1`, [id]);

    res.json({ ok: true });
  } catch (err) {
    console.error("[deleteHorarioProfesorado] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error borrando fila de horario" });
  }
}

/**
 * Insertar cuadrante completo de guardias
 */
async function insertCuadranteGuardias(req, res) {
  try {
    const usuarioSesion = req.session?.user;
    if (!usuarioSesion)
      return res.status(401).json({ ok: false, error: "No autenticado" });

    const { cuadrante, curso_academico } = req.body;

    if (!curso_academico) {
      return res
        .status(400)
        .json({ ok: false, error: "curso_academico es obligatorio" });
    }

    // 1️⃣ Borramos las guardias actuales del curso para reinsertar el nuevo estado
    await db.query(
      `DELETE FROM horario_profesorado WHERE tipo='guardia' AND curso_academico=$1`,
      [curso_academico],
    );

    const insertPromises = [];

    // 2️⃣ Recorremos el objeto cuadrante que envía el Front
    Object.entries(cuadrante).forEach(([clave, profesores]) => {
      const [idperiodo, dIndexStr] = clave.split("-");
      const dia_semana = Number(dIndexStr) + 1;

      profesores.forEach((p) => {
        // IMPORTANTE: Extraemos el id de la estancia si existe (puede venir como objeto o id directo)
        const idestancia = p.estancia?.id || p.idestancia || null;

        insertPromises.push(
          db.query(
            `INSERT INTO horario_profesorado 
             (uid, dia_semana, idperiodo, tipo, idestancia, idmateria, gidnumber, curso_academico) 
             VALUES ($1, $2, $3, 'guardia', $4, $5, $6, $7) 
             RETURNING *`,
            [
              p.uid,
              dia_semana,
              idperiodo,
              idestancia,
              p.idmateria || null,
              p.gidnumber || null,
              curso_academico,
            ],
          ),
        );
      });
    });

    const resultados = await Promise.all(insertPromises);
    const filasNuevas = resultados.map((r) => r.rows[0]);

    // 3️⃣ RECONSTRUIMOS EL OBJETO para el Frontend (para que el setGuardias no pierda datos)
    const cuadranteActualizado = {};

    filasNuevas.forEach((fila) => {
      const clave = `${fila.idperiodo}-${fila.dia_semana - 1}`;
      if (!cuadranteActualizado[clave]) cuadranteActualizado[clave] = [];

      // Buscamos los datos del profesor original en el body para no perder el nombre
      const profeOriginal = cuadrante[clave]?.find(
        (orig) => orig.uid === fila.uid,
      );

      cuadranteActualizado[clave].push({
        id_registro: fila.id, // El nuevo ID real de la BD
        uid: fila.uid,
        givenName: profeOriginal?.givenName || "",
        sn: profeOriginal?.sn || "",
        estancia: profeOriginal?.estancia || null, // Mantenemos el objeto estancia para el diálogo
        idmateria: fila.idmateria,
        gidnumber: fila.gidnumber || [],
      });
    });

    res.status(201).json({
      ok: true,
      cuadranteActualizado, // 👈 El Front hará setGuardias(data.cuadranteActualizado)
    });
  } catch (err) {
    console.error("[insertCuadranteGuardias] Error:", err);
    res.status(500).json({ ok: false, error: "Error al sincronizar guardias" });
  }
}

async function deleteCuadranteGuardias(req, res) {
  try {
    const { curso_academico } = req.body;
    if (!curso_academico)
      return res.status(400).json({ ok: false, error: "Curso requerido" });

    await db.query(
      `DELETE FROM horario_profesorado WHERE tipo='guardia' AND curso_academico=$1`,
      [curso_academico],
    );

    res.json({ ok: true, message: "Cuadrante borrado correctamente" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  getHorarioProfesoradoEnriquecido,
  insertHorarioProfesorado,
  updateHorarioProfesorado,
  deleteHorarioProfesorado,
  duplicarHorarioProfesorado,
  insertCuadranteGuardias,
  deleteCuadranteGuardias,
};
