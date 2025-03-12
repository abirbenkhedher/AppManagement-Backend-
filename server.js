const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importer cors
const path = require('path'); // Importer le module path
const mobileAppRoutes = require('./routes/MobileAppRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const interfaceRoutes = require('./routes/interfaceRoutes');
const componentRoutes = require('./routes/componentRoutes');

const app = express();

// Middleware pour parser le JSON
app.use(express.json());//-
app.use(express.json());//+
//+
// Middleware pour gérer les données de formulaire//+
app.use(express.urlencoded({ extended: true }));//+
//+
// Middleware pour gérer les uploads de fichiers//+
const multer = require('multer');//+
const upload = multer({ dest: 'uploads/' });//+

// Configurer CORS pour autoriser les requêtes depuis http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000', // Autoriser uniquement ce domaine
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Autoriser ces méthodes HTTP
  allowedHeaders: ['Content-Type', 'Authorization'], // Autoriser ces en-têtes
}));

// Connexion à la base de données
mongoose.connect('mongodb://localhost:27017/mobileAppDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api', mobileAppRoutes);
app.use('/api', moduleRoutes);
app.use('/api', interfaceRoutes);
app.use('/api', componentRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});