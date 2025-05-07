// authRoutes.js
const express = require('express');
const authController = require('../controllers/authController'); // Importez le contrôleur

const router = express.Router();

// Route d'inscription
router.post('/register', authController.register); // Utilisez la fonction exportée

// Route de connexion
router.post('/login', authController.login); // Utilisez la fonction exportée

module.exports = router;