import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ChevronLeft, Sprout, Utensils, PersonStanding, MonitorOff, MessageCircle, Droplets, TreePine, Flower } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { MOOD_CONFIG } from '../components/MoodBadge';
import { dataService } from '../services/dataService';
import welcomeCharacter from '../assets/welcome-character.png';

const ENERGY_LABELS = {
  1: 'Very Low (Prioritize sleep)',
  2: 'Low (Gentle pace needed)',
  3: 'Balanced & Steady',
  4: 'Vibrant & Focused',
  5: 'Radiant (Full Bloom!)',
};

const CARE_ITEMS = [
  { key: 'meal', label: 'Nourishing Meal', icon: Utensils },
  { key: 'stretch', label: 'Gentle Stretch', icon: PersonStanding },
  { key: 'screenBreak', label: 'Screen Curfew', icon: MonitorOff },
  { key: 'friend', label: 'Connected with Friend', icon: MessageCircle },
  { key: 'water', label: 'Hydrated Well', icon: Droplets },
  { key: 'nature', label: 'Fresh Air / Walk', icon: TreePine },
];

export default function LogForm() {
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
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleCare = (key) => {
    setSelfCare((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await dataService.addLog({
        mood,
        energyLevel,
        studyHours: Number(studyHours),
        littleWin: littleWin.trim(),
        selfCare,
        notes: notes.trim(),
      });
      setSaved(true);
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Your check-in could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-bloom-muted hover:text-bloom-dark"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs text-bloom-muted">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <Card padding="p-6 md:p-8" className="border-sage-200">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-bloom-border">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center shadow-soft">
              <Sprout className="w-6 h-6 text-sage-700" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-display text-bloom-dark">
                How is your garden blooming today?
              </h1>
              <p className="text-xs text-bloom-muted">Take a mindful pause to record your rhythm</p>
            </div>
          </div>
          <img
            src={welcomeCharacter}
            alt="Companion"
            className="w-14 h-14 object-contain hidden sm:block"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p role="alert" className="rounded-xl bg-peach-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
          {/* Mood */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-3">
              1. Pick your current vibe
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
                        ? 'bg-sage-100 border-sage-400 ring-2 ring-sage-300 scale-105 shadow-soft'
                        : 'bg-white border-bloom-border hover:bg-cream-100'
                    }`}
                  >
                    <span className="mb-1">{React.createElement(config.icon, { className: 'w-6 h-6' })}</span>
                    <span className="text-[11px] font-semibold text-bloom-dark capitalize">{key}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Energy */}
          <div className="bg-cream-50 p-4 rounded-3xl border border-bloom-border">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-bloom-muted">
                2. Energy Level ({energyLevel}/5)
              </label>
              <span className="text-xs font-bold text-sage-800 bg-white px-2.5 py-0.5 rounded-full border border-sage-200">
                {ENERGY_LABELS[energyLevel]}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-sage-700"
            />
          </div>

          {/* Study hours */}
          <div className="bg-cream-50 p-4 rounded-3xl border border-bloom-border">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-bloom-muted">
                3. Mindful Study Hours
              </label>
              <span className="text-sm font-bold text-bloom-dark">{studyHours} hrs</span>
            </div>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full p-3 rounded-2xl border border-bloom-border bg-white text-bloom-dark font-semibold text-center focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>

          {/* Self-care moments */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-2.5">
              4. Self-care moments practiced today
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Little Bloom */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-2">
              5. Today's Little Bloom <Flower className="inline w-4 h-4 text-amber-400" /> (One tiny win or grateful smile)
            </label>
            <input
              type="text"
              placeholder="e.g. Completed assignment draft, breathed deeply..."
              value={littleWin}
              maxLength={500}
              onChange={(e) => setLittleWin(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-bloom-border bg-white text-bloom-dark placeholder-bloom-muted/60 focus:outline-none focus:ring-2 focus:ring-sage-300 text-sm shadow-inner-soft"
            />
          </div>

          <div>
            <label htmlFor="log-reflection" className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-2">
              Reflection (Optional)
            </label>
            <textarea
              id="log-reflection"
              rows="2"
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-bloom-border bg-white text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300 text-sm"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={saving}
              className="w-full py-4 text-base"
              icon={saved ? Check : Sparkles}
            >
              {saved ? 'Saved to Your Garden!' : saving ? 'Saving…' : "Save Today's Log"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
