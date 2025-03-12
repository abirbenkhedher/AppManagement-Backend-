const Component = require('../models/Component');

// ➤ Créer un composant
exports.createComponent = async (req, res) => {
  try {
    const { name, type, properties } = req.body;

    // Vérifier si le nom et le type sont fournis
    if (!name || !type) {
      return res.status(400).json({ error: 'Le nom et le type sont obligatoires.' });
    }

    // Vérifier que les propriétés sont un objet
    if (typeof properties !== 'object' || properties === null) {
      return res.status(400).json({ error: 'Les propriétés doivent être un objet JSON valide.' });
    }

    // Créer un nouveau composant
    const newComponent = new Component({ name, type, properties });
    await newComponent.save();

    res.status(201).json(newComponent);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du composant.', details: error.message });
  }
};