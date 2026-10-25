const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

function isValidReminderTime(value) {
  return value === '' || (typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('SIGNUP ERROR:', err);
    res.status(400).json({ error: 'Signup failed. Email may already exist.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('name email reminderTime');
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  return res.json({
    name: user.name || '',
    email: user.email || '',
    reminderTime: user.reminderTime || '',
  });
});

router.put('/me', auth, async (req, res) => {
  const fields = {};
  if (req.body.name !== undefined) {
    if (typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.trim().length > 80) {
      return res.status(400).json({ error: 'Name must be between 1 and 80 characters.' });
    }
    fields.name = req.body.name.trim();
  }
  if (req.body.email !== undefined) {
    if (typeof req.body.email !== 'string'
      || req.body.email.trim().length > 254
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email.trim())) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    fields.email = req.body.email.trim().toLowerCase();
  }
  if (req.body.reminderTime !== undefined) {
    if (!isValidReminderTime(req.body.reminderTime)) {
      return res.status(400).json({ error: 'Reminder time must use a valid 24-hour time.' });
    }
    fields.reminderTime = req.body.reminderTime;
  }
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Provide at least one account preference to update.' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: fields },
      { new: true, runValidators: true },
    ).select('name email reminderTime');
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    return res.json({
      name: user.name || '',
      email: user.email || '',
      reminderTime: user.reminderTime || '',
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'That email address is already in use.' });
    }
    throw err;
  }
});

module.exports = router;