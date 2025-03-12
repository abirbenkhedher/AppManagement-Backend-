const mongoose = require('mongoose');

const ComponentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nom du composant
  type: { type: String, required: true }, // Type de composant
  properties: { type: Object, default: {} }, // Propriétés du composant
  createdAt: { type: Date, default: Date.now }, // Date de création
});

module.exports = mongoose.model('Component', ComponentSchema);