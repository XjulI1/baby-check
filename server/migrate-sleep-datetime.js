const { executeQuery } = require('./db');

async function migrateSleepDateTime() {
  try {
    console.log("Début de la migration pour les heures de début/fin de sommeil...");

    // Ajouter les colonnes sleep_start_time et sleep_end_time
    try {
      const sleepStartExists = await executeQuery(`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 'baby_events'
        AND column_name = 'sleep_start_time'
      `);

      if (sleepStartExists[0].count === 0n) {
        await executeQuery(`
          ALTER TABLE baby_events
          ADD COLUMN sleep_start_time DATETIME NULL
        `);
        console.log("Migration réussie: colonne 'sleep_start_time' ajoutée");
      } else {
        console.log("La colonne 'sleep_start_time' existe déjà, ignoré.");
      }
    } catch (error) {
      throw error;
    }

    try {
      const sleepEndExists = await executeQuery(`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 'baby_events'
        AND column_name = 'sleep_end_time'
      `);

      if (sleepEndExists[0].count === 0n) {
        await executeQuery(`
          ALTER TABLE baby_events
          ADD COLUMN sleep_end_time DATETIME NULL
        `);
        console.log("Migration réussie: colonne 'sleep_end_time' ajoutée");
      } else {
        console.log("La colonne 'sleep_end_time' existe déjà, ignoré.");
      }
    } catch (error) {
      throw error;
    }

    console.log("Migration des heures de sommeil terminée avec succès !");
  } catch (error) {
    console.error("Erreur lors de la migration des heures de sommeil:", error);
    throw error;
  }
}

// Exécuter la migration si ce fichier est appelé directement
if (require.main === module) {
  migrateSleepDateTime()
    .then(() => {
      console.log("Migration terminée.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Échec de la migration:", error);
      process.exit(1);
    });
}

module.exports = { migrateSleepDateTime };
