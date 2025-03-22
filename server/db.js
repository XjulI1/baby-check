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
    // Vérifier si la table existe déjà
    const tableExists = await executeQuery(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'baby_events'
    `);

    if (tableExists[0].count === 0) {
      // Créer la table des événements si elle n'existe pas
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS baby_events (
          id VARCHAR(50) PRIMARY KEY,
          type ENUM('pipi', 'caca', 'biberon', 'dodo') NOT NULL,
          timestamp DATETIME NOT NULL,
          quantity DECIMAL(5,2) NULL,
          notes TEXT NULL
        )
      `);
      console.log('Table baby_events créée avec succès');
    } else {
      // La table existe, vérifier si le type 'dodo' est déjà dans l'ENUM
      try {
        // Tenter d'ajouter le type 'dodo' à l'ENUM si ce n'est pas déjà fait
        await executeQuery(`
          ALTER TABLE baby_events
          MODIFY COLUMN type ENUM('pipi', 'caca', 'biberon', 'dodo') NOT NULL
        `);
        console.log("Type 'dodo' ajouté à l'ENUM avec succès");
      } catch (alterErr) {
        // Si l'erreur est due au fait que l'ENUM contient déjà 'dodo', c'est OK
        if (!alterErr.message.includes("Data truncated")) {
          throw alterErr;
        }
        console.log("Le type 'dodo' est déjà présent dans l'ENUM");
      }
    }

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
