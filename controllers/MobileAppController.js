const MobileApp = require('../models/MobileApp');
const Module = require('../models/Module');

// Créer une application
exports.createApp = async (req, res) => {
  try {
    console.log("Données reçues :", req.body);
    console.log("Fichier reçu :", req.file);

    const { name, details, status, modules } = req.body;

    if (!name || !details) {
      return res.status(400).json({ message: "Le nom et les détails sont obligatoires." });
    }

    let modulesArray = [];
    if (modules) {
      modulesArray = Array.isArray(modules) ? modules : [modules]; // Assurer que modules est un tableau
      const existingModules = await Module.find({ _id: { $in: modulesArray } });
      if (existingModules.length !== modulesArray.length) {
        return res.status(400).json({ message: "Un ou plusieurs modules n'existent pas." });
      }
    }

    // Gestion de l'upload de l'image
    const logoUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

    const newApp = new MobileApp({
      name,
      details,
      status,
      modules: modulesArray,
      dateCreation: new Date(),
      DateModification: new Date(),
      logo: logoUrl, 
    });

    await newApp.save();
    res.status(201).json(newApp);
  } catch (error) {
    console.error("Erreur lors de la création de l'application :", error);
    res.status(500).json({ message: "Erreur lors de la création de l'application", error: error.message });
  }
};


// Lire toutes les applications
exports.getAllApps = async (req, res) => {
  try {
    const apps = await MobileApp.find().populate('modules');
    res.status(200).json(apps);
  } catch (error) {
    console.error("Erreur lors de la récupération des applications :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Lire une application par ID
exports.getAppById = async (req, res) => {
  try {
    const app = await MobileApp.findById(req.params.id).populate('modules');
    if (!app) {
      return res.status(404).json({ message: "Application non trouvée" });
    }
    res.status(200).json(app);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'application :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour une application
exports.updateApp = async (req, res) => {
  try {
    const { name, details, status, moduleIds = [], logo } = req.body;

    let existingModules = [];
    if (moduleIds.length > 0) {
      existingModules = await Module.find({ _id: { $in: moduleIds } });
      if (existingModules.length !== moduleIds.length) {
        return res.status(400).json({ message: "Un ou plusieurs modules n'existent pas." });
      }
    }

    const updatedApp = await MobileApp.findByIdAndUpdate(
      req.params.id,
      {
        name,
        details,
        status,
        modules: existingModules.map(m => m._id),
        logo,
        dateModification: new Date(),
      },
      { new: true }
    ).populate('modules');

    if (!updatedApp) {
      return res.status(404).json({ message: "Application non trouvée" });
    }
    res.status(200).json(updatedApp);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'application :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer une application
exports.deleteApp = async (req, res) => {
  try {
    const deletedApp = await MobileApp.findByIdAndDelete(req.params.id);
    if (!deletedApp) {
      return res.status(404).json({ message: "Application non trouvée" });
    }
    res.status(200).json({ message: "Application supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'application :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Upload du logo uniquement
exports.uploadLogo = async (req, res) => {
  try {
    const mobileAppId = req.params.id;
    const mobileApp = await MobileApp.findById(mobileAppId);

    if (!mobileApp) {
      return res.status(404).json({ message: 'Application non trouvée' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const logoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    mobileApp.logo = logoUrl;
    await mobileApp.save();

    res.status(200).json({ message: 'Logo mis à jour avec succès', logoUrl });
  } catch (error) {
    console.error("Erreur lors de l'upload du logo :", error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
