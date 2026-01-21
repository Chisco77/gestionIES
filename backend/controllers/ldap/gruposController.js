/**
 * ================================================================
 *  Controller: gruposController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de grupos en LDAP.
 *    Permite obtener información de los grupos almacenados en
 *    el directorio y sus miembros asociados.
 *
 *  Funcionalidades:
 *    - Obtener grupos filtrados por `groupType` (getLdapGrupos)
 *    - Obtener los miembros (People) de un grupo dado su `gidNumber` (getMiembrosPorGidNumber)
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

const ldap = require("ldapjs");

const BASE_DN = "dc=instituto,dc=extremadura,dc=es";
const GROUP_DN = `ou=Group,${BASE_DN}`;
const PEOPLE_DN = `ou=People,${BASE_DN}`;

//const LDAP_URL = process.env.LDAP_URL;

// 1. Obtener grupos filtrando por groupType
exports.getLdapGrupos = (req, res) => {
  const ldapSession = req.session.ldap;
  const groupType = req.query.groupType || null;

  if (!ldapSession) {
    console.warn("⚠️ No hay sesión LDAP en req.session");
    return res.status(401).json({ error: "No autenticado" });
  }
  // Login externo o interno
  const LDAP_URL = ldapSession.external
    ? `ldap://${ldapSession.ldapHost}`
    : process.env.LDAP_URL;
  const client = ldap.createClient({
    url: LDAP_URL,
  });

  client.bind(ldapSession.dn, ldapSession.password, (err) => {
    if (err) {
      console.error("❌ Error en bind LDAP:", err.message);
      return res.status(401).json({ error: "LDAP bind fallido" });
    }

    const filter = groupType
      ? `(&(objectClass=lisAclGroup)(groupType=${groupType}))`
      : `(objectClass=lisAclGroup)`;

    const options = {
      scope: "sub",
      filter,
      attributes: ["cn", "description", "gidNumber", "groupType"],
    };

    const grupos = [];

    client.search(GROUP_DN, options, (err, ldapRes) => {
      if (err) {
        console.error("❌ Error buscando grupos:", err.message);
        return res.status(500).json({ error: "Error en búsqueda de grupos" });
      }

      ldapRes.on("searchEntry", (entry) => {
        const attrs = {};
        entry.attributes.forEach((attr) => {
          attrs[attr.type] = attr.vals;
        });

        if (
          attrs.cn &&
          attrs.gidNumber &&
          attrs.groupType &&
          attrs.groupType?.[0] === groupType
        ) {
          grupos.push({
            cn: attrs.cn[0],
            description: attrs.description?.[0] || "",
            gidNumber: attrs.gidNumber[0],
            groupType: attrs.groupType[0],
          });
        }
      });

      ldapRes.on("end", () => {
        client.unbind();
        res.json(grupos);
      });

      ldapRes.on("error", (err) => {
        console.error("❌ Error en stream de búsqueda:", err.message);
        res.status(500).json({ error: "Error al procesar grupos" });
      });
    });
  });
};

// 2. Obtener miembros de People dado un gidNumber
exports.getMiembrosPorGidNumber = (req, res) => {
  const ldapSession = req.session.ldap;
  const { gidNumber } = req.params;

  if (!ldapSession) {
    console.warn("⚠️ No hay sesión LDAP en req.session");
    return res.status(401).json({ error: "No autenticado" });
  }

  // Login externo o interno
  const LDAP_URL = ldapSession.external
    ? `ldap://${ldapSession.ldapHost}`
    : process.env.LDAP_URL;

  const client = ldap.createClient({
    url: LDAP_URL,
  });

  client.bind(ldapSession.dn, ldapSession.password, (err) => {
    if (err) {
      console.error("❌ Error en bind LDAP:", err.message);
      return res.status(401).json({ error: "LDAP bind fallido" });
    }

    const groupOptions = {
      scope: "sub",
      filter: `(&(objectClass=lisAclGroup)(gidNumber=${gidNumber}))`,
      attributes: ["memberUid"],
    };

    client.search(GROUP_DN, groupOptions, (err, groupRes) => {
      if (err) {
        console.error("❌ Error buscando grupo:", err.message);
        return res.status(500).json({ error: "Error en búsqueda de grupo" });
      }

      let memberUids = [];

      groupRes.on("searchEntry", (entry) => {
        const attrs = {};
        entry.attributes.forEach((attr) => {
          attrs[attr.type] = attr.vals;
        });
        memberUids = attrs.memberUid || [];
      });

      groupRes.on("end", () => {
        if (memberUids.length === 0) {
          client.unbind();
          return res.json([]);
        }

        const peopleOptions = {
          scope: "sub",
          filter: "(objectClass=inetOrgPerson)",
          attributes: ["uid", "givenName", "sn"],
        };

        const miembros = [];

        client.search(PEOPLE_DN, peopleOptions, (err, peopleRes) => {
          if (err) {
            console.error("❌ Error buscando personas:", err.message);
            return res.status(500).json({ error: "Error buscando personas" });
          }

          peopleRes.on("searchEntry", (entry) => {
            const attrs = {};
            entry.attributes.forEach((attr) => {
              attrs[attr.type] = attr.vals;
            });

            const uid = attrs.uid?.[0];
            if (memberUids.includes(uid)) {
              miembros.push({
                uid,
                givenName: attrs.givenName?.[0] || "",
                sn: attrs.sn?.[0] || "",
              });
            }
          });

          peopleRes.on("end", () => {
            client.unbind();
            res.json(miembros);
          });

          peopleRes.on("error", (err) => {
            console.error("❌ Error en stream de personas:", err.message);
            res.status(500).json({ error: "Error al procesar personas" });
          });
        });
      });

      groupRes.on("error", (err) => {
        console.error("❌ Error en stream de grupo:", err.message);
        res.status(500).json({ error: "Error en búsqueda de grupo" });
      });
    });
  });
};

// ================================================================
// Helper interno: obtener grupos LDAP por groupType
// Uso interno desde otros controladores (NO es endpoint)
// ================================================================
async function obtenerGruposPorTipo(ldapSession, groupType) {
  return new Promise((resolve, reject) => {
    if (!ldapSession) {
      return reject(new Error("No hay sesión LDAP"));
    }

    // Login externo o interno
    const LDAP_URL = ldapSession.external
      ? `ldap://${ldapSession.ldapHost}`
      : process.env.LDAP_URL;

    const client = ldap.createClient({ url: LDAP_URL });

    client.bind(ldapSession.dn, ldapSession.password, (err) => {
      if (err) {
        console.error("❌ Error en bind LDAP:", err.message);
        return reject(err);
      }

      const filter = groupType
        ? `(&(objectClass=lisAclGroup)(groupType=${groupType}))`
        : `(objectClass=lisAclGroup)`;

      const options = {
        scope: "sub",
        filter,
        attributes: ["cn", "description", "gidNumber", "groupType"],
      };

      const grupos = [];

      client.search(GROUP_DN, options, (err, ldapRes) => {
        if (err) {
          console.error("❌ Error buscando grupos:", err.message);
          return reject(err);
        }

        ldapRes.on("searchEntry", (entry) => {
          const attrs = {};
          entry.attributes.forEach((attr) => {
            attrs[attr.type] = attr.vals;
          });

          if (
            attrs.cn &&
            attrs.gidNumber &&
            attrs.groupType &&
            (!groupType || attrs.groupType[0] === groupType)
          ) {
            grupos.push({
              cn: attrs.cn[0],
              description: attrs.description?.[0] || "",
              gidNumber: attrs.gidNumber[0],
              groupType: attrs.groupType[0],
            });
          }
        });

        ldapRes.on("end", () => {
          client.unbind();
          resolve(grupos);
        });

        ldapRes.on("error", (err) => {
          console.error("❌ Error en stream LDAP:", err.message);
          reject(err);
        });
      });
    });
  });
}

module.exports.obtenerGruposPorTipo = obtenerGruposPorTipo;
