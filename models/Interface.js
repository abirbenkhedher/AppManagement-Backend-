const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['navigation', 'api', 'function', 'menu'],
    required: true
  },
  target: String,
  params: mongoose.Schema.Types.Mixed,
  method: String,
  url: String,
  headers: mongoose.Schema.Types.Mixed,
  body: mongoose.Schema.Types.Mixed,
  functionName: String
});

// Schéma pour les options de menu (simplifié)
const MenuOptionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'Un ID est requis pour chaque option de menu'],
    default: () => mongoose.Types.ObjectId().toString()
  },
  label: {
    type: String,
    required: [true, 'Le libellé de l\'option est requis'],
    trim: true,
    minlength: [2, 'Le libellé doit contenir au moins 2 caractères']
  },
  action: {
    type: ActionSchema,
    required: [true, 'Une action est requise pour chaque option de menu']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Schéma pour la configuration du header (simplifié)
const HeaderConfigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre du header est requis'],
    default: 'Titre',
    trim: true,
    maxlength: [50, 'Le titre ne peut excéder 50 caractères']
  },
  backgroundColor: {
    type: String,
    default: '#0d6efd',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: props => `${props.value} n'est pas une couleur hexadécimale valide!`
    }
  },
  color: {
    type: String,
    default: '#ffffff',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: props => `${props.value} n'est pas une couleur hexadécimale valide!`
    }
  },
  fontSize: {
    type: String,
    default: '18px',
    validate: {
      validator: function(v) {
        return /^\d+(px|rem|em|%)$/.test(v);
      },
      message: props => `${props.value} n'est pas une taille de police valide!`
    }
  },
  fontWeight: {
    type: String,
    enum: ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    default: 'bold'
  },
  textAlign: {
    type: String,
    enum: ['left', 'center', 'right', 'justify'],
    default: 'center'
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  showMenuButton: {
    type: Boolean,
    default: true
  },
  menuOptions: {
    type: [MenuOptionSchema],
    default: [],
    validate: {
      validator: function(v) {
        const ids = v.map(option => option.id);
        return new Set(ids).size === ids.length;
      },
      message: 'Les options de menu contiennent des IDs en double!'
    }
  },
  fixed: {
    type: Boolean,
    default: true
  },
  elevation: {
    type: Number,
    min: 0,
    max: 24,
    default: 4
  }
}, { _id: false });

const ComponentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Bouton', 'Champ texte', 'Label', 'Image', 'Liste','Détails']
  },

   apiConfig: {
    url: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE']
    },
    headers: mongoose.Schema.Types.Mixed,
    params: mongoose.Schema.Types.Mixed,
    dataPath: String, // Chemin pour extraire les données (ex: "data.items")
    itemTemplate: mongoose.Schema.Types.Mixed // Template pour chaque élément de liste
  },
  detailConfig: {
    idField: String, // Champ utilisé comme ID pour les détails
    detailFields: [{
      label: String,
      field: String,
      type: String // texte, nombre, date, etc.
    }]
  },
  placeholder: String,
  text: String,
  inputType: {
    type: String,
    enum: ['text', 'password', 'email', 'number', 'tel', 'date', 'textarea'],
    required: function() {
      return this.type === 'Champ texte';
    },
    default: 'text' // Valeur par défaut
  },
  variant: String,
  action: ActionSchema,
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
});
const InterfaceConfigSchema = new mongoose.Schema({
  backgroundColor: {
    type: String,
    default: '#f8f9fa'
  },
  padding: {
    type: String,
    default: '15px'
  },
  margin: {
    type: String,
    default: '0'
  },
  gap: {
    type: String,
    default: '10px'
  }
}, { _id: false, versionKey: false });

const InterfaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  components: {
    type: [ComponentSchema],
    default: []
  },
  headerConfig: {
    type: HeaderConfigSchema,
    default: () => ({})
  },
  interfaceConfig: {
    type: InterfaceConfigSchema,
    default: () => ({})
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Middleware pour mettre à jour updatedAt
InterfaceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index pour optimiser les recherches par nom
InterfaceSchema.index({ name: 1 });

module.exports = mongoose.model('Interface', InterfaceSchema);