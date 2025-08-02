const express = require('express');
const router = express.Router();
const { executeQuery } = require('../db');

// Fonction helper pour formater les événements
function formatEvent(event) {
  return {
    id: event.id,
    type: event.type,
    timestamp: new Date(event.timestamp),
    quantity: event.quantity !== null ? Number(event.quantity) : undefined,
    notes: event.notes || undefined,
    childId: event.child_id || undefined,
    breastLeft: event.breast_left || undefined,
    breastRight: event.breast_right || undefined,
    medicationName: event.medication_name || undefined,
    medicationList: event.medication_list ? event.medication_list : undefined,
    foodItem: event.food_item || undefined,
    foodCategory: event.food_category || undefined,
    foodReaction: event.food_reaction || undefined,
    sleepStartTime: event.sleep_start_time ? new Date(event.sleep_start_time) : undefined,
    sleepEndTime: event.sleep_end_time ? new Date(event.sleep_end_time) : undefined
  };
}

// Récupérer tous les événements
router.get('/', async (req, res) => {
  try {
    const { childId } = req.query;
    let query = 'SELECT * FROM baby_events';
    let params = [];

    if (childId) {
      query += ' WHERE child_id = ?';
      params.push(childId);
    }

    query += ' ORDER BY timestamp DESC';

    const results = await executeQuery(query, params);

    // Formater les résultats pour qu'ils correspondent au format attendu par le client
    const formattedResults = results.map(formatEvent);

    res.json(formattedResults);
  } catch (err) {
    console.error('Erreur lors de la récupération des événements:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements' });
  }
});

// Récupérer les événements pour une date spécifique
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { childId } = req.query;
    const startDate = `${date} 00:00:00`;
    const endDate = `${date} 23:59:59`;

    let query = 'SELECT * FROM baby_events WHERE timestamp BETWEEN ? AND ?';
    let params = [startDate, endDate];

    if (childId) {
      query += ' AND child_id = ?';
      params.push(childId);
    }

    query += ' ORDER BY timestamp DESC';

    const results = await executeQuery(query, params);

    const formattedResults = results.map(formatEvent);

    res.json(formattedResults);
  } catch (err) {
    console.error('Erreur lors de la récupération des événements par date:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements par date' });
  }
});

// Récupérer les événements pour une plage de dates
router.get('/range/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const { childId } = req.query;
    const start = `${startDate} 00:00:00`;
    const end = `${endDate} 23:59:59`;

    let query = 'SELECT * FROM baby_events WHERE timestamp BETWEEN ? AND ?';
    let params = [start, end];

    if (childId) {
      query += ' AND child_id = ?';
      params.push(childId);
    }

    query += ' ORDER BY timestamp DESC';

    const results = await executeQuery(query, params);

    const formattedResults = results.map(formatEvent);

    res.json(formattedResults);
  } catch (err) {
    console.error('Erreur lors de la récupération des événements par plage de dates:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements par plage de dates' });
  }
});

// Ajouter un nouvel événement
router.post('/', async (req, res) => {
  try {
    const event = req.body;

    // Formater la date ISO en format MySQL DATETIME
    let timestamp;
    if (event.timestamp) {
      const date = new Date(event.timestamp);
      timestamp = date.toISOString().slice(0, 19).replace('T', ' ');
    } else {
      timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    // Formater les dates de sommeil si elles existent
    let sleepStartTime = null;
    let sleepEndTime = null;

    if (event.sleepStartTime) {
      const startDate = new Date(event.sleepStartTime);
      sleepStartTime = startDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    if (event.sleepEndTime) {
      const endDate = new Date(event.sleepEndTime);
      sleepEndTime = endDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    await executeQuery(
      'INSERT INTO baby_events (id, type, timestamp, quantity, notes, child_id, breast_left, breast_right, medication_name, medication_list, food_item, food_category, food_reaction, sleep_start_time, sleep_end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        event.id,
        event.type,
        timestamp,
        event.quantity || null,
        event.notes || null,
        event.childId || null,
        event.breastLeft || null,
        event.breastRight || null,
        event.medicationName || null,
        event.medicationList ? JSON.stringify(event.medicationList) : null,
        event.foodItem || null,
        event.foodCategory || null,
        event.foodReaction || null,
        sleepStartTime,
        sleepEndTime
      ]
    );

    res.status(201).json({ message: 'Événement ajouté avec succès' });
  } catch (err) {
    console.error("Erreur lors de l'ajout d'un événement:", err);
    res.status(500).json({ error: "Erreur lors de l'ajout d'un événement" });
  }
});

// Modifier un événement
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = req.body;

    // Formater la date ISO en format MySQL DATETIME
    let timestamp;
    if (event.timestamp) {
      const date = new Date(event.timestamp);
      timestamp = date.toISOString().slice(0, 19).replace('T', ' ');
    } else {
      timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    // Formater les dates de sommeil si elles existent
    let sleepStartTime = null;
    let sleepEndTime = null;

    if (event.sleepStartTime) {
      const startDate = new Date(event.sleepStartTime);
      sleepStartTime = startDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    if (event.sleepEndTime) {
      const endDate = new Date(event.sleepEndTime);
      sleepEndTime = endDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    await executeQuery(
      'UPDATE baby_events SET type = ?, timestamp = ?, quantity = ?, notes = ?, breast_left = ?, breast_right = ?, medication_name = ?, medication_list = ?, food_item = ?, food_category = ?, food_reaction = ?, sleep_start_time = ?, sleep_end_time = ? WHERE id = ?',
      [
        event.type,
        timestamp,
        event.quantity || null,
        event.notes || null,
        event.breastLeft || null,
        event.breastRight || null,
        event.medicationName || null,
        event.medicationList ? JSON.stringify(event.medicationList) : null,
        event.foodItem || null,
        event.foodCategory || null,
        event.foodReaction || null,
        sleepStartTime,
        sleepEndTime,
        id
      ]
    );

    res.json({ message: 'Événement modifié avec succès' });
  } catch (err) {
    console.error("Erreur lors de la modification d'un événement:", err);
    res.status(500).json({ error: "Erreur lors de la modification d'un événement" });
  }
});

// Supprimer un événement
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery('DELETE FROM baby_events WHERE id = ?', [id]);

    res.json({ message: 'Événement supprimé avec succès' });
  } catch (err) {
    console.error("Erreur lors de la suppression d'un événement:", err);
    res.status(500).json({ error: "Erreur lors de la suppression d'un événement" });
  }
});

module.exports = router;
