/**
 * ================================================================
 *  Rutas: authRoutes.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Rutas relacionadas con autenticación mediante LDAP.
 *    Permiten iniciar sesión, comprobar autenticación y cerrar sesión.
 *
 *  Endpoints:
 *    POST /login
 *      - Llama a loginLdap para autenticar un usuario en LDAP.
 *      - Body: { username, password }
 *
 *    GET /check-auth
 *      - Comprueba si hay sesión LDAP activa.
 *      - Responde con { authenticated: true, username } si la sesión existe.
 *      - Responde 401 si no hay sesión.
 *
 *    POST /logout
 *      - Elimina la sesión LDAP y la cookie asociada.
 *      - Responde con mensaje de cierre de sesión.
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

// authRoutes.js
const express = require("express");
const router = express.Router();
const { loginLdap } = require("../controllers/ldap/loginController");

const pool = require("../db"); // conexión a PostgreSQL

router.post("/login", loginLdap);


// Check auth con perfil y datos LDAP
router.get("/check-auth", async (req, res) => {
  if (!req.session.ldap) {
    console.log("🔒 No autenticado: No hay datos en la sesión LDAP");
    return res.status(401).json({ authenticated: false, error: "No autenticado" });
  }

  try {
    const { dn, password, employeeNumber, givenName, sn } = req.session.ldap;

    // Log de los datos de la sesión LDAP
    console.log("🔑 Datos de la sesión LDAP:", { dn, employeeNumber, givenName, sn });

    const match = dn.match(/^(uid|cn)=(.+?),/);
    const uid = match ? match[2] : dn;

    // Consultar perfil en PostgreSQL
    const result = await pool.query(
      "SELECT perfil FROM perfiles_usuario WHERE uid = $1 LIMIT 1",
      [uid]
    );
    const perfil = result.rows.length > 0 ? result.rows[0].perfil : "profesor";

     // Enviar respuesta con los datos de la sesión y perfil
    return res.json({
      authenticated: true,
      username: uid,
      uid,
      perfil,
      employeeNumber,
      givenName,
      sn,
    });

  } catch (error) {
    console.error("❌ Error consultando perfil:", error);
    return res.status(500).json({ error: "Error obteniendo perfil" });
  }
});




router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    res.status(200).json({ mensaje: "Sesión cerrada correctamente" });
  });
});

module.exports = router;
