const express = require('express');
const router = express.Router();
const interfaceController = require('../controllers/InterfaceController');

// Routes pour les interfaces
router.post('/interfaces', interfaceController.createInterface);
router.get('/interfaces', interfaceController.getAllInterfaces);
router.get('/interfaces/:id', interfaceController.getInterfaceById);
router.put('/interfaces/:id', interfaceController.updateInterface);
router.delete('/interfaces/:id', interfaceController.deleteInterface);
router.put('/:id', interfaceController.updateInterface);

module.exports = router;