// Fichier pour configurer la connexion à la base de données MariaDB
import mariadb from 'mariadb'

// Configuration de la connexion à MariaDB
const pool = mariadb.createPool({
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: Number(import.meta.env.VITE_DB_PORT) || 3306,
  user: import.meta.env.VITE_DB_USER || 'root',
  password: import.meta.env.VITE_DB_PASSWORD || '',
  database: import.meta.env.VITE_DB_DATABASE || 'baby_check',
  connectionLimit: 5,
})

export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  let conn
  try {
    conn = await pool.getConnection()
    const res = await conn.query(query, params)
    return res
  } catch (err) {
    console.error("Erreur lors de l'exécution de la requête:", err)
    throw err
  } finally {
    if (conn) conn.release()
  }
}

// Initialisation de la base de données
export async function initDatabase() {
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
    `)
    console.log('Base de données initialisée avec succès')
  } catch (err) {
    console.error("Erreur lors de l'initialisation de la base de données:", err)
  }
}
