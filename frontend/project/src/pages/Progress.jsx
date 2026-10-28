import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { dataService, isHabitScheduledOnDate } from '../services/dataService';

const MOODS = {
  sunny: 'Calm',
  blooming: 'Good',
  seedling: 'Okay',
  wilting: 'Low',
  stormy: 'Stressed',
};

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRecentDates(today = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
}

function getSavedDateKey(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : getLocalDateKey(date);
}

function getExpectedCompletions(habit, dates) {
  const frequency = (habit.frequency || habit.target || 'Daily').toLowerCase();
  if (frequency.includes('3 days')) return 3;
  return dates.filter((date) => isHabitScheduledOnDate(habit, date)).length;
}

function getEntryDateKey(entry) {
  return getSavedDateKey(entry.dateKey || entry.date);
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function readProgressGoals() {
  try {
    return { goals: dataService.getProgressGoals(), error: '' };
  } catch {
    return { goals: [], error: 'Saved goals could not be loaded.' };
  }
}

function getInitialData() {
  try {
    return { habits: dataService.getDashboardHabits(), error: '' };
  } catch {
    return { habits: [], error: 'Saved habits could not be loaded.' };
  }
}

export default function Progress() {
  const [habitState, setHabitState] = useState(getInitialData);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState('');
  const [goalState, setGoalState] = useState(readProgressGoals);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalUnit, setGoalUnit] = useState('');

  const [weekDates] = useState(() => getRecentDates(new Date()));
  const weekDateKeys = useMemo(() => weekDates.map(getLocalDateKey), [weekDates]);

  const habits = habitState.habits;
  const habitError = habitState.error;

  useEffect(() => {
    let active = true;
    const loadLogs = async () => {
      try {
        const savedLogs = await dataService.getDashboardLogs();
        if (active) {
          setLogs(savedLogs);
          setLogsError('');
        }
      } catch {
        if (active) setLogsError('Journal trends are unavailable right now.');
      } finally {
        if (active) setLogsLoading(false);
      }
    };
    const handleDataUpdated = () => {
      try {
        setHabitState({ habits: dataService.getDashboardHabits(), error: '' });
      } catch {
        setHabitState({ habits: [], error: 'Saved habits could not be loaded.' });
      }
      setLogsLoading(true);
      loadLogs();
    };
    loadLogs();
    window.addEventListener('bloomly_data_updated', handleDataUpdated);
    return () => {
      active = false;
      window.removeEventListener('bloomly_data_updated', handleDataUpdated);
    };
  }, []);

  const retryLoadLogs = async () => {
    setLogsLoading(true);
    setLogsError('');
    try {
      setLogs(await dataService.getDashboardLogs());
    } catch {
      setLogsError('Journal trends are unavailable right now.');
    } finally {
      setLogsLoading(false);
    }
  };

  const habitSummaries = useMemo(() => habits
    .map((habit) => {
      const completedDates = new Set(
        (habit.completionDates || []).map(getSavedDateKey).filter(Boolean),
      );
      const weeklyExpected = habit.archived ? 0 : getExpectedCompletions(habit, weekDates);
      const scheduledDates = weekDates.filter((date) => isHabitScheduledOnDate(habit, date));
      const weeklyCompleted = habit.frequency?.toLowerCase().includes('3 days')
        ? Math.min(weeklyExpected, weekDateKeys.filter((date) => completedDates.has(date)).length)
        : scheduledDates.filter((date) => completedDates.has(getLocalDateKey(date))).length;
      const archivedCompletions = weekDateKeys.filter((date) => completedDates.has(date)).length;

      return {
        ...habit,
        completedDates,
        weeklyExpected,
        weeklyCompleted,
        archivedCompletions,
        history: weekDates.map((date) => ({
          date,
          completed: completedDates.has(getLocalDateKey(date)),
        })),
      };
    }), [habits, weekDates, weekDateKeys]);

  const weeklyTotals = habitSummaries.filter((habit) => !habit.archived).reduce((totals, habit) => ({
    completed: totals.completed + habit.weeklyCompleted,
    expected: totals.expected + habit.weeklyExpected,
  }), { completed: 0, expected: 0 });
  const completionRate = weeklyTotals.expected
    ? Math.round((weeklyTotals.completed / weeklyTotals.expected) * 100)
    : null;

  const dailyCompletions = useMemo(() => weekDates.map((date) => {
    const dateKey = getLocalDateKey(date);
    const count = habitSummaries.filter((habit) => habit.completedDates.has(dateKey)).length;
    return {
      dateKey,
      day: formatDate(date),
      dayLabel: date.toLocaleDateString(undefined, { weekday: 'short' }),
      completions: count,
    };
  }), [habitSummaries, weekDates]);
  const maxDailyCompletions = Math.max(1, habitSummaries.length);

  const journalByDay = useMemo(() => {
    const entriesByDate = new Map();
    logs
      .filter((entry) => weekDateKeys.includes(getEntryDateKey(entry)))
      .sort((first, second) => (
        new Date(first.date) - new Date(second.date)
        || new Date(first.createdAt || first.date) - new Date(second.createdAt || second.date)
      ))
      .forEach((entry) => entriesByDate.set(getEntryDateKey(entry), entry));

    return [...entriesByDate.entries()]
      .map(([dateKey, entry]) => ({
        dateKey,
        day: formatDate(new Date(`${dateKey}T12:00:00`)),
        mood: MOODS[entry.mood] || 'Okay',
        energy: Number(entry.energyLevel),
      }))
      .sort((first, second) => first.dateKey.localeCompare(second.dateKey));
  }, [logs, weekDateKeys]);
  const validJournalDays = journalByDay.filter((entry) => (
    entry.mood !== 'Not recorded' && Number.isInteger(entry.energy) && entry.energy >= 1 && entry.energy <= 5
  ));
  const showJournalTrends = validJournalDays.length >= 3;

  const handleCreateGoal = (event) => {
    event.preventDefault();
    try {
      const target = goalTarget.trim() ? Number(goalTarget) : null;
      if (goalTarget.trim() && (!Number.isFinite(target) || target <= 0)) {
        setGoalState((current) => ({ ...current, error: 'Enter a target greater than zero.' }));
        return;
      }
      const goals = dataService.addProgressGoal({
        title: goalTitle.trim(),
        description: goalDescription.trim(),
        target,
        unit: goalUnit.trim(),
      });
      setGoalState({ goals, error: '' });
      setGoalTitle('');
      setGoalDescription('');
      setGoalTarget('');
      setGoalUnit('');
      setShowGoalForm(false);
    } catch {
      setGoalState((current) => ({ ...current, error: 'This goal could not be saved.' }));
    }
  };

  const handleDeleteGoal = (goal) => {
    if (!window.confirm(`Remove the goal “${goal.title}”?`)) return;
    try {
      setGoalState({ goals: dataService.deleteProgressGoal(goal.id), error: '' });
    } catch {
      setGoalState((current) => ({ ...current, error: 'This goal could not be removed.' }));
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold font-display text-bloom-dark sm:text-3xl">Progress</h1>
        <p className="mt-1 text-sm text-bloom-muted">Your habits and check-ins from the last seven days.</p>
      </header>

      {habitError && (
        <p role="alert" className="rounded-xl border border-peach-200 bg-peach-50 px-4 py-3 text-sm text-rose-800">
          {habitError}
        </p>
      )}

      <section aria-labelledby="weekly-completion-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="weekly-completion-heading" className="text-lg font-bold font-display text-bloom-dark">Habit completion</h2>
            <p className="mt-1 text-sm text-bloom-muted">Today and the previous six days</p>
          </div>
          {completionRate !== null && (
            <p className="text-sm font-semibold text-sage-900">
              {completionRate}% <span className="font-normal text-bloom-muted">({weeklyTotals.completed} of {weeklyTotals.expected} scheduled completions)</span>
            </p>
          )}
        </div>

        {habitError ? (
          <Card padding="p-6">
            <p className="text-sm text-bloom-muted">Habit progress is unavailable until the saved data can be loaded.</p>
          </Card>
        ) : habitSummaries.length === 0 ? (
          <Card padding="p-6">
            <p className="text-sm text-bloom-muted">Add a habit and record completions to see your weekly progress.</p>
          </Card>
        ) : (
          <>
            <Card padding="p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-semibold text-bloom-dark">Completions by day</h3>
              <p className="mb-3 text-xs text-bloom-muted">
                The weekly rate uses active habits’ scheduled frequency. The chart includes all recorded completions, including archived habits.
              </p>
              <ol className="grid h-56 grid-cols-7 gap-2" aria-label="Seven-day habit completion chart">
                {dailyCompletions.map(({ dateKey, day, dayLabel, completions }) => (
                  <li
                    key={dateKey}
                    aria-label={`${day}: ${completions} habit completions`}
                    className="flex min-w-0 flex-col items-center justify-end gap-2 text-center"
                  >
                    <span className="text-xs font-semibold tabular-nums text-bloom-dark">{completions}</span>
                    <div className="flex h-36 w-full items-end overflow-hidden rounded-lg bg-cream-100">
                      <div
                        className="w-full rounded-t-md bg-sage-500 transition-all"
                        style={{ height: completions ? `${(completions / maxDailyCompletions) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-[10px] leading-tight text-bloom-muted">{dayLabel}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-bloom-dark">Individual habit history</h3>
              <ul className="space-y-2">
                {habitSummaries.map((habit) => (
                  <li key={habit.id}>
                    <Card padding="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-bloom-dark">{habit.title}</p>
                          <p className="mt-0.5 text-xs text-bloom-muted">
                            {habit.archived
                              ? `Archived · ${habit.archivedCompletions} completion${habit.archivedCompletions === 1 ? '' : 's'} this week`
                              : `${habit.weeklyCompleted} of ${habit.weeklyExpected} expected this week`}
                          </p>
                        </div>
                        <ol className="flex items-center gap-1.5" aria-label={`Seven-day history for ${habit.title}`}>
                          {habit.history.map(({ date, completed }) => (
                            <li key={getLocalDateKey(date)}>
                              <span
                                title={`${formatDate(date)}: ${completed ? 'Completed' : 'Not completed'}`}
                                aria-label={`${formatDate(date)}: ${completed ? 'Completed' : 'Not completed'}`}
                                className={`grid h-8 w-8 place-items-center rounded-lg text-[10px] font-medium ${
                                  completed ? 'bg-sage-100 text-sage-900' : 'bg-cream-100 text-bloom-muted'
                                }`}
                              >
                                {date.toLocaleDateString(undefined, { weekday: 'narrow' })}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="journal-trends-heading" className="space-y-3">
        <div>
          <h2 id="journal-trends-heading" className="text-lg font-bold font-display text-bloom-dark">Mood and energy</h2>
          <p className="mt-1 text-sm text-bloom-muted">Journal check-ins in the same seven-day period.</p>
        </div>
        {logsLoading ? (
          <Card padding="p-6"><p className="text-sm text-bloom-muted">Loading journal trends…</p></Card>
        ) : logsError ? (
          <Card padding="p-5">
            <p role="alert" className="text-sm text-rose-800">{logsError}</p>
            <Button variant="outline" size="sm" onClick={retryLoadLogs} className="mt-3">Try again</Button>
          </Card>
        ) : showJournalTrends ? (
          <Card padding="p-4 sm:p-5">
            <p className="mb-3 text-xs text-bloom-muted">
              One latest check-in per date. Mood is shown as recorded; no cause or correlation is inferred.
            </p>
            <ul className="space-y-2">
              {validJournalDays.map((entry) => (
                <li key={entry.dateKey} aria-label={`${entry.day}, mood ${entry.mood}, energy ${entry.energy} of 5`}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-xl bg-cream-100 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_8rem_7rem]">
                    <span className="text-xs font-medium text-bloom-dark">{entry.day}</span>
                    <span className="text-xs text-bloom-muted">{entry.mood}</span>
                    <span className="col-span-2 flex items-center gap-2 sm:col-span-1">
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                        <span className="block h-full rounded-full bg-sage-600" style={{ width: `${(entry.energy / 5) * 100}%` }} />
                      </span>
                      <span className="w-12 text-right text-xs tabular-nums text-bloom-muted">{entry.energy}/5 energy</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card padding="p-5">
            <p className="text-sm font-medium text-bloom-dark">
              {logsLoading ? 'Loading journal entries…' : 'More check-ins needed'}
            </p>
            {!logsLoading && (
              <p className="mt-1 text-sm text-bloom-muted">
                Mood and energy trends appear after check-ins on at least three different days in this week.
              </p>
            )}
          </Card>
        )}
      </section>

      <section aria-labelledby="goals-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="goals-heading" className="text-lg font-bold font-display text-bloom-dark">Goals</h2>
            <p className="mt-1 text-sm text-bloom-muted">Personal targets you’ve saved.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowGoalForm((visible) => !visible)} icon={Plus}>
            {showGoalForm ? 'Cancel' : 'Add goal'}
          </Button>
        </div>

        {goalState.error && (
          <p role="alert" className="rounded-xl border border-peach-200 bg-peach-50 px-4 py-3 text-sm text-rose-800">
            {goalState.error}
          </p>
        )}

        {showGoalForm && (
          <Card padding="p-4 sm:p-5">
            <form onSubmit={handleCreateGoal} className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-bloom-dark sm:col-span-2">
                Goal
                <input
                  required
                  maxLength={100}
                  value={goalTitle}
                  onChange={(event) => setGoalTitle(event.target.value)}
                  placeholder="e.g. Take regular walks"
                  className="mt-1.5 w-full rounded-xl border border-bloom-border bg-white px-3.5 py-2.5 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-bloom-dark sm:col-span-2">
                Details <span className="font-normal text-bloom-muted">(optional)</span>
                <input
                  maxLength={240}
                  value={goalDescription}
                  onChange={(event) => setGoalDescription(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-bloom-border bg-white px-3.5 py-2.5 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-bloom-dark">
                Target <span className="font-normal text-bloom-muted">(optional)</span>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={goalTarget}
                  onChange={(event) => setGoalTarget(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-bloom-border bg-white px-3.5 py-2.5 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-bloom-dark">
                Target unit <span className="font-normal text-bloom-muted">(optional)</span>
                <input
                  maxLength={30}
                  value={goalUnit}
                  onChange={(event) => setGoalUnit(event.target.value)}
                  placeholder="days, walks, books…"
                  className="mt-1.5 w-full rounded-xl border border-bloom-border bg-white px-3.5 py-2.5 text-sm"
                />
              </label>
              <div className="sm:col-span-2">
                <Button type="submit" variant="primary" size="sm">Save goal</Button>
              </div>
            </form>
          </Card>
        )}

        {goalState.error ? (
          <Card padding="p-5">
            <p className="text-sm text-bloom-muted">Personal goals are unavailable until the saved data can be loaded.</p>
          </Card>
        ) : goalState.goals.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {goalState.goals.map((goal) => (
              <li key={goal.id}>
                <Card padding="p-4" className="flex h-full items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-bloom-dark">{goal.title}</h3>
                    {goal.description && <p className="mt-1 text-xs text-bloom-muted">{goal.description}</p>}
                    {goal.target && (
                      <p className="mt-2 text-xs font-medium text-sage-900">
                        Target: {goal.target}{goal.unit ? ` ${goal.unit}` : ''}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal)}
                    aria-label={`Remove goal ${goal.title}`}
                    className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl text-bloom-muted transition hover:bg-peach-100/60 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card padding="p-5">
            <p className="text-sm text-bloom-muted">No personal goals saved yet. Add a goal to keep your own target visible here.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
