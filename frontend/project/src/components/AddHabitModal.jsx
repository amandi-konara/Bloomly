import { useState } from 'react';
import { Plus, X } from './Icons';
import Button from './Button';
import { dataService } from '../services/dataService';

const CATEGORIES = ['Mindfulness', 'Hydration', 'Movement', 'Rest', 'Nutrition', 'Focus', 'Other'];
const FREQUENCIES = ['Daily', 'Weekdays', '3 days/week', 'Weekends'];

function getInitialForm(habit) {
  const savedCategory = habit?.category || 'Mindfulness';
  const category = savedCategory === 'Rest & Sleep'
    ? 'Rest'
    : savedCategory === 'Focus & Study'
      ? 'Focus'
      : CATEGORIES.includes(savedCategory) ? savedCategory : 'Other';

  return {
    title: habit?.title || '',
    category,
    frequency: habit?.frequency || 'Daily',
    reminder: habit?.reminder || '',
  };
}

export default function AddHabitModal({ isOpen, onClose, onAdded, habit = null }) {
  const [form, setForm] = useState(() => getInitialForm(habit));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError('Enter a name for this habit.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const changes = { ...form, title, reminder: form.reminder || '' };
      const updated = habit
        ? dataService.updateHabit(habit.id, changes)
        : dataService.addHabit(changes);
      onAdded?.(updated);
      onClose();
    } catch {
      setError('This habit could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-dark/30 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-form-title"
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-bloom-border bg-cream-50 shadow-soft-lg"
      >
        <header className="flex items-center justify-between border-b border-bloom-border/70 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 id="habit-form-title" className="text-lg font-bold font-display text-bloom-dark">
              {habit ? 'Edit habit' : 'Add a habit'}
            </h2>
            <p className="mt-0.5 text-sm text-bloom-muted">Set the routine and when you want to do it.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="grid h-9 w-9 place-items-center rounded-xl text-bloom-muted transition hover:bg-cream-200 hover:text-bloom-dark"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <div>
            <label htmlFor="habit-title" className="mb-1.5 block text-sm font-semibold text-bloom-dark">
              Habit name
            </label>
            <input
              id="habit-title"
              type="text"
              required
              maxLength={100}
              autoFocus
              value={form.title}
              onChange={updateField('title')}
              placeholder="e.g. Take a short walk"
              className="w-full rounded-xl border border-bloom-border bg-white px-3.5 py-3 text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="habit-category" className="mb-1.5 block text-sm font-semibold text-bloom-dark">
                Category
              </label>
              <select
                id="habit-category"
                value={form.category}
                onChange={updateField('category')}
                className="w-full rounded-xl border border-bloom-border bg-white px-3.5 py-3 text-sm text-bloom-dark"
              >
                {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="habit-frequency" className="mb-1.5 block text-sm font-semibold text-bloom-dark">
                Frequency
              </label>
              <select
                id="habit-frequency"
                value={form.frequency}
                onChange={updateField('frequency')}
                className="w-full rounded-xl border border-bloom-border bg-white px-3.5 py-3 text-sm text-bloom-dark"
              >
                {!FREQUENCIES.includes(form.frequency) && <option>{form.frequency}</option>}
                {FREQUENCIES.map((frequency) => <option key={frequency}>{frequency}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="habit-reminder" className="mb-1.5 block text-sm font-semibold text-bloom-dark">
              Reminder <span className="font-normal text-bloom-muted">(optional)</span>
            </label>
            <input
              id="habit-reminder"
              type="time"
              value={form.reminder}
              onChange={updateField('reminder')}
              className="w-full rounded-xl border border-bloom-border bg-white px-3.5 py-3 text-sm text-bloom-dark"
            />
          </div>

          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}

          <footer className="flex justify-end gap-2 border-t border-bloom-border/70 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving} icon={habit ? undefined : Plus}>
              {saving ? 'Saving…' : habit ? 'Save changes' : 'Add habit'}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}
