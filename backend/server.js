/*require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
// require("dotenv").config(); // Ya se requiere al principio del archivo, puedes eliminar esta línea duplicada si lo deseas

const authRoutes = require("./routes/authRoutes");
const ldapRoutes = require("./routes/ldapRoutes");
const dbRoutes = require("./routes/dbRoutes");

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

// MUY IMPORTANTE: Necesario cuando la aplicación Node.js está detrás de un proxy (como Nginx)
// Le dice a Express que confíe en los encabezados X-Forwarded-* (como X-Forwarded-Proto)
// que el proxy enviará, permitiendo que 'req.protocol' refleje el protocolo original (HTTPS).
app.set("trust proxy", 1);

// 🛡️ CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir solicitudes sin 'origin' (ej. de herramientas como Postman, o peticiones de mismo origen)
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
      secure: true, // La cookie solo se enviará sobre HTTPS en producción
      httpOnly: true,
      // 'lax' es a menudo una mejor opción para la mayoría de las aplicaciones en producción
      // permite que la cookie sea enviada con navegación de nivel superior y solicitudes GET
      sameSite: "lax", // Ajustado a "lax" para producción, era "strict" anteriormente
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
  // Escucha en todas las interfaces para ser accesible desde Nginx
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor en producción en puerto ${PORT}`);
  });
}
*/

require("dotenv").config();

const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const cors = require("cors");
const fs = require("fs");
const https = require("https");

const authRoutes = require("./routes/authRoutes");
const ldapRoutes = require("./routes/ldapRoutes");
const dbRoutes = require("./routes/dbRoutes");

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

// 🔐 Pool de conexión a PostgreSQL (para sesiones y otras operaciones si lo deseas)
const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 🔧 Confía en proxy (por ejemplo, NGINX en producción)
app.set("trust proxy", 1);

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

// 🧠 Sesiones con almacenamiento en PostgreSQL
app.use(
  session({
    store: new pgSession({
      pool: pgPool, // Usa la conexión a PostgreSQL
      tableName: "session", // Puedes cambiar el nombre si quieres
      createTableIfMissing: true, // Crea automáticamente la tabla si no existe
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // true solo en producción con HTTPS real
      httpOnly: true,
      sameSite: "lax", // o "strict" si necesitas mayor seguridad
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    },
  })
);

// 🔁 Rutas
app.use("/api", authRoutes);
app.use("/api/ldap", ldapRoutes);
app.use("/api/db", dbRoutes);

// 🚀 Servidor
const PORT = process.env.PORT || 5000;

if (!isProduction) {
  const sslOptions = {
    key: fs.readFileSync("./ssl-dev/key.pem"),
    cert: fs.readFileSync("./ssl-dev/cert.pem"),
  };

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`🚀 Servidor en https://localhost:${PORT} (desarrollo HTTPS)`);
  });
} else {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor en producción en puerto ${PORT}`);
  });
}
