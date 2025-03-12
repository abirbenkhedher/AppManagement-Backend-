const mongoose = require('mongoose');

const InterfaceSchema = new mongoose.Schema({
  name: String,
  components: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }],
});

const ModuleSchema = new mongoose.Schema({
  name: String,
  interfaces: [InterfaceSchema],
});

module.exports = mongoose.model('Module', ModuleSchema);