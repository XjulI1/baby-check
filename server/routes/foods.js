const express = require('express');
const { executeQuery } = require('../db');
const router = express.Router();

/**
 * GET /api/foods/:childId
 * Récupérer tous les aliments découverts pour un enfant
 */
router.get('/:childId', async (req, res) => {
  try {
    const { childId } = req.params;

    const foods = await executeQuery(
      'SELECT * FROM discovered_foods WHERE child_id = ? ORDER BY first_tasted_date DESC',
      [childId]
    );

    // Convertir les dates en format ISO pour le frontend
    const formattedFoods = foods.map(food => ({
      ...food,
      first_tasted_date: food.first_tasted_date.toISOString(),
      created_at: food.created_at.toISOString(),
      updated_at: food.updated_at.toISOString()
    }));

    res.json(formattedFoods);
  } catch (error) {
    console.error('Erreur lors de la récupération des aliments:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des aliments' });
  }
});

/**
 * POST /api/foods
 * Ajouter ou mettre à jour un aliment découvert
 */
router.post('/', async (req, res) => {
  try {
    const { name, category, reaction, childId, date } = req.body;

    if (!name || !category || !reaction || !childId) {
      return res.status(400).json({
        error: 'Les champs name, category, reaction et childId sont requis'
      });
    }

    const tastedDate = date ? new Date(date) : new Date();

    // Vérifier si l'aliment existe déjà pour cet enfant
    const existingFood = await executeQuery(
      'SELECT * FROM discovered_foods WHERE name = ? AND child_id = ?',
      [name, childId]
    );

    let result;

    if (existingFood.length > 0) {
      // Mettre à jour l'aliment existant
      result = await executeQuery(`
        UPDATE discovered_foods
        SET last_reaction = ?, tasting_count = tasting_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE name = ? AND child_id = ?
      `, [reaction, name, childId]);

      // Récupérer l'aliment mis à jour
      const updatedFood = await executeQuery(
        'SELECT * FROM discovered_foods WHERE name = ? AND child_id = ?',
        [name, childId]
      );

      res.json({
        message: 'Aliment mis à jour avec succès',
        food: {
          ...updatedFood[0],
          first_tasted_date: updatedFood[0].first_tasted_date.toISOString(),
          created_at: updatedFood[0].created_at.toISOString(),
          updated_at: updatedFood[0].updated_at.toISOString()
        }
      });
    } else {
      // Ajouter un nouvel aliment
      result = await executeQuery(`
        INSERT INTO discovered_foods (name, category, first_tasted_date, last_reaction, tasting_count, child_id)
        VALUES (?, ?, ?, ?, 1, ?)
      `, [name, category, tastedDate, reaction, childId]);

      // Récupérer l'aliment créé
      const newFood = await executeQuery(
        'SELECT * FROM discovered_foods WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        message: 'Aliment ajouté avec succès',
        food: {
          ...newFood[0],
          first_tasted_date: newFood[0].first_tasted_date.toISOString(),
          created_at: newFood[0].created_at.toISOString(),
          updated_at: newFood[0].updated_at.toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout/mise à jour de l\'aliment:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'ajout/mise à jour de l\'aliment' });
  }
});

/**
 * DELETE /api/foods/:childId/:foodName
 * Supprimer un aliment découvert
 */
router.delete('/:childId/:foodName', async (req, res) => {
  try {
    const { childId, foodName } = req.params;
    const decodedFoodName = decodeURIComponent(foodName);

    const result = await executeQuery(
      'DELETE FROM discovered_foods WHERE name = ? AND child_id = ?',
      [decodedFoodName, childId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aliment non trouvé' });
    }

    res.json({ message: 'Aliment supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'aliment:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'aliment' });
  }
});

/**
 * GET /api/foods/:childId/stats
 * Récupérer les statistiques des aliments pour un enfant
 */
router.get('/:childId/stats', async (req, res) => {
  try {
    const { childId } = req.params;

    // Statistiques par catégorie
    const categoryStats = await executeQuery(`
      SELECT category, COUNT(*) as count
      FROM discovered_foods
      WHERE child_id = ?
      GROUP BY category
    `, [childId]);

    // Statistiques par réaction
    const reactionStats = await executeQuery(`
      SELECT last_reaction as reaction, COUNT(*) as count
      FROM discovered_foods
      WHERE child_id = ?
      GROUP BY last_reaction
    `, [childId]);

    // Total d'aliments
    const totalResult = await executeQuery(
      'SELECT COUNT(*) as total FROM discovered_foods WHERE child_id = ?',
      [childId]
    );

    res.json({
      total: totalResult[0].total,
      byCategory: categoryStats.reduce((acc, stat) => {
        acc[stat.category] = stat.count;
        return acc;
      }, {}),
      byReaction: reactionStats.reduce((acc, stat) => {
        acc[stat.reaction] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des statistiques' });
  }
});

module.exports = router;
