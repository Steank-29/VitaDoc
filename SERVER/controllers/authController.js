const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const admin = require('../config/firebase');

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Normalize phone number (consistent with frontend)
const normalizePhoneNumber = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s-]/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

// Send email with OTP
const sendEmailOtp = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Code - VitaDoc',
    text: `Your password reset code is: ${otp}. It expires in 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);
};

// Send SMS with OTP (mocked if twilioClient is null)
const sendSmsOtp = async (phone, otp) => {
  if (!twilioClient) {
    console.log(`Mock SMS to ${phone}: Your OTP is ${otp}`);
    return;
  }
  await twilioClient.messages.create({
    body: `Your password reset code is: ${otp}. It expires in 10 minutes.`,
    from: process.env.TWILIO_PHONE,
    to: phone,
  });
};

// Sign Up (Register)
const signUp = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    gender,
    dateOfBirth,
    medicalSpecialty,
    location,
    phoneNumber,
    secondPhoneNumber,
    password,
  } = req.body;
  const picture = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Validate file upload
    if (!picture) {
      return res.status(400).json({ message: 'Profile picture is required' });
    }

    // Normalize phone numbers
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const normalizedSecondPhone = normalizePhoneNumber(secondPhoneNumber);

    const user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      gender,
      dateOfBirth,
      medicalSpecialty,
      picture,
      location,
      phoneNumber: normalizedPhone,
      secondPhoneNumber: normalizedSecondPhone,
      password,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Sign In (Login)
const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'Use Google Sign-In for this account' });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role // if you have roles
      }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: '1h',
        issuer: 'VitaDoc',
        subject: user._id.toString()
      }
    );
    
    res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Forgot Password - Send OTP (now email only; phone handled by frontend)
const forgotPassword = async (req, res) => {
  const { contact, type } = req.body;

  try {
    if (type === 'phone') {
      return res.status(200).json({ message: 'Proceed with client-side verification' }); // Frontend handles phone OTP
    }

    let user = await User.findOne({ email: contact.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'Google accounts cannot reset passwords' });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = expiry;
    user.resetType = type;
    await user.save();

    await sendEmailOtp(contact, otp);

    res.status(200).json({ message: 'Code sent successfully' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Verify Code (email only; phone handled by frontend)
const verifyCode = async (req, res) => {
  const { contact, code, type } = req.body;

  try {
    if (type === 'phone') {
      return res.status(200).json({ message: 'Proceed with client-side verification' }); // Frontend handles
    }

    let user = await User.findOne({ email: contact.toLowerCase() });
    if (!user || !(await user.compareOtp(code))) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    res.status(200).json({ message: 'Code verified' });
  } catch (err) {
    console.error('Verify code error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Reset Password (handle both; for phone, verify ID token from Firebase)
const resetPassword = async (req, res) => {
  const { contact, newPassword, idToken, type } = req.body;

  try {
    let user;
    if (type === 'phone') {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const verifiedPhone = decodedToken.phone_number; // E.164 format from Firebase

      user = await User.findOne({ phoneNumber: normalizePhoneNumber(verifiedPhone) });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      // Email reset
      user = await User.findOne({ email: contact.toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify OTP still valid
      if (!user.resetOtp || !user.resetOtpExpiry || new Date() > user.resetOtpExpiry || user.resetType !== type) {
        return res.status(400).json({ message: 'Session expired. Please request a new code.' });
      }
    }

    user.password = newPassword;
    user.clearOtp();
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetOtp -resetOtpExpiry');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Get user by ID error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    res.status(500).json({ message: err.message || 'Server error' });
  }
};


// Backend - refresh token route
const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Issue new token
    const newToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { signUp, signIn, forgotPassword, verifyCode, resetPassword, getUserById, refreshToken };