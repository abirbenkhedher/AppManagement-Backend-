const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mobileAppRoutes = require('./routes/MobileAppRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const interfaceRoutes = require('./routes/interfaceRoutes');
const authRoutes = require('./routes/authRoutes');
const actionroutes = require('./routes/actionroutes');
const approutes = require('./routes/app');

const app = express();

// Configuration de la sécurité
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:8081'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Disposition'] // Ajoutez ceci
}));



// Limiter les requêtes pour prévenir les attaques DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});
app.use(limiter);

// Middleware pour parser le JSON
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));

// Middleware pour les données de formulaire
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 10000 
}));

// Configuration de la base de données
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mobileAppDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Vérification et création du dossier uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Created upload directory at ${uploadDir}`);
}

// Middleware de journalisation

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes
app.use('/api', mobileAppRoutes);
app.use('/api', moduleRoutes);
app.use('/api', interfaceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/actions', actionroutes);
app.use('/api/apps',approutes)


// Test endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Middleware de journalisation des erreurs

// Validation des erreurs avec celebrate

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: '🔍 Route not found',
    path: req.originalUrl
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  
  res.status(statusCode).json({ 
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      details: err.details 
    })
  });
});

// Configuration du serveur
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🌐 CORS allowed origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}, 'http://localhost:8081'`);
});

// Gestion propre des arrêts
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});