const express = require("express");
const session = require("express-session");
const cors = require("cors");

const { getLdapAlumnos } = require("./controllers/usuariosController");
const { loginLdap } = require("./controllers/loginController");

const app = express();

// 💡 Paso 1: Configurar CORS con origin fijo y credentials
app.use(cors({
  origin: "http://localhost:5173", // ⚠️ frontend Vite
  credentials: true
}));

// 💡 Paso 2: Aceptar preflight OPTIONS explícitamente
app.options("*", cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// 💡 Paso 3: Middleware ordenado
app.use(express.json());

app.use(session({
  secret: "clave-secreta-super-segura",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true si HTTPS
    httpOnly: true,
    sameSite: "lax"
  }
}));

// 💡 Paso 4: Endpoints
app.post("/api/login", loginLdap);
app.get("/api/ldap/alumnos", getLdapAlumnos);

app.get("/api/check-auth", (req, res) => {
  if (req.session.ldap) {
    const uid = req.session.ldap.dn.split(",")[0].replace("uid=", "");
    res.json({ authenticated: true, username: uid });
  } else {
    res.sendStatus(401);
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.sendStatus(200));
});

// 💡 Paso 5: Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor LDAP backend en http://localhost:${PORT}`);
});