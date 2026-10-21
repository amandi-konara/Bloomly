import React, { useState } from 'react';
import { X, Plus, Sparkles } from './Icons';
import Button from './Button';
import { dataService } from '../services/dataService';

const HABIT_PRESETS = [
  { title: 'Morning sunlight & breathing', category: 'Mindfulness', icon: 'Sun', color: 'butter' },
  { title: 'Drink 2L fresh water', category: 'Hydration', icon: 'Droplet', color: 'mint' },
  { title: 'Read 20 pages of a book', category: 'Focus', icon: 'Book', color: 'sage' },
  { title: 'Screen curfew at 10 PM', category: 'Rest', icon: 'Moon', color: 'peach' },
  { title: 'Walk 5,000 steps outdoors', category: 'Movement', icon: 'Activity', color: 'mint' },
];

export default function AddHabitModal({ isOpen, onClose, onAdded }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Mindfulness');
  const [target, setTarget] = useState('Daily');
  const [color, setColor] = useState('sage');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHabit = {
      title: title.trim(),
      category,
      target,
      color,
    };

    const updated = dataService.addHabit(newHabit);
    if (onAdded) onAdded(updated);
    setTitle('');
    onClose();
  };

  const handleSelectPreset = (p) => {
    setTitle(p.title);
    setCategory(p.category);
    setColor(p.color);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-dark/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 w-full max-w-md rounded-4xl border border-bloom-border shadow-soft-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-bloom-border/60">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-mint-100 flex items-center justify-center text-base">
              🌸
            </span>
            <h2 className="text-lg font-bold font-display text-bloom-dark">Nurture a New Habit</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-bloom-muted hover:text-bloom-dark hover:bg-cream-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
              Habit Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 15-minute gentle evening yoga"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-bloom-border bg-white text-bloom-dark text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-2xl border border-bloom-border bg-white text-bloom-dark text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
              >
                <option value="Mindfulness">Mindfulness</option>
                <option value="Hydration">Hydration</option>
                <option value="Movement">Movement</option>
                <option value="Rest">Rest & Sleep</option>
                <option value="Nutrition">Nutrition</option>
                <option value="Focus">Focus & Study</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
                Frequency
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full p-3 rounded-2xl border border-bloom-border bg-white text-bloom-dark text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
              >
                <option value="Daily">Daily</option>
                <option value="5 days/week">5 days / week</option>
                <option value="3 days/week">3 days / week</option>
                <option value="Weekends">Weekends only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
              Quick Ideas
            </label>
            <div className="flex flex-wrap gap-1.5">
              {HABIT_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="px-2.5 py-1 text-xs rounded-xl bg-white border border-bloom-border text-bloom-dark hover:bg-sage-100 transition"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" className="w-full py-3.5" icon={Plus}>
              Plant This Habit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
