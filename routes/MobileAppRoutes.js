const express = require('express');
const router = express.Router();
const mobileAppController = require('../controllers/MobileAppController');
const upload = require('../middleware/upload'); // Importation de Multer



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



module.exports = router;
