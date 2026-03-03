/**
 * ================================================================
 *  Controller: usuariosController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para gestión de usuarios mediante LDAP.
 *    Permite obtener información de usuarios, grupos y miembros de grupos.
 *
 *  Funcionalidades:
 *    - obtenerGruposDesdeLdap: obtener grupos LDAP filtrando por groupType.
 *    - obtenerGruposPeople: endpoint HTTP para obtener grupos LDAP.
 *    - buscarPorUid: busca un usuario en LDAP dado su uid.
 *    - getLdapUsuarios: obtiene todos los usuarios o filtrados por tipo (students/teachers).
 *    - obtenerAlumnosPorGrupo: obtiene alumnos pertenecientes a un grupo específico.
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

// ==========================
// 🔐 ANONIMIZADOR
// ==========================

const ANONIMIZAR = process.env.ANONIMIZAR_USUARIOS === "true";

const nombresFake = [
  "Lucas", "Daniel", "Mateo", "Alejandro", "Pablo",
  "Sofía", "Lucía", "Martina", "Valeria", "Emma"
];

const apellidosFake = [
  "García López", "Fernández Ruiz", "Martínez Gómez",
  "Sánchez Pérez", "Romero Díaz", "Torres Moreno"
];

// Hash simple y determinista basado en uid
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function anonimizarUsuario(usuario) {
  if (!ANONIMIZAR || !usuario.uid) return usuario;

  const hash = hashString(usuario.uid);

  const nombre = nombresFake[hash % nombresFake.length];
  const apellido = apellidosFake[hash % apellidosFake.length];

  return {
    ...usuario,
    givenName: nombre,
    sn: apellido
  };
}

const ldap = require("ldapjs");

//const LDAP_URL = process.env.LDAP_URL;

// obtener grupos desde LDAP
async function obtenerGruposDesdeLdap(ldapSession, filtroGroupType = null) {
  return new Promise((resolve, reject) => {
    if (!ldapSession) {
      return reject(new Error("No autenticado: falta sesión LDAP"));
    }

    // Login externo o interno
    const LDAP_URL = ldapSession.external
      ? `ldap://${ldapSession.ldapHost}`
      : process.env.LDAP_URL;

    const client = ldap.createClient({
      // url: "ldap://172.16.218.2:389",
      url: LDAP_URL,
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

// obtener grupos de ldap
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

exports.buscarPorUid = (ldapSession, uid, callback) => {
  // Login externo o interno
  const LDAP_URL = ldapSession.external
    ? `ldap://${ldapSession.ldapHost}`
    : process.env.LDAP_URL;

  const client = ldap.createClient({
    url: LDAP_URL,
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
      attributes: ["givenName", "sn", "uid", "gidNumber"],
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
          gidNumber: attrs.gidNumber?.[0] || null,
        };
      });

      /*res.on("end", () => { anonimizar
        client.unbind();
        callback(null, alumno);
      });*/
      res.on("end", () => {
  client.unbind();

  const alumnoFinal = alumno ? anonimizarUsuario(alumno) : null;

  callback(null, alumnoFinal);
});

      res.on("error", (err) => {
        client.unbind();
        callback(err);
      });
    });
  });
};

// Obtener usuarios de LDAP (estudiantes, profesores, staff o todos)
exports.getLdapUsuarios = (req, res) => {
  const ldapSession = req.session.ldap;
  const tipo = req.query.tipo || "all";
  const grupoPermitido = ["students", "teachers", "staff"].includes(tipo)
    ? tipo
    : "all";

  if (!ldapSession) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const LDAP_URL = ldapSession.external
    ? `ldap://${ldapSession.ldapHost}`
    : process.env.LDAP_URL;

  const client = ldap.createClient({ url: LDAP_URL });

  client.bind(ldapSession.dn, ldapSession.password, async (err) => {
    if (err) {
      return res.status(401).json({
        error: "LDAP bind fallido",
        details: err.message,
      });
    }

    const baseDN = "dc=instituto,dc=extremadura,dc=es";

    try {
      // ==========================
      // 1️⃣ Obtener miembros del grupo principal (students/teachers/staff)
      // ==========================
      let allowedUidSet = null;

      if (grupoPermitido !== "all") {
        const groupPrincipal = await searchLDAP(client, `ou=Group,${baseDN}`, {
          scope: "sub",
          filter: `(&(cn=${grupoPermitido})(objectClass=lisAclGroup))`,
          attributes: ["memberUid"],
        });

        const memberUids = groupPrincipal[0]?.memberUid || [];

        allowedUidSet = new Set(
          memberUids.filter(
            (uid) => typeof uid === "string" && uid.trim() !== ""
          )
        );
      }

      // ==========================
      // 2️⃣ Buscar TODOS los usuarios (sin OR gigante)
      // ==========================
      const people = await searchLDAP(client, `ou=People,${baseDN}`, {
        scope: "sub",
        filter: "(objectClass=inetOrgPerson)",
        attributes: [
          "uidNumber",
          "givenName",
          "sn",
          "uid",
          "gidNumber",
          "employeeNumber",
        ],
      });

      // ==========================
      // 3️⃣ Buscar SOLO grupos permitidos por groupType
      // ==========================
      let groupTypeFilter = "(objectClass=lisAclGroup)";

      if (grupoPermitido === "students") {
        groupTypeFilter =
          "(&(objectClass=lisAclGroup)(groupType=school_class))";
      }

      if (grupoPermitido === "teachers") {
        groupTypeFilter =
          "(&(objectClass=lisAclGroup)(groupType=school_department))";
      }

      if (grupoPermitido === "staff") {
        groupTypeFilter =
          "(&(objectClass=lisAclGroup)(groupType=administration))";
      }

      const groups = await searchLDAP(client, `ou=Group,${baseDN}`, {
        scope: "sub",
        filter: groupTypeFilter,
        attributes: ["cn", "memberUid"],
      });

      // ==========================
      // 4️⃣ Construir mapa invertido uid → grupos
      // ==========================
      const userGroupsMap = {};

      groups.forEach((group) => {
        const groupName = group.cn?.[0];
        const members = group.memberUid || [];

        members.forEach((uid) => {
          if (!userGroupsMap[uid]) {
            userGroupsMap[uid] = [];
          }
          userGroupsMap[uid].push(groupName);
        });
      });

      // ==========================
      // 5️⃣ Construir resultado final (filtrado eficiente con Set)
      // ==========================
      const result = people
        .filter((p) => {
          if (!allowedUidSet) return true;
          return allowedUidSet.has(p.uid?.[0]);
        })
        .map((p) => ({
          id: p.uidNumber?.[0] || null,
          givenName: p.givenName?.[0] || null,
          sn: p.sn?.[0] || null,
          uid: p.uid?.[0] || null,
          gidNumber: p.gidNumber?.[0] || null,
          employeeNumber: p.employeeNumber?.[0] || null,
          groups: userGroupsMap[p.uid?.[0]] || [],
        }));

      // ==========================
      // 6️⃣ Ordenación
      // ==========================
      result.sort((a, b) => {
        const snA = a.sn?.toLowerCase() || "";
        const snB = b.sn?.toLowerCase() || "";
        const nameA = a.givenName?.toLowerCase() || "";
        const nameB = b.givenName?.toLowerCase() || "";
        return snA.localeCompare(snB) || nameA.localeCompare(nameB);
      });

      client.unbind();
      //res.json(result); anonimizar
      const resultadoFinal = result.map(anonimizarUsuario);
res.json(resultadoFinal);
    } catch (error) {
      console.error("🔥 ERROR REAL LDAP:", error);
      client.unbind();
      res.status(500).json({
        error: "Error procesando LDAP",
        details: error.message,
      });
    }
  });
};

// ==========================
// Helper promisificado
// ==========================
function searchLDAP(client, baseDN, options) {
  return new Promise((resolve, reject) => {
    const entries = [];

    client.search(baseDN, options, (err, res) => {
      if (err) return reject(err);

      res.on("searchEntry", (entry) => {
        const obj = {};
        entry.attributes.forEach((attr) => {
          obj[attr.type] = attr.vals;
        });
        entries.push(obj);
      });

      res.on("error", reject);
      res.on("end", () => resolve(entries));
    });
  });
}

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
  const escapeLDAP = (input) => input.replace(/([\\\*\(\)\0])/g, "\\$1");

  // Login externo o interno
  const LDAP_URL = ldapSession.external
    ? `ldap://${ldapSession.ldapHost}`
    : process.env.LDAP_URL;

  const client = ldap.createClient({
    url: LDAP_URL,
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
        return res
          .status(500)
          .json({ error: "Error en búsqueda de grupo", details: err.message });
      });

      groupRes.on("end", () => {
        // Filtrar valores válidos
        memberUids = memberUids.filter(
          (uid) => typeof uid === "string" && uid.trim() !== ""
        );

        if (memberUids.length === 0) {
          client.unbind();
          return res.json([]);
        }

        const filterParts = memberUids.map((uid) => `(uid=${escapeLDAP(uid)})`);

        if (filterParts.length === 0) {
          client.unbind();
          return res.json([]);
        }

        const filter = `(|${filterParts.join("")})`;

        const peopleOptions = {
          scope: "sub",
          filter,
          attributes: ["uid", "givenName", "sn"],
        };

        client.search(
          `ou=People,${baseDN}`,
          peopleOptions,
          (err, peopleRes) => {
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
              return res.status(500).json({
                error: "Error en búsqueda de alumnos",
                details: err.message,
              });
            });

            peopleRes.on("end", () => {
              client.unbind();
              //res.json(alumnos); anonimizar
              const alumnosAnonimizados = alumnos.map(anonimizarUsuario);
res.json(alumnosAnonimizados);
            });
          }
        );
      });
    });
  });
};
