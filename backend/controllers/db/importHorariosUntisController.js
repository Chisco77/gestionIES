const fs = require("fs");
const db = require("../../db");

const { parseHorariosCSV } = require("../services/untis/parseHorariosCSV");
const { agruparHorarios } = require("../services/untis/agruparHorarios");

// Servicios LDAP
const getGruposLDAP = require("../services/ldap/getGruposLDAP");

exports.importHorariosUntisController = async (req, res) => {
  try {
    const archivoHorarios = req.file; // Al usar upload.single("horarios") viene en req.file

    if (!archivoHorarios) {
      return res.status(400).json({ error: "Falta el archivo de horarios" });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // =====================================
    // 1. LDAP (Solo Grupos para obtener gidNumber)
    // =====================================
    const ldapSession = req.session.ldap;
    const ldapGrupos = await getGruposLDAP(ldapSession);

    console.log ("Grupos LDAP. ", ldapGrupos);

    const gruposMap = {};
    ldapGrupos.forEach((g) => {
      gruposMap[g.cn] = g.gidNumber;
    });

    // =====================================
    // 2. EMPLEADOS DESDE DB (Mapeo por acrónimo UNTIS -> uid)
    // =====================================
    const profsDB = await db.query(`
      SELECT uid, acronimo_untis FROM empleados WHERE acronimo_untis IS NOT NULL
    `);

    const profsUntisMap = {};
    profsDB.rows.forEach((p) => {
      profsUntisMap[p.acronimo_untis.trim().toUpperCase()] = p.uid;
    });

    // =====================================
    // 3. MATERIAS DESDE DB (Mapeo por acrónimo UNTIS -> id)
    // =====================================
    const materiasDB = await db.query(`
      SELECT id, acronimo_untis FROM materias WHERE acronimo_untis IS NOT NULL
    `);

    const materiasUntisMap = {};
    materiasDB.rows.forEach((m) => {
      materiasUntisMap[m.acronimo_untis.trim().toUpperCase()] = m.id;
    });

    // =====================================
    // 4. PARSEAR CSV DE HORARIOS
    // =====================================
    const horariosRaw = await parseHorariosCSV(archivoHorarios.path);
    console.log ("Horarios Raw: ", horariosRaw);

    const incidencias = [];
    const horariosFinales = [];

    for (let i = 0; i < horariosRaw.length; i++) {
      const fila = horariosRaw[i];

      const acronimoProfesor = fila.codigoProfesor?.trim().toUpperCase();
      
      const acronimoMateria = fila.codigoMateria?.trim().toUpperCase();

      // Obtener uid directamente de la tabla empleados mediante el acrónimo UNTIS
      const uidEmpleado = profsUntisMap[acronimoProfesor];
      if (!uidEmpleado) {
        incidencias.push({
          tipo: "Profesor no encontrado en empleados",
          fila: i + 1,
          data: fila,
        });
        continue;
      }

      // Buscar grupo en LDAP
      const gidnumber = gruposMap[fila.grupo];
      if (!gidnumber) {
        incidencias.push({
          tipo: "Grupo no encontrado en LDAP",
          fila: i + 1,
          grupo: fila.grupo,
        });
        continue;
      }

      // Buscar materia en BD por su acrónimo UNTIS
      const idMateria = materiasUntisMap[acronimoMateria];
      if (!idMateria) {
        incidencias.push({
          tipo: "Materia no encontrada",
          fila: i + 1,
          materia: acronimoMateria,
        });
        continue;
      }

      let periodo = fila.periodo;
      if (periodo >= 4) periodo++;

      horariosFinales.push({
        uid: uidEmpleado,
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
    // 5. AGRUPAR + INSERTAR EN BD
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

    // Borrar fichero temporal subido
    if (fs.existsSync(archivoHorarios.path)) {
      fs.unlinkSync(archivoHorarios.path);
    }
  } catch (error) {
    console.error(error);
    res.write(
      `event: end\ndata: ${JSON.stringify({ error: error.message })}\n\n`
    );
    res.end();
  }
};
