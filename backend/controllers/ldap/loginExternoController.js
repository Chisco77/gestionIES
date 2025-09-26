/**
 * ================================================================
 *  Controller: loginExternoController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para autenticación mediante LDAP desde fuera de subred orellana
 *    Permite iniciar sesión validando credenciales en el directorio LDAP.
 *    Solo para usuarios del grupo "teachers"
 *
 *  Funcionalidades:
 *    - loginExternoLdap: valida usuario y contraseña en LDAP y crea sesión.
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
const { Pool } = require("pg");

exports.loginExternoLdap = async (req, res) => {
    
  // datos de conexion se pasan en el body, forman parte de la sesion ldap  
  const {
    username,
    password,
    ldapHost,
    pgHost,
    pgDatabase,
    pgUser,
    pgPassword,
  } = req.body;

  
  if (!username || !password || !ldapHost || !pgHost || !pgDatabase) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }


  const LDAP_URL = `ldap://${ldapHost}`;

  const client = ldap.createClient({ url: LDAP_URL });

  const userDN = `uid=${username},ou=People,dc=instituto,dc=extremadura,dc=es`;

  // Bind con LDAP externo
  console.log("LDAP externo: ", LDAP_URL);

  client.bind(userDN, password, async (err) => {
    if (err) {
      console.error("Error bind LDAP externo:", err.message);
      return res.status(401).json({ error: "Credenciales LDAP inválidas" });
    }

    // Buscar grupo teachers
    const baseDN = "dc=instituto,dc=extremadura,dc=es";
    const groupDN = `ou=Group,${baseDN}`;
    const groupOptions = {
      scope: "sub",
      filter: "(&(objectClass=lisAclGroup)(cn=teachers))",
      attributes: ["memberUid"],
    };

    console.log("hace bind.");
    client.search(groupDN, groupOptions, async (err, searchRes) => {
      if (err) {
        client.unbind();
        return res.status(500).json({ error: "Error buscando grupo teachers" });
      }
      console.log ("Hace search");
      let autorizado = false;

      searchRes.on("searchEntry", (entry) => {
        const members =
          entry.attributes.find((a) => a.type === "memberUid")?.vals || [];
        if (members.includes(username)) autorizado = true;
      });

      searchRes.on("end", async () => {
        client.unbind();

        if (!autorizado) {
          return res.status(403).json({ error: "Usuario no autorizado" });
        }

        // Guardar sesión
        req.session.ldap = { dn: userDN, password, external: true, ldapHost };

        // Conectar PostgreSQL externo
        const pool = new Pool({
          host: pgHost,
          port: 5432,
          user: pgUser,
          password: pgPassword,
          database: pgDatabase,
        });

        try {
          await pool.query("SELECT 1"); // test de conexión
        } catch (err) {
          return res
            .status(500)
            .json({ error: "Error conexión BD externa", details: err.message });
        }

        // Guardar datos de DB en la sesión
        req.session.dbConfig = {
          host: pgHost,
          database: pgDatabase,
          user: pgUser,
          password: pgPassword,
        };

        res.json({ message: "Login externo correcto" });
      });
    });
  });
};
