import { useState } from 'react';
import {
  AlertCircle,
  Check,
  Cloud,
  Heart,
  Meh,
  MessageCircle,
  MonitorOff,
  Moon,
  PersonStanding,
  Smile,
  TreePine,
  Utensils,
  X,
} from 'lucide-react';
import Button from './Button';
import { dataService } from '../services/dataService';

const MOODS = [
  { key: 'blooming', label: 'Good', icon: Smile },
  { key: 'seedling', label: 'Calm', icon: Moon },
  { key: 'sunny', label: 'Okay', icon: Meh },
  { key: 'stormy', label: 'Stressed', icon: Cloud },
  { key: 'wilting', label: 'Low', icon: AlertCircle },
];

const ENERGY_LABELS = {
  1: 'Low',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'High',
};

const CARE_ITEMS = [
  { key: 'meal', label: 'Ate well', icon: Utensils },
  { key: 'stretch', label: 'Moved my body', icon: PersonStanding },
  { key: 'water', label: 'Rested', icon: Moon },
  { key: 'friend', label: 'Connected with someone', icon: MessageCircle },
  { key: 'nature', label: 'Spent time outside', icon: TreePine },
  { key: 'screenBreak', label: 'Took a screen break', icon: MonitorOff },
];

const INITIAL_SELF_CARE = {
  meal: false,
  stretch: false,
  screenBreak: false,
  friend: false,
  water: false,
  nature: false,
};

export default function DailyCheckInModal({ isOpen, onClose, onSaved }) {
  const [mood, setMood] = useState('blooming');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [selfCare, setSelfCare] = useState(INITIAL_SELF_CARE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const toggleCare = (key) => {
    setSelfCare((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const savedLog = await dataService.addLog({
        mood,
        energyLevel,
        selfCare,
        notes: notes.trim(),
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onSaved?.(savedLog);
        onClose();
      }, 900);
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Your check-in could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-dark/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 w-full max-w-xl rounded-4xl border border-bloom-border shadow-soft-lg overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-bloom-border/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-sage-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-sage-700" />
            </span>
            <h2 className="text-xl font-bold font-display text-bloom-dark">Daily Check-in</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close daily check-in"
            className="p-2 rounded-xl text-bloom-muted hover:text-bloom-dark hover:bg-cream-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-7 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-bloom-dark mb-3">
              How are you feeling today?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MOODS.map(({ key, label, icon: Icon }) => {
                const selected = mood === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setMood(key)}
                    className={`min-h-20 flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition ${
                      selected
                        ? 'bg-sage-100 border-sage-400 text-sage-900'
                        : 'bg-white border-bloom-border text-bloom-muted hover:border-sage-200 hover:bg-sage-50/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="daily-energy" className="text-sm font-semibold text-bloom-dark">
                How&apos;s your energy?
              </label>
              <span className="text-sm font-medium text-sage-800">{energyLevel}/5 · {ENERGY_LABELS[energyLevel]}</span>
            </div>
            <input
              id="daily-energy"
              type="range"
              min="1"
              max="5"
              step="1"
              value={energyLevel}
              onChange={(event) => setEnergyLevel(Number(event.target.value))}
              className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-sage-700"
            />
            <div className="flex justify-between text-xs text-bloom-muted mt-2">
              <span>Low</span>
              <span>Okay</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-bloom-dark mb-3">
              What did you do for yourself?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CARE_ITEMS.map(({ key, label, icon: Icon }) => {
                const selected = selfCare[key];
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleCare(key)}
                    className={`flex items-center gap-3 min-h-12 p-3 rounded-xl border text-left transition ${
                      selected
                        ? 'bg-sage-100 border-sage-300 text-sage-900'
                        : 'bg-white border-bloom-border text-bloom-muted hover:border-sage-200 hover:bg-sage-50/50'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium">{label}</span>
                    {selected && <Check className="w-4 h-4 ml-auto shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="daily-note" className="block text-sm font-semibold text-bloom-dark mb-2">
              Anything you&apos;d like to remember?
            </label>
            <textarea
              id="daily-note"
              rows="3"
              placeholder="A small win, a thought, or something on your mind…"
              value={notes}
              maxLength={500}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full p-3.5 rounded-2xl border border-bloom-border bg-white text-bloom-dark placeholder-bloom-muted/60 focus:outline-none focus:ring-2 focus:ring-sage-300 text-sm"
            />
          </div>

          {error && <p role="alert" className="rounded-xl bg-peach-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={saving}
            className="w-full py-4 text-base"
            icon={saved ? Check : undefined}
          >
            {saved ? 'Saved' : saving ? 'Saving…' : 'Save check-in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
