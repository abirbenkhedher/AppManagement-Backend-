const mongoose = require('mongoose');
const Component = require('./Component');

const InterfaceSchema = new mongoose.Schema({
  name: String,
  components: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }],
});

module.exports = mongoose.model('Interface', InterfaceSchema);