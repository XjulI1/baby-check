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
          type ENUM('pipi', 'caca', 'biberon', 'dodo', 'allaitement') NOT NULL,
          timestamp DATETIME NOT NULL,
          quantity DECIMAL(5,2) NULL,
          notes TEXT NULL,
          child_id VARCHAR(100) NULL,
          breast_left BOOLEAN NULL,
          breast_right BOOLEAN NULL
        )
      `);
      console.log('Table baby_events créée avec succès');
    } else {
      // La table existe, vérifier si les colonnes requises existent
      try {
        // Vérifier si la colonne child_id existe
        const columnExists = await executeQuery(`
          SELECT COUNT(*) as count
          FROM information_schema.columns
          WHERE table_schema = DATABASE()
          AND table_name = 'baby_events'
          AND column_name = 'child_id'
        `);

        if (columnExists[0].count === 0n) {
          // Ajouter la colonne child_id si elle n'existe pas
          await executeQuery(`
            ALTER TABLE baby_events
            ADD COLUMN child_id VARCHAR(100) NULL
          `);
          console.log("Colonne 'child_id' ajoutée avec succès");
        }

        // Vérifier et mettre à jour l'ENUM pour inclure 'dodo' et 'allaitement'
        try {
          await executeQuery(`
            ALTER TABLE baby_events
            MODIFY COLUMN type ENUM('pipi', 'caca', 'biberon', 'dodo', 'allaitement') NOT NULL
          `);
          console.log("Types 'dodo' et 'allaitement' ajoutés à l'ENUM avec succès");
        } catch (alterErr) {
          // Si l'erreur est due au fait que l'ENUM contient déjà les types, c'est OK
          if (!alterErr.message.includes("Data truncated")) {
            throw alterErr;
          }
          console.log("Les types 'dodo' et 'allaitement' sont déjà présents dans l'ENUM");
        }

        // Vérifier si les colonnes breast_left et breast_right existent
        const breastLeftExists = await executeQuery(`
          SELECT COUNT(*) as count
          FROM information_schema.columns
          WHERE table_schema = DATABASE()
          AND table_name = 'baby_events'
          AND column_name = 'breast_left'
        `);

        if (breastLeftExists[0].count === 0n) {
          await executeQuery(`
            ALTER TABLE baby_events
            ADD COLUMN breast_left BOOLEAN NULL
          `);
          console.log("Colonne 'breast_left' ajoutée avec succès");
        }

        const breastRightExists = await executeQuery(`
          SELECT COUNT(*) as count
          FROM information_schema.columns
          WHERE table_schema = DATABASE()
          AND table_name = 'baby_events'
          AND column_name = 'breast_right'
        `);

        if (breastRightExists[0].count === 0n) {
          await executeQuery(`
            ALTER TABLE baby_events
            ADD COLUMN breast_right BOOLEAN NULL
          `);
          console.log("Colonne 'breast_right' ajoutée avec succès");
        }
      } catch (err) {
        console.error("Erreur lors de la vérification/mise à jour du schéma:", err);
        throw err;
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
