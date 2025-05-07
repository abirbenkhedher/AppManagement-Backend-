const mongoose = require('mongoose');

const MobileAppSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  details: { type: String, required: true },
  dateCreation: { type: Date, default: Date.now },
  DateModification: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["En développement", "En test", "En production"],
    default: "En développement",
  },
  logo: { type: String },
  modules: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Module',
    // Ajoutez ceci pour autoriser la population profonde
    populate: {
      path: 'interfaces',
      model: 'Interface'
    }
  }],
  exportedData: { type: Object },
}, {
  // Activez la population virtuelle
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Alternative : Si vous ne voulez pas modifier le schéma
MobileAppSchema.set('strictPopulate', false);

module.exports = mongoose.model('MobileApp', MobileAppSchema);