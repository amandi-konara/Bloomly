import React, { useState } from 'react';
import { X, Sparkles, Check, Heart } from './Icons';
import { MOOD_CONFIG } from './MoodBadge';
import Button from './Button';
import { dataService } from '../services/dataService';

const ENERGY_LABELS = {
  1: 'Very Low (Needs gentle sleep)',
  2: 'Low (Take it slow today)',
  3: 'Balanced & Steady',
  4: 'Vibrant & Focused',
  5: 'Radiant (Full bloom!)',
};

const CARE_ITEMS = [
  { key: 'meal', label: 'Nourishing Meal', icon: '🍲' },
  { key: 'stretch', label: 'Gentle Stretch', icon: '🧘' },
  { key: 'screenBreak', label: 'Screen Curfew', icon: '📵' },
  { key: 'friend', label: 'Friend Check-in', icon: '💬' },
  { key: 'water', label: 'Hydration Goal', icon: '💧' },
  { key: 'nature', label: 'Outdoor Air', icon: '🌿' },
];

export default function DailyCheckInModal({ isOpen, onClose, onSaved }) {
  const [mood, setMood] = useState('blooming');
  const [energyLevel, setEnergyLevel] = useState(4);
  const [studyHours, setStudyHours] = useState(3.5);
  const [littleWin, setLittleWin] = useState('');
  const [notes, setNotes] = useState('');
  const [selfCare, setSelfCare] = useState({
    meal: true,
    stretch: true,
    screenBreak: false,
    friend: true,
    water: true,
    nature: false,
  });
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  if (!isOpen) return null;

  const toggleCare = (key) => {
    setSelfCare((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const logData = {
      mood,
      energyLevel,
      studyHours: Number(studyHours),
      littleWin: littleWin.trim() || 'Took mindful care of myself today 🌸',
      selfCare,
      notes: notes.trim(),
    };

    const saved = await dataService.addLog(logData);
    setSaving(false);
    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
      if (onSaved) onSaved(saved);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-dark/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 w-full max-w-xl rounded-4xl border border-bloom-border shadow-soft-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 bg-white border-b border-bloom-border/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-sage-100 flex items-center justify-center text-lg">
              🌱
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-bloom-dark">Today's Garden Check-in</h2>
              <p className="text-xs text-bloom-muted">Log your vibe, energy, self-care, and small wins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-bloom-muted hover:text-bloom-dark hover:bg-cream-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-7 space-y-6 overflow-y-auto">
          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-2.5">
              1. How is your inner garden blooming today?
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {Object.entries(MOOD_CONFIG).map(([key, config]) => {
                const isSelected = mood === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMood(key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? 'bg-white border-sage-400 ring-2 ring-sage-300 shadow-soft scale-105'
                        : 'bg-white/70 border-bloom-border hover:bg-white hover:border-sage-200'
                    }`}
                  >
                    <span className="text-2xl mb-1">{config.emoji}</span>
                    <span className="text-[11px] font-semibold text-bloom-dark line-clamp-1">{key}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Energy Slider */}
          <div className="bg-white p-4 rounded-3xl border border-bloom-border">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-bloom-muted">
                2. Energy Level ({energyLevel}/5)
              </label>
              <span className="text-xs font-medium text-sage-800 bg-sage-100 px-2.5 py-0.5 rounded-full">
                {ENERGY_LABELS[energyLevel]}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-sage-700"
            />
            <div className="flex justify-between text-[11px] text-bloom-muted mt-1 px-1">
              <span>Rest & recharge</span>
              <span>Steady rhythm</span>
              <span>Full energy</span>
            </div>
          </div>

          {/* Study & Focus Hours */}
          <div className="bg-white p-4 rounded-3xl border border-bloom-border">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-bloom-muted">
                3. Focused Study / Creative Hours
              </label>
              <span className="text-sm font-bold text-bloom-dark">{studyHours} hrs</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="16"
                step="0.5"
                value={studyHours}
                onChange={(e) => setStudyHours(Math.max(0, Number(e.target.value)))}
                className="w-24 p-2.5 rounded-xl border border-bloom-border bg-cream-50 text-bloom-dark font-semibold text-center focus:outline-none focus:ring-2 focus:ring-sage-300"
              />
              <div className="flex gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 6].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setStudyHours(hrs)}
                    className={`px-3 py-1 text-xs rounded-xl border transition ${
                      studyHours === hrs
                        ? 'bg-sage-200 border-sage-300 font-semibold text-sage-900'
                        : 'bg-cream-100 border-bloom-border text-bloom-muted hover:bg-cream-200'
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Self-Care Checklist */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-2.5">
              4. Self-care moments practiced today
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CARE_ITEMS.map((item) => {
                const active = selfCare[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleCare(item.key)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition ${
                      active
                        ? 'bg-sage-100 border-sage-300 text-sage-900 shadow-soft'
                        : 'bg-white border-bloom-border text-bloom-muted hover:bg-cream-100'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs font-medium line-clamp-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Little Bloom Gratitude */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-2">
              5. Today's Little Bloom 🌼 (One small win or smile)
            </label>
            <input
              type="text"
              placeholder="e.g. Sipped my favorite lavender tea, smiled at a puppy..."
              value={littleWin}
              onChange={(e) => setLittleWin(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-bloom-border bg-white text-bloom-dark placeholder-bloom-muted/60 focus:outline-none focus:ring-2 focus:ring-sage-300 text-sm shadow-inner-soft"
            />
          </div>

          {/* Journal Reflection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-2">
              6. Evening Reflection (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="How are you feeling right now? Any gentle thoughts before resting..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-bloom-border bg-white text-bloom-dark placeholder-bloom-muted/60 focus:outline-none focus:ring-2 focus:ring-sage-300 text-sm shadow-inner-soft"
            />
          </div>

          {/* Action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={saving}
              className="w-full py-4 text-base"
              icon={celebrating ? Check : Sparkles}
            >
              {celebrating ? 'Garden Planted! 🌸' : saving ? 'Saving your bloom...' : "Save Today's Check-in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
