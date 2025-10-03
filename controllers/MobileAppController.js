const MobileApp = require("../models/MobileApp");
const Module = require("../models/Module");

/******************************************************************************
 * CONTROLEUR POUR LA GESTION DES APPLICATIONS MOBILES
 * 
 * Ce fichier contient tous les contrôleurs pour les opérations CRUD sur les
 * applications mobiles, incluant :
 * - Vérification d'unicité des noms
 * - Création, lecture, mise à jour et suppression d'applications
 * - Gestion des logos et association des modules
 ******************************************************************************/

// ============================================================================
// VÉRIFICATION ET VALIDATION
// ============================================================================

/**
 * Vérifie si un nom d'application est déjà utilisé
 */
exports.checkAppName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre 'name' est requis",
      });
    }

    const existingApp = await MobileApp.findOne({ name });
    res.status(200).json({
      success: true,
      isUnique: !existingApp,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du nom:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la vérification du nom",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ============================================================================
// OPÉRATIONS CRUD PRINCIPALES
// ============================================================================

/**
 * Crée une nouvelle application mobile
 */
exports.createApp = async (req, res) => {
  try {
    const { name, details, status, modules } = req.body;

    // Vérification de l'unicité du nom
    const existingApp = await MobileApp.findOne({ name });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: "Une application avec ce nom existe déjà.",
      });
    }

    // Validation des modules associés
    let modulesArray = [];
    if (modules) {
      modulesArray = Array.isArray(modules) ? modules : [modules];
      const existingModules = await Module.find({ _id: { $in: modulesArray } });
      if (existingModules.length !== modulesArray.length) {
        return res.status(400).json({
          success: false,
          message: "Un ou plusieurs modules n'existent pas.",
        });
      }
    }

    // Gestion du logo uploadé
    const logoUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    // Création de l'application
    const newApp = new MobileApp({
      name,
      details,
      status,
      modules: modulesArray,
      logo: logoUrl,
    });

    await newApp.save();

    res.status(201).json({
      success: true,
      data: newApp,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'application :", error);

    // Gestion spécifique de l'erreur d'unicité
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Une application avec ce nom existe déjà.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'application",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Récupère toutes les applications avec leurs modules
 */
exports.getAllApps = async (req, res) => {
  try {
    const apps = await MobileApp.find().populate("modules");
    res.status(200).json(apps);
  } catch (error) {
    console.error("Erreur lors de la récupération des applications :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Récupère une application spécifique par son ID
 */
exports.getAppById = async (req, res) => {
  try {
    const app = await MobileApp.findById(req.params.id).populate({
      path: "modules",
      populate: {
        path: "interfaces",
      },
    });

    if (!app) {
      return res.status(404).json({ message: "Application non trouvée" });
    }
    res.status(200).json(app);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'application :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Met à jour une application existante
 */
exports.updateApp = async (req, res) => {
  try {
    const { name, details, status, moduleIds = [] } = req.body;

    // Vérification de l'unicité si le nom est modifié
    if (name) {
      const existingApp = await MobileApp.findOne({
        name,
        _id: { $ne: req.params.id },
      });
      if (existingApp) {
        return res.status(400).json({
          success: false,
          message: "Une application avec ce nom existe déjà.",
        });
      }
    }

    // Validation des nouveaux modules
    let existingModules = [];
    if (moduleIds.length > 0) {
      existingModules = await Module.find({ _id: { $in: moduleIds } });
      if (existingModules.length !== moduleIds.length) {
        return res.status(400).json({
          success: false,
          message: "Un ou plusieurs modules n'existent pas.",
        });
      }
    }

    // Préparation des données de mise à jour
    const updateData = {
      ...(name && { name }),
      ...(details && { details }),
      ...(status && { status }),
      modules: existingModules.map((m) => m._id),
      DateModification: new Date(),
    };

    const updatedApp = await MobileApp.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("modules");

    if (!updatedApp) {
      return res.status(404).json({
        success: false,
        message: "Application non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedApp,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'application :", error);

    // Gestion spécifique de l'erreur d'unicité
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Une application avec ce nom existe déjà.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Supprime une application
 */
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

// ============================================================================
// GESTION DES FICHIERS
// ============================================================================

/**
 * Upload et mise à jour du logo d'une application
 */
exports.uploadLogo = async (req, res) => {
  try {
    const mobileAppId = req.params.id;
    const mobileApp = await MobileApp.findById(mobileAppId);

    if (!mobileApp) {
      return res.status(404).json({ message: "Application non trouvée" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    const logoUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    mobileApp.logo = logoUrl;
    await mobileApp.save();

    res.status(200).json({ message: "Logo mis à jour avec succès", logoUrl });
  } catch (error) {
    console.error("Erreur lors de l'upload du logo :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};