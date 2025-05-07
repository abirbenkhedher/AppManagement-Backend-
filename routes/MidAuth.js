const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Accès autorisé', userId: req.userId });
});

module.exports = router;