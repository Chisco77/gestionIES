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
 * ================================================================
 */
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

    // Obtener todos los grupos de tipo school_class
    const grupos = await obtenerGruposPorTipo(ldapSession, "school_class");
    grupos.forEach((g) => {
      gruposCache[String(g.gidNumber)] = g.cn;
    });

    // ========================================
    // Filtros desde query
    // ========================================
    const { uid, gidnumber, curso_academico, dia_semana } = req.query;
    const filtros = [];
    const vals = [];
    let i = 0;

    if (uid) {
      filtros.push(`h.uid = $${++i}`);
      vals.push(uid);
    }
    if (gidnumber) {
      filtros.push(`h.gidnumber = $${++i}`);
      vals.push(Number(gidnumber));
    }
    if (curso_academico) {
      filtros.push(`h.curso_academico = $${++i}`);
      vals.push(curso_academico);
    }
    if (dia_semana) {
      filtros.push(`h.dia_semana = $${++i}`);
      vals.push(Number(dia_semana));
    }

    const where = filtros.length ? "WHERE " + filtros.join(" AND ") : "";

    const { rows } = await db.query(
      `SELECT h.*, 
              m.nombre AS materia_nombre,
              e.descripcion AS estancia_descripcion
       FROM horario_profesorado h
       LEFT JOIN materias m ON h.idmateria = m.id
       LEFT JOIN estancias e ON h.idestancia = e.id
       ${where}
       ORDER BY h.uid, h.dia_semana, h.idperiodo ASC`,
      vals
    );

    const uidsUnicos = Array.from(
      new Set(rows.map((r) => r.uid).filter(Boolean))
    );
    await Promise.all(uidsUnicos.map((u) => getNombreProfesor(u)));

    const enriquecido = rows.map((item) => ({
      ...item,
      nombreProfesor: usuariosCache[item.uid] || "Profesor desconocido",
      grupo: item.gidnumber
        ? gruposCache[String(item.gidnumber)] || "Grupo desconocido"
        : null,
      materia: item.materia_nombre || "Materia desconocida",
      estancia: item.estancia_descripcion || "Estancia desconocida",
    }));

    res.json({ ok: true, horario: enriquecido });
  } catch (err) {
    console.error("[getHorarioProfesoradoEnriquecido] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error obteniendo horario del profesorado" });
  }
}

/**
 * Insertar nueva fila de horario
 */
async function insertHorarioProfesorado(req, res) {
  try {
    const usuarioSesion = req.session?.user;
    if (!usuarioSesion)
      return res.status(401).json({ ok: false, error: "No autenticado" });

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

    // 🔒 Validaciones básicas
    if (!uid || !dia_semana || !idperiodo) {
      return res.status(400).json({
        ok: false,
        error: "uid, dia_semana e idperiodo son obligatorios",
      });
    }

    if (dia_semana < 1 || dia_semana > 5) {
      return res.status(400).json({
        ok: false,
        error: "dia_semana debe estar entre 1 y 5",
      });
    }

    //  VALIDACIÓN CLAVE: evitar duplicados
    const { rows: existentes } = await db.query(
      `SELECT id FROM horario_profesorado
       WHERE uid=$1 AND dia_semana=$2 AND idperiodo=$3`,
      [uid, dia_semana, idperiodo]
    );

    if (existentes.length > 0) {
      return res.status(409).json({
        ok: false,
        error: "Ya existe una sesión en ese día y periodo",
      });
    }

    // validar tipo
    const TIPOS_VALIDOS = ["lectiva", "tutores", "guardia", "departamento"];

    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        ok: false,
        error: "Tipo inválido",
      });
    }

    // normalización según tipo
    let gid = gidnumber || null;
    let mat = idmateria || null;
    let est = idestancia || null;

    if (tipo === "tutores" || tipo === "guardia" || tipo === "departamento") {
      gid = null;
      mat = null;
      est = null;
    }

    //  validación tipo lectiva
    if (tipo === "lectiva") {
      if (!gid || !mat) {
        return res.status(400).json({
          ok: false,
          error: "Las sesiones lectivas requieren grupo y materia",
        });
      }
    }

    const { rows } = await db.query(
      `INSERT INTO horario_profesorado (
        uid, dia_semana, idperiodo, tipo, gidnumber, idmateria, idestancia, curso_academico
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [uid, dia_semana, idperiodo, tipo, gid, mat, est, curso_academico]
    );

    res.status(201).json({ ok: true, fila: rows[0] });
  } catch (err) {
    console.error("[insertHorarioProfesorado] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error insertando fila de horario" });
  }
}

/**
 * Actualizar fila de horario
 */
async function updateHorarioProfesorado(req, res) {
  try {
    const id = req.params.id;
    const usuarioSesion = req.session?.user;

    if (!usuarioSesion)
      return res.status(401).json({ ok: false, error: "No autenticado" });

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

    //  comprobar que la fila existe
    const { rows: filaActual } = await db.query(
      `SELECT * FROM horario_profesorado WHERE id=$1`,
      [id]
    );

    if (!filaActual[0]) {
      return res.status(404).json({
        ok: false,
        error: "Fila no encontrada",
      });
    }

    //  evitar duplicado (excepto a sí misma)
    const { rows: duplicados } = await db.query(
      `SELECT id FROM horario_profesorado
       WHERE uid=$1 AND dia_semana=$2 AND idperiodo=$3 AND id<>$4`,
      [uid, dia_semana, idperiodo, id]
    );

    if (duplicados.length > 0) {
      return res.status(409).json({
        ok: false,
        error: "Ya existe otra sesión en ese día y periodo",
      });
    }

    const TIPOS_VALIDOS = ["lectiva", "tutores", "guardia", "departamento"];

    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        ok: false,
        error: "Tipo inválido",
      });
    }

    let gid = gidnumber || null;
    let mat = idmateria || null;
    let est = idestancia || null;

    if (tipo === "tutores" || tipo === "guardia" || tipo === "departamento") {
      gid = null;
      mat = null;
      est = null;
    }

    if (tipo === "lectiva") {
      if (!gid || !mat) {
        return res.status(400).json({
          ok: false,
          error: "Las sesiones lectivas requieren grupo y materia",
        });
      }
    }

    const { rows } = await db.query(
      `UPDATE horario_profesorado
       SET uid=$1, dia_semana=$2, idperiodo=$3, tipo=$4, gidnumber=$5, idmateria=$6, idestancia=$7, curso_academico=$8
       WHERE id=$9
       RETURNING *`,
      [uid, dia_semana, idperiodo, tipo, gid, mat, est, curso_academico, id]
    );

    res.json({ ok: true, fila: rows[0] });
  } catch (err) {
    console.error("[updateHorarioProfesorado] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error actualizando fila de horario" });
  }
}

/**
 * Duplicar horario de un profesor a otro
 */
async function duplicarHorarioProfesorado(req, res) {
  try {
    const usuarioSesion = req.session?.user;
    if (!usuarioSesion)
      return res.status(401).json({ ok: false, error: "No autenticado" });

    const { uidOrigen, uidDestino, curso_academico } = req.body;

    if (!uidOrigen || !uidDestino)
      return res
        .status(400)
        .json({ ok: false, error: "uidOrigen y uidDestino son obligatorios" });

    const filtros = ["uid = $1"];
    const vals = [uidOrigen];
    if (curso_academico) {
      filtros.push("curso_academico = $2");
      vals.push(curso_academico);
    }

    const { rows: filasOrigen } = await db.query(
      `SELECT * FROM horario_profesorado WHERE ${filtros.join(" AND ")}`,
      vals
    );

    if (!filasOrigen.length)
      return res
        .status(404)
        .json({ ok: false, error: "No hay horario para el profesor origen" });

    const insertPromises = filasOrigen.map((f) =>
      db.query(
        `INSERT INTO horario_profesorado
         (uid, dia_semana, idperiodo, tipo, gidnumber, idmateria, idestancia, curso_academico)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [
          uidDestino,
          f.dia_semana,
          f.idperiodo,
          f.tipo,
          f.gidnumber,
          f.idmateria,
          f.idestancia,
          f.curso_academico,
        ]
      )
    );

    const filasDuplicadas = await Promise.all(insertPromises);

    res.status(201).json({
      ok: true,
      duplicadas: filasDuplicadas.map((r) => r.rows?.[0] || null),
      total: filasDuplicadas.length,
    });
  } catch (err) {
    console.error("[duplicarHorarioProfesorado] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error duplicando horario del profesorado" });
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
      [id]
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

module.exports = {
  getHorarioProfesoradoEnriquecido,
  insertHorarioProfesorado,
  updateHorarioProfesorado,
  deleteHorarioProfesorado,
  duplicarHorarioProfesorado,
};
