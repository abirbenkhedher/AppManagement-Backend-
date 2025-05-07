// controllers/actionController.js
const Action = require('../models/Actions');

// Créer une action
exports.createAction = async (req, res) => {
  try {
    const action = new Action(req.body);
    await action.save();
    res.status(201).json(action);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer toutes les actions
exports.getAllActions = async (req, res) => {
  try {
    const actions = await Action.find();
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une action par ID
exports.getActionById = async (req, res) => {
  try {
    const action = await Action.findById(req.params.id);
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }
    res.json(action);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une action
exports.updateAction = async (req, res) => {
  try {
    const action = await Action.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }
    res.json(action);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une action
exports.deleteAction = async (req, res) => {
  try {
    const action = await Action.findByIdAndDelete(req.params.id);
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }
    res.json({ message: 'Action deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAppWithModules = async (req, res) => {
    try {
      const app = await App.findById(req.params.id)
        .populate({
          path: 'modules',
          populate: {
            path: 'interfaces',
            populate: {
              path: 'components' // Assurez-vous de peupler les composants
            }
          }
        });
      res.json(app);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };