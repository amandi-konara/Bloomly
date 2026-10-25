import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, HeartPulse, RefreshCw, Sprout } from 'lucide-react';
import Card from '../components/Card';
import DailyCheckInModal from '../components/DailyCheckInModal';
import { dataService, isHabitScheduledOnDate } from '../services/dataService';

function getGreeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getInitialHabitState() {
  try {
    return { items: dataService.getDashboardHabits(), error: '' };
  } catch {
    return { items: [], error: 'Saved habits could not be loaded. Please refresh and try again.' };
  }
}

export default function Dashboard() {
  const [habitState, setHabitState] = useState(getInitialHabitState);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState('');
  const [savingHabitId, setSavingHabitId] = useState(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const loadHabits = useCallback(() => {
    try {
      setHabitState({ items: dataService.getDashboardHabits(), error: '' });
    } catch {
      setHabitState({
        items: [],
        error: 'Saved habits could not be loaded. Please refresh and try again.',
      });
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      setLogs(await dataService.getDashboardLogs());
      setLogsError('');
    } catch {
      setLogsError('Check-in history is unavailable right now.');
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadInitialLogs = async () => {
      try {
        const fetchedLogs = await dataService.getDashboardLogs();
        if (active) {
          setLogs(fetchedLogs);
          setLogsError('');
        }
      } catch {
        if (active) setLogsError('Check-in history is unavailable right now.');
      } finally {
        if (active) setLogsLoading(false);
      }
    };
    loadInitialLogs();

    const handleUpdate = () => {
      loadHabits();
      loadLogs();
    };
    window.addEventListener('bloomly_data_updated', handleUpdate);
    return () => {
      active = false;
      window.removeEventListener('bloomly_data_updated', handleUpdate);
    };
  }, [loadHabits, loadLogs]);

  const habits = habitState.items;
  const habitsError = habitState.error;
  const today = new Date();
  const todayFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const todayKey = dataService.getHabitDateKey(today);
  const name = user.name?.trim() || 'there';
  const scheduledHabits = habits.filter((habit) => isHabitScheduledOnDate(habit, today));
  const completedCount = scheduledHabits.filter((habit) => habit.completedToday).length;
  const todayLog = logs
    .filter((log) => (log.dateKey || dataService.getHabitDateKey(new Date(log.date))) === todayKey)
    .sort((first, second) => new Date(second.createdAt || second.date) - new Date(first.createdAt || first.date))[0];
  const handleToggleHabit = (id) => {
    setSavingHabitId(id);
    try {
      setHabitState({
        items: dataService.toggleHabit(id),
        error: '',
      });
    } catch {
      setHabitState((current) => ({
        ...current,
        error: 'This habit could not be updated. Please try again.',
      }));
    } finally {
      setSavingHabitId(null);
    }
  };

  const handleCheckInSaved = (savedLog) => {
    if (savedLog) {
      setLogs((current) => [
        savedLog,
        ...current.filter((log) => (
          (log.dateKey || dataService.getHabitDateKey(new Date(log.date)))
          !== (savedLog.dateKey || dataService.getHabitDateKey(new Date(savedLog.date)))
        )),
      ]);
      setLogsError('');
      setLogsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-bloom-muted">{todayFormatted}</p>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display text-bloom-dark">
          {getGreeting(today.getHours())}, {name}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] gap-5 items-start">
        <Card padding="p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 pb-4 border-b border-bloom-border/70">
            <div>
              <h2 className="text-lg font-bold font-display text-bloom-dark">Today's habits</h2>
              <p className="mt-1 text-sm text-bloom-muted">
                {scheduledHabits.length
                  ? `${completedCount} of ${scheduledHabits.length} completed`
                  : 'Your daily checklist'}
              </p>
            </div>
            <Link
              to="/habits"
              className="text-sm font-semibold text-sage-800 hover:text-sage-900 transition"
            >
              Manage habits
            </Link>
          </div>

          {habitsError && (
            <p role="alert" className="mt-4 rounded-xl bg-peach-50 px-3 py-2 text-sm text-rose-800">
              {habitsError}
            </p>
          )}

          {habitsError ? (
            <p className="py-6 text-sm text-bloom-muted">Your habit checklist is unavailable until the saved data can be loaded.</p>
          ) : scheduledHabits.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <Sprout className="mb-3 h-8 w-8 text-sage-600" aria-hidden="true" />
              <h3 className="text-base font-semibold text-bloom-dark">No habits scheduled today</h3>
              <p className="mt-1 max-w-sm text-sm text-bloom-muted">
                Add a routine to your habits list and it will appear here.
              </p>
              <Link
                to="/habits"
                className="mt-4 inline-flex items-center rounded-xl bg-sage-100 px-4 py-2 text-sm font-semibold text-sage-900 transition hover:bg-sage-200"
              >
                Go to habits
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-bloom-border/70">
              {scheduledHabits.map((habit) => {
                const completed = Boolean(habit.completedToday);
                return (
                  <li key={habit.id}>
                    <button
                      type="button"
                      onClick={() => handleToggleHabit(habit.id)}
                      disabled={savingHabitId === habit.id}
                      aria-pressed={completed}
                      aria-label={`${completed ? 'Undo completion of' : 'Mark'} ${habit.title}`}
                      className="group flex w-full items-center gap-3 py-4 text-left transition disabled:cursor-wait disabled:opacity-60"
                    >
                      <span
                        className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg border transition ${
                          completed
                            ? 'border-sage-600 bg-sage-700 text-white'
                            : 'border-bloom-border bg-cream-50 text-transparent group-hover:border-sage-400'
                        }`}
                      >
                        <Check className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-semibold ${completed ? 'text-bloom-muted line-through' : 'text-bloom-dark'}`}>
                          {habit.title}
                        </span>
                        {(habit.target || habit.category) && (
                          <span className="mt-0.5 block text-xs text-bloom-muted">
                            {[habit.category, habit.target].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </span>
                      <span className="text-xs font-medium text-bloom-muted opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                        {completed ? 'Undo' : 'Complete'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div>
          <Card padding="p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-peach-100 text-rose-700">
                <HeartPulse className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-bloom-dark">Mood & energy</h2>
                <p className="mt-1 text-xs text-bloom-muted">
                  {logsLoading
                    ? 'Loading today’s check-in…'
                    : logsError
                      ? logsError
                      : todayLog
                    ? `Today's check-in is saved: ${todayLog.mood}, energy ${todayLog.energyLevel}/5.`
                    : 'Take a quick moment to check in with yourself.'}
                </p>
                {logsError && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-bloom-muted">
                    <span>{logsError}</span>
                    <button
                      type="button"
                      onClick={loadLogs}
                      aria-label="Retry loading check-in history"
                      className="rounded-lg p-1.5 text-sage-800 hover:bg-cream-100"
                    >
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsCheckInOpen(true)}
                  className="mt-3 inline-flex min-h-9 items-center rounded-xl bg-sage-100 px-3 py-2 text-xs font-semibold text-sage-900 transition hover:bg-sage-200"
                >
                  {todayLog ? 'Update check-in' : 'Check in'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSaved={handleCheckInSaved}
      />
    </div>
  );
}
