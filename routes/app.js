const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const App = require('../models/MobileApp');

// Export endpoint modifié
// Modifiez la route d'export pour inclure les actions complètes
// Modifiez la route d'export pour inclure les headers
router.post('/:id/export', async (req, res) => {
  try {
    console.log('Début export pour app:', req.params.id);
    const app = await App.findById(req.params.id)
      .populate({
        path: 'modules',
        populate: {
          path: 'interfaces',
          model: 'Interface',
          populate: {
            path: 'headerConfig',
            model: 'HeaderConfig'
          }
        }
      });

    if (!app) {
      console.log('App non trouvée');
      return res.status(404).json({ message: 'Application non trouvée' });
    }

    // Construction des données d'export complètes
    const exportData = {
      appInfo: {
        name: app.name,
        id: app._id,
        details: app.details,
        dateCreation: app.dateCreation,
        status: app.status,
        logo: app.logo
      },
      modules: app.modules.map(module => ({
        name: module.name,
        interfaces: module.interfaces.map(intf => ({
          name: intf.name,
          createdAt: intf.createdAt,
          updatedAt: intf.updatedAt,
          // Configuration complète de l'interface
          interfaceConfig: intf.interfaceConfig ? {
            backgroundColor: intf.interfaceConfig.backgroundColor,
            padding: intf.interfaceConfig.padding,
            margin: intf.interfaceConfig.margin,
            gap: intf.interfaceConfig.gap
          } : null,
          // Configuration complète du header
          headerConfig: intf.headerConfig ? {
            title: intf.headerConfig.title,
            backgroundColor: intf.headerConfig.backgroundColor,
            color: intf.headerConfig.color,
            fontSize: intf.headerConfig.fontSize,
            fontWeight: intf.headerConfig.fontWeight,
            textAlign: intf.headerConfig.textAlign,
            showBackButton: intf.headerConfig.showBackButton,
            showMenuButton: intf.headerConfig.showMenuButton,
            fixed: intf.headerConfig.fixed,
            elevation: intf.headerConfig.elevation,
            menuOptions: intf.headerConfig.menuOptions?.map(option => ({
              id: option.id,
              label: option.label,
              isActive: option.isActive,
              action: option.action ? {
                type: option.action.type,
                target: option.action.target,
                params: option.action.params || {},
                ...(option.action.type === 'api' && {
                  method: option.action.method,
                  url: option.action.url,
                  headers: option.action.headers,
                  body: option.action.body
                }),
                ...(option.action.type === 'function' && {
                  functionName: option.action.functionName
                })
              } : null
            })) || []
          } : null,
          // Export complet des composants
          components: intf.components?.map(comp => ({
            id: comp.id,
            type: comp.type,
            text: comp.text,
            placeholder: comp.placeholder,
            inputType: comp.inputType,
            variant: comp.variant,
            // Configuration API pour les composants de type Liste/Détails
            apiConfig: comp.apiConfig ? {
              url: comp.apiConfig.url,
              method: comp.apiConfig.method,
              headers: comp.apiConfig.headers,
              params: comp.apiConfig.params,
              dataPath: comp.apiConfig.dataPath,
              itemTemplate: comp.apiConfig.itemTemplate
            } : null,
            // Configuration des détails
            detailConfig: comp.detailConfig ? {
              idField: comp.detailConfig.idField,
              listFields: comp.detailConfig.listFields?.map(field => ({
                label: field.label,
                field: field.field
              })) || [],
              detailFields: comp.detailConfig.detailFields?.map(field => ({
                label: field.label,
                field: field.field
              })) || [],
              selectedItem: comp.detailConfig.selectedItem
            } : null,
            detailInterface: comp.detailInterface,
            // Style complet
            style: comp.style ? {
              backgroundColor: comp.style.backgroundColor,
              color: comp.style.color,
              width: comp.style.width,
              height: comp.style.height,
              margin: comp.style.margin,
              padding: comp.style.padding,
              fontSize: comp.style.fontSize,
              fontWeight: comp.style.fontWeight,
              fontStyle: comp.style.fontStyle,
              textAlign: comp.style.textAlign,
              zIndex: comp.style.zIndex,
              position: comp.style.position,
              flex: comp.style.flex,
              minWidth: comp.style.minWidth,
              border: comp.style.border,
              borderRadius: comp.style.borderRadius,
              boxShadow: comp.style.boxShadow,
              display: comp.style.display,
              flexDirection: comp.style.flexDirection,
              justifyContent: comp.style.justifyContent,
              alignItems: comp.style.alignItems,
              flexWrap: comp.style.flexWrap,
              cursor: comp.style.cursor,
              opacity: comp.style.opacity,
              transform: comp.style.transform,
              transition: comp.style.transition
            } : null,
            // Actions complètes
            action: comp.action ? {
              type: comp.action.type,
              target: comp.action.target,
              params: comp.action.params || {},
              ...(comp.action.type === 'api' && {
                method: comp.action.method,
                url: comp.action.url,
                headers: comp.action.headers,
                body: comp.action.body
              }),
              ...(comp.action.type === 'function' && {
                functionName: comp.action.functionName
              })
            } : null
          })) || []
        }))
      })),
      exportMeta: {
        date: new Date(),
        version: '1.0',
        exportedBy: req.user?.id || 'system'
      }
    };

    // Sauvegarde de l'export
    app.exportedData = exportData;
    app.exportConfig = {
      lastExportDate: new Date(),
      exportVersion: '1.0'
    };
    await app.save();

    console.log('Export réussi pour app:', app.name);
    res.status(200).json({
      success: true,
      data: exportData,
      message: 'Export réussi'
    });

  } catch (error) {
    console.error('Erreur export:', error);
    res.status(500).json({
      success: false,
      message: 'Échec export',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Nouvelle route pour gérer les actions des composants
router.post('/:id/components/actions', async (req, res) => {
  try {
    const { id } = req.params;
    const { componentId, actionType, ...actionData } = req.body;

    const app = await App.findById(id);
    if (!app) {
      return res.status(404).json({ message: 'Application non trouvée' });
    }

    // Vérifier si l'action existe déjà
    const existingIndex = app.componentActions.findIndex(
      a => a.componentId === componentId
    );

    const newAction = {
      componentId,
      actionType,
      ...actionData,
      createdAt: new Date()
    };

    if (existingIndex >= 0) {
      app.componentActions[existingIndex] = newAction;
    } else {
      app.componentActions.push(newAction);
    }

    await app.save();

    res.status(200).json({
      success: true,
      data: newAction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la gestion des actions',
      error: error.message
    });
  }
});

// Get by name endpoint (inchangé)
router.get('/by-name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const app = await App.findOne({ name })
      .populate({
        path: 'modules',
        populate: {
          path: 'interfaces',
          model: 'Interface'
        }
      });

    if (!app) {
      return res.status(404).json({ 
        success: false,
        message: 'Application non trouvée'
      });
    }

    res.json({
      success: true,
      data: app.exportedData || app.toObject()
    });
  } catch (error) {
    console.error('Erreur recherche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Générer un lien de prévisualisation (inchangé)
router.post('/generate-preview', async (req, res) => {
  try {
    const { appId, appName } = req.body;
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await App.findByIdAndUpdate(appId, {
      previewToken: token,
      previewTokenExpires: expiresAt
    });

    const previewUrl = `${process.env.API_BASE_URL || 'http://your-api.com'}/api/apps/preview/${appName}?token=${token}`;

    res.json({
      success: true,
      previewUrl,
      deepLink: `exp://your-ip:19000/--/preview?url=${encodeURIComponent(previewUrl)}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du lien'
    });
  }
});

// Endpoint de prévisualisation (inchangé)
router.get('/preview/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { token } = req.query;

    const app = await App.findOne({ name })
      .populate('modules interfaces')
      .select('+previewToken +previewTokenExpires');

    if (!app || app.previewToken !== token || new Date(app.previewTokenExpires) < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Lien de prévisualisation invalide ou expiré'
      });
    }

    res.json({
      success: true,
      data: app.exportedData || app.toObject()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données'
    });
  }
});

module.exports = router;