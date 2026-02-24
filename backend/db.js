/*require("dotenv").config();

const { Pool } = require('pg');

// Crea un pool de conexiones para PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
*/

require("dotenv").config();

const { Pool, types } = require("pg");

// 🔥 MUY IMPORTANTE: evitar conversión automática de timestamps a Date
types.setTypeParser(1114, (value) => value); // timestamp without time zone
types.setTypeParser(1184, (value) => value); // timestamp with time zone

// Crea un pool de conexiones para PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;