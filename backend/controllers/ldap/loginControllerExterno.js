/**
 * ================================================================
 *  Controller: loginExternoController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para autenticación externa mediante LDAP.
 *    Permite iniciar sesión contra un LDAP remoto autorizado.
 *
 *  Funcionalidades:
 *    - loginExterno: valida usuario y contraseña en un LDAP indicado
 *      por el cliente (si está permitido) y crea sesión.
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

exports.loginLdapExterno = async (req, res) => {
  const { username, password, ldapHost, pgHost, pgDatabase, pgUser, pgPassword } = req.body;

  if (!username || !password || !ldapHost || !pgHost || !pgDatabase || !pgUser || !pgPassword) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const userDN = `uid=${username},ou=People,dc=instituto,dc=extremadura,dc=es`;
  const client = ldap.createClient({ url: `ldap://${ldapHost}` });

  // Bind LDAP
  client.bind(userDN, password, async (err) => {
    if (err) return res.status(401).json({ error: "Credenciales LDAP inválidas", details: err.message });

    // Conectar a PostgreSQL remoto
    const pool = new Pool({
      host: pgHost,
      database: pgDatabase,
      user: pgUser,
      password: pgPassword,
      port: 5432,
    });

    try {
      await pool.query("SELECT 1"); // prueba conexión
      pool.end();

      // Guardar sesión
      req.session.ldap = { dn: userDN, password, ldapHost, pgHost, pgDatabase, pgUser };
      res.json({ message: "Login externo correcto" });
    } catch (dbErr) {
      res.status(401).json({ error: "Error conexión PostgreSQL", details: dbErr.message });
    } finally {
      client.unbind();
    }
  });
};
