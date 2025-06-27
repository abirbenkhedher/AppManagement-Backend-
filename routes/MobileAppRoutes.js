const express = require('express');
const router = express.Router();
const mobileAppController = require('../controllers/MobileAppController');
const upload = require('../middleware/upload'); // Importation de Multer
const MobileApp = require('../models/MobileApp')
const Module = require('../models/Module');

router.get('/apps/check-name', mobileAppController.checkAppName);

// Routes pour les applications
router.post('/apps',
    (req, res, next) => {
      // Vérification du Content-Type
      if (!req.is('multipart/form-data')) {
        return res.status(400).json({
          success: false,
          message: "Content-Type must be multipart/form-data"
        });
      }
      next();
    },
    (req, res, next) => {
      upload.single('logo')(req, res, (err) => {
        if (err) {
          // Gestion spécifique des erreurs Multer
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
              success: false,
              message: "File too large (max 5MB)"
            });
          }
          if (err.message.includes('Unexpected end of form')) {
            return res.status(400).json({
              success: false,
              message: "Incomplete form data",
              solution: "Check if all fields are properly filled and file is valid"
            });
          }
          return res.status(500).json({
            success: false,
            message: "File upload failed",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }
        next();
      });
    },
    mobileAppController.createApp
  );
 


router.get('/apps', mobileAppController.getAllApps);
router.get('/apps/:id', mobileAppController.getAppById);
router.delete('/apps/:id', mobileAppController.deleteApp);


router.put('/apps/:id', 
    upload.single('logo'),
    async (req, res) => {
        try {
            const { name, details, status } = req.body;
            
            if (!name || !details) {
                return res.status(400).json({ 
                    success: false,
                    message: "Name and details are required" 
                });
            }

            // Handle modules - they might come as array or string
            let moduleIds = [];
            if (req.body.modules) {
                // If modules is an array (normal case)
                if (Array.isArray(req.body.modules)) {
                    moduleIds = req.body.modules;
                } 
                // If modules is a string (FormData case)
                else if (typeof req.body.modules === 'string') {
                    moduleIds = req.body.modules.split(',');
                }
            }

            // Verify modules exist if any are provided
            if (moduleIds.length > 0) {
                const existingModules = await Module.find({ _id: { $in: moduleIds } });
                if (existingModules.length !== moduleIds.length) {
                    return res.status(400).json({ 
                        success: false,
                        message: "One or more modules don't exist" 
                    });
                }
            }

            const updateData = {
                name,
                details,
                status: status || "En développement",
                modules: moduleIds,
                DateModification: new Date()
            };

            if (req.file) {
                updateData.logo = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            const updatedApp = await MobileApp.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            ).populate('modules');

            if (!updatedApp) {
                return res.status(404).json({ 
                    success: false,
                    message: "App not found" 
                });
            }

            res.status(200).json({
                success: true,
                data: updatedApp
            });

        } catch (error) {
            console.error("Update error:", error);
            
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.errors
                });
            }
            
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: "App with this name already exists"
                });
            }

            res.status(500).json({ 
                success: false,
                message: "Server error",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);
module.exports = router;
