const { executeQuery } = require('./db');

async function migrateDatabase() {
  try {
    console.log("Début de la migration de la base de données...");

    // Modifier la colonne type pour ajouter 'dodo' à l'ENUM
    try {
      await executeQuery(`
        ALTER TABLE baby_events
        MODIFY COLUMN type ENUM('pipi', 'caca', 'biberon', 'dodo') NOT NULL
      `);
      console.log("Migration réussie: 'dodo' ajouté aux types d'événements");
    } catch (error) {
      if (error.message.includes("Data truncated") || error.message.includes("Duplicate")) {
        console.log("Le type 'dodo' semble déjà être présent dans l'ENUM, ignoré.");
      } else {
        throw error;
      }
    }

    console.log("Migration terminée avec succès!");
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

migrateDatabase();
