const { executeQuery } = require('./db');

async function migrateDatabase() {
  try {
    console.log("Début de la migration de la base de données...");

    // 1. Modifier la colonne type pour ajouter 'dodo' à l'ENUM
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

    // 2. Ajouter la colonne child_id si elle n'existe pas encore
    try {
      const columnExists = await executeQuery(`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 'baby_events'
        AND column_name = 'child_id'
      `);

      if (columnExists[0].count === 0) {
        await executeQuery(`
          ALTER TABLE baby_events
          ADD COLUMN child_id VARCHAR(100) NULL
        `);
        console.log("Migration réussie: colonne 'child_id' ajoutée");
      } else {
        console.log("La colonne 'child_id' existe déjà, ignoré.");
      }
    } catch (error) {
      throw error;
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
