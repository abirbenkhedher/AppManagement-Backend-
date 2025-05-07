
const mongoose = require('mongoose');
const Module = require('../models/Module');
const MobileApp = require('../models/MobileApp');
// Créer un module
exports.createModule = async (req, res) => {
  try {
    const { name, interfaces } = req.body;

    // Validate interface IDs
    if (!Array.isArray(interfaces)) {
      return res.status(400).json({ message: "Les interfaces doivent être un tableau d'IDs." });
    }

    const areValidObjectIds = interfaces.every(id => mongoose.Types.ObjectId.isValid(id));
    if (!areValidObjectIds) {
      return res.status(400).json({ message: "Certains IDs d'interfaces sont invalides." });
    }

    const newModule = new Module({
      name,
      interfaces,
    });

    await newModule.save();
    res.status(201).send(newModule);
  } catch (error) {
    console.error("Erreur lors de la création du module :", error);
    res.status(400).send(error);
  }
};

// Lire tous les modules
exports.getAllModules = async (req, res) => {
  try {
    const modules = await Module.find().populate('interfaces');
    res.send(modules);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Lire un module par ID
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate('interfaces');
    if (!module) return res.status(404).send('Module non trouvé');
    res.send(module);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Mettre à jour un module
exports.updateModule = async (req, res) => {
  try {
    const { name, interfaceIds } = req.body;

    console.log("Données reçues :", { name, interfaceIds }); // Debugging

    // Vérification que interfaceIds est bien un tableau d'ObjectId
    if (!Array.isArray(interfaceIds)) {
      return res.status(400).json({ message: "Les interfaces doivent être un tableau d'IDs." });
    }

    const areValidObjectIds = interfaceIds.every(id => mongoose.Types.ObjectId.isValid(id));
    if (!areValidObjectIds) {
      return res.status(400).json({ message: "Certains IDs d'interfaces sont invalides." });
    }

    // Mettre à jour le module avec les nouveaux IDs d'interfaces
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      { name, interfaces: interfaceIds },
      { new: true } // Retourner le module mis à jour
    ).populate('interfaces'); // Peupler les interfaces après mise à jour

    // Si le module n'est pas trouvé
    if (!updatedModule) {
      return res.status(404).json({ message: "Module non trouvé" });
    }

    res.status(200).json(updatedModule);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du module :", error);
    res.status(400).json({ message: "Erreur lors de la mise à jour du module" });
  }
};


exports.deleteModule = async (req, res) => {
    try {
      const moduleId = req.params.id;
  
      // Vérifier si l'ID est un ObjectId valide
      if (!mongoose.Types.ObjectId.isValid(moduleId)) {
        return res.status(400).json({ message: "ID de module invalide." });
      }
  
      // Vérifier si le module est utilisé dans une application
      const appsUsingModule = await MobileApp.find({ modules: moduleId });
      if (appsUsingModule.length > 0) {
        return res.status(400).json({ message: "Ce module est utilisé dans une ou plusieurs applications et ne peut pas être supprimé." });
      }
  
      // Supprimer le module s'il n'est pas utilisé dans une application
      const deletedModule = await Module.findByIdAndDelete(moduleId);
      if (!deletedModule) {
        return res.status(404).json({ message: "Module non trouvé" });
      }
      res.status(200).json({ message: "Module supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du module :", error);
      res.status(500).json({ message: "Erreur lors de la suppression du module" });
    }
  };