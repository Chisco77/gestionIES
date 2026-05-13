/**
 * ================================================================
 * Controller: configuracionCentroController.js
 * Proyecto: gestionIES
 * ================================================================
 *
 * Descripción:
 * Controlador para la gestión de los datos del IES
 * (Nombre, dirección, teléfonos, etc. Incluye logos y cargos directivos)
 *
 * Autor: Francisco Damian Mendez Palma
 * IES Francisco de Orellana - Trujillo
 * ================================================================
 */


const db = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");

// Función auxiliar para no repetir código de promesas LDAP
const obtenerDatosLDAP = (ldapSession, uid) => {
  return new Promise((resolve) => {
    if (!uid) return resolve(null);
    buscarPorUid(ldapSession, uid, (err, datos) => {
      if (!err && datos) {
        resolve({
          uid: datos.uid,
          nombre: datos.givenName,
          apellidos: datos.sn,
          nombreCompleto: `${datos.givenName || ""} ${datos.sn || ""}`.trim(),
        });
      } else resolve(null);
    });
  });
};

async function getConfiguracionCentro(req, res) {
  try {
    const ldapSession = req.session?.ldap;

    const { rows } = await db.query(
      `SELECT 
        id, nombre_ies, direccion_linea_1, direccion_linea_2, 
        direccion_linea_3, telefono, fax, email, localidad, 
        provincia, codigo_postal, web_url, logo_miies_url, 
        logo_centro_url, favicon_url, uid_directora, uid_secretaria,
        uid_jefa_estudios, uids_adjuntos
       FROM configuracion_centro
       LIMIT 1`
    );

    if (!rows[0]) {
      return res
        .status(404)
        .json({ ok: false, error: "No hay configuración definida" });
    }

    const centro = rows[0];
    let directora = null,
      secretaria = null,
      jefaEstudios = null;
    let adjuntos = [];

    if (ldapSession) {
      // 1. Cargamos cargos individuales
      [directora, secretaria, jefaEstudios] = await Promise.all([
        obtenerDatosLDAP(ldapSession, centro.uid_directora),
        obtenerDatosLDAP(ldapSession, centro.uid_secretaria),
        obtenerDatosLDAP(ldapSession, centro.uid_jefa_estudios),
      ]);

      // 2. Cargamos el array de adjuntos (si existe)
      if (centro.uids_adjuntos && Array.isArray(centro.uids_adjuntos)) {
        adjuntos = await Promise.all(
          centro.uids_adjuntos.map((uid) => obtenerDatosLDAP(ldapSession, uid))
        );
        // Filtramos por si algún UID no existiera en LDAP
        adjuntos = adjuntos.filter((a) => a !== null);
      }
    }

    res.json({
      ok: true,
      centro: {
        ...centro,
        directora,
        secretaria,
        jefaEstudios,
        adjuntos, // Array de objetos con nombreCompleto, uid, etc.
      },
    });
  } catch (err) {
    console.error("[getConfiguracionCentro] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error obteniendo la configuración" });
  }
}

async function saveConfiguracionCentro(req, res) {
  const body = req.body;

  if (!body.nombre_ies) {
    return res
      .status(400)
      .json({ ok: false, error: "El nombre del IES es obligatorio" });
  }

  // 📁 Archivos
  const logo_miies_url = req.files?.["logo_miies"]
    ? `/gestionIES/public/logos/${req.files["logo_miies"][0].filename}`
    : null;
  const logo_centro_url = req.files?.["logo_centro"]
    ? `/gestionIES/public/logos/${req.files["logo_centro"][0].filename}`
    : null;
  const favicon_url = req.files?.["favicon"]
    ? `/gestionIES/public/logos/${req.files["favicon"][0].filename}`
    : null;

  // Procesar adjuntos: Asegurarnos de que enviamos un array válido para PG
  let uids_adjuntos = body.uids_adjuntos;
  if (typeof uids_adjuntos === "string") {
    uids_adjuntos = uids_adjuntos.split(",").map((s) => s.trim());
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO configuracion_centro (
        id, nombre_ies, direccion_linea_1, direccion_linea_2, direccion_linea_3,
        telefono, fax, email, localidad, provincia, codigo_postal, web_url,
        logo_miies_url, logo_centro_url, favicon_url,
        uid_directora, uid_secretaria, uid_jefa_estudios, uids_adjuntos
      )
      VALUES (
        1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
      ON CONFLICT (id) DO UPDATE SET
        nombre_ies        = EXCLUDED.nombre_ies,
        direccion_linea_1 = EXCLUDED.direccion_linea_1,
        direccion_linea_2 = EXCLUDED.direccion_linea_2,
        direccion_linea_3 = EXCLUDED.direccion_linea_3,
        telefono          = EXCLUDED.telefono,
        fax               = EXCLUDED.fax,
        email             = EXCLUDED.email,
        localidad         = EXCLUDED.localidad,
        provincia         = EXCLUDED.provincia,
        codigo_postal     = EXCLUDED.codigo_postal,
        web_url           = EXCLUDED.web_url,
        logo_miies_url    = COALESCE(EXCLUDED.logo_miies_url, configuracion_centro.logo_miies_url),
        logo_centro_url   = COALESCE(EXCLUDED.logo_centro_url, configuracion_centro.logo_centro_url),
        favicon_url       = COALESCE(EXCLUDED.favicon_url, configuracion_centro.favicon_url),
        uid_directora     = EXCLUDED.uid_directora,
        uid_secretaria    = EXCLUDED.uid_secretaria,
        uid_jefa_estudios = EXCLUDED.uid_jefa_estudios,
        uids_adjuntos     = EXCLUDED.uids_adjuntos,
        updated_at        = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        body.nombre_ies,
        body.direccion_linea_1,
        body.direccion_linea_2,
        body.direccion_linea_3,
        body.telefono,
        body.fax,
        body.email,
        body.localidad,
        body.provincia,
        body.codigo_postal,
        body.web_url,
        logo_miies_url,
        logo_centro_url,
        favicon_url,
        body.uid_directora || null,
        body.uid_secretaria || null,
        body.uid_jefa_estudios || null,
        uids_adjuntos || [], // Enviamos el array
      ]
    );

    res.json({ ok: true, centro: rows[0] });
  } catch (err) {
    console.error("[saveConfiguracionCentro] Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Error guardando la configuración" });
  }
}

module.exports = {
  getConfiguracionCentro,
  saveConfiguracionCentro,
};
