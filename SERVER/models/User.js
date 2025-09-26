const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: function() { return !this.googleId; }, minlength: 2 },
  lastName: { type: String, required: function() { return !this.googleId; }, minlength: 2 },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
  },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'], 
    required: function() { return !this.googleId; } 
  },
  dateOfBirth: { type: Date, required: function() { return !this.googleId; } },
  medicalSpecialty: { 
    type: String, 
    required: function() { return !this.googleId; },
    enum: [
      "Family Medicine Physician", "Internist", "Pediatrician", "General Practitioner", 
      "Geriatrician", "Cardiologist", "Dermatologist", "Endocrinologist", 
      "Gastroenterologist", "Hepatologist", "Nephrologist", "Pulmonologist", 
      "Rheumatologist", "Neurologist", "Allergist", "Immunologist", 
      "Infectious Disease Specialist", "Medical Oncologist", "Radiation Oncologist", 
      "Hematologist", "General Surgeon", "Cardiothoracic Surgeon", "Neurosurgeon", 
      "Orthopedic Surgeon", "Plastic Surgeon", "Transplant Surgeon", "Vascular Surgeon", 
      "Colorectal Surgeon", "Oral Surgeon", "Maxillofacial Surgeon", "Otolaryngologist", 
      "Ophthalmologist", "Urologist", "Gynecologic Oncologist", "Bariatric Surgeon", 
      "Anesthesiologist", "Emergency Medicine Physician", "Hospitalist", "Intensivist", 
      "Critical Care Physician", "Pathologist", "Radiologist", "Interventional Radiologist", 
      "Nuclear Medicine Specialist", "Psychiatrist", "Addiction Psychiatrist", 
      "Physiatrist", "Obstetrician", "Gynecologist", "Maternal-Fetal Medicine Specialist", 
      "Reproductive Endocrinologist", "Adolescent Medicine Specialist", "Neonatologist"
    ]
  },
  picture: { type: String, required: function() { return !this.googleId; } },
  password: { type: String, required: function() { return !this.googleId; } },
  location: { type: String, required: function() { return !this.googleId; } },
  phoneNumber: { 
    type: String, 
    required: function() { return !this.googleId; }, 
    match: /^\+?[\d\s-]{10,15}$/ 
  },
  secondPhoneNumber: { type: String, match: /^\+?[\d\s-]{10,15}$/ },
  googleId: { type: String },
  name: { type: String },
  // New fields for password reset
  resetOtp: { type: String }, // Hashed OTP
  resetOtpExpiry: { type: Date }, // Expiry time
  resetType: { type: String, enum: ['email', 'phone'] }, // Type of reset (email or phone)
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// Compare OTP
userSchema.methods.compareOtp = async function (otp) {
  if (!this.resetOtp || !this.resetOtpExpiry || new Date() > this.resetOtpExpiry) return false;
  return bcrypt.compare(otp, this.resetOtp);
};

// Clear OTP after use
userSchema.methods.clearOtp = function () {
  this.resetOtp = undefined;
  this.resetOtpExpiry = undefined;
  this.resetType = undefined;
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ phoneNumber: 1 }); // For phone-based reset

module.exports = mongoose.model('User', userSchema);