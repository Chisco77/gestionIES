/**
 * ================================================================
 *  Controller: loginController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para autenticación mediante LDAP.
 *    Permite iniciar sesión validando credenciales en el directorio LDAP.
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



const ldap = require('ldapjs');
//const LDAP_URL = import.meta.env.LDAP_URL;

exports.loginLdap = (req, res) => {
  const { username, password } = req.body;
  const LDAP_URL = process.env.LDAP_URL;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario o contraseña faltantes' });
  }

  const userDN = `uid=${username},ou=People,dc=instituto,dc=extremadura,dc=es`;

  const client = ldap.createClient({
   // url: 'ldap://172.16.218.2:389' // Cambia a IP o dominio real
    url: LDAP_URL // Cambia a IP o dominio real
  });

  client.bind(userDN, password, (err) => {
  if (err) {
    console.error("🔒 Error en bind LDAP:", err.message); // <--- log directo
    return res.status(401).json({ error: "Credenciales inválidas", details: err.message });
  }

  req.session.ldap = {
    dn: userDN,
    password: password,
  };

  client.unbind();
  res.json({ message: "Login correcto" });
});

};
