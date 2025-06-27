const mongoose = require('mongoose');

const MobileAppSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  details: { type: String },
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
    populate: {
      path: 'interfaces',
      model: 'Interface',
      populate: {
        path: 'headerConfig',
        model: 'HeaderConfig'
      }
    }
  }],
  exportedData: { 
    type: Object,
    default: null
  },
  exportConfig: {
    type: {
      lastExportDate: Date,
      exportVersion: String
    },
    default: null
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictPopulate: false
});

module.exports = mongoose.model('MobileApp', MobileAppSchema);