const express = require('express');
const router = express.Router();
const Module = require('../models/Module');

// GET /api/modules - Fetch all modules
router.get('/modules', async (req, res) => {
  try {
    const modules = await Module.find(); // Fetch all modules from the database
    res.status(200).json(modules);
  } catch (error) {
    console.error("Erreur lors de la récupération des modules :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des modules" });
  }
});

// POST /api/modules - Add a new module
router.post('/modules', async (req, res) => {
  try {
    const { name, interfaces } = req.body;
    const newModule = new Module({ name, interfaces });
    await newModule.save();
    res.status(201).json(newModule);
  } catch (error) {
    console.error("Erreur lors de l'ajout du module :", error);
    res.status(500).json({ message: "Erreur lors de l'ajout du module" });
  }
});



// Supprimer un module par ID
router.delete('/modules/:id', async (req, res) => {
    try {
      const deletedModule = await Module.findByIdAndDelete(req.params.id);
      if (!deletedModule) {
        return res.status(404).json({ message: "Module non trouvé" });
      }
      res.status(200).json({ message: "Module supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du module :", error);
      res.status(500).json({ message: "Erreur lors de la suppression du module" });
    }
  });

module.exports = router;