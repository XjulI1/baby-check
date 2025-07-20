const { executeQuery } = require('./db');

async function migrateDatabase() {
  try {
    console.log("Début de la migration de la base de données...");

    // 1. Modifier la colonne type pour ajouter 'dodo', 'allaitement' et 'medicaments' à l'ENUM
    try {
      await executeQuery(`
        ALTER TABLE baby_events
        MODIFY COLUMN type ENUM('pipi', 'caca', 'biberon', 'dodo', 'allaitement', 'medicaments') NOT NULL
      `);
      console.log("Migration réussie: 'dodo', 'allaitement' et 'medicaments' ajoutés aux types d'événements");
    } catch (error) {
      if (error.message.includes("Data truncated") || error.message.includes("Duplicate")) {
        console.log("Les types 'dodo', 'allaitement' et 'medicaments' semblent déjà être présents dans l'ENUM, ignoré.");
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

    // 3. Ajouter les colonnes breast_left et breast_right pour l'allaitement
    try {
      // Vérifier si breast_left existe
      const breastLeftExists = await executeQuery(`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 'baby_events'
        AND column_name = 'breast_left'
      `);

      if (breastLeftExists[0].count === 0) {
        await executeQuery(`
          ALTER TABLE baby_events
          ADD COLUMN breast_left BOOLEAN NULL
        `);
        console.log("Migration réussie: colonne 'breast_left' ajoutée");
      } else {
        console.log("La colonne 'breast_left' existe déjà, ignoré.");
      }

      // Vérifier si breast_right existe
      const breastRightExists = await executeQuery(`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 'baby_events'
        AND column_name = 'breast_right'
      `);

      if (breastRightExists[0].count === 0) {
        await executeQuery(`
          ALTER TABLE baby_events
          ADD COLUMN breast_right BOOLEAN NULL
        `);
        console.log("Migration réussie: colonne 'breast_right' ajoutée");
      } else {
        console.log("La colonne 'breast_right' existe déjà, ignoré.");
      }
    } catch (error) {
      throw error;
    }

    // 4. Ajouter les colonnes medication_name et medication_list pour les médicaments
    try {
      // Vérifier si medication_name existe
      const medicationNameExists = await executeQuery(`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 'baby_events'
        AND column_name = 'medication_name'
      `);

      if (medicationNameExists[0].count === 0) {
        await executeQuery(`
          ALTER TABLE baby_events
          ADD COLUMN medication_name VARCHAR(255) NULL
        `);
        console.log("Migration réussie: colonne 'medication_name' ajoutée");
      } else {
        console.log("La colonne 'medication_name' existe déjà, ignoré.");
      }

      // Vérifier si medication_list existe
      const medicationListExists = await executeQuery(`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 'baby_events'
        AND column_name = 'medication_list'
      `);

      if (medicationListExists[0].count === 0) {
        await executeQuery(`
          ALTER TABLE baby_events
          ADD COLUMN medication_list JSON NULL
        `);
        console.log("Migration réussie: colonne 'medication_list' ajoutée");
      } else {
        console.log("La colonne 'medication_list' existe déjà, ignoré.");
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
