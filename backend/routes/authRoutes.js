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



const express = require("express");
const router = express.Router();
const { loginLdap } = require("../controllers/ldap/loginController");
const {loginExternoLdap } = require ("../controllers/ldap/loginExternoController");

router.post(
  "/login",
  (req, res, next) => {
    next();
  },
  loginLdap
);


router.get("/check-auth", (req, res) => {
  if (req.session.ldap) {
    const uid = req.session.ldap.dn.split(",")[0].replace("uid=", "");
    res.json({ authenticated: true, username: uid });
  } else {
    res.sendStatus(401);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid"); // Elimina la cookie del navegador
    res.status(200).json({ mensaje: "Sesión cerrada correctamente" });
  });
});

// Ruta para login externo
router.post("/login-externo", loginExternoLdap);


module.exports = router;
