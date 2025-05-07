const Interface = require('../models/Interface');
const Module = require('../models/Module');

// Créer une interface
exports.createInterface = async (req, res) => {
  try {
    const { name, components } = req.body;
    
    const newInterface = new Interface({
      name,
      components
    });

    await newInterface.save();
    res.status(201).send(newInterface);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Lire toutes les interfaces
exports.getAllInterfaces = async (req, res) => {
  try {
    const interfaces = await Interface.find().populate('components');
    res.send(interfaces);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Lire une interface par ID
exports.getInterfaceById = async (req, res) => {
  try {
    const interface = await Interface.findById(req.params.id).populate('components');
    if (!interface) return res.status(404).send('Interface non trouvée');
    res.send(interface);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Mettre à jour une interface
exports.updateInterface = async (req, res) => {
  try {
    const { name, componentIds } = req.body;

    const interface = await Interface.findByIdAndUpdate(
      req.params.id,
      { name, components: componentIds },
      { new: true }
    ).populate('components');

    if (!interface) return res.status(404).send('Interface non trouvée');
    res.send(interface);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Supprimer une interface
// controllers/interfaceController.js
// controllers/interfaceController.js
exports.deleteInterface = async (req, res) => {

  try {
    const { id } = req.params;

    // 1. Supprimer les références d'abord
    await Module.updateMany(
      { interfaces: id },
      { $pull: { interfaces: id } },
    );

    // 2. Supprimer l'interface
    const result = await Interface.findByIdAndDelete(id);

    if (!result) {
      throw new Error('Interface non trouvée');
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Transaction annulée:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
  }
};

  // Dans exports.updateInterface
exports.updateInterface = async (req, res) => {
  try {
    const { name, components } = req.body; // Modifié de componentIds à components

    const interface = await Interface.findByIdAndUpdate(
      req.params.id,
      { name, components }, // Modifié pour prendre les composants directement
      { new: true }
    );

    if (!interface) return res.status(404).send('Interface non trouvée');
    res.send(interface);
  } catch (error) {
    res.status(400).send(error);
  }
};