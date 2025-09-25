const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: function() { return !this.googleId; }, minlength: 2 },
  lastName: { type: String, required: function() { return !this.googleId; }, minlength: 2 },
  email: { type: String, required: true, unique: true },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'], 
    required: function() { return !this.googleId; } 
  },
  dateOfBirth: { type: Date, required: function() { return !this.googleId; } },
  medicalSpecialty: { type: String, required: function() { return !this.googleId; } },
  picture: { type: String, required: function() { return !this.googleId; } }, // Store file path or URL
  password: { type: String, required: function() { return !this.googleId; } }, // Hashed; not required for Google users
  location: { type: String, required: function() { return !this.googleId; } },
  phoneNumber: { 
    type: String, 
    required: function() { return !this.googleId; }, 
    match: /^\+?[\d\s-]{10,15}$/ 
  },
  secondPhoneNumber: { type: String, match: /^\+?[\d\s-]{10,15}$/ },
  googleId: { type: String }, // For Google auth
  name: { type: String }, // For Google auth (full name)
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving (skip if no password or Google auth)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false; // No password for Google users
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);