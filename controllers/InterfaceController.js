const Interface = require('../models/Interface');

// Créer une interface
exports.createInterface = async (req, res) => {
  try {
    const { name, componentIds } = req.body;

    const newInterface = new Interface({
      name,
      components: componentIds,
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
exports.deleteInterface = async (req, res) => {
    try {
      const interfaceId = req.params.id;
  
      // Vérifier si l'interface est utilisée dans un module
      const modulesUsingInterface = await Module.find({ interfaces: interfaceId });
      if (modulesUsingInterface.length > 0) {
        return res.status(400).json({ message: "Cette interface est utilisée dans un ou plusieurs modules et ne peut pas être supprimée." });
      }
  
      const deletedInterface = await Interface.findByIdAndDelete(interfaceId);
      if (!deletedInterface) {
        return res.status(404).json({ message: "Interface non trouvée" });
      }
      res.status(200).json({ message: "Interface supprimée avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'interface :", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'interface" });
    }
  };