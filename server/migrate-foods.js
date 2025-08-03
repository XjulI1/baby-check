const { executeQuery } = require('./db');

/**
 * Migration pour ajouter le support des aliments (diversification alimentaire)
 */
async function migrateFoodSupport() {
  try {
    console.log('🍽️ Début de la migration pour le support des aliments...');

    // 1. Mettre à jour l'ENUM type pour inclure 'aliment'
    console.log('1. Ajout du type "aliment" dans l\'ENUM...');
    await executeQuery(`
      ALTER TABLE baby_events
      MODIFY COLUMN type ENUM('pipi', 'caca', 'biberon', 'dodo', 'allaitement', 'medicaments', 'aliment', 'bain) NOT NULL
    `);
    console.log('✅ Type "aliment" ajouté avec succès');

    // 2. Ajouter les colonnes pour les aliments
    console.log('2. Ajout des colonnes pour les aliments...');

    // Vérifier si les colonnes existent déjà
    const foodItemExists = await executeQuery(`
      SELECT COUNT(*) as count
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
      AND table_name = 'baby_events'
      AND column_name = 'food_item'
    `);
    console.log(`Colonne food_item existe déjà: ${foodItemExists[0].count}`);
    if (parseInt(foodItemExists[0].count) === 0) {
      await executeQuery(`
        ALTER TABLE baby_events
        ADD COLUMN food_item VARCHAR(255) NULL,
        ADD COLUMN food_category ENUM('fruits', 'legumes', 'viandes', 'poissons', 'cereales', 'laitiers', 'autres') NULL,
        ADD COLUMN food_reaction ENUM('aime', 'neutre', 'naime_pas', 'allergie') NULL
      `);
      console.log('✅ Colonnes pour les aliments ajoutées avec succès');
    } else {
      console.log('ℹ️ Les colonnes pour les aliments existent déjà');
    }

    // 3. Créer la table pour l'historique des aliments découverts
    console.log('3. Création de la table des aliments découverts...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS discovered_foods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category ENUM('fruits', 'legumes', 'viandes', 'poissons', 'cereales', 'laitiers', 'autres') NOT NULL,
        first_tasted_date DATETIME NOT NULL,
        last_reaction ENUM('aime', 'neutre', 'naime_pas', 'allergie') NOT NULL,
        tasting_count INT DEFAULT 1,
        child_id VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_food_child (name, child_id),
        INDEX idx_child_category (child_id, category),
        INDEX idx_first_tasted (first_tasted_date)
      )
    `);
    console.log('✅ Table discovered_foods créée avec succès');

    console.log('🎉 Migration pour le support des aliments terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration des aliments:', error);
    throw error;
  }
}

// Exporter la fonction de migration
module.exports = { migrateFoodSupport };

// Si ce script est exécuté directement, lancer la migration
if (require.main === module) {
  const { initDatabase } = require('./db');

  async function runMigration() {
    try {
      await initDatabase();
      await migrateFoodSupport();
      console.log('Migration terminée !');
      process.exit(0);
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
      process.exit(1);
    }
  }

  runMigration();
}
