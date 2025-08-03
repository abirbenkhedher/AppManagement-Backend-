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

    // Fonction récursive pour exporter les composants imbriqués
    const exportComponent = (component) => {
      return {
        id: component.id,
        type: component.type,
        text: component.text,
        placeholder: component.placeholder,
        inputType: component.inputType,
        variant: component.variant,
        apiField: component.apiField,
        apiConfig: component.apiConfig ? {
          url: component.apiConfig.url,
          method: component.apiConfig.method,
          headers: component.apiConfig.headers,
          params: component.apiConfig.params,
          dataPath: component.apiConfig.dataPath,
          itemTemplate: component.apiConfig.itemTemplate
        } : null,
        detailInterface: component.detailInterface,
        detailConfig: component.detailConfig ? {
          idField: component.detailConfig.idField,
          listFields: component.detailConfig.listFields?.map(field => ({
            label: field.label,
            field: field.field
          })) || [],
          detailFields: component.detailConfig.detailFields?.map(field => ({
            label: field.label,
            field: field.field
          })) || [],
          selectedItem: component.detailConfig.selectedItem
        } : null,
        action: component.action ? {
          type: component.action.type,
          target: component.action.target,
          params: component.action.params || {},
          ...(component.action.type === 'api' && {
            method: component.action.method,
            url: component.action.url,
            headers: component.action.headers,
            body: component.action.body,
            dataPath: component.action.dataPath
          }),
          ...(component.action.type === 'function' && {
            functionName: component.action.functionName
          }),
          detailInterface: component.action.detailInterface,
          detailConfig: component.action.detailConfig ? {
            idField: component.action.detailConfig.idField,
            listFields: component.action.detailConfig.listFields?.map(field => ({
              label: field.label,
              field: field.field
            })) || [],
            detailFields: component.action.detailConfig.detailFields?.map(field => ({
              label: field.label,
              field: field.field
            })) || [],
            selectedItem: component.action.detailConfig.selectedItem
          } : null
        } : null,
        style: component.style ? {
          backgroundColor: component.style.backgroundColor,
          color: component.style.color,
          width: component.style.width,
          height: component.style.height,
          margin: component.style.margin,
          padding: component.style.padding,
          fontSize: component.style.fontSize,
          fontWeight: component.style.fontWeight,
          fontStyle: component.style.fontStyle,
          textAlign: component.style.textAlign,
          zIndex: component.style.zIndex,
          position: component.style.position,
          top: component.style.top,
          left: component.style.left,
          right: component.style.right,
          bottom: component.style.bottom,
          flex: component.style.flex,
          minWidth: component.style.minWidth,
          border: component.style.border,
          borderColor: component.style.borderColor,
          borderWidth: component.style.borderWidth,
          borderRadius: component.style.borderRadius,
          boxShadow: component.style.boxShadow,
          display: component.style.display,
          flexDirection: component.style.flexDirection,
          justifyContent: component.style.justifyContent,
          alignItems: component.style.alignItems,
          flexWrap: component.style.flexWrap,
          cursor: component.style.cursor,
          opacity: component.style.opacity,
          transform: component.style.transform,
          transition: component.style.transition
        } : null,
        components: component.components?.map(nestedComp => exportComponent(nestedComp)) || []
      };
    };

    // Construction des données d'export complètes
    const exportData = {
      appInfo: {
        name: app.name,
        id: app._id,
        details: app.details,
        dateCreation: app.dateCreation,
        status: app.status,
        logo: app.logo,
        previewToken: app.previewToken,
        previewTokenExpires: app.previewTokenExpires
      },
      modules: app.modules.map(module => ({
        name: module.name,
        interfaces: module.interfaces.map(intf => ({
          name: intf.name,
          createdAt: intf.createdAt,
          updatedAt: intf.updatedAt,
          interfaceConfig: intf.interfaceConfig ? {
            backgroundColor: intf.interfaceConfig.backgroundColor,
            padding: intf.interfaceConfig.padding,
            margin: intf.interfaceConfig.margin,
            gap: intf.interfaceConfig.gap
          } : null,
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
          components: intf.components?.map(comp => exportComponent(comp)) || []
        }))
      })),
      componentActions: app.componentActions?.map(action => ({
        componentId: action.componentId,
        actionType: action.actionType,
        ...action,
        createdAt: action.createdAt
      })) || [],
      exportMeta: {
        date: new Date(),
        version: '1.2',
        exportedBy: req.user?.id || 'system',
        schemaVersion: '1.0'
      }
    };

    // Sauvegarde de l'export
    app.exportedData = exportData;
    app.exportConfig = {
      lastExportDate: new Date(),
      exportVersion: '1.2',
      exportedBy: req.user?.id || 'system'
    };
    await app.save();

    console.log('Export réussi pour app:', app.name);
    res.status(200).json({
      success: true,
      data: exportData,
      message: 'Export réussi',
      exportId: app._id,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Erreur export:', error);
    res.status(500).json({
      success: false,
      message: 'Échec export',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date()
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