const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  mood: { type: String, enum: ['seedling', 'blooming', 'wilting', 'stormy', 'sunny'], default: 'seedling' },
  energyLevel: { type: Number, min: 1, max: 5, default: 3 },
  studyHours: { type: Number, default: 0 },
  littleWin: { type: String, default: '' },
  selfCare: {
    meal: { type: Boolean, default: false },
    stretch: { type: Boolean, default: false },
    screenBreak: { type: Boolean, default: false },
    friend: { type: Boolean, default: false },
    water: { type: Boolean, default: false },
    nature: { type: Boolean, default: false },
  },
  notes: { type: String, default: '', maxlength: 500 },
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);