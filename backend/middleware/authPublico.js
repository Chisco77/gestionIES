// middleware/authPublico.js
const db = require("../db");

const validarTokenPublico = async (req, res, next) => {
  const tokenHeader = req.headers["x-public-token"];

  if (tokenHeader) {
    try {
      const result = await db.query(
        "SELECT * FROM access_tokens WHERE token = $1",
        [tokenHeader]
      );

      const tokenData = result.rows[0];

      if (tokenData) {
        req.esPantallaPublica = true;
        if (!req.session) req.session = {};

        // Inyectamos los datos dinámicos desde la BD
        req.session.ldap = {
          uid: tokenData.nombre, // nombre descriptivo
          dn: tokenData.ldap_user, // Extraído de la columna ldap_user
          password: tokenData.ldap_pass, // Extraído de la columna ldap_pass
          isPublic: true,
        };

        return next();
      }
    } catch (error) {
      console.error("Error en validación de token dinámico:", error.message);
    }
  }
  next();
};

module.exports = { validarTokenPublico };
