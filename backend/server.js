/*const express = require("express");
const session = require("express-session");
const cors = require("cors");

// Rutas
const authRoutes = require("./routes/authRoutes");
const ldapRoutes = require("./routes/ldapRoutes");
const dbRoutes = require("./routes/dbRoutes");

const app = express();

const allowedOrigins = ["http://localhost:5173", "http://172.16.218.200", "http://localhost:5000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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
      sameSite: "None",
      secure: true,
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
});
*/

/*const express = require("express");
const session = require("express-session");
const cors = require("cors");

// Rutas
const authRoutes = require("./routes/authRoutes");
const ldapRoutes = require("./routes/ldapRoutes");
const dbRoutes = require("./routes/dbRoutes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.options("*", cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: "clave-secreta-super-segura",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
  }
}));

// Usar rutas organizadas
app.use("/api", authRoutes);      // login, logout, check-auth
app.use("/api/ldap", ldapRoutes); // usuarios LDAP
app.use("/api/db", dbRoutes);     // cursos BD

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
*/

const express = require("express");
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
});