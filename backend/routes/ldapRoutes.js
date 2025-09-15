/**
 * ================================================================
 *  Rutas: ldapRoutes.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Rutas relacionadas con LDAP.
 *    Incluyen gestión de usuarios y grupos, así como búsqueda de miembros.
 *
 *  Endpoints:
 *
 *    --- Grupos ---
 *    GET /grupos                   -> Obtener todos los grupos (opcional filter por groupType)
 *    GET /grupos/:gidNumber/miembros -> Obtener miembros (People) de un grupo por gidNumber
 *
 *    --- Usuarios ---
 *    GET /usuarios                 -> Obtener todos los usuarios LDAP
 *    GET /usuariosPorGrupo         -> Obtener alumnos de un grupo específico (req.query.grupo)
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
