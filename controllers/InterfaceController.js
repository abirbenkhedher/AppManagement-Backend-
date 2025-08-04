const Interface = require('../models/Interface');
const Module = require('../models/Module');

// Créer une interface
exports.createInterface = async (req, res) => {
  try {
    console.log('Données reçues pour création :', JSON.stringify(req.body, null, 2));
    const { name, components, headerConfig = {}, interfaceConfig = {} } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Le nom de l\'interface est requis' });
    }

    const newInterface = new Interface({
      name,
      components: components || [], // Les composants incluent maintenant maximoAttribute
      headerConfig: {
        title: headerConfig.title || 'Titre',
        backgroundColor: headerConfig.backgroundColor || '#0d6efd',
        color: headerConfig.color || '#ffffff',
        fontSize: headerConfig.fontSize || '18px',
        fontWeight: headerConfig.fontWeight || 'bold',
        textAlign: headerConfig.textAlign || 'center',
        showBackButton: headerConfig.showBackButton !== false,
        showMenuButton: headerConfig.showMenuButton !== false,
        menuOptions: headerConfig.menuOptions || [],
        fixed: headerConfig.fixed !== false,
        elevation: headerConfig.elevation || 4,
      },
      interfaceConfig: {
        backgroundColor: interfaceConfig.backgroundColor || '#f8f9fa',
        padding: interfaceConfig.padding || '15px',
        margin: interfaceConfig.margin || '0px',
        gap: interfaceConfig.gap || '10px',
        objective: interfaceConfig.objective || null,
      },
    });

    const savedInterface = await newInterface.save();
    console.log('Interface sauvegardée :', JSON.stringify(savedInterface, null, 2));
    res.status(201).json(savedInterface);
  } catch (error) {
    console.error('Erreur lors de la création :', error);
    res.status(400).json({
      message: 'Erreur lors de la création',
      error: error.message,
    });
  }
};

// Lire toutes les interfaces
exports.getAllInterfaces = async (req, res) => {
  try {
    const interfaces = await Interface.find().populate('components');
    res.status(200).json(interfaces);
  } catch (error) {
    console.error('Erreur lors de la récupération des interfaces :', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des interfaces',
      error: error.message,
    });
  }
};

// Lire une interface par ID
exports.getInterfaceById = async (req, res) => {
  try {
    const interface = await Interface.findById(req.params.id).populate('components');
    if (!interface) {
      return res.status(404).json({ message: 'Interface non trouvée' });
    }
    const responseData = interface.toObject();
    if (!responseData.interfaceConfig) {
      responseData.interfaceConfig = {};
    }
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'interface :', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération de l\'interface',
      error: error.message,
    });
  }
};

// Mettre à jour une interface
exports.updateInterface = async (req, res) => {
  try {
    console.log('Données reçues pour mise à jour :', JSON.stringify(req.body, null, 2)); // Log pour débogage
    const { id } = req.params;
    const { name, components, headerConfig = {}, interfaceConfig = {} } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Le nom de l\'interface est requis' });
    }

    const updateData = {
      name,
      components: components || [],
      headerConfig: {
        title: headerConfig.title || 'Titre',
        backgroundColor: headerConfig.backgroundColor || '#0d6efd',
        color: headerConfig.color || '#ffffff',
        fontSize: headerConfig.fontSize || '18px',
        fontWeight: headerConfig.fontWeight || 'bold',
        textAlign: headerConfig.textAlign || 'center',
        showBackButton: headerConfig.showBackButton !== false,
        showMenuButton: headerConfig.showMenuButton !== false,
        menuOptions: headerConfig.menuOptions || [],
        fixed: headerConfig.fixed !== false,
        elevation: headerConfig.elevation || 4,
      },
      interfaceConfig: {
        backgroundColor: interfaceConfig.backgroundColor || '#f8f9fa',
        padding: interfaceConfig.padding || '15px',
        margin: interfaceConfig.margin || '0px',
        gap: interfaceConfig.gap || '10px',
        objective: interfaceConfig.objective || null, // Gestion explicite de objective
      },
      updatedAt: Date.now(),
    };

    const updatedInterface = await Interface.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedInterface) {
      return res.status(404).json({ message: 'Interface non trouvée' });
    }

    console.log('Interface mise à jour :', JSON.stringify(updatedInterface, null, 2)); // Log pour débogage
    res.status(200).json(updatedInterface);
  } catch (error) {
    console.error('Erreur lors de la mise à jour :', error);
    res.status(400).json({
      message: 'Erreur lors de la mise à jour',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Supprimer une interface
exports.deleteInterface = async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer les références dans les modules
    await Module.updateMany(
      { interfaces: id },
      { $pull: { interfaces: id } }
    );

    // Supprimer l'interface
    const result = await Interface.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Interface non trouvée' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression :', error);
    res.status(500).json({
      message: 'Erreur lors de la suppression',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};