const { Pool } = require('pg');

// Crea un pool de conexiones para PostgreSQL
const pool = new Pool({
  user: 'postgres',           // Cambia por tu usuario de PostgreSQL
  host: 'localhost',
  database: 'becarios',   // Cambia por tu base de datos
  password: '79Mor77Men2009',   // Cambia por tu contraseña
  port: 5432,
});

module.exports = pool;
