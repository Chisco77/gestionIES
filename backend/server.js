require("dotenv").config();

const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const path = require("path");

// Rutas
const authRoutes = require("./routes/authRoutes");
const ldapRoutes = require("./routes/ldapRoutes");
const dbRoutes = require("./routes/dbRoutes");
const excelDietasRoutes = require("./routes/excelDietasRoutes");

// Configuración del pool de PostgreSQL
const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
const INTERNAL_RANGE = "172.16.218.0/23";
const PORT = process.env.PORT || 5000;

// Función para inicializar el servidor
async function initServer() {
  try {
    // Espera a que la base de datos esté disponible
    await pgPool.connect();
    console.log("✅ Conexión a la base de datos establecida");

    // Inicialización del envío de correos SMTP aquí
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true", // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Middleware
    app.set("trust proxy", 1);
    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) callback(null, true);
          else callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
      })
    );
    app.use(express.json());

    app.use(
      session({
        store: new pgSession({
          pool: pgPool,
          tableName: "session",
          createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: isProduction,
          httpOnly: true,
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24,
        },
      })
    );

    // Rutas
    app.use("/api", authRoutes);
    app.use("/api/ldap", ldapRoutes);
    app.use("/api/db", dbRoutes);
    app.use("/api/excel-dietas", excelDietasRoutes);

    //app.use('/uploads/alumnos', express.static(path.join(__dirname, 'uploads/alumnos')));
    app.use(
      "/uploads/alumnos",
      cors({
        origin: allowedOrigins,
      }),
      express.static(path.join(__dirname, "uploads/alumnos"))
    );

    // Inicia el servidor HTTPS o HTTP
    if (!isProduction) {
      const sslOptions = {
        key: fs.readFileSync("./ssl-dev/key.pem"),
        cert: fs.readFileSync("./ssl-dev/cert.pem"),
      };
      https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(
          `🚀 Servidor en https://localhost:${PORT} (desarrollo HTTPS)`
        );
      });
    } else {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Servidor en producción en puerto ${PORT}`);
      });
    }

    // Devuelve el transporter para usar en tus rutas
    return transporter;
  } catch (error) {
    console.error("❌ Error iniciando el servidor:", error);
    process.exit(1);
  }
}

// Inicializa el servidor
initServer().then((transporter) => {
  // Si quieres, puedes exportar el transporter globalmente
  app.locals.transporter = transporter;
});

/*require("dotenv").config();

const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const path = require("path");

// Rutas
const authRoutes = require("./routes/authRoutes");
const ldapRoutes = require("./routes/ldapRoutes");
const dbRoutes = require("./routes/dbRoutes");
const excelDietasRoutes = require("./routes/excelDietasRoutes");

// Configuración del pool de PostgreSQL
const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
const INTERNAL_RANGE = "172.16.218.0/23";
const PORT = process.env.PORT || 5000;

// Función para inicializar el servidor
async function initServer() {
  try {
    // Espera a que la base de datos esté disponible
    await pgPool.connect();
    console.log("✅ Conexión a la base de datos establecida");

    // Inicialización del envío de correos SMTP aquí
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true", // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Middleware
    app.set("trust proxy", 1);
    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) callback(null, true);
          else callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
      })
    );
    app.use(express.json());

    app.use(
      session({
        store: new pgSession({
          pool: pgPool,
          tableName: "session",
          createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: isProduction,
          httpOnly: true,
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24,
        },
      })
    );

    // Rutas
    app.use("/api", authRoutes);
    app.use("/api/ldap", ldapRoutes);
    app.use("/api/db", dbRoutes);
    app.use("/api/excel-dietas", excelDietasRoutes);
    //app.use('/uploads/alumnos', express.static(path.join(__dirname, 'uploads/alumnos')));
    app.use(
      "/uploads/alumnos",
      cors({
        origin: allowedOrigins,
      }),
      express.static(path.join(__dirname, "uploads/alumnos"))
    );

    // Inicia el servidor HTTPS o HTTP
    if (!isProduction) {
      const sslOptions = {
        key: fs.readFileSync("./ssl-dev/key.pem"),
        cert: fs.readFileSync("./ssl-dev/cert.pem"),
      };
      https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(
          `🚀 Servidor en https://localhost:${PORT} (desarrollo HTTPS)`
        );
      });
    } else {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Servidor en producción en puerto ${PORT}`);
      });
    }

    // Devuelve el transporter para usar en tus rutas
    return transporter;
  } catch (error) {
    console.error("❌ Error iniciando el servidor:", error);
    process.exit(1);
  }
}

// Inicializa el servidor
initServer().then((transporter) => {
  // Si quieres, puedes exportar el transporter globalmente
  app.locals.transporter = transporter;
});
*/
