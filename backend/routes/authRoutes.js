// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { loginLdap } = require("../controllers/ldap/loginController");

router.post(
  "/login",
  (req, res, next) => {
    console.log("POST /api/login recibido");
    next();
  },
  loginLdap
);

router.get("/check-auth", (req, res) => {
  console.log("check auth entra");
  if (req.session.ldap) {
    console.log("existe session.ldap");
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

module.exports = router;
