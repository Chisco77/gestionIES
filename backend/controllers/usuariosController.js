const ldap = require("ldapjs");

exports.getLdapAlumnos = (req, res) => {
  const ldapSession = req.session.ldap;
  const tipo = req.query.tipo || "all"; // default: sin filtro
  const grupoPermitido = ["students", "teachers"].includes(tipo) ? tipo : "all";

  if (!ldapSession) {
    console.warn("⚠️ No hay sesión LDAP en req.session");
    return res.status(401).json({ error: "No autenticado" });
  }

  console.log("📡 Intentando conectar a LDAP con DN:", ldapSession.dn);

  const client = ldap.createClient({
    url: "ldap://172.16.218.2:389", // Cambia a tu IP si necesario
  });

  client.bind(ldapSession.dn, ldapSession.password, (err) => {
    if (err) {
      console.error("❌ Error en LDAP bind:", err.message);
      return res
        .status(401)
        .json({ error: "LDAP bind fallido", details: err.message });
    }

    console.log("✅ Bind correcto con LDAP");

    const baseDN = "dc=instituto,dc=extremadura,dc=es";

    const peopleOptions = {
      scope: "sub",
      filter: "(objectClass=inetOrgPerson)",
      attributes: ["uidNumber", "givenName", "sn", "uid", "gidNumber"],
    };

    client.search(`ou=People,${baseDN}`, peopleOptions, (err, peopleRes) => {
      if (err) {
        console.error("❌ Error al buscar usuarios:", err.message);
        return res
          .status(500)
          .json({ error: "Error al buscar usuarios", details: err.message });
      }

      const people = [];

      peopleRes.on("searchEntry", (entry) => {
        if (!entry || !entry.attributes) {
          console.warn(
            "⚠️ Entrada de persona vacía o sin atributos. Ignorando."
          );
          return;
        }

        // Extraer atributos manualmente
        const attrs = {};
        entry.attributes.forEach((attr) => {
          attrs[attr.type] = attr.vals;
        });

        const givenName = attrs.givenName ? attrs.givenName[0] : null;
        const sn = attrs.sn ? attrs.sn[0] : null;
        const uid = attrs.uid ? attrs.uid[0] : null;
        const gidNumber = attrs.gidNumber ? attrs.gidNumber[0] : null;
        const uidNumber = attrs.uidNumber ? attrs.uidNumber[0] : null;

        if (!uid) {
          console.warn("⚠️ Persona sin uid. Ignorando:", attrs);
          return;
        }

        console.log(
          `🔎 Usuario válido encontrado: uid=${uid}, gidNumber=${gidNumber}`
        );

        people.push({ uidNumber, givenName, sn, uid, gidNumber });
      });

      peopleRes.on("error", (err) => {
        console.error("❌ Error en stream de búsqueda de People:", err.message);
        return res.status(500).json({
          error: "Error al procesar búsqueda en People",
          details: err.message,
        });
      });

      peopleRes.on("end", () => {
        if (people.length === 0) {
          console.warn("⚠️ La búsqueda LDAP en People no devolvió resultados.");
          console.log("🧪 Parámetros usados:");
          console.log("  DN base:", `ou=People,${baseDN}`);
          console.log("  Filtro:", peopleOptions.filter);
          console.log("  Atributos:", peopleOptions.attributes);
        }
        const groupBaseDN = `ou=Group,${baseDN}`;
        // Buscamos grupos
        const groupOptions = {
          scope: "sub",
          filter: "(objectClass=lisAclGroup)",
          attributes: ["cn", "gidNumber", "memberUid"],
        };

        console.log("🔍 Parámetros usados en búsqueda de grupos LDAP:");
        console.log("  Base DN:", groupBaseDN);
        console.log("  Filtro:", groupOptions.filter);
        console.log("  Atributos:", groupOptions.attributes);

        client.search(groupBaseDN, groupOptions, (err, groupRes) => {
          if (err) {
            console.error("❌ Error al buscar grupos:", err.message);
            return res.status(500).json({
              error: "Error al buscar grupos",
              details: err.message,
            });
          }

          const groups = {};

          groupRes.on("searchEntry", (entry) => {
            if (!entry || !entry.attributes) {
              console.warn(
                "⚠️ Entrada de grupo vacía o sin atributos. Ignorando."
              );
              return;
            }

            // Extraer atributos manualmente
            const attrs = {};
            entry.attributes.forEach((attr) => {
              attrs[attr.type] = attr.vals;
            });

            const cn = attrs.cn ? attrs.cn[0] : null;
            const members = attrs.memberUid || [];

            if (!cn) {
              console.warn("⚠️ Grupo sin nombre (cn):", attrs);
              return;
            }

            groups[cn] = members; // Mapear cn → lista de uid (memberUid)
          });

          groupRes.on("error", (err) => {
            console.error(
              "❌ Error en stream de búsqueda de Group:",
              err.message
            );
            return res.status(500).json({
              error: "Error en stream de grupos",
              details: err.message,
            });
          });

          groupRes.on("end", () => {
            console.log(
              "📌 gidNumbers de personas:",
              people.map((p) => p.gidNumber)
            );
            console.log("📦 grupos disponibles:", groups);
            const result = people
              .map((p) => {
                const groupsForUser = Object.entries(groups)
                  .filter(([groupName, memberUids]) =>
                    memberUids.includes(p.uid)
                  )
                  .map(([groupName]) => groupName);

                return {
                  id: p.uidNumber,
                  givenName: p.givenName,
                  sn: p.sn,
                  uid: p.uid,
                  groups: groupsForUser,
                };
              })
              .filter((p) => {
                if (grupoPermitido === "all") return true;
                return p.groups.includes(grupoPermitido);
              });

            console.log(
              "✅ Enviando resultado LDAP:",
              result.length,
              "registros"
            );
            client.unbind();
            res.json(result);
          });
        });
      });
    });
  });
};
