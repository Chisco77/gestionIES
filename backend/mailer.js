const nodemailer = require("nodemailer");

console.log(process.env.GMAIL_APP_PASSWORD);


const mailer = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "comunicaciones@iesfcodeorellana.es",
    pass: process.env.GMAIL_APP_PASSWORD, // contraseña de aplicación
  },
});

console.log(process.env.GMAIL_APP_PASSWORD);

module.exports = mailer;
