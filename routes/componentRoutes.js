const express = require('express');
const router = express.Router();
const componentController = require('../controllers/ComponentController');
const Component = require('../models/Component'); // Assurez-vous d'avoir un modèle Component

// Routes pour les composants
router.post('/components', async (req, res) => {
    try {
      const { components } = req.body;
  
      // Valider les données reçues
      if (!Array.isArray(components)) {
        return res.status(400).json({ error: 'Les données doivent être un tableau de composants.' });
      }
  
      // Enregistrer chaque composant dans la base de données
      const savedComponents = await Component.insertMany(components);
  
      res.status(201).json(savedComponents);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des composants:', error);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement des composants', details: error.message });
    }
  });
module.exports = router;
