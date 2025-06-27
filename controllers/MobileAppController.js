  const MobileApp = require('../models/MobileApp');
  const Module = require('../models/Module');

  // Vérifier l'unicité du nom d'application
  exports.checkAppName = async (req, res) => {
    try {
      const { name } = req.query;
      
      if (!name) {
        return res.status(400).json({ 
          success: false,
          message: "Le paramètre 'name' est requis" 
        });
      }

      const existingApp = await MobileApp.findOne({ name });
      res.status(200).json({ 
        success: true,
        isUnique: !existingApp 
      });
    } catch (error) {
      console.error("Erreur lors de la vérification du nom:", error);
      res.status(500).json({ 
        success: false,
        message: "Erreur serveur lors de la vérification du nom",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  // Créer une application
  exports.createApp = async (req, res) => {
    try {
      const { name, details, status, modules } = req.body;

      

      // Vérification de l'unicité du nom
      const existingApp = await MobileApp.findOne({ name });
      if (existingApp) {
        return res.status(400).json({ 
          success: false,
          message: "Une application avec ce nom existe déjà." 
        });
      }

      let modulesArray = [];
      if (modules) {
        modulesArray = Array.isArray(modules) ? modules : [modules];
        const existingModules = await Module.find({ _id: { $in: modulesArray } });
        if (existingModules.length !== modulesArray.length) {
          return res.status(400).json({ 
            success: false,
            message: "Un ou plusieurs modules n'existent pas." 
          });
        }
      }

      const logoUrl = req.file 
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : null;
      
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
        data: newApp
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'application :", error);
      
      // Gestion spécifique de l'erreur d'unicité
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Une application avec ce nom existe déjà."
        });
      }

      res.status(500).json({ 
        success: false,
        message: "Erreur lors de la création de l'application",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
      const app = await MobileApp.findById(req.params.id)
        .populate({
          path: 'modules',
          populate: {
            path: 'interfaces'
          }
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

  // Mettre à jour une application
  exports.updateApp = async (req, res) => {
    try {
      const { name, details, status, moduleIds = [] } = req.body;

      // Vérification de l'unicité si le nom est modifié
      if (name) {
        const existingApp = await MobileApp.findOne({ name, _id: { $ne: req.params.id } });
        if (existingApp) {
          return res.status(400).json({ 
            success: false,
            message: "Une application avec ce nom existe déjà." 
          });
        }
      }

      let existingModules = [];
      if (moduleIds.length > 0) {
        existingModules = await Module.find({ _id: { $in: moduleIds } });
        if (existingModules.length !== moduleIds.length) {
          return res.status(400).json({ 
            success: false,
            message: "Un ou plusieurs modules n'existent pas." 
          });
        }
      }

      const updateData = {
        ...(name && { name }),
        ...(details && { details }),
        ...(status && { status }),
        modules: existingModules.map(m => m._id),
        DateModification: new Date(),
      };

      const updatedApp = await MobileApp.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate('modules');

      if (!updatedApp) {
        return res.status(404).json({ 
          success: false,
          message: "Application non trouvée" 
        });
      }
      
      res.status(200).json({
        success: true,
        data: updatedApp
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'application :", error);
      
      // Gestion spécifique de l'erreur d'unicité
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Une application avec ce nom existe déjà."
        });
      }

      res.status(500).json({ 
        success: false,
        message: "Erreur serveur",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
