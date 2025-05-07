const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Utilisez bcryptjs
const jwt = require('jsonwebtoken');

// Inscription
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Nom d\'utilisateur déjà utilisé.' });
    }

    // Créer un nouvel utilisateur (le mot de passe sera haché par le modèle)
    const user = new User({ username, password });
    await user.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
    }

    // Vérifier le mot de passe avec bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
    }

    // Générer un token JWT
    const token = jwt.sign(
        { userId: user._id }, // Données à inclure dans le token
        process.env.JWT_SECRET || 'secretKey', // Clé secrète
        { expiresIn: '1h' } // Expiration après 1 heure
      );
    res.json({ token });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
};