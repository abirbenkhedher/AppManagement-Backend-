const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  componentId: { type: String, required: true }, // Lien vers le composant
  actionType: { type: String, required: true, enum: ['navigation', 'api', 'function'] },
  // Pour navigation
  navigationTarget: { type: String },
  navigationParams: { type: Object },
  // Pour api
  apiMethod: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'] },
  apiUrl: { type: String },
  apiHeaders: { type: Object },
  apiBody: { type: Object },
  // Pour function
  functionName: { type: String },
  functionParams: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Actions', ActionSchema);