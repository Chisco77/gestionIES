/**
 * ================================================================
 * Utils: volcarAusencias.js
 * Proyecto: gestionIES
 * ================================================================
 *
 * Descripción:
 * Sincroniza los permisos aceptados (estado 1) con la tabla
 * de ausencias_profesorado.
 *
 * Autor: Francisco Damian Mendez Palma (Adaptado)
 * ================================================================
 */

const db = require("../db");

async function volcarAusenciasALaBD() {
  console.log("🔄 Iniciando sincronización de permisos aprobados -> ausencias...");

  try {
    // 1. Obtenemos los permisos aceptados (estado = 1)
    // No filtramos por fecha para asegurar que si un admin aprueba algo pasado o muy futuro, se vuelque.
    const queryPermisos = `
      SELECT id, uid, fecha, fecha_fin, idperiodo_inicio, idperiodo_fin, tipo 
      FROM permisos 
      WHERE estado = 1
    `;
    
    const { rows: permisosAprobados } = await db.query(queryPermisos);

    if (permisosAprobados.length === 0) {
      console.log("ℹ️ No hay nuevos permisos aprobados para volcar.");
      return;
    }

    console.log(`📌 Procesando ${permisosAprobados.length} permisos aceptados...`);

    for (const permiso of permisosAprobados) {
      // Lógica de tipo de ausencia
      const tipoAusencia = (permiso.tipo === 13) ? 'asunto-propio' : 'permiso';
      
      // Preparar la inserción con ON CONFLICT para evitar duplicados por idpermiso
      const queryInsert = `
        INSERT INTO ausencias_profesorado (
          uid_profesor, 
          fecha_inicio, 
          fecha_fin, 
          idperiodo_inicio, 
          idperiodo_fin, 
          tipo_ausencia, 
          creada_por, 
          idpermiso
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (idpermiso) DO NOTHING;
      `;

      const values = [
        permiso.uid,
        permiso.fecha,
        permiso.fecha_fin || permiso.fecha, // Si fecha_fin es null, usamos la fecha de inicio
        permiso.idperiodo_inicio,
        permiso.idperiodo_fin,
        tipoAusencia,
        permiso.uid, 
        permiso.id
      ];

      await db.query(queryInsert, values);
    }

    console.log("✅ Sincronización de ausencias finalizada con éxito.");
    
  } catch (error) {
    console.error("❌ Error en el volcado de ausencias:", error);
    throw error;
  }
}

module.exports = volcarAusenciasALaBD;