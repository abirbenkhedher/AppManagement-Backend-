const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Utilisez bcryptjs

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hasher le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10); // Hacher le mot de passe
  }
  next();
});

module.exports = mongoose.model('User', userSchema);