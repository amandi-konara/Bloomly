const express = require('express');
const Log = require('../models/Log');
const auth = require('../middleware/auth');
const router = express.Router();

const MOODS = ['seedling', 'blooming', 'wilting', 'stormy', 'sunny'];
const SELF_CARE_KEYS = ['meal', 'stretch', 'screenBreak', 'friend', 'water', 'nature'];
const EDITABLE_FIELDS = ['date', 'dateKey', 'mood', 'energyLevel', 'studyHours', 'littleWin', 'notes', 'selfCare'];

function isValidDate(value) {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value !== 'string') return false;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

function validateLogFields(fields) {
  if (fields.date !== undefined
    && !isValidDate(fields.date)) {
    return 'A valid date is required.';
  }
  if (fields.dateKey !== undefined && !isValidDate(fields.dateKey)) {
    return 'A valid local calendar date is required.';
  }
  if (fields.mood !== undefined && !MOODS.includes(fields.mood)) {
    return 'Choose a valid mood.';
  }
  if (fields.energyLevel !== undefined
    && (!Number.isInteger(fields.energyLevel) || fields.energyLevel < 1 || fields.energyLevel > 5)) {
    return 'Energy must be a whole number from 1 to 5.';
  }
  if (fields.studyHours !== undefined
    && (typeof fields.studyHours !== 'number' || !Number.isFinite(fields.studyHours)
      || fields.studyHours < 0 || fields.studyHours > 24)) {
    return 'Study hours must be a number from 0 to 24.';
  }
  if (fields.littleWin !== undefined
    && (typeof fields.littleWin !== 'string' || fields.littleWin.length > 500)) {
    return 'Little win must be 500 characters or fewer.';
  }
  if (fields.notes !== undefined && (typeof fields.notes !== 'string' || fields.notes.length > 500)) {
    return 'Reflection must be 500 characters or fewer.';
  }
  if (fields.selfCare !== undefined
    && (!fields.selfCare || typeof fields.selfCare !== 'object' || Array.isArray(fields.selfCare)
      || Object.entries(fields.selfCare).some(([key, value]) => (
        !SELF_CARE_KEYS.includes(key) || typeof value !== 'boolean'
      )))) {
    return 'Self-care activities are invalid.';
  }
  return null;
}

router.post('/', auth, async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const fields = Object.fromEntries(
    EDITABLE_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]),
  );
  if (fields.mood === undefined || fields.energyLevel === undefined) {
    return res.status(400).json({ error: 'Mood and energy are required for a journal entry.' });
  }
  if (fields.dateKey !== undefined) fields.date = new Date(`${fields.dateKey}T12:00:00.000Z`);
  const error = validateLogFields(fields);
  if (error) return res.status(400).json({ error });
  const log = await Log.create({ ...fields, user: req.userId });
  res.json(log);
});

router.get('/', auth, async (req, res) => {
  const logs = await Log.find({ user: req.userId }).sort({ date: -1, createdAt: -1 });
  res.json(logs);
});

router.put('/:id', auth, async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const fields = Object.fromEntries(
    EDITABLE_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]),
  );
  const error = validateLogFields(fields);
  if (error) return res.status(400).json({ error });
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Provide at least one field to update.' });
  }
  if (fields.dateKey !== undefined) {
    fields.date = new Date(`${fields.dateKey}T12:00:00.000Z`);
  } else if (fields.date !== undefined) {
    fields.dateKey = undefined;
  }

  try {
    const update = { $set: fields };
    if (fields.date !== undefined && fields.dateKey === undefined) update.$unset = { dateKey: 1 };
    if (fields.dateKey === undefined) delete fields.dateKey;
    const log = await Log.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      update,
      { new: true, runValidators: true },
    );
    if (!log) return res.status(404).json({ error: 'Journal entry not found.' });
    return res.json(log);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid journal entry ID.' });
    throw err;
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const log = await Log.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!log) return res.status(404).json({ error: 'Journal entry not found.' });
    return res.json({ deleted: true });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid journal entry ID.' });
    throw err;
  }
});

module.exports = router;