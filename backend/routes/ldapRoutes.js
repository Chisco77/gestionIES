// routes/ldapRoutes.js
const express = require("express");
const router = express.Router();
const { getLdapUsuarios } = require("../controllers/ldap/usuariosController");

router.get("/usuarios", getLdapUsuarios);

module.exports = router;
