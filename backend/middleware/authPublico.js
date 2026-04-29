// middleware/authPublico.js
const db = require("../db");

/*const validarTokenPublico = async (req, res, next) => {
  const tokenHeader = req.headers["x-public-token"];
  console.log("LOG 1: [Middleware] Token recibido en header:", tokenHeader);

  if (tokenHeader) {
    try {
      // CAMBIO AQUÍ: Usamos .query y quitamos el de-structuring [rows]
      const result = await db.query(
        "SELECT * FROM access_tokens WHERE token = $1", // PostgreSQL usa $1 en lugar de ?
        [tokenHeader]
      );

      const rows = result.rows; // En 'pg', los datos están en .rows
      console.log("LOG 2: [Middleware] Resultado BD (filas):", rows.length);

      if (rows.length > 0) {
        req.esPantallaPublica = true;
        if (!req.session) req.session = {};

        // Inyectamos la sesión con el usuario de pantalla
        req.session.ldap = {
          uid: "pantalla_sala",
          dn: process.env.LDAP_PUBLIC_USER, // Asegúrate de tener esto en tu .env
          password: process.env.LDAP_PUBLIC_PASS,
          isPublic: true,
        };

        console.log(
          "LOG 3: [Middleware] Sesión inyectada con éxito para:",
          req.session.ldap.uid
        );
        return next();
      } else {
        console.warn("LOG 4: [Middleware] Token no encontrado en BD");
      }
    } catch (error) {
      // Este es el LOG 5 que veíamos antes, ahora debería desaparecer
      console.error(
        "LOG 5: [Middleware] Error en consulta SQL:",
        error.message
      );
    }
  }
  next();
};

module.exports = { validarTokenPublico };
*/

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
          uid: tokenData.nombre, // Usamos el nombre descriptivo
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
