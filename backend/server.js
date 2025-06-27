/*const express = require("express");
const session = require("express-session");
const cors = require("cors");

// Rutas
const authRoutes = require("./routes/authRoutes");
const ldapRoutes = require("./routes/ldapRoutes");
const dbRoutes = require("./routes/dbRoutes");

const app = express();

// 🛠️ 1. CORS (debe ir primero)
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,              // para que funcione req.session
  })
);

// 🛠️ 2. JSON parser
app.use(express.json());

// 🛠️ 3. Sesiones
app.use(
  session({
    secret: "clave-secreta-super-segura",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// 🛠️ 4. Rutas
app.use("/api", authRoutes);
app.use("/api/ldap", ldapRoutes);
app.use("/api/db", dbRoutes);

// 🛠️ 5. Puerto
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});*/
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const ldapRoutes = require("./routes/ldapRoutes");
const dbRoutes = require("./routes/dbRoutes");

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.set("trust proxy", 1); // necesario detrás de nginx en producción

// 🛡️ CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS bloqueado para:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// 🛠️ Body parser
app.use(express.json());

// 🛠️ Sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // solo cookies seguras si estamos en producción
      httpOnly: true,
      sameSite: isProduction ? "lax" : "strict",
    },
  })
);

// 🛠️ Rutas
app.use("/api", authRoutes);
app.use("/api/ldap", ldapRoutes);
app.use("/api/db", dbRoutes);

// 🛠️ Servidor
const PORT = process.env.PORT || 5000;

if (!isProduction) {
  // Desarrollo local con HTTPS
  const sslOptions = {
    key: fs.readFileSync("./ssl-dev/key.pem"),
    cert: fs.readFileSync("./ssl-dev/cert.pem"),
  };

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`🚀 Servidor en https://localhost:${PORT} (desarrollo HTTPS)`);
  });
} else {
  // Producción detrás de NGINX
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor en producción en puerto ${PORT}`);
  });
}
