import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  ChevronLeft,
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
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { dataService } from '../services/dataService';

const MOODS = [
  { key: 'blooming', label: 'Good', icon: Smile },
  { key: 'seedling', label: 'Okay', icon: Moon },
  { key: 'sunny', label: 'Calm', icon: Meh },
  { key: 'stormy', label: 'Stressed', icon: Cloud },
  { key: 'wilting', label: 'Low', icon: AlertCircle },
];

const CARE_ITEMS = [
  { key: 'meal', label: 'Ate well', icon: Utensils },
  { key: 'stretch', label: 'Moved my body', icon: PersonStanding },
  { key: 'water', label: 'Rested', icon: Moon },
  { key: 'friend', label: 'Connected with someone', icon: MessageCircle },
  { key: 'nature', label: 'Spent time outside', icon: TreePine },
  { key: 'screenBreak', label: 'Took a screen break', icon: MonitorOff },
];

export default function LogForm() {
  const [mood, setMood] = useState('blooming');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [selfCare, setSelfCare] = useState({
    meal: false,
    stretch: false,
    screenBreak: false,
    friend: false,
    water: false,
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
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-bloom-border">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-sage-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-sage-700" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-display text-bloom-dark">
                Daily Check-in
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p role="alert" className="rounded-xl bg-peach-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
          {/* Mood */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-3">
              How are you feeling today?
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {MOODS.map(({ key, label, icon: Icon }) => {
                const isSelected = mood === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMood(key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? 'bg-sage-100 border-sage-400 text-sage-900'
                        : 'bg-white border-bloom-border text-bloom-muted hover:bg-cream-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" aria-hidden="true" />
                    <span className="text-[11px] font-semibold">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Energy */}
          <div className="bg-cream-50 p-4 rounded-3xl border border-bloom-border">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-bloom-muted">
                How&apos;s your energy? ({energyLevel}/5)
              </label>
              <span className="text-xs font-bold text-sage-800 bg-white px-2.5 py-0.5 rounded-full border border-sage-200">
                {energyLevel <= 2 ? 'Low' : energyLevel === 3 ? 'Okay' : 'High'}
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

          {/* Self-care moments */}
          <div>
            <label className="block text-sm font-semibold text-bloom-dark mb-3">
              What did you do for yourself?
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
                        ? 'bg-sage-100 border-sage-300 text-sage-900'
                        : 'bg-white border-bloom-border text-bloom-muted hover:bg-cream-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {active && <Check className="w-4 h-4 ml-auto" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="log-reflection" className="block text-sm font-semibold text-bloom-dark mb-2">
              Anything you&apos;d like to remember?
            </label>
            <textarea
              id="log-reflection"
              rows="2"
              placeholder="A small win, a thought, or something on your mind…"
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
              icon={saved ? Check : undefined}
            >
              {saved ? 'Saved' : saving ? 'Saving…' : 'Save check-in'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
