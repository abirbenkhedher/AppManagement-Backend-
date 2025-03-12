const mongoose = require('mongoose');

const MobileAppSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Champ obligatoire
  details: { type: String, required: true }, // Champ obligatoire
  dateCreation: { type: Date, default: Date.now },
  DateModification: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["En développement", "En test", "En production"],
    default: "En développement",
  },
  logo: { type: String }, // Champ optionnel
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
});

module.exports = mongoose.model('MobileApp', MobileAppSchema);