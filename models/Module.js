// models/Module.js
const mongoose = require('mongoose');

const InterfaceSchema = new mongoose.Schema({
  name: String,
  components: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }],
});

const ModuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  interfaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interface' }],
  parentModuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null }, // <-- Nouveau
});

module.exports = mongoose.model('Module', ModuleSchema);
