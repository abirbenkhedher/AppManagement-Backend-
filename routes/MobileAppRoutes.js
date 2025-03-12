const express = require('express');
const router = express.Router();
const mobileAppController = require('../controllers/MobileAppController');
const upload = require('../middleware/upload'); // Importation de Multer

// Routes pour les applications
router.post('/apps', upload.single('logo'), mobileAppController.createApp);
router.get('/apps', mobileAppController.getAllApps);
router.get('/apps/:id', mobileAppController.getAppById);
router.put('/apps/:id', upload.single('logo'), mobileAppController.updateApp); // Ajout de l'upload ici
router.delete('/apps/:id', mobileAppController.deleteApp);

module.exports = router;
