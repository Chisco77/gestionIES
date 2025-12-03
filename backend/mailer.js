const nodemailer = require("nodemailer");
const db = require("./db"); 

let mailer = null;

// Obtenemos correo de origen y clave de aplicación.
(async () => {
  try {
    const { rows } = await db.query(
      "SELECT emails, app_password FROM avisos WHERE modulo = 'smtp' LIMIT 1"
    );

    const smtp = rows[0];

    if (!smtp) {
      console.error("❌ No hay configuración SMTP en la tabla avisos");
      return;
    }

    mailer = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: smtp.emails[0],
        pass: smtp.app_password,
      },
    });

    console.log("📧 SMTP cargado correctamente:", smtp.emails[0]);
  } catch (err) {
    console.error("❌ Error inicializando SMTP:", err);
  }
})();

// Transportador
module.exports = {
  sendMail: async (...args) => {
    if (!mailer) throw new Error("SMTP no configurado todavía");
    return mailer.sendMail(...args);
  },
};
