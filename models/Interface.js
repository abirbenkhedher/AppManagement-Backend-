const mongoose = require('mongoose');

const InterfaceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  components: [{
    id: String,
    type: { 
      type: String, 
      required: true,
      enum: ['Bouton', 'Champ texte', 'Label', 'Image', 'Conteneur'] 
    },
    placeholder: String,
    text: String,
    
    // Nouveau champ pour l'action
    action: {
      type: {
        type: String,
        enum: ['navigation', 'api', 'function'],
        required: function() {
          return this.type === 'Bouton'; // Seulement requis pour les boutons
        }
      },
      // Pour la navigation
      target: String,
      params: mongoose.Schema.Types.Mixed,
      
      // Pour les API
      method: String,
      url: String,
      headers: mongoose.Schema.Types.Mixed,
      body: mongoose.Schema.Types.Mixed,
      
      // Pour les fonctions
      functionName: String
    },
    
    style: {
      backgroundColor: String,
      color: String,
      width: String,
      height: String,
      margin: String,
      padding: String,
      fontSize: String,
      fontWeight: String,
      fontStyle: String,
      textAlign: String,
      zIndex: Number,
      position: String,
      flex: String,
      minWidth: String,
      border: String,
      borderRadius: String,
      boxShadow: String,
      display: String,
      flexDirection: String,
      justifyContent: String,
      alignItems: String,
      flexWrap: String,
      cursor: String,
      opacity: Number,
      transform: String,
      transition: String
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Mise à jour automatique de la date de modification
InterfaceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Interface', InterfaceSchema);