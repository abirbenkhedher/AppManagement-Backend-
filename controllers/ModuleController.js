const mongoose = require("mongoose");
const Module = require("../models/Module");
const MobileApp = require("../models/MobileApp");

/******************************************************************************
 * CONTROLEUR POUR LA GESTION DES MODULES
 * 
 * Ce fichier contient tous les contrôleurs pour les opérations CRUD sur les
 * modules, incluant :
 * - Création, lecture, mise à jour et suppression de modules
 * - Gestion de la structure hiérarchique des modules (arborescence)
 * - Validation des dépendances et prévention des suppressions risquées
 ******************************************************************************/

// ============================================================================
// CRÉATION ET STRUCTURE HIÉRARCHIQUE
// ============================================================================

/**
 * Crée un nouveau module avec validation des interfaces et parent
 */
exports.createModule = async (req, res) => {
  try {
    const { name, interfaces, parentModuleId } = req.body;

    if (!Array.isArray(interfaces)) {
      return res
        .status(400)
        .json({ message: "Les interfaces doivent être un tableau d'IDs." });
    }

    // Validation des ObjectIds
    const areValidObjectIds = interfaces.every((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    if (!areValidObjectIds) {
      return res
        .status(400)
        .json({ message: "Certains IDs d'interfaces sont invalides." });
    }

    // Validation du module parent si spécifié
    if (parentModuleId && !mongoose.Types.ObjectId.isValid(parentModuleId)) {
      return res.status(400).json({ message: "ID de module parent invalide." });
    }

    const newModule = new Module({
      name,
      interfaces,
      parentModuleId: parentModuleId || null,
    });

    await newModule.save();
    res.status(201).send(newModule);
  } catch (error) {
    console.error("Erreur lors de la création du module :", error);
    res.status(400).send(error);
  }
};

/**
 * Construit l'arborescence complète des modules
 */
exports.getModuleTree = async (req, res) => {
  try {
    const modules = await Module.find().populate("interfaces").lean();

    // Fonction récursive pour construire l'arbre hiérarchique
    const buildTree = (parentId = null) => {
      return modules
        .filter((m) => String(m.parentModuleId) === String(parentId))
        .map((m) => ({
          ...m,
          children: buildTree(m._id),
        }));
    };

    res.json(buildTree());
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur lors de la construction de l'arbre des modules",
      });
  }
};

// ============================================================================
// LECTURE ET RÉCUPÉRATION
// ============================================================================

/**
 * Récupère tous les modules avec leurs interfaces
 */
exports.getAllModules = async (req, res) => {
  try {
    const modules = await Module.find().populate("interfaces");
    res.send(modules);
  } catch (error) {
    res.status(500).send(error);
  }
};

/**
 * Récupère un module spécifique par son ID
 */
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate("interfaces");
    if (!module) return res.status(404).send("Module non trouvé");
    res.send(module);
  } catch (error) {
    res.status(500).send(error);
  }
};

// ============================================================================
// MISE À JOUR ET SUPPRESSION
// ============================================================================

/**
 * Met à jour un module existant
 */
exports.updateModule = async (req, res) => {
  try {
    const { name, interfaceIds } = req.body;

    console.log("Données reçues :", { name, interfaceIds });

    if (!Array.isArray(interfaceIds)) {
      return res
        .status(400)
        .json({ message: "Les interfaces doivent être un tableau d'IDs." });
    }

    // Validation des ObjectIds des interfaces
    const areValidObjectIds = interfaceIds.every((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    if (!areValidObjectIds) {
      return res
        .status(400)
        .json({ message: "Certains IDs d'interfaces sont invalides." });
    }

    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      { name, interfaces: interfaceIds },
      { new: true }
    ).populate("interfaces");

    if (!updatedModule) {
      return res.status(404).json({ message: "Module non trouvé" });
    }

    res.status(200).json(updatedModule);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du module :", error);
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour du module" });
  }
};

/**
 * Supprime un module après vérification des dépendances
 */
exports.deleteModule = async (req, res) => {
  try {
    const moduleId = req.params.id;

    // Validation de l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ message: "ID de module invalide." });
    }

    // Vérification des applications utilisant ce module
    const appsUsingModule = await MobileApp.find({ modules: moduleId });
    if (appsUsingModule.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Ce module est utilisé dans une ou plusieurs applications et ne peut pas être supprimé.",
        });
    }

    // Suppression du module
    const deletedModule = await Module.findByIdAndDelete(moduleId);
    if (!deletedModule) {
      return res.status(404).json({ message: "Module non trouvé" });
    }
    res.status(200).json({ message: "Module supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du module :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du module" });
  }
};