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

const ldap = require("ldapjs");

exports.loginLdap = (req, res) => {
  const { username, password } = req.body;
  const LDAP_URL = process.env.LDAP_URL;

  if (!username || !password) {
    return res.status(400).json({ error: "Usuario o contraseña faltantes" });
  }

  const userDN = `uid=${username},ou=People,dc=instituto,dc=extremadura,dc=es`;
  
  console.log ("LDAP: ", LDAP_URL);
  const client = ldap.createClient({
    url: LDAP_URL,
  });

  // bind con credenciales del usuario
  client.bind(userDN, password, (err) => {
    if (err) {
      console.error("🔒 Error en bind LDAP:", err.message);
      return res
        .status(401)
        .json({ error: "Credenciales inválidas", details: err.message });
    }


    const baseDN = "dc=instituto,dc=extremadura,dc=es";
    const groupDN = `ou=Group,${baseDN}`;
    const groupOptions = {
      scope: "sub",
      filter: "(&(objectClass=lisAclGroup)(cn=teachers))",
      attributes: ["memberUid"],
    };

    // buscar uid en grupo teachers
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
        const members = entry.attributes
          .find((attr) => attr.type === "memberUid")
          ?.vals || [];
        if (members.includes(username)) {
          autorizado = true;
        }
      });

      searchRes.on("end", () => {
        client.unbind();

        if (!autorizado) {
          return res.status(403).json({
            error: "Acceso denegado",
            details: "El usuario no pertenece al grupo teachers",
          });
        }

        // guardar sesión solo si pertenece a teachers
        req.session.ldap = {
          dn: userDN,
          password: password,
        };

        res.json({ message: "Login correcto (grupo teachers)" });
      });
    });
  });
};
