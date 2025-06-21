const Interface = require('../models/Interface');
const Module = require('../models/Module');

// Créer une interface
exports.createInterface = async (req, res) => {
  try {
    const { name, components, headerConfig = {}, interfaceConfig = {} } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Le nom de l'interface est requis" });
    }

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
        elevation: headerConfig.elevation || 4
      },
      interfaceConfig: {
        backgroundColor: interfaceConfig.backgroundColor || "#f8f9fa",
        padding: interfaceConfig.padding || "15px",
        margin: interfaceConfig.margin || "0",
        gap: interfaceConfig.gap || "10px",
      }
    });

    await newInterface.save();
    res.status(201).json(newInterface);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la création",
      error: error.message
    });
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

    const responseData = interface.toObject();
    if (!responseData.interfaceConfig) {
      responseData.interfaceConfig = {};
    }
    res.send(interface);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Mettre à jour une interface
exports.updateInterface = async (req, res) => {

  try {
    const { id } = req.params;
    const { name, components, headerConfig = {}, interfaceConfig = {} } = req.body;

    

    // Construction de l'objet de mise à jour
    const updateData = {
      name,
      components,
      headerConfig: {
        title: headerConfig.title,
        backgroundColor: headerConfig.backgroundColor,
        color: headerConfig.color,
        fontSize: headerConfig.fontSize,
        fontWeight: headerConfig.fontWeight,
        textAlign: headerConfig.textAlign,
        showBackButton: headerConfig.showBackButton,
        showMenuButton: headerConfig.showMenuButton,
        menuOptions: headerConfig.menuOptions,
        fixed: headerConfig.fixed,
        elevation: headerConfig.elevation
      },
      interfaceConfig: {
        backgroundColor: interfaceConfig.backgroundColor,
        padding: interfaceConfig.padding,
        margin: interfaceConfig.margin,
        gap: interfaceConfig.gap
      },
      updatedAt: Date.now()
    };


    const updatedInterface = await Interface.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedInterface) {
      return res.status(404).json({ message: "Interface non trouvée" });
    }



    res.json(updatedInterface);
  } catch (error) {
    console.error("Erreur de mise à jour:", error);
    res.status(400).json({
      message: "Erreur lors de la mise à jour",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

 