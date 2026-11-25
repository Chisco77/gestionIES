
/**
 * ================================================================
 * Controller: hostsController.js
 * Proyecto: gestionIES
 * ================================================================
 *
 * Descripción:
 *   Controlador para la gestión de hosts almacenados en LDAP.
 *
 * Funcionalidades:
 *   - Obtener hosts LDAP (getLdapHosts)
 *   - Filtrar hosts por dc
 *   - Obtener un host concreto por dc
 *
 * Atributos LDAP utilizados:
 *   - dc
 *   - associatedDomain
 *   - aRecord
 *   - objectClass
 *
 * ================================================================
 */

const ldap = require("ldapjs");

const BASE_DN = "dc=instituto,dc=extremadura,dc=es";
const HOSTS_DN = `ou=hosts,${BASE_DN}`;

/**
 * ================================================================
 * Helper: escapar caracteres especiales en filtros LDAP
 * ================================================================
 */
function escapeLDAPFilter(value) {
  return String(value)
    .replace(/\\/g, "\\5c")
    .replace(/\*/g, "\\2a")
    .replace(/\(/g, "\\28")
    .replace(/\)/g, "\\29")
    .replace(/\0/g, "\\00");
}

/**
 * ================================================================
 * Helper interno: obtener hosts LDAP
 *
 * Permite filtrar por dc.
 * No es un endpoint.
 * ================================================================
 */
async function obtenerHostsLDAP(ldapSession, dc = null) {
  return new Promise((resolve, reject) => {
    if (!ldapSession) {
      return reject(new Error("No hay sesión LDAP"));
    }

    // Login externo o interno
    const LDAP_URL = ldapSession.external
      ? `ldap://${ldapSession.ldapHost}`
      : process.env.LDAP_URL;

    const client = ldap.createClient({
      url: LDAP_URL,
    });

    client.bind(
      ldapSession.dn,
      ldapSession.password,
      (err) => {
        if (err) {
          console.error("❌ Error en bind LDAP:", err.message);
          client.unbind();
          return reject(err);
        }

        // Filtro de hosts
        const filter = dc
          ? `(&(objectClass=dNSDomain2)(dc=${escapeLDAPFilter(dc)}))`
          : "(&(objectClass=dNSDomain2)(dc=*))";

        const options = {
          scope: "sub",
          filter,
          attributes: [
            "dc",
            "associatedDomain",
            "aRecord",
            "objectClass",
          ],
        };

        const hosts = [];

        client.search(HOSTS_DN, options, (err, ldapRes) => {
          if (err) {
            console.error(
              "❌ Error buscando hosts LDAP:",
              err.message
            );

            client.unbind();
            return reject(err);
          }

          ldapRes.on("searchEntry", (entry) => {
            const attrs = {};

            entry.attributes.forEach((attr) => {
              attrs[attr.type] = attr.vals;
            });

            if (attrs.dc?.length) {
              hosts.push({
                dn: entry.dn.toString(),
                dc: attrs.dc[0],
                associatedDomain:
                  attrs.associatedDomain?.[0] || "",
                aRecord: attrs.aRecord || [],
                objectClass: attrs.objectClass || [],
              });
            }
          });

          ldapRes.on("end", () => {
            client.unbind();
            resolve(hosts);
          });

          ldapRes.on("error", (err) => {
            console.error(
              "❌ Error procesando resultados LDAP:",
              err.message
            );

            client.unbind();
            reject(err);
          });
        });
      }
    );
  });
}

/**
 * ================================================================
 * 1. Obtener hosts LDAP
 *
 * GET /api/ldap/hosts
 * GET /api/ldap/hosts?dc=a03-pro
 * ================================================================
 */
exports.getLdapHosts = async (req, res) => {
  const ldapSession = req.session.ldap;
  const dc = req.query.dc || null;

  if (!ldapSession) {
    console.warn("⚠️ No hay sesión LDAP en req.session");

    return res.status(401).json({
      error: "No autenticado",
    });
  }

  try {
    const hosts = await obtenerHostsLDAP(
      ldapSession,
      dc
    );

    return res.json(hosts);
  } catch (err) {
    console.error(
      "❌ Error obteniendo hosts LDAP:",
      err.message
    );

    return res.status(500).json({
      error: "Error al obtener hosts LDAP",
    });
  }
};

/**
 * ================================================================
 * 2. Obtener un host por dc
 *
 * GET /api/ldap/hosts/:dc
 * ================================================================
 */
exports.getLdapHostPorDc = async (req, res) => {
  const ldapSession = req.session.ldap;
  const { dc } = req.params;

  if (!ldapSession) {
    console.warn("⚠️ No hay sesión LDAP en req.session");

    return res.status(401).json({
      error: "No autenticado",
    });
  }

  try {
    const hosts = await obtenerHostsLDAP(
      ldapSession,
      dc
    );

    if (hosts.length === 0) {
      return res.status(404).json({
        error: "Host no encontrado",
      });
    }

    return res.json(hosts[0]);
  } catch (err) {
    console.error(
      "❌ Error obteniendo host LDAP:",
      err.message
    );

    return res.status(500).json({
      error: "Error al obtener host LDAP",
    });
  }
};

/**
 * ================================================================
 * Exportación del helper
 * Uso interno desde otros controladores
 * ================================================================
 */
module.exports.obtenerHostsLDAP = obtenerHostsLDAP;
