const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { signUp, signIn, forgotPassword, verifyCode, resetPassword } = require('../controllers/authController');

const router = express.Router();

// Email/Password Routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

// Google Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.redirect(`https://vita-doc.vercel.app/dashboard?token=${token}`);
});

// Verify JWT token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, userId: decoded.id });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

// Fetch user data
router.get('/user', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('firstName lastName email gender dateOfBirth medicalSpecialty picture location phoneNumber secondPhoneNumber');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;