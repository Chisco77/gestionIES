const ldap = require("ldapjs");

// ✅ Función reutilizable para obtener grupos desde LDAP
async function obtenerGruposDesdeLdap(ldapSession, filtroGroupType = null) {
  return new Promise((resolve, reject) => {
    if (!ldapSession) {
      return reject(new Error("No autenticado: falta sesión LDAP"));
    }

    const client = ldap.createClient({
     // url: "ldap://172.16.218.2:389",
         url: "ldap://192.168.1.32:389",

    });

    client.bind(ldapSession.dn, ldapSession.password, (err) => {
      if (err) {
        return reject(new Error("LDAP bind fallido: " + err.message));
      }

      const baseDN = "dc=instituto,dc=extremadura,dc=es";
      const groupBaseDN = `ou=Group,${baseDN}`;

      let filtro = "(objectClass=lisAclGroup)";
      if (filtroGroupType) {
        filtro = `(&${filtro}(groupType=${filtroGroupType}))`;
      }

      const groupOptions = {
        scope: "sub",
        filter: filtro,
        attributes: ["cn", "gidNumber", "description", "memberUid"],
      };

      client.search(groupBaseDN, groupOptions, (err, groupRes) => {
        if (err) {
          return reject(new Error("Error al buscar grupos: " + err.message));
        }

        const grupos = [];

        groupRes.on("searchEntry", (entry) => {
          const attrs = {};
          entry.attributes.forEach((attr) => {
            attrs[attr.type] = attr.vals;
          });

          const cn = attrs.cn?.[0] || null;
          const gidNumber = attrs.gidNumber?.[0] || null;
          const description = attrs.description?.[0] || null;
          const memberUid = attrs.memberUid || [];

          if (cn && gidNumber) {
            grupos.push({ cn, gidNumber, description, memberUid });
          }
        });

        groupRes.on("error", (err) => reject(err));

        groupRes.on("end", () => {
          client.unbind();
          resolve(grupos);
        });
      });
    });
  });
}

exports.obtenerGruposDesdeLdap = obtenerGruposDesdeLdap;

// ✅ Versión HTTP para uso en rutas
exports.obtenerGruposPeople = async (req, res) => {
  try {
    const ldapSession = req.session?.ldap;
    const filtroGroupType = req.query.groupType || null;

    const grupos = await obtenerGruposDesdeLdap(ldapSession, filtroGroupType);
    res.json(grupos);
  } catch (error) {
    console.error("❌ Error en obtenerGruposPeople:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.buscarAlumnoPorUid = (ldapSession, uid, callback) => {
  const client = ldap.createClient({
   // url: "ldap://172.16.218.2:389",
       url: "ldap://192.168.1.32:389",

  });

  client.bind(ldapSession.dn, ldapSession.password, (err) => {
    if (err) {
      console.error("❌ Error en LDAP bind:", err.message);
      return callback(err);
    }

    const baseDN = "dc=instituto,dc=extremadura,dc=es";
    const options = {
      scope: "sub",
      filter: `(uid=${uid})`,
      attributes: ["givenName", "sn", "uid"],
    };

    client.search(`ou=People,${baseDN}`, options, (err, res) => {
      if (err) {
        console.error("❌ Error en búsqueda LDAP:", err.message);
        client.unbind();
        return callback(err);
      }

      let alumno = null;

      res.on("searchEntry", (entry) => {
        const attrs = {};
        entry.attributes.forEach((attr) => {
          attrs[attr.type] = attr.vals;
        });
        alumno = {
          uid: attrs.uid?.[0] || null,
          givenName: attrs.givenName?.[0] || null,
          sn: attrs.sn?.[0] || null,
        };
      });

      res.on("end", () => {
        client.unbind();
        callback(null, alumno);
      });

      res.on("error", (err) => {
        client.unbind();
        callback(err);
      });
    });
  });
};

// ✅ Función existente sin cambios
exports.getLdapUsuarios = (req, res) => {
  const ldapSession = req.session.ldap;
  const tipo = req.query.tipo || "all";
  const grupoPermitido = ["students", "teachers"].includes(tipo) ? tipo : "all";

  if (!ldapSession) {
    console.warn("⚠️ No hay sesión LDAP en req.session");
    return res.status(401).json({ error: "No autenticado" });
  }

  const client = ldap.createClient({
   // url: "ldap://172.16.218.2:389",
       url: "ldap://192.168.1.32:389",

  });

  client.bind(ldapSession.dn, ldapSession.password, (err) => {
    if (err) {
      return res
        .status(401)
        .json({ error: "LDAP bind fallido", details: err.message });
    }

    const baseDN = "dc=instituto,dc=extremadura,dc=es";
    const peopleOptions = {
      scope: "sub",
      filter: "(objectClass=inetOrgPerson)",
      attributes: ["uidNumber", "givenName", "sn", "uid", "gidNumber"],
    };

    client.search(`ou=People,${baseDN}`, peopleOptions, (err, peopleRes) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error al buscar usuarios", details: err.message });
      }

      const people = [];

      peopleRes.on("searchEntry", (entry) => {
        const attrs = {};
        entry.attributes.forEach((attr) => {
          attrs[attr.type] = attr.vals;
        });

        const uid = attrs.uid?.[0];
        if (!uid) return;

        people.push({
          uidNumber: attrs.uidNumber?.[0] || null,
          givenName: attrs.givenName?.[0] || null,
          sn: attrs.sn?.[0] || null,
          uid,
          gidNumber: attrs.gidNumber?.[0] || null,
        });
      });

      peopleRes.on("end", () => {
        const groupBaseDN = `ou=Group,${baseDN}`;
        const groupOptions = {
          scope: "sub",
          filter: "(objectClass=lisAclGroup)",
          attributes: ["cn", "gidNumber", "memberUid"],
        };

        client.search(groupBaseDN, groupOptions, (err, groupRes) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Error al buscar grupos", details: err.message });
          }

          const groups = {};

          groupRes.on("searchEntry", (entry) => {
            const attrs = {};
            entry.attributes.forEach((attr) => {
              attrs[attr.type] = attr.vals;
            });

            const cn = attrs.cn?.[0];
            const members = attrs.memberUid || [];

            if (cn) {
              groups[cn] = members;
            }
          });

          groupRes.on("end", () => {
            const result = people
              .map((p) => {
                const userGroups = Object.entries(groups)
                  .filter(([_, uids]) => uids.includes(p.uid))
                  .map(([name]) => name);

                return {
                  id: p.uidNumber,
                  givenName: p.givenName,
                  sn: p.sn,
                  uid: p.uid,
                  groups: userGroups,
                };
              })
              .filter(
                (p) =>
                  grupoPermitido === "all" || p.groups.includes(grupoPermitido)
              );

            client.unbind();
            res.json(result);
          });
        });
      });
    });
  });
};

// Obtiene alumnos que pertenecen al grupo con el cn indicado en req.query.grupo
exports.obtenerAlumnosPorGrupo = (req, res) => {
  const ldapSession = req.session.ldap;
  const grupo = req.query.grupo;


  if (!grupo || grupo.trim() === "") {
    return res.status(400).json({ error: "Parámetro 'grupo' requerido" });
  }

  if (!ldapSession) {
    return res.status(401).json({ error: "No autenticado" });
  }

  // Función para escapar caracteres especiales en filtro LDAP
  const escapeLDAP = (input) =>
    input.replace(/([\\\*\(\)\0])/g, "\\$1");

  const client = ldap.createClient({
    //url: "ldap://172.16.218.2:389",
        url: "ldap://192.168.1.32:389",

  });

  client.bind(ldapSession.dn, ldapSession.password, (err) => {
    if (err) {
      return res
        .status(401)
        .json({ error: "LDAP bind fallido", details: err.message });
    }

    const baseDN = "dc=instituto,dc=extremadura,dc=es";

    // Buscar el grupo para obtener su lista de memberUid
    const groupOptions = {
      scope: "sub",
      filter: `(&(objectClass=lisAclGroup)(cn=${escapeLDAP(grupo)}))`,
      attributes: ["memberUid"],
    };

    client.search(`ou=Group,${baseDN}`, groupOptions, (err, groupRes) => {
      if (err) {
        client.unbind();
        return res
          .status(500)
          .json({ error: "Error al buscar grupo", details: err.message });
      }

      let memberUids = [];

      groupRes.on("searchEntry", (entry) => {
        const attr = entry.attributes.find((a) => a.type === "memberUid");
        memberUids = attr?.vals || [];
      });

      groupRes.on("error", (err) => {
        client.unbind();
        return res.status(500).json({ error: "Error en búsqueda de grupo", details: err.message });
      });

      groupRes.on("end", () => {
        // Filtrar valores válidos
        memberUids = memberUids.filter(uid => typeof uid === "string" && uid.trim() !== "");

        if (memberUids.length === 0) {
          client.unbind();
          return res.json([]);
        }

        const filterParts = memberUids.map(uid => `(uid=${escapeLDAP(uid)})`);

        if (filterParts.length === 0) {
          client.unbind();
          return res.json([]);
        }

        const filter = `(|${filterParts.join('')})`;

        const peopleOptions = {
          scope: "sub",
          filter,
          attributes: ["uid", "givenName", "sn"],
        };

        client.search(`ou=People,${baseDN}`, peopleOptions, (err, peopleRes) => {
          if (err) {
            client.unbind();
            return res.status(500).json({
              error: "Error al buscar alumnos",
              details: err.message,
            });
          }

          const alumnos = [];

          peopleRes.on("searchEntry", (entry) => {
            const attrs = {};
            entry.attributes.forEach((attr) => {
              attrs[attr.type] = attr.vals;
            });

            alumnos.push({
              uid: attrs.uid?.[0] || null,
              givenName: attrs.givenName?.[0] || null,
              sn: attrs.sn?.[0] || null,
            });
          });

          peopleRes.on("error", (err) => {
            client.unbind();
            return res.status(500).json({ error: "Error en búsqueda de alumnos", details: err.message });
          });

          peopleRes.on("end", () => {
            client.unbind();
            res.json(alumnos);
          });
        });
      });
    });
  });
};

