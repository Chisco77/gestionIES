/**
 * ================================================================
 * Utils: volcarAusencias.js
 * Proyecto: gestionIES
 * ================================================================
 *
 * Descripción:
 * Sincroniza los permisos aceptados (estado 1) con la tabla
 * de ausencias_profesorado.
 * Sincroniza actividades extraescolares (estado 1)
 *
 * Autor: Francisco Damian Mendez Palma (Adaptado)
 * ================================================================
 */

const db = require("../db");

async function volcarAusenciasALaBD() {
  console.log(
    "🔄 Iniciando sincronización de permisos y extraescolares -> ausencias..."
  );

  try {
    // 1. PROCESAR PERMISOS APROBADOS
    const queryPermisos = `
      SELECT id, uid, fecha, fecha_fin, idperiodo_inicio, idperiodo_fin, tipo, descripcion 
      FROM permisos 
      WHERE estado = 1
    `;
    const { rows: permisos } = await db.query(queryPermisos);

    for (const permiso of permisos) {
      const tipoAusencia = permiso.tipo === 13 ? "asunto-propio" : "permiso";

      const queryInsertPermiso = `
        INSERT INTO ausencias_profesorado (
          uid_profesor, fecha_inicio, fecha_fin, 
          idperiodo_inicio, idperiodo_fin, tipo_ausencia, 
          descripcion, creada_por, idpermiso
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (idpermiso) DO NOTHING;
      `;

      await db.query(queryInsertPermiso, [
        permiso.uid,
        permiso.fecha,
        permiso.fecha_fin || permiso.fecha,
        permiso.idperiodo_inicio,
        permiso.idperiodo_fin,
        tipoAusencia,
        permiso.descripcion || null, // Mapeo de descripción del permiso
        permiso.uid,
        permiso.id,
      ]);
    }
    console.log(`✅ ${permisos.length} permisos procesados.`);

    // 2. PROCESAR EXTRAESCOLARES ACEPTADAS (estado = 1)
    const queryExtra = `
      SELECT id, uid, responsables_uids, fecha_inicio, fecha_fin, 
             idperiodo_inicio, idperiodo_fin, titulo
      FROM extraescolares 
      WHERE estado = 1
    `;
    const { rows: actividades } = await db.query(queryExtra);

    let totalAusenciasExtra = 0;

    for (const actividad of actividades) {
      const responsables = actividad.responsables_uids || [];

      for (const uidResponsable of responsables) {
        const queryInsertExtra = `
          INSERT INTO ausencias_profesorado (
            uid_profesor, 
            fecha_inicio, 
            fecha_fin, 
            idperiodo_inicio, 
            idperiodo_fin, 
            tipo_ausencia, 
            descripcion,
            creada_por, 
            idextraescolar
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (idextraescolar, uid_profesor) DO NOTHING;
        `;

        const valuesExtra = [
          uidResponsable,
          actividad.fecha_inicio,
          actividad.fecha_fin || actividad.fecha_inicio,
          actividad.idperiodo_inicio,
          actividad.idperiodo_fin,
          "extraescolar", // Tipo simplificado
          actividad.titulo, // El título de la actividad va a la descripción
          actividad.uid,
          actividad.id,
        ];

        await db.query(queryInsertExtra, valuesExtra);
        totalAusenciasExtra++;
      }
    }
    console.log(
      `✅ ${actividades.length} actividades procesadas (${totalAusenciasExtra} ausencias).`
    );
    console.log("🚀 Sincronización finalizada.");
  } catch (error) {
    console.error("❌ Error en el volcado:", error);
    throw error;
  }
}

module.exports = volcarAusenciasALaBD;
