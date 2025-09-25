const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      gender,
      dateOfBirth,
      medicalSpecialty,
      picture,
      location,
      phoneNumber,
      secondPhoneNumber,
      password,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Sign In (Login)
const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'Use Google Sign-In for this account' });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signUp, signIn };