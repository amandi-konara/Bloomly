const express = require('express');
const Log = require('../models/Log');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const log = await Log.create({ ...req.body, user: req.userId });
  res.json(log);
});

router.get('/', auth, async (req, res) => {
  const logs = await Log.find({ user: req.userId }).sort({ date: -1 }).limit(30);
  res.json(logs);
});

module.exports = router;