const mariadb = require('mariadb');
const dotenv = require('dotenv');

dotenv.config();

// Configuration de la connexion à MariaDB
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'baby_check',
  connectionLimit: 5,
});

async function executeQuery(query, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(query, params);
    return res;
  } catch (err) {
    console.error("Erreur lors de l'exécution de la requête:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// Initialisation de la base de données
async function initDatabase() {
  try {
    // Créer la table des événements si elle n'existe pas
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS baby_events (
        id VARCHAR(50) PRIMARY KEY,
        type ENUM('pipi', 'caca', 'biberon') NOT NULL,
        timestamp DATETIME NOT NULL,
        quantity DECIMAL(5,2) NULL,
        notes TEXT NULL
      )
    `);
    console.log('Base de données initialisée avec succès');
  } catch (err) {
    console.error("Erreur lors de l'initialisation de la base de données:", err);
    throw err;
  }
}

module.exports = {
  executeQuery,
  initDatabase
};
