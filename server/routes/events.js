const express = require('express');
const router = express.Router();
const { executeQuery } = require('../db');

// Récupérer tous les événements
router.get('/', async (req, res) => {
  try {
    const results = await executeQuery('SELECT * FROM baby_events ORDER BY timestamp DESC');

    // Formater les résultats pour qu'ils correspondent au format attendu par le client
    const formattedResults = results.map(event => ({
      id: event.id,
      type: event.type,
      timestamp: new Date(event.timestamp),
      quantity: event.quantity !== null ? Number(event.quantity) : undefined,
      notes: event.notes || undefined
    }));

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
    const startDate = `${date} 00:00:00`;
    const endDate = `${date} 23:59:59`;

    const results = await executeQuery(
      'SELECT * FROM baby_events WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
      [startDate, endDate]
    );

    const formattedResults = results.map(event => ({
      id: event.id,
      type: event.type,
      timestamp: new Date(event.timestamp),
      quantity: event.quantity !== null ? Number(event.quantity) : undefined,
      notes: event.notes || undefined
    }));

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
    const start = `${startDate} 00:00:00`;
    const end = `${endDate} 23:59:59`;

    const results = await executeQuery(
      'SELECT * FROM baby_events WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
      [start, end]
    );

    const formattedResults = results.map(event => ({
      id: event.id,
      type: event.type,
      timestamp: new Date(event.timestamp),
      quantity: event.quantity !== null ? Number(event.quantity) : undefined,
      notes: event.notes || undefined
    }));

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

    await executeQuery(
      'INSERT INTO baby_events (id, type, timestamp, quantity, notes) VALUES (?, ?, ?, ?, ?)',
      [event.id, event.type, timestamp, event.quantity || null, event.notes || null]
    );

    res.status(201).json({ message: 'Événement ajouté avec succès' });
  } catch (err) {
    console.error("Erreur lors de l'ajout d'un événement:", err);
    res.status(500).json({ error: "Erreur lors de l'ajout d'un événement" });
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
