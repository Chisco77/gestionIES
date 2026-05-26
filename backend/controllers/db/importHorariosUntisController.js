const fs = require("fs");
const db = require("../../db");

const { parseHorariosCSV } = require("../services/untis/parseHorariosCSV");
const { parseProfesoresCSV } = require("../services/untis/parseProfesoresCSV");
const { parseMateriasCSV } = require("../services/untis/parseMateriasCSV");
const { agruparHorarios } = require("../services/untis/agruparHorarios");
const { normalizarTexto } = require("../services/untis/normalizarTexto");

// 👇 NUEVOS SERVICIOS LDAP
const getProfesoresLDAP = require("../services/ldap/getProfesoresLDAP");
const getGruposLDAP = require("../services/ldap/getGruposLDAP");
exports.importHorariosUntisController = async (req, res) => {
  try {
    const archivoHorarios = req.files?.horarios?.[0];
    const archivoProfesores = req.files?.profesores?.[0];
    const archivoMaterias = req.files?.materias?.[0];

    if (!archivoHorarios || !archivoProfesores || !archivoMaterias) {
      return res.status(400).json({ error: "Faltan archivos" });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // =====================================
    // LDAP (SERVICIOS DIRECTOS, SIN FETCH)
    // =====================================

    const ldapSession = req.session.ldap;

    const ldapProfesores = await getProfesoresLDAP(ldapSession);
    const ldapGrupos = await getGruposLDAP(ldapSession);

    const ldapMap = {};
    ldapProfesores.forEach((p) => {
      ldapMap[p.nombreNormalizado] = p;
    });

    const gruposMap = {};
    ldapGrupos.forEach((g) => {
      gruposMap[g.cn] = g.gidNumber;
    });

    console.log("Profesores normalizados: ", ldapMap);
    console.log("Grupos normalizados: ", gruposMap);

    // =====================================
    // MATERIAS DB
    // =====================================

    const materiasDB = await db.query(`
      SELECT id, nombre FROM materias
    `);

    const materiasMap = {};

    materiasDB.rows.forEach((m) => {
      materiasMap[normalizarTexto(m.nombre)] = m.id;
    });

    // =====================================
    // CSV
    // =====================================

    const horariosRaw = await parseHorariosCSV(archivoHorarios.path);
    const profesoresUNTIS = await parseProfesoresCSV(archivoProfesores.path);
    const materiasUNTIS = await parseMateriasCSV(archivoMaterias.path);

    const incidencias = [];
    const horariosFinales = [];

    for (let i = 0; i < horariosRaw.length; i++) {
      const fila = horariosRaw[i];

      const profUNTIS = profesoresUNTIS[fila.codigoProfesor];
      if (!profUNTIS) continue;

      const nombreNormalizado = normalizarTexto(profUNTIS.nombre);
      const profLDAP = ldapMap[nombreNormalizado];

      if (!profLDAP) continue;

      const gidnumber = gruposMap[fila.grupo];
      if (!gidnumber) continue;

      const nombreMateria = materiasUNTIS[fila.codigoMateria];
      if (!nombreMateria) continue;

      const idMateria = materiasMap[normalizarTexto(nombreMateria)];
      if (!idMateria) continue;

      let periodo = fila.periodo;
      if (periodo >= 4) periodo++;

      horariosFinales.push({
        uid: profLDAP.uid,
        dia_semana: fila.dia,
        idperiodo: periodo,
        tipo: "lectiva",
        gidnumbers: [gidnumber],
        idmateria: idMateria,
        idestancia: null,
      });

      if (i % 20 === 0) {
        res.write(
          `data: ${JSON.stringify({
            procesadas: i + 1,
            totalFilas: horariosRaw.length,
          })}\n\n`
        );
      }
    }

    // =====================================
    // AGRUPAR + INSERTAR
    // =====================================

    const agrupados = agruparHorarios(horariosFinales);

    await db.query(`TRUNCATE horario_profesorado RESTART IDENTITY`);

    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;

    const curso = month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

    for (const h of agrupados) {
      await db.query(
        `
        INSERT INTO horario_profesorado
        (uid, dia_semana, idperiodo, tipo, gidnumber, idmateria, idestancia, curso_academico)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
        [
          h.uid,
          h.dia_semana,
          h.idperiodo,
          h.tipo,
          h.gidnumbers,
          h.idmateria,
          h.idestancia,
          curso,
        ]
      );
    }

    res.write(
      `event: end\ndata: ${JSON.stringify({
        total: agrupados.length,
        insertadas: agrupados.length,
        incidencias,
      })}\n\n`
    );

    res.end();

    [
      archivoHorarios.path,
      archivoProfesores.path,
      archivoMaterias.path,
    ].forEach((f) => fs.existsSync(f) && fs.unlinkSync(f));
  } catch (error) {
    console.error(error);
    res.end();
  }
};
