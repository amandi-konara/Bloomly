import api from '../api';

const STORAGE_KEYS = {
  LOGS: 'bloomly_logs',
  HABITS: 'bloomly_habits',
  GOALS: 'bloomly_goals',
  SETTINGS: 'bloomly_settings',
};

const LEGACY_FREQUENCIES = ['Daily', 'Weekdays', '3 days/week', 'Weekends', 'Every night'];

// Seed sample past 7 days of logs if none exist so the charts & habits look alive immediately
const INITIAL_LOGS = [
  {
    _id: 'seed-6',
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    mood: 'blooming',
    energyLevel: 4,
    studyHours: 4.5,
    littleWin: 'Finished my lecture notes early & enjoyed matcha tea in the garden 🍵',
    selfCare: { meal: true, stretch: true, screenBreak: true, friend: false },
    notes: 'Feeling light and focused today. Really loved the morning sunshine.',
  },
  {
    _id: 'seed-5',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    mood: 'sunny',
    energyLevel: 5,
    studyHours: 5,
    littleWin: 'Walked through campus park with Maya between labs 🌿',
    selfCare: { meal: true, stretch: true, screenBreak: true, friend: true },
    notes: 'Great energy! Hit my study goal without feeling exhausted.',
  },
  {
    _id: 'seed-4',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    mood: 'seedling',
    energyLevel: 3,
    studyHours: 3.5,
    littleWin: 'Watered all my windowsill plants and took a quiet pause 🪴',
    selfCare: { meal: true, stretch: false, screenBreak: true, friend: false },
    notes: 'A bit sleepy in the afternoon, gave myself permission to take a 20-min power nap.',
  },
  {
    _id: 'seed-3',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    mood: 'wilting',
    energyLevel: 2,
    studyHours: 2.0,
    littleWin: 'Baked cinnamon oats and rested when my body asked for it 🥣',
    selfCare: { meal: true, stretch: true, screenBreak: false, friend: true },
    notes: 'Exams approaching, felt a little overwhelmed but stretching really helped.',
  },
  {
    _id: 'seed-2',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    mood: 'seedling',
    energyLevel: 3,
    studyHours: 4.0,
    littleWin: 'Solved a tough algorithm question on first try! ✨',
    selfCare: { meal: true, stretch: true, screenBreak: true, friend: false },
    notes: 'Regained confidence today. Momentum is building slowly and gently.',
  },
  {
    _id: 'seed-1',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    mood: 'blooming',
    energyLevel: 4,
    studyHours: 4.5,
    littleWin: 'Cooked dinner with my roommate and laughed till our cheeks hurt 🍲',
    selfCare: { meal: true, stretch: true, screenBreak: true, friend: true },
    notes: 'Connection is such medicine. Feeling deeply grateful tonight.',
  },
];

const INITIAL_HABITS = [
  {
    id: 'h-1',
    title: 'Hydrate with lemon water',
    category: 'Hydration',
    target: '2.0 Liters',
    streak: 6,
    icon: 'droplet',
    color: 'mint',
    completedToday: true,
    history: [true, true, true, true, false, true, true],
  },
  {
    id: 'h-2',
    title: 'Morning gentle stretch',
    category: 'Movement',
    target: '15 mins',
    streak: 4,
    icon: 'activity',
    color: 'sage',
    completedToday: true,
    history: [false, true, true, true, true, true, true],
  },
  {
    id: 'h-3',
    title: 'Mindful study session',
    category: 'Focus',
    target: '3+ Hours',
    streak: 5,
    icon: 'book',
    color: 'butter',
    completedToday: false,
    history: [true, true, true, true, true, false, false],
  },
  {
    id: 'h-4',
    title: 'Screen curfew by 10:30 PM',
    category: 'Rest',
    target: 'Every night',
    streak: 3,
    icon: 'moon',
    color: 'peach',
    completedToday: false,
    history: [true, false, true, false, true, true, false],
  },
  {
    id: 'h-5',
    title: 'Nourishing home-cooked meal',
    category: 'Nutrition',
    target: 'Daily',
    streak: 7,
    icon: 'sparkles',
    color: 'sage',
    completedToday: true,
    history: [true, true, true, true, true, true, true],
  },
];

const INITIAL_GOALS = [
  {
    id: 'g-1',
    title: '7-Day Mindful Garden Streak',
    description: 'Log daily mood, self-care, and little wins for 7 consecutive days',
    category: 'Wellness Habit',
    current: 6,
    target: 7,
    unit: 'days',
    progress: 85,
    deadline: 'This Sunday',
    reward: 'Unlock "Blooming Lotus" clay badge',
    status: 'in-progress',
  },
  {
    id: 'g-2',
    title: 'Consistent 25 Study Hours',
    description: 'Balance focused study hours with restorative breaks',
    category: 'Academics',
    current: 21,
    target: 25,
    unit: 'hours',
    progress: 84,
    deadline: 'End of week',
    reward: 'Cozy study companion sticker',
    status: 'in-progress',
  },
  {
    id: 'g-3',
    title: 'Mindful Outdoor Walks',
    description: 'Take 5 walks in the fresh air without looking at mobile phone',
    category: 'Rest & Nature',
    current: 5,
    target: 5,
    unit: 'walks',
    progress: 100,
    deadline: 'Completed!',
    reward: 'Golden Sun clay trophy',
    status: 'completed',
  },
  {
    id: 'g-4',
    title: 'Sleep Routine Restoration',
    description: 'Reach 8 hours restful sleep for at least 5 nights this week',
    category: 'Recovery',
    current: 3,
    target: 5,
    unit: 'nights',
    progress: 60,
    deadline: 'Next Monday',
    reward: 'Starlight Dreamer badge',
    status: 'in-progress',
  },
];

const INITIAL_SETTINGS = {
  name: 'Amandi',
  email: 'amandi@university.edu',
  university: 'Faculty of Engineering',
  dailyReminder: '20:30',
  notifications: true,
  cozySounds: true,
  weeklyReport: true,
  accentTheme: 'sage',
};

function toHabitDateKey(date) {
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
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : toHabitDateKey(date);
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
  // --- Logs ---
  async getLogs() {
    try {
      const res = await api.get('/logs');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      console.warn('API getLogs fallback to local cache:', err.message);
    }
    const cached = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    return INITIAL_LOGS;
  },

  async getDashboardLogs() {
    const res = await api.get('/logs');
    if (!Array.isArray(res.data)) {
      throw new Error('The logs response was not a list.');
    }
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(res.data));
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
    let savedLog = null;
    try {
      const res = await api.post('/logs', logData);
      if (res.data) savedLog = res.data;
    } catch (err) {
      console.warn('API addLog fallback to local storage:', err.message);
    }
    if (!savedLog) {
      savedLog = {
        _id: 'local-' + Date.now(),
        date: new Date().toISOString(),
        ...logData,
      };
    }
    const current = await this.getLogs();
    const updated = [savedLog, ...current.filter((l) => {
      const lDate = new Date(l.date).toDateString();
      const sDate = new Date(savedLog.date).toDateString();
      return lDate !== sDate;
    })];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
    return savedLog;
  },

  // --- Habits ---
  getHabits() {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (raw) {
      try {
        const habits = JSON.parse(raw);
        if (!Array.isArray(habits)) throw new Error('Saved habits are not a list.');
        const normalized = habits.map(normalizeHabit);
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(normalized));
        return normalized;
      } catch (error) {
        console.warn('Saved habits could not be read:', error.message);
        throw error;
      }
    }
    const initialized = INITIAL_HABITS.map(normalizeHabit);
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(initialized));
    return initialized;
  },

  getDashboardHabits() {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) return [];

    const habits = JSON.parse(raw);
    if (!Array.isArray(habits)) {
      throw new Error('Saved habits are not a list.');
    }

    return habits
      .filter((habit) => !/^h-[1-5]$/.test(habit.id))
      .map(normalizeHabit);
  },

  saveHabits(habits) {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
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
    const newHabit = normalizeHabit({
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      streak: 0,
      completedToday: false,
      completionDates: [],
      archived: false,
      color: 'sage',
      target: habit.frequency || 'Daily',
      ...habit,
    });
    const updated = [newHabit, ...habits];
    this.saveHabits(updated);
    return updated;
  },

  updateHabit(id, changes) {
    const updated = this.getHabits().map((habit) => (
      habit.id === id
        ? normalizeHabit({ ...habit, ...changes, id: habit.id })
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
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
    return INITIAL_GOALS;
  },

  getProgressGoals() {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) return [];
    const goals = JSON.parse(raw);
    if (!Array.isArray(goals)) {
      throw new Error('Saved goals are not a list.');
    }
    return goals.filter((goal) => !/^g-[1-4]$/.test(goal.id));
  },

  saveGoals(goals) {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  addProgressGoal(goal) {
    const updated = [...this.getProgressGoals(), {
      id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      ...goal,
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

  // --- Settings ---
  getSettings() {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      try {
        return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
      } catch {
        // ignore
      }
    }
    return INITIAL_SETTINGS;
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // --- AI Tips with Warm Fallbacks ---
  async getAiTips() {
    try {
      const res = await api.get('/ai/tips');
      if (res.data?.tips) return res.data.tips;
    } catch (err) {
      console.warn('API getAiTips fallback:', err.message);
    }
    return `Your garden is thriving! You've stayed consistent with your daily stretches and hydration even during busy study weeks.
Notice how your energy peaks on days when you connect with friends — keep protecting those small social pauses.
Give yourself permission to rest this evening; gentle consistency will always outgrow burnout.`;
  },
};
