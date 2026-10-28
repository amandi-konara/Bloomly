import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Heart, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { dataService } from '../services/dataService';

const MOODS = [
  { value: 'sunny', label: 'Calm' },
  { value: 'blooming', label: 'Good' },
  { value: 'seedling', label: 'Okay' },
  { value: 'wilting', label: 'Low' },
  { value: 'stormy', label: 'Stressed' },
];

const SELF_CARE = [
  { key: 'meal', label: 'Nourishing meal' },
  { key: 'stretch', label: 'Movement' },
  { key: 'screenBreak', label: 'Screen break' },
  { key: 'friend', label: 'Connected with someone' },
  { key: 'water', label: 'Hydration' },
  { key: 'nature', label: 'Time outside' },
];

const EMPTY_FORM = {
  date: getLocalDateKey(new Date()),
  mood: 'seedling',
  energyLevel: 3,
  notes: '',
  selfCare: {},
};

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getEntryDateKey(value) {
  if (value && typeof value === 'object' && /^\d{4}-\d{2}-\d{2}$/.test(value.dateKey || '')) {
    return value.dateKey;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (value && typeof value === 'object') value = value.date;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : getLocalDateKey(date);
}

function getEntryDate(entry) {
  return new Date(`${getEntryDateKey(entry)}T12:00:00`);
}

function getMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: startOffset }, (_, index) => ({ key: `blank-${index}`, day: null })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      key: `${year}-${month}-${index + 1}`,
      day: index + 1,
      date: new Date(year, month, index + 1, 12),
    })),
  ];
}

function getMoodLabel(value) {
  return MOODS.find((mood) => mood.value === value)?.label || 'Okay';
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getErrorMessage(error, fallback) {
  return error.response?.data?.error || error.message || fallback;
}

function getInitialHabitState() {
  try {
    return { habits: dataService.getDashboardHabits(), error: '' };
  } catch {
    return { habits: [], error: 'Habit completion records could not be loaded.' };
  }
}

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [habitState] = useState(getInitialHabitState);
  const habits = habitState.habits;
  const [dateFilter, setDateFilter] = useState('');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const habitError = habitState.error;

  useEffect(() => {
    let active = true;
    dataService.getJournalEntries()
      .then((savedEntries) => {
        if (active) setEntries(savedEntries);
      })
      .catch((loadError) => {
        if (active) {
          setLoadFailed(true);
          setError(getErrorMessage(loadError, 'Journal entries could not be loaded.'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const retryLoadEntries = async () => {
    setLoading(true);
    setLoadFailed(false);
    setError('');
    try {
      setEntries(await dataService.getJournalEntries());
    } catch (loadError) {
      setLoadFailed(true);
      setError(getErrorMessage(loadError, 'Journal entries could not be loaded.'));
    } finally {
      setLoading(false);
    }
  };

  const visibleEntries = useMemo(() => (
    entries
      .filter((entry) => !dateFilter || getEntryDateKey(entry) === dateFilter)
      .sort((first, second) => (
        getEntryDate(second) - getEntryDate(first)
        || new Date(second.createdAt || second.date) - new Date(first.createdAt || first.date)
      ))
  ), [entries, dateFilter]);
  const calendarDays = useMemo(() => getMonthDays(currentMonth), [currentMonth]);
  const entriesByDate = useMemo(
    () => new Set(entries.map(getEntryDateKey)),
    [entries],
  );
  const habitDates = useMemo(() => new Set(
    habits.flatMap((habit) => (habit.completionDates || []).map((date) => (
      /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getEntryDateKey(date)
    ))),
  ), [habits]);
  const completedHabitsOnDate = dateFilter
    ? habits.filter((habit) => (habit.completionDates || []).some((date) => (
      (/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getEntryDateKey(date)) === dateFilter
    )))
    : [];
  const entriesOnDate = dateFilter
    ? entries.filter((entry) => getEntryDateKey(entry) === dateFilter)
    : [];

  const openCreateForm = () => {
    setForm({ ...EMPTY_FORM, date: dateFilter || getLocalDateKey(new Date()) });
    setEditingId(null);
    setError('');
    setIsFormOpen(true);
  };

  const openEditForm = (entry) => {
    setForm({
      date: getEntryDateKey(entry) || getLocalDateKey(new Date()),
      mood: MOODS.some((mood) => mood.value === entry.mood) ? entry.mood : 'seedling',
      energyLevel: Number(entry.energyLevel) || 3,
      notes: entry.notes || entry.littleWin || '',
      selfCare: Object.fromEntries(
        SELF_CARE.map(({ key }) => [key, Boolean(entry.selfCare?.[key])]),
      ),
    });
    setEditingId(entry._id);
    setError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const changeMonth = (offset) => {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  const selectDate = (date) => {
    const key = getLocalDateKey(date);
    setDateFilter(key);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleSelfCare = (key) => {
    setForm((current) => ({
      ...current,
      selfCare: { ...current.selfCare, [key]: !current.selfCare[key] },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const entry = {
      date: new Date(`${form.date}T12:00:00.000Z`).toISOString(),
      dateKey: form.date,
      mood: form.mood,
      energyLevel: Number(form.energyLevel),
      notes: form.notes.trim(),
      selfCare: Object.fromEntries(SELF_CARE.map(({ key }) => [key, Boolean(form.selfCare[key])])),
    };

    try {
      const saved = editingId
        ? await dataService.updateJournalEntry(editingId, entry)
        : await dataService.createJournalEntry(entry);
      setEntries((current) => (
        editingId
          ? current.map((item) => (item._id === editingId ? saved : item))
          : [saved, ...current]
      ));
      closeForm();
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'This journal entry could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete your journal entry from ${formatDate(getEntryDate(entry))}? This cannot be undone.`)) return;
    setError('');
    try {
      await dataService.deleteJournalEntry(entry._id);
      setEntries((current) => current.filter((item) => item._id !== entry._id));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'This journal entry could not be deleted.'));
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-bloom-dark sm:text-3xl">Wellness Journal</h1>
          <p className="mt-1 text-sm text-bloom-muted">A quick note on how you’re doing.</p>
        </div>
        <Button variant="primary" onClick={openCreateForm} icon={Plus}>
          New entry
        </Button>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-peach-200 bg-peach-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}
      {habitError && (
        <p role="alert" className="rounded-xl border border-peach-200 bg-peach-50 px-4 py-3 text-sm text-rose-800">
          Habit completion records are unavailable.
        </p>
      )}

      {isFormOpen && (
        <Card padding="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold font-display text-bloom-dark">
                {editingId ? 'Edit entry' : 'How are you today?'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close entry form"
                className="grid h-9 w-9 place-items-center rounded-xl text-bloom-muted transition hover:bg-cream-200/60 hover:text-bloom-dark"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="journal-date" className="mb-2 block text-sm font-semibold text-bloom-dark">Date</label>
                <input
                  id="journal-date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(event) => updateField('date', event.target.value)}
                  className="w-full rounded-xl border border-bloom-border bg-white px-3.5 py-3 text-sm text-bloom-dark"
                />
              </div>

              <fieldset>
                <legend className="mb-2 block text-sm font-semibold text-bloom-dark">Mood</legend>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      aria-pressed={form.mood === mood.value}
                      onClick={() => updateField('mood', mood.value)}
                      className={`min-h-10 rounded-xl border px-3 text-sm font-medium transition ${
                        form.mood === mood.value
                          ? 'border-sage-500 bg-sage-100 text-sage-900'
                          : 'border-bloom-border bg-white text-bloom-muted hover:border-sage-300'
                      }`}
                    >
                      {mood.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <fieldset>
              <legend className="mb-2 block text-sm font-semibold text-bloom-dark">Energy: {form.energyLevel} of 5</legend>
              <div className="flex gap-2" role="group" aria-label="Energy rating">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    aria-label={`Energy ${rating} of 5`}
                    aria-pressed={form.energyLevel === rating}
                    onClick={() => updateField('energyLevel', rating)}
                    className={`grid h-10 w-10 place-items-center rounded-xl border text-sm font-semibold transition ${
                      form.energyLevel === rating
                        ? 'border-sage-600 bg-sage-700 text-white'
                        : 'border-bloom-border bg-white text-bloom-muted hover:border-sage-300'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="journal-reflection" className="mb-2 block text-sm font-semibold text-bloom-dark">
                Reflection <span className="font-normal text-bloom-muted">(optional)</span>
              </label>
              <textarea
                id="journal-reflection"
                rows="2"
                maxLength="500"
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                placeholder="Anything you’d like to remember?"
                className="w-full resize-y rounded-xl border border-bloom-border bg-white px-3.5 py-3 text-sm text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300"
              />
              <p className="mt-1 text-right text-xs text-bloom-muted">{form.notes.length}/500</p>
            </div>

            <fieldset>
              <legend className="mb-2 block text-sm font-semibold text-bloom-dark">
                Self-care <span className="font-normal text-bloom-muted">(optional)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {SELF_CARE.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={Boolean(form.selfCare[key])}
                    onClick={() => toggleSelfCare(key)}
                    className={`min-h-9 rounded-xl border px-3 text-sm transition ${
                      form.selfCare[key]
                        ? 'border-sage-400 bg-sage-100 text-sage-900'
                        : 'border-bloom-border bg-white text-bloom-muted hover:border-sage-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="flex justify-end gap-2 border-t border-bloom-border/70 pt-4">
              <Button variant="outline" onClick={closeForm} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving} icon={Save}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Save entry'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card padding="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-display text-bloom-dark">Browse by date</h2>
            <p className="mt-0.5 text-xs text-bloom-muted">Select a date to view journal entries and habit completions.</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-bloom-muted">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Filter entries by date</span>
            <input
              type="date"
              aria-label="Filter entries by date"
              value={dateFilter}
              onChange={(event) => {
                if (!event.target.value) {
                  setDateFilter('');
                  return;
                }
                const [year, month, day] = event.target.value.split('-').map(Number);
                selectDate(new Date(year, month - 1, day, 12));
              }}
              className="rounded-xl border border-bloom-border bg-white px-3 py-2 text-sm text-bloom-dark"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="grid h-9 w-9 place-items-center rounded-xl border border-bloom-border bg-white text-bloom-muted hover:bg-cream-100"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <h3 className="text-sm font-semibold text-bloom-dark">
            {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h3>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="grid h-9 w-9 place-items-center rounded-xl border border-bloom-border bg-white text-bloom-muted hover:bg-cream-100"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-bloom-muted sm:gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => <span key={weekday}>{weekday}</span>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map(({ key, day, date }) => {
            if (!day) return <span key={key} aria-hidden="true" className="min-h-10 sm:min-h-12" />;
            const dateKey = getLocalDateKey(date);
            const hasEntry = entriesByDate.has(dateKey);
            const hasCompletion = habitDates.has(dateKey);
            const isToday = dateKey === getLocalDateKey(new Date());
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectDate(date)}
                aria-pressed={dateFilter === dateKey}
                aria-label={`${date.toLocaleDateString(undefined, { dateStyle: 'full' })}${hasEntry ? ', journal entry saved' : ''}${hasCompletion ? ', habit completion recorded' : ''}`}
                className={`relative flex min-h-10 flex-col items-center justify-center rounded-xl border text-sm transition sm:min-h-12 ${
                  dateFilter === dateKey
                    ? 'border-sage-500 bg-sage-100 font-semibold text-sage-900'
                    : isToday
                      ? 'border-sage-300 bg-sage-50 text-sage-900'
                      : 'border-transparent text-bloom-dark hover:border-bloom-border hover:bg-cream-100'
                }`}
              >
                {day}
                {(hasEntry || hasCompletion) && (
                  <span className="mt-0.5 flex gap-0.5" aria-hidden="true">
                    {hasEntry && <span className="h-1 w-1 rounded-full bg-peach-500" />}
                    {hasCompletion && <span className="h-1 w-1 rounded-full bg-sage-700" />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-bloom-muted">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-peach-500" />Journal entry</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sage-700" />Habit completion</span>
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="ml-auto font-medium text-sage-800 hover:underline"
            >
              Clear date
            </button>
          )}
        </div>
      </Card>

      {dateFilter && (
        <Card padding="p-4 sm:p-5">
          <h2 className="text-sm font-bold text-bloom-dark">{formatDate(`${dateFilter}T12:00:00`)}</h2>
          {habitError && <p role="alert" className="mt-2 text-sm text-rose-700">{habitError}</p>}
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold text-bloom-muted">Habit completions</h3>
              {habitError ? (
                <p className="mt-2 text-sm text-rose-800">Habit completion records could not be loaded.</p>
              ) : completedHabitsOnDate.length ? (
                <ul className="mt-2 space-y-1.5">
                  {completedHabitsOnDate.map((habit) => (
                    <li key={habit.id} className="flex items-center gap-2 text-sm text-bloom-dark">
                      <span className="h-2 w-2 rounded-full bg-sage-700" aria-hidden="true" />
                      {habit.title}{habit.archived ? ' (archived)' : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-bloom-muted">No habit completions recorded for this date.</p>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-bloom-muted">Journal entries</h3>
              <p className="mt-2 text-sm text-bloom-muted">
                {loadFailed
                  ? 'Journal entries are unavailable until they load successfully.'
                  : entriesOnDate.length
                  ? `${entriesOnDate.length} saved ${entriesOnDate.length === 1 ? 'entry' : 'entries'} shown below.`
                  : 'No journal entries saved for this date.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold font-display text-bloom-dark">
          {dateFilter ? 'Entries for selected date' : 'Your entries'}
        </h2>
        {dateFilter && (
          <button type="button" onClick={() => setDateFilter('')} className="text-sm font-medium text-sage-800 hover:underline">
            Show all entries
          </button>
        )}
      </div>

      {loading ? (
        <Card padding="p-8" className="text-center text-sm text-bloom-muted">Loading your entries…</Card>
      ) : loadFailed ? (
        <Card padding="p-8" className="text-center">
          <p className="text-sm text-bloom-muted">Your journal cannot be shown until your saved entries load.</p>
          <Button variant="outline" size="sm" onClick={retryLoadEntries} className="mt-3">Try again</Button>
        </Card>
      ) : visibleEntries.length > 0 ? (
        <ol className="space-y-3">
          {visibleEntries.map((entry) => {
            const activities = SELF_CARE.filter(({ key }) => entry.selfCare?.[key]);
            return (
              <li key={entry._id}>
                <Card padding="p-4 sm:p-5">
                  <article>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-bloom-dark">{formatDate(getEntryDate(entry))}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                          <span className="rounded-lg bg-sage-100 px-2.5 py-1 font-medium text-sage-900">
                            {getMoodLabel(entry.mood)}
                          </span>
                          <span className="text-bloom-muted">Energy {entry.energyLevel ?? 3}/5</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(entry)}
                          aria-label={`Edit entry from ${formatDate(getEntryDate(entry))}`}
                          className="grid h-9 w-9 place-items-center rounded-xl text-bloom-muted transition hover:bg-cream-200/60 hover:text-bloom-dark"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry)}
                          aria-label={`Delete entry from ${formatDate(getEntryDate(entry))}`}
                          className="grid h-9 w-9 place-items-center rounded-xl text-bloom-muted transition hover:bg-peach-100/60 hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {(entry.notes || entry.littleWin) && (
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-bloom-muted">
                        {entry.notes || entry.littleWin}
                      </p>
                    )}
                    {activities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activities.map(({ key, label }) => (
                          <span key={key} className="inline-flex items-center gap-1.5 rounded-lg bg-cream-100 px-2.5 py-1 text-xs text-bloom-muted">
                            <Heart className="h-3 w-3 text-sage-700" aria-hidden="true" />
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                </Card>
              </li>
            );
          })}
        </ol>
      ) : (
        <Card padding="p-8 sm:p-12" className="text-center">
          <Heart className="mx-auto mb-3 h-7 w-7 text-sage-600" aria-hidden="true" />
          <h3 className="text-base font-bold text-bloom-dark">
            {dateFilter ? 'No entries for this date' : 'Your journal is ready'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-bloom-muted">
            {dateFilter
              ? 'Choose another date or clear the filter to see your entries.'
              : 'Save a quick mood and energy check-in whenever you like.'}
          </p>
          {!dateFilter && !isFormOpen && (
            <Button variant="primary" size="sm" onClick={openCreateForm} icon={Plus} className="mt-4">
              New entry
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
