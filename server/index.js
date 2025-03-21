const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { initDatabase } = require('./db'); // Importer la fonction d'initialisation

// Charger les variables d'environnement
dotenv.config();

// Initialiser la base de données
initDatabase().catch((err) => {
  console.error("Échec de l'initialisation de la base de données:", err);
  process.exit(1); // Arrêter le serveur en cas d'échec d'initialisation
});

// Importer les routes
const eventsRoutes = require('./routes/events');

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/events', eventsRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Baby-Check fonctionne correctement' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
