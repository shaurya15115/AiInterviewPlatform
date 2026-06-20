const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    console.log('🔐 Generating token for user:', user._id);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET is not set!');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });
    console.log('✓ Token generated successfully');
    
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    console.log('🔐 Generating token for user:', user._id);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET is not set!');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });
    console.log('✓ Token generated successfully');
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, resumeData: user.resumeData } });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};