/**
 * ================================================================
 *  Controller: loginController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para autenticación mediante LDAP.
 *    Permite iniciar sesión validando credenciales en el directorio LDAP.
 *    Solo para usuarios del grupo "teachers"
 *
 *  Funcionalidades:
 *    - loginLdap: valida usuario y contraseña en LDAP y crea sesión.
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

const db = require("../../db");

const ldap = require("ldapjs");

exports.loginLdap = (req, res) => {
  const { username, password } = req.body;
  const LDAP_URL = process.env.LDAP_URL;

  if (!username || !password) {
    return res.status(400).json({ error: "Debe indicar usuario y contraseña" });
  }

  // Definir DN según usuario
  let userDN;
  if (username === "admin") {
    userDN = `cn=admin,ou=People,dc=instituto,dc=extremadura,dc=es`;
  } else {
    userDN = `uid=${username},ou=People,dc=instituto,dc=extremadura,dc=es`;
  }

  const client = ldap.createClient({ url: LDAP_URL });

  // Bind con credenciales del usuario
  client.bind(userDN, password, (err) => {
    if (err) {
      console.error("🔒 Error en bind LDAP:", err.message);
      return res
        .status(401)
        .json({ error: "Credenciales inválidas", details: err.message });
    }

    const baseDN = "dc=instituto,dc=extremadura,dc=es";

    // Caso especial: si es admin, no comprobamos grupo
    if (username === "admin") {
      // Buscamos employeeNumber aunque sea admin
      const userOptions = {
        scope: "sub",
        filter: `(cn=${username})`, // usar cn en lugar de uid
        attributes: ["employeeNumber", "givenName", "sn"],
      };

      client.search(`ou=People,${baseDN}`, userOptions, (err, searchRes) => {
        if (err) {
          client.unbind();
          return res.status(500).json({
            error: "Error buscando employeeNumber admin",
            details: err.message,
          });
        }

        searchRes.on("searchEntry", (entry) => {
          const empNum =
            entry.attributes.find((a) => a.type === "employeeNumber")
              ?.values[0] || null;
          const givenName =
            entry.attributes.find((a) => a.type === "givenName")?.values[0] ||
            "";
          const sn =
            entry.attributes.find((a) => a.type === "sn")?.values[0] || "";

          req.session.ldap = {
            dn: userDN,
            password,
            employeeNumber: empNum || null,
            givenName: givenName || "",
            sn: sn || "",
          };

          console.log("✅ Admin login correcto, employeeNumber:", empNum);
        });
        // ➜ Lanzar volcado completo usando contraseña del admin
        const volcarProfesoresALaBD = require("../../utils/volcadoProfesores");
        const volcarAusenciasALaBD = require("../../utils/volcadoAusencias");

        Promise.all([
          volcarProfesoresALaBD(password),
          volcarAusenciasALaBD(), // <--- Nueva llamada
        ])
          .then(() =>
            console.log(
              "🟢 Volcados completos (Profesores y Ausencias) ejecutados tras login de admin."
            )
          )
          .catch((err) =>
            console.error("❌ Error en procesos de volcado:", err)
          );

        searchRes.on("end", () => {
          client.unbind();
          return res.json({ message: "Login correcto (usuario admin)" });
        });
      });

      return;
    }

    // Búsqueda normal para grupo teachers/staff
    const groupDN = `ou=Group,${baseDN}`;
    const groupOptions = {
      scope: "sub",
      filter: "(&(objectClass=lisAclGroup)(|(cn=teachers)(cn=staff)))",
      attributes: ["memberUid"],
    };

    client.search(groupDN, groupOptions, (err, searchRes) => {
      if (err) {
        client.unbind();
        return res.status(500).json({
          error: "Error buscando grupo teachers",
          details: err.message,
        });
      }

      let autorizado = false;

      searchRes.on("searchEntry", (entry) => {
        const members =
          entry.attributes.find((attr) => attr.type === "memberUid")?.vals ||
          [];
        if (members.includes(username)) {
          autorizado = true;
        }
      });

      searchRes.on("end", () => {
        if (!autorizado) {
          client.unbind();
          console.warn(
            "⚠️ Acceso denegado: usuario no pertenece a teachers/staff"
          );
          return res.status(403).json({
            error: "Acceso denegado",
            details: "El usuario no pertenece al grupo teachers/staff",
          });
        }

        // Usuario autorizado: buscar employeeNumber y otros detalles
        const userOptions = {
          scope: "sub",
          filter: `(uid=${username})`,
          attributes: ["employeeNumber", "givenName", "sn"], // También añadimos dadoName y sn
        };

        client.search(`ou=People,${baseDN}`, userOptions, (err, searchRes2) => {
          if (err) {
            client.unbind();
            return res.status(500).json({
              error: "Error buscando employeeNumber",
              details: err.message,
            });
          }

          searchRes2.on("searchEntry", (entry) => {
            const empNum =
              entry.attributes.find((a) => a.type === "employeeNumber")
                ?.values[0] || null;
            const givenName =
              entry.attributes.find((a) => a.type === "givenName")?.values[0] ||
              "";
            const sn =
              entry.attributes.find((a) => a.type === "sn")?.values[0] || "";

            // Guardar sesión LDAP con employeeNumber, givenName y sn
            req.session.ldap = {
              dn: userDN,
              password,
              employeeNumber: empNum,
              givenName,
              sn,
            };

            console.log("✅ Login correcto como teacher");
          });

          searchRes2.on("end", async () => {
            try {
              // Buscar perfil en PostgreSQL
              const { rows } = await db.query(
                `SELECT perfil FROM perfiles_usuario WHERE uid = $1`,
                [username]
              );

              const perfil = rows[0]?.perfil || "profesor";

              // Guardar sesión completa
              req.session.user = {
                username,
                perfil,
              };

              console.log("🟢 Perfil cargado:", perfil);

              client.unbind();
              return res.json({
                message: "Login correcto",
                perfil,
              });
            } catch (errDb) {
              console.error("❌ Error obteniendo perfil:", errDb);
              client.unbind();
              return res.status(500).json({
                error: "Error obteniendo perfil de usuario",
              });
            }
          });
        });
      });
    });
  });
};
