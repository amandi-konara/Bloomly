import { useState } from 'react';
import { Archive, Bell, Check, Pencil, Plus, RotateCcw, Sprout, Trash2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import AddHabitModal from '../components/AddHabitModal';
import { dataService } from '../services/dataService';

const CATEGORIES = ['All', 'Mindfulness', 'Hydration', 'Movement', 'Rest', 'Nutrition', 'Focus', 'Other'];
const LEGACY_FREQUENCIES = ['Daily', 'Weekdays', '3 days/week', 'Weekends', 'Every night'];

function getInitialHabitState() {
  try {
    return { habits: dataService.getHabits(), error: '' };
  } catch {
    return { habits: [], error: 'Habits could not be loaded. Refresh the page to try again.' };
  }
}

function getCategoryFilter(habit) {
  if (habit.category === 'Rest & Sleep') return 'Rest';
  if (habit.category === 'Focus & Study') return 'Focus';
  return CATEGORIES.includes(habit.category) ? habit.category : 'Other';
}

function formatReminder(reminder) {
  if (!reminder) return null;
  const [hour, minute] = reminder.split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return reminder;
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function Habits() {
  const [habitState, setHabitState] = useState(getInitialHabitState);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const refreshHabits = (habits) => setHabitState({ habits, error: '' });
  const visibleHabits = habitState.habits.filter((habit) => (
    Boolean(habit.archived) === showArchived
    && (activeCategory === 'All' || getCategoryFilter(habit) === activeCategory)
  ));
  const archivedCount = habitState.habits.filter((habit) => habit.archived).length;
  const today = new Date();
  const todayKey = dataService.getHabitDateKey(today);

  const handleToggle = (id) => {
    try {
      refreshHabits(dataService.toggleHabit(id, today));
    } catch {
      setHabitState((current) => ({ ...current, error: 'Completion could not be saved. Please try again.' }));
    }
  };

  const handleArchive = (habit) => {
    try {
      refreshHabits(habit.archived
        ? dataService.restoreHabit(habit.id)
        : dataService.archiveHabit(habit.id));
    } catch {
      setHabitState((current) => ({ ...current, error: 'This habit could not be archived. Please try again.' }));
    }
  };

  const handleDelete = (habit) => {
    if (!window.confirm(`Delete "${habit.title}" and its completion history? This cannot be undone.`)) return;
    try {
      refreshHabits(dataService.deleteHabit(habit.id));
    } catch {
      setHabitState((current) => ({ ...current, error: 'This habit could not be deleted. Please try again.' }));
    }
  };

  const openCreateForm = () => {
    setEditingHabit(null);
    setIsFormOpen(true);
  };

  const openEditForm = (habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingHabit(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-bloom-dark sm:text-3xl">
            My Habits
          </h1>
          <p className="mt-1 text-sm text-bloom-muted">Keep your routines simple and steady.</p>
        </div>
        <Button variant="primary" onClick={openCreateForm} icon={Plus}>
          Add Habit
        </Button>
      </header>

      {habitState.error && (
        <p role="alert" className="rounded-xl border border-peach-200 bg-peach-50 px-4 py-3 text-sm text-rose-800">
          {habitState.error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter habits by category">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`min-h-9 whitespace-nowrap rounded-xl px-3.5 text-sm font-medium transition ${
                activeCategory === category
                  ? 'bg-sage-700 text-white'
                  : 'border border-bloom-border bg-white/80 text-bloom-muted hover:bg-cream-200/60 hover:text-bloom-dark'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex">
          <button
            type="button"
            onClick={() => setShowArchived((current) => !current)}
            aria-pressed={showArchived}
            className={`inline-flex min-h-9 items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition ${
              showArchived
                ? 'bg-sage-100 text-sage-900'
                : 'text-bloom-muted hover:bg-cream-200/60 hover:text-bloom-dark'
            }`}
          >
            <Archive className="h-4 w-4" aria-hidden="true" />
            <span>{showArchived ? 'Archived' : 'Archived habits'}</span>
            <span className="text-xs tabular-nums">{archivedCount}</span>
          </button>
        </div>
      </div>

      {habitState.error ? (
        <Card padding="p-8" className="text-center">
          <p className="text-sm text-bloom-muted">Your habits cannot be displayed until the saved data is available.</p>
        </Card>
      ) : visibleHabits.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {visibleHabits.map((habit) => {
            const completedToday = Boolean(habit.completionDates?.includes(todayKey) || habit.completedToday);
            const history = dataService.getHabitHistory(habit, today, 7);
            const reminder = formatReminder(habit.reminder);

            return (
              <li key={habit.id}>
                <Card padding="p-4 sm:p-5" className="h-full">
                  <div className="flex items-start gap-3">
                    {!habit.archived && (
                      <button
                        type="button"
                        onClick={() => handleToggle(habit.id)}
                        aria-pressed={completedToday}
                        aria-label={`${completedToday ? 'Undo completion of' : 'Complete'} ${habit.title} for today`}
                        className={`mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg border transition ${
                          completedToday
                            ? 'border-sage-600 bg-sage-700 text-white'
                            : 'border-bloom-border bg-white text-transparent hover:border-sage-400'
                        }`}
                      >
                        <Check className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                      </button>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h2 className={`text-base font-semibold ${completedToday ? 'text-bloom-muted' : 'text-bloom-dark'}`}>
                          {habit.title}
                        </h2>
                        <span className="rounded-lg bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-800">
                          {getCategoryFilter(habit)}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-bloom-muted">
                        <span>{habit.frequency || 'Daily'}</span>
                        {habit.target && !LEGACY_FREQUENCIES.includes(habit.target) && <span>{habit.target}</span>}
                        {reminder && (
                          <span className="inline-flex items-center gap-1">
                            <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                            {reminder}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(habit)}
                        title={`Edit ${habit.title}`}
                        aria-label={`Edit ${habit.title}`}
                        className="grid h-9 w-9 place-items-center rounded-xl text-bloom-muted transition hover:bg-cream-200/60 hover:text-bloom-dark"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchive(habit)}
                        title={habit.archived ? `Restore ${habit.title}` : `Archive ${habit.title}`}
                        aria-label={habit.archived ? `Restore ${habit.title}` : `Archive ${habit.title}`}
                        className="grid h-9 w-9 place-items-center rounded-xl text-bloom-muted transition hover:bg-cream-200/60 hover:text-bloom-dark"
                      >
                        {habit.archived
                          ? <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          : <Archive className="h-4 w-4" aria-hidden="true" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(habit)}
                        title={`Delete ${habit.title}`}
                        aria-label={`Delete ${habit.title}`}
                        className="grid h-9 w-9 place-items-center rounded-xl text-bloom-muted transition hover:bg-peach-100/60 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-bloom-border/70 pt-3">
                    <span className="text-xs font-medium text-bloom-muted">Last 7 days</span>
                    <ol className="flex items-center gap-1.5" aria-label={`Seven-day completion history for ${habit.title}`}>
                      {history.map(({ date, completed }) => {
                        const weekday = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
                        return (
                          <li key={date}>
                            <span
                              title={`${weekday}: ${completed ? 'Completed' : 'Not completed'}`}
                              aria-label={`${weekday}: ${completed ? 'Completed' : 'Not completed'}`}
                              className={`grid h-7 min-w-7 place-items-center rounded-lg px-1 text-[10px] font-medium ${
                                completed
                                  ? 'bg-sage-100 text-sage-800'
                                  : 'bg-cream-100 text-bloom-muted'
                              }`}
                            >
                              {weekday.slice(0, 1)}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                  {habit.archived && (
                    <p className="mt-2 text-xs text-bloom-muted">Archived · completion history is kept</p>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      ) : (
        <Card padding="p-8 sm:p-12" className="text-center">
          <Sprout className="mx-auto mb-3 h-8 w-8 text-sage-600" aria-hidden="true" />
          <h2 className="text-base font-bold text-bloom-dark">
            {showArchived ? 'No archived habits' : activeCategory === 'All' ? 'No habits yet' : `No ${activeCategory.toLowerCase()} habits`}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-bloom-muted">
            {showArchived
              ? 'Archived habits will appear here, with their history preserved.'
              : 'Create a habit to start building a routine that works for you.'}
          </p>
          {!showArchived && (
            <Button variant="primary" size="sm" onClick={openCreateForm} icon={Plus} className="mt-4">
              Add Habit
            </Button>
          )}
        </Card>
      )}

      {isFormOpen && (
        <AddHabitModal
          key={editingHabit?.id || 'new'}
          isOpen
          onClose={closeForm}
          onAdded={refreshHabits}
          habit={editingHabit}
        />
      )}
    </div>
  );
}
