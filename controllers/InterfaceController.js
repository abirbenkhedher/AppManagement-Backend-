const Interface = require("../models/Interface");
const Module = require("../models/Module");

/******************************************************************************
 * CONTROLEUR POUR LA GESTION DES INTERFACES
 * 
 * Ce fichier contient tous les contrôleurs pour les opérations CRUD sur les
 * interfaces utilisateur, incluant :
 * - Création, lecture, mise à jour et suppression d'interfaces
 * - Gestion de la configuration des en-têtes et du layout
 * - Association des composants et gestion des modules liés
 ******************************************************************************/

// ============================================================================
// CRÉATION ET RÉCUPÉRATION
// ============================================================================

/**
 * Crée une nouvelle interface avec sa configuration
 */
exports.createInterface = async (req, res) => {
  try {
    console.log(
      "Données reçues pour création :",
      JSON.stringify(req.body, null, 2)
    );
    const {
      name,
      components,
      headerConfig = {},
      interfaceConfig = {},
    } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Le nom de l'interface est requis" });
    }

    // Configuration de l'interface avec valeurs par défaut
    const newInterface = new Interface({
      name,
      components: components || [],
      headerConfig: {
        title: headerConfig.title || "Titre",
        backgroundColor: headerConfig.backgroundColor || "#0d6efd",
        color: headerConfig.color || "#ffffff",
        fontSize: headerConfig.fontSize || "18px",
        fontWeight: headerConfig.fontWeight || "bold",
        textAlign: headerConfig.textAlign || "center",
        showBackButton: headerConfig.showBackButton !== false,
        showMenuButton: headerConfig.showMenuButton !== false,
        menuOptions: headerConfig.menuOptions || [],
        fixed: headerConfig.fixed !== false,
        elevation: headerConfig.elevation || 4,
      },
      interfaceConfig: {
        backgroundColor: interfaceConfig.backgroundColor || "#f8f9fa",
        padding: interfaceConfig.padding || "15px",
        margin: interfaceConfig.margin || "0px",
        gap: interfaceConfig.gap || "10px",
        objective: interfaceConfig.objective || null,
      },
    });

    const savedInterface = await newInterface.save();
    console.log(
      "Interface sauvegardée :",
      JSON.stringify(savedInterface, null, 2)
    );
    res.status(201).json(savedInterface);
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    res.status(400).json({
      message: "Erreur lors de la création",
      error: error.message,
    });
  }
};

/**
 * Récupère toutes les interfaces avec leurs composants
 */
exports.getAllInterfaces = async (req, res) => {
  try {
    const interfaces = await Interface.find().populate("components");
    res.status(200).json(interfaces);
  } catch (error) {
    console.error("Erreur lors de la récupération des interfaces :", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des interfaces",
      error: error.message,
    });
  }
};

/**
 * Récupère une interface spécifique par son ID
 */
exports.getInterfaceById = async (req, res) => {
  try {
    const interface = await Interface.findById(req.params.id).populate(
      "components"
    );
    if (!interface) {
      return res.status(404).json({ message: "Interface non trouvée" });
    }
    const responseData = interface.toObject();
    if (!responseData.interfaceConfig) {
      responseData.interfaceConfig = {};
    }
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'interface :", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'interface",
      error: error.message,
    });
  }
};

// ============================================================================
// MISE À JOUR ET SUPPRESSION
// ============================================================================

/**
 * Met à jour une interface existante
 */
exports.updateInterface = async (req, res) => {
  try {
    console.log(
      "Données reçues pour mise à jour :",
      JSON.stringify(req.body, null, 2)
    );
    const { id } = req.params;
    const {
      name,
      components,
      headerConfig = {},
      interfaceConfig = {},
    } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Le nom de l'interface est requis" });
    }

    // Préparation des données de mise à jour
    const updateData = {
      name,
      components: components || [],
      headerConfig: {
        title: headerConfig.title || "Titre",
        backgroundColor: headerConfig.backgroundColor || "#0d6efd",
        color: headerConfig.color || "#ffffff",
        fontSize: headerConfig.fontSize || "18px",
        fontWeight: headerConfig.fontWeight || "bold",
        textAlign: headerConfig.textAlign || "center",
        showBackButton: headerConfig.showBackButton !== false,
        showMenuButton: headerConfig.showMenuButton !== false,
        menuOptions: headerConfig.menuOptions || [],
        fixed: headerConfig.fixed !== false,
        elevation: headerConfig.elevation || 4,
      },
      interfaceConfig: {
        backgroundColor: interfaceConfig.backgroundColor || "#f8f9fa",
        padding: interfaceConfig.padding || "15px",
        margin: interfaceConfig.margin || "0px",
        gap: interfaceConfig.gap || "10px",
        objective: interfaceConfig.objective || null, 
      },
      updatedAt: Date.now(),
    };

    const updatedInterface = await Interface.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedInterface) {
      return res.status(404).json({ message: "Interface non trouvée" });
    }

    console.log(
      "Interface mise à jour :",
      JSON.stringify(updatedInterface, null, 2)
    ); 
    res.status(200).json(updatedInterface);
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(400).json({
      message: "Erreur lors de la mise à jour",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Supprime une interface et la retire des modules associés
 */
exports.deleteInterface = async (req, res) => {
  try {
    const { id } = req.params;

    // Nettoyage des références dans les modules
    await Module.updateMany({ interfaces: id }, { $pull: { interfaces: id } });

    const result = await Interface.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Interface non trouvée" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({
      message: "Erreur lors de la suppression",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};