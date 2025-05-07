const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Récupérer le token depuis les en-têtes
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
    req.userId = decoded.userId; // Ajouter l'ID de l'utilisateur à la requête
    next(); // Passer au contrôleur
  } catch (error) {
    // Gérer les erreurs (par exemple, token expiré)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré. Veuillez vous reconnecter.' });
    }
    res.status(400).json({ error: 'Token invalide.' });
  }
};

module.exports = authMiddleware;