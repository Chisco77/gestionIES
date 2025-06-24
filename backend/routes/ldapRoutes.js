// routes/ldapRoutes.js
const express = require("express");
const router = express.Router();
const {
  getLdapUsuarios,
  obtenerAlumnosPorGrupo,
} = require("../controllers/ldap/usuariosController");

const {
  getLdapGrupos,
  getMiembrosPorGidNumber,
} = require("../controllers/ldap/gruposController");

router.get("/grupos", getLdapGrupos);
router.get("/grupos/:gidNumber/miembros", getMiembrosPorGidNumber);
router.get("/usuarios", getLdapUsuarios);
router.get("/usuariosPorGrupo", obtenerAlumnosPorGrupo);

module.exports = router;
