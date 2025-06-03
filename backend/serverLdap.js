// server.js
const express = require("express");
const ldap = require("ldapjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Para poder leer y manejar las cookies
const alumnosController = require('./controllers/alumnosController');  // Importamos el controlador de alumnos

const app = express();
const port = 5000;

// Configura CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Tu frontend
    credentials: true, // Permite que las cookies se envíen
  })
);

app.use(bodyParser.json());
app.use(cookieParser()); // Middleware para manejar cookies

const ldapClient = ldap.createClient({
  url: "ldap://172.16.218.2", // Dirección de tu servidor LDAP
});

// Endpoint de login para autenticación con LDAP
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const dn = `uid=${username},ou=People,dc=instituto,dc=extremadura,dc=es`; // Formato del DN

  ldapClient.bind(dn, password, (err) => {
    if (err) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    } else {
      const token = jwt.sign({ username }, "your-secret-key", { expiresIn: "1h" });
      return res.status(200).json({
        message: "Autenticación exitosa",
        accessToken: token,
      });
    }
  });
});

// Endpoint de logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  return res.status(200).json({ message: "Sesión cerrada con éxito" });
});

// Rutas para alumnos
app.use('/api', alumnosController);  // Añadimos el controlador de alumnos

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
