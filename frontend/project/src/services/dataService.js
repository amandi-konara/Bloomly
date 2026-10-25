import api from '../api';

const STORAGE_KEYS = {
  HABITS: 'bloomly_habits',
  GOALS: 'bloomly_goals',
};

const LEGACY_FREQUENCIES = ['Daily', 'Weekdays', '3 days/week', 'Weekends', 'Every night'];
const HABIT_FREQUENCIES = LEGACY_FREQUENCIES;
const HABIT_CATEGORIES = ['Mindfulness', 'Hydration', 'Movement', 'Rest', 'Nutrition', 'Focus', 'Other'];

function toHabitDateKey(date) {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    const value = new Date(0);
    value.setFullYear(year, month - 1, day);
    value.setHours(12, 0, 0, 0);
    if (value.getFullYear() !== year || value.getMonth() !== month - 1 || value.getDate() !== day) {
      throw new Error('A valid completion date is required.');
    }
    return date;
  }
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) {
    throw new Error('A valid completion date is required.');
  }
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeCompletionDate(value) {
  if (typeof value !== 'string') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    try {
      return toHabitDateKey(value);
    } catch {
      return null;
    }
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : toHabitDateKey(date);
}

function getAccountStorageKey(key) {
  let user;
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    throw new Error('Account details are unavailable. Please sign in again.');
  }
  const identifier = user.id || user._id || user.email?.trim().toLowerCase();
  if (!identifier) throw new Error('Account details are unavailable. Please sign in again.');
  return `${key}:${encodeURIComponent(String(identifier))}`;
}

function syncLocalAccountIdentity(account) {
  let current;
  try {
    current = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    throw new Error('Saved account details could not be read.');
  }
  const accountIdentifier = account.id || account._id || account.email?.trim().toLowerCase();
  if (!accountIdentifier) throw new Error('The account response did not include an account identifier.');

  const accountEmail = account.email?.trim().toLowerCase();
  const currentEmail = current.email?.trim().toLowerCase();
  if (!current.id && !current._id && accountEmail && currentEmail === accountEmail) {
    const oldIdentifier = currentEmail;
    for (const key of [STORAGE_KEYS.HABITS, STORAGE_KEYS.GOALS]) {
      const oldKey = `${key}:${encodeURIComponent(oldIdentifier)}`;
      const newKey = `${key}:${encodeURIComponent(String(accountIdentifier))}`;
      const oldValue = localStorage.getItem(oldKey);
      if (oldValue !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldValue);
      }
    }
  }

  localStorage.setItem('user', JSON.stringify({
    ...current,
    id: accountIdentifier,
    name: account.name || current.name,
    email: account.email || current.email,
  }));
  window.dispatchEvent(new Event('bloomly_account_updated'));
}

function getHabitFrequency(habit) {
  return habit.frequency || (LEGACY_FREQUENCIES.includes(habit.target) ? habit.target : 'Daily');
}

export function isHabitScheduledOnDate(habit, date) {
  const frequency = getHabitFrequency(habit).toLowerCase();
  const day = date instanceof Date ? date : new Date(`${date}T12:00:00`);
  if (frequency.includes('weekend')) return day.getDay() === 0 || day.getDay() === 6;
  if (frequency.includes('weekday') || frequency.includes('5 days')) return day.getDay() > 0 && day.getDay() < 6;
  return true;
}

function getRecentHabitDates(date = new Date(), count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(date);
    day.setHours(12, 0, 0, 0);
    day.setDate(day.getDate() - (count - index - 1));
    return toHabitDateKey(day);
  });
}

function normalizeHabit(habit) {
  const todayKey = toHabitDateKey(new Date());
  const legacyHistory = Array.isArray(habit.history) ? habit.history : [];
  const legacyDates = legacyHistory.flatMap((completed, index) => {
    if (!completed) return [];
    const day = new Date();
    day.setDate(day.getDate() - (legacyHistory.length - index - 1));
    return [toHabitDateKey(day)];
  });
  const hasDatedCompletions = Array.isArray(habit.completionDates);
  const completionDates = hasDatedCompletions
    ? habit.completionDates.map(normalizeCompletionDate).filter(Boolean)
    : legacyDates;
  if (!hasDatedCompletions && habit.completedToday && !completionDates.includes(todayKey)) {
    completionDates.push(todayKey);
  }

  return {
    ...habit,
    id: habit.id || `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category: habit.category || 'Other',
    target: habit.target || 'Daily',
    frequency: habit.frequency || (LEGACY_FREQUENCIES.includes(habit.target) ? habit.target : 'Daily'),
    reminder: habit.reminder || '',
    archived: Boolean(habit.archived),
    completionDates: [...new Set(completionDates)],
    completedToday: completionDates.includes(todayKey),
  };
}

export const dataService = {
  async getAccountSettings() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async saveAccountSettings(settings) {
    const res = await api.put('/auth/me', settings);
    return res.data;
  },

  syncLocalAccountIdentity(account) {
    syncLocalAccountIdentity(account);
  },

  // --- Logs ---
  async getLogs() {
    const res = await api.get('/logs');
    if (!Array.isArray(res.data)) throw new Error('The logs response was not a list.');
    return res.data;
  },

  async getDashboardLogs() {
    const res = await api.get('/logs');
    if (!Array.isArray(res.data)) {
      throw new Error('The logs response was not a list.');
    }
    return res.data;
  },

  async getJournalEntries() {
    const res = await api.get('/logs');
    if (!Array.isArray(res.data)) {
      throw new Error('The journal response was not a list.');
    }
    return res.data;
  },

  async createJournalEntry(entry) {
    const res = await api.post('/logs', entry);
    return res.data;
  },

  async updateJournalEntry(id, entry) {
    const res = await api.put(`/logs/${encodeURIComponent(id)}`, entry);
    return res.data;
  },

  async deleteJournalEntry(id) {
    const res = await api.delete(`/logs/${encodeURIComponent(id)}`);
    return res.data;
  },

  async addLog(logData) {
    const dateKey = logData.dateKey || this.getHabitDateKey(new Date());
    const date = logData.date || new Date(`${dateKey}T12:00:00.000Z`).toISOString();
    const res = await api.post('/logs', { ...logData, date, dateKey });
    return res.data;
  },

  // --- Habits ---
  getHabits() {
    const key = getAccountStorageKey(STORAGE_KEYS.HABITS);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const habits = JSON.parse(raw);
        if (!Array.isArray(habits)) throw new Error('Saved habits are not a list.');
        const normalized = habits.map(normalizeHabit);
        localStorage.setItem(key, JSON.stringify(normalized));
        return normalized;
      } catch (error) {
        console.warn('Saved habits could not be read:', error.message);
        throw error;
      }
    }
    return [];
  },

  getDashboardHabits() {
    return this.getHabits();
  },

  saveHabits(habits) {
    localStorage.setItem(getAccountStorageKey(STORAGE_KEYS.HABITS), JSON.stringify(habits));
  },

  getHabitDateKey(date = new Date()) {
    return toHabitDateKey(date);
  },

  getHabitHistory(habit, date = new Date(), count = 7) {
    const completionDates = new Set((habit.completionDates || []).map(normalizeCompletionDate).filter(Boolean));
    return getRecentHabitDates(date, count).map((day) => ({
      date: day,
      completed: completionDates.has(day),
    }));
  },

  toggleHabit(id, date = new Date()) {
    const dateKey = toHabitDateKey(date);
    const habits = this.getHabits();
    const targetHabit = habits.find((habit) => habit.id === id);
    if (!targetHabit) throw new Error('Habit not found.');
    if (targetHabit.archived) throw new Error('Archived habits cannot be completed.');
    const updated = habits.map((h) => {
      if (h.id === id) {
        const completions = new Set(h.completionDates || []);
        if (completions.has(dateKey)) completions.delete(dateKey);
        else completions.add(dateKey);
        const completionDates = [...completions].sort();
        const todayKey = toHabitDateKey(new Date());
        let streak = 0;
        const firstOffset = completions.has(todayKey) ? 0 : 1;
        for (let offset = firstOffset; offset < firstOffset + 366; offset += 1) {
          const day = new Date();
          day.setDate(day.getDate() - offset);
          if (!completions.has(toHabitDateKey(day))) break;
          streak += 1;
        }
        return {
          ...h,
          completedToday: completions.has(todayKey),
          streak,
          completionDates,
          history: getRecentHabitDates().map((day) => completions.has(day)),
        };
      }
      return h;
    });
    this.saveHabits(updated);
    return updated;
  },

  addHabit(habit) {
    const habits = this.getHabits();
    const title = typeof habit.title === 'string' ? habit.title.trim() : '';
    if (!title || title.length > 100) throw new Error('Habit name must be between 1 and 100 characters.');
    if (!HABIT_FREQUENCIES.includes(habit.frequency)) {
      throw new Error('Choose a valid habit frequency.');
    }
    if (!HABIT_CATEGORIES.includes(habit.category)) throw new Error('Choose a valid habit category.');
    if (typeof habit.reminder !== 'string' || (habit.reminder && !/^([01]\d|2[0-3]):[0-5]\d$/.test(habit.reminder))) {
      throw new Error('Choose a valid reminder time.');
    }
    const newHabit = normalizeHabit({
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      streak: 0,
      completedToday: false,
      completionDates: [],
      archived: false,
      color: 'sage',
      ...habit,
      title,
      target: habit.frequency,
    });
    const updated = [newHabit, ...habits];
    this.saveHabits(updated);
    return updated;
  },

  updateHabit(id, changes) {
    const habits = this.getHabits();
    const existing = habits.find((habit) => habit.id === id);
    if (!existing) throw new Error('Habit not found.');
    const title = typeof changes.title === 'string' ? changes.title.trim() : existing.title;
    if (!title || title.length > 100) throw new Error('Habit name must be between 1 and 100 characters.');
    if (changes.frequency !== undefined && !HABIT_FREQUENCIES.includes(changes.frequency)) {
      throw new Error('Choose a valid habit frequency.');
    }
    if (changes.category !== undefined && !HABIT_CATEGORIES.includes(changes.category)) {
      throw new Error('Choose a valid habit category.');
    }
    if (changes.reminder !== undefined
      && (typeof changes.reminder !== 'string' || (changes.reminder && !/^([01]\d|2[0-3]):[0-5]\d$/.test(changes.reminder)))) {
      throw new Error('Choose a valid reminder time.');
    }
    const updated = habits.map((habit) => (
      habit.id === id
        ? normalizeHabit({
          ...habit,
          ...changes,
          title,
          target: changes.frequency !== undefined && changes.frequency !== habit.frequency
            ? changes.frequency
            : habit.target,
          completionDates: habit.completionDates,
          id: habit.id,
        })
        : habit
    ));
    this.saveHabits(updated);
    return updated;
  },

  archiveHabit(id) {
    return this.updateHabit(id, { archived: true });
  },

  restoreHabit(id) {
    return this.updateHabit(id, { archived: false });
  },

  deleteHabit(id) {
    const habits = this.getHabits().filter((h) => h.id !== id);
    this.saveHabits(habits);
    return habits;
  },

  // --- Goals ---
  getGoals() {
    const raw = localStorage.getItem(getAccountStorageKey(STORAGE_KEYS.GOALS));
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        throw new Error('Saved goals could not be read.');
      }
    }
    return [];
  },

  getProgressGoals() {
    const goals = this.getGoals();
    if (!Array.isArray(goals)) throw new Error('Saved goals are not a list.');
    return goals;
  },

  saveGoals(goals) {
    localStorage.setItem(getAccountStorageKey(STORAGE_KEYS.GOALS), JSON.stringify(goals));
  },

  addProgressGoal(goal) {
    const title = typeof goal.title === 'string' ? goal.title.trim() : '';
    if (!title || title.length > 100) throw new Error('Goal name must be between 1 and 100 characters.');
    if (goal.description && goal.description.length > 240) throw new Error('Goal details must be 240 characters or fewer.');
    if (goal.unit && goal.unit.length > 30) throw new Error('Goal unit must be 30 characters or fewer.');
    if (goal.target !== null && goal.target !== undefined && (!Number.isFinite(goal.target) || goal.target <= 0)) {
      throw new Error('Goal target must be greater than zero.');
    }
    const updated = [...this.getProgressGoals(), {
      id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      ...goal,
      title,
    }];
    this.saveGoals(updated);
    return updated;
  },

  deleteProgressGoal(id) {
    const updated = this.getProgressGoals().filter((goal) => goal.id !== id);
    this.saveGoals(updated);
    return updated;
  },

  addGoal(goal) {
    const goals = this.getGoals();
    const newGoal = {
      id: 'g-' + Date.now(),
      current: 0,
      progress: 0,
      status: 'in-progress',
      ...goal,
    };
    const updated = [newGoal, ...goals];
    this.saveGoals(updated);
    return updated;
  },

  updateGoalProgress(id, increment) {
    const goals = this.getGoals();
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextVal = Math.min(g.target, Math.max(0, g.current + increment));
        const progress = Math.round((nextVal / g.target) * 100);
        return {
          ...g,
          current: nextVal,
          progress,
          status: progress >= 100 ? 'completed' : 'in-progress',
        };
      }
      return g;
    });
    this.saveGoals(updated);
    return updated;
  },

};
