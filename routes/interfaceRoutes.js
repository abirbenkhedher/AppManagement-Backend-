const express = require('express');
const router = express.Router();
const interfaceController = require('../controllers/InterfaceController');

// Routes pour les interfaces
router.post('/interfaces', interfaceController.createInterface);
router.get('/interfaces', interfaceController.getAllInterfaces);
router.get('/interfaces/:id', interfaceController.getInterfaceById);
router.put('/interfaces/:id', interfaceController.updateInterface);
router.delete('/interfaces/:id', interfaceController.deleteInterface);



router.get('/api/sample-list', (req, res) => {
  const sampleData = [
    { id: 1, name: 'Client 1', email: 'client1@example.com', status: 'Actif' },
    { id: 2, name: 'Client 2', email: 'client2@example.com', status: 'Inactif' },
    { id: 3, name: 'Client 3', email: 'client3@example.com', status: 'Actif' }
  ];
  res.json(sampleData);
});

// Route pour simuler une API de détails
router.get('/api/sample-details/:id', (req, res) => {
  const details = {
    1: { id: 1, name: 'Client 1', email: 'client1@example.com', phone: '0601020304', address: '1 Rue des Clients' },
    2: { id: 2, name: 'Client 2', email: 'client2@example.com', phone: '0602030405', address: '2 Rue des Clients' },
    3: { id: 3, name: 'Client 3', email: 'client3@example.com', phone: '0603040506', address: '3 Rue des Clients' }
  };
  res.json(details[req.params.id] || {});
});
module.exports = router;