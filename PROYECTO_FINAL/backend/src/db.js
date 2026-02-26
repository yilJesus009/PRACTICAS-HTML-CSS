require("dotenv").config();
const pool = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 5501),
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;