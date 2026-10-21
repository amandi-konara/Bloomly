import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Flame,
  Sparkles,
  Plus,
  Check,
  RefreshCw,
  Clock,
  BookOpen,
  Droplet,
  Moon,
  Activity,
  Heart,
} from '../components/Icons';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import MoodBadge, { MOOD_CONFIG } from '../components/MoodBadge';
import DailyCheckInModal from '../components/DailyCheckInModal';
import AddHabitModal from '../components/AddHabitModal';
import { dataService } from '../services/dataService';
import welcomeCharacter from '../assets/welcome-character.png';

export default function Dashboard() {
  const [habits, setHabits] = useState(() => dataService.getHabits());
  const [logs, setLogs] = useState(() => {
    const cached = localStorage.getItem('bloomly_logs');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      { _id: '1', date: new Date(Date.now() - 6 * 86400000).toISOString(), mood: 'blooming', energyLevel: 4, studyHours: 4.5, littleWin: 'Finished lecture notes early & enjoyed matcha tea 🍵' },
      { _id: '2', date: new Date(Date.now() - 5 * 86400000).toISOString(), mood: 'sunny', energyLevel: 5, studyHours: 5, littleWin: 'Walked in the park between labs 🌿' },
      { _id: '3', date: new Date(Date.now() - 4 * 86400000).toISOString(), mood: 'seedling', energyLevel: 3, studyHours: 3.5, littleWin: 'Watered windowsill plants and rested 🪴' },
      { _id: '4', date: new Date(Date.now() - 3 * 86400000).toISOString(), mood: 'wilting', energyLevel: 2, studyHours: 2.0, littleWin: 'Baked cinnamon oats and took a gentle break 🥣' },
      { _id: '5', date: new Date(Date.now() - 2 * 86400000).toISOString(), mood: 'seedling', energyLevel: 3, studyHours: 4.0, littleWin: 'Solved a tough algorithm question! ✨' },
      { _id: '6', date: new Date(Date.now() - 1 * 86400000).toISOString(), mood: 'blooming', energyLevel: 4, studyHours: 4.5, littleWin: 'Cooked dinner with my roommate and laughed 🍲' },
      { _id: '7', date: new Date().toISOString(), mood: 'blooming', energyLevel: 4, studyHours: 3.5, littleWin: 'Practiced morning mindfulness & hydrated well 💧' },
    ];
  });
  const [tips, setTips] = useState(
    "🌸 Your garden is thriving! You've stayed consistent with your daily stretches and hydration even during busy study weeks.\n🌱 Notice how your energy peaks on days when you connect with friends — keep protecting those small pauses.\n✨ Give yourself permission to rest this evening; gentle consistency will always outgrow burnout."
  );
  const [loadingTips, setLoadingTips] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [todayMood, setTodayMood] = useState('blooming');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Amandi"}');

  const loadAllData = async () => {
    const fetchedLogs = await dataService.getLogs();
    setLogs(fetchedLogs);
    setHabits(dataService.getHabits());

    if (fetchedLogs.length > 0) {
      setTodayMood(fetchedLogs[0].mood || 'blooming');
    }
  };

  useEffect(() => {
    loadAllData();
    fetchTips();

    const handleUpdate = () => loadAllData();
    window.addEventListener('bloomly_data_updated', handleUpdate);
    return () => window.removeEventListener('bloomly_data_updated', handleUpdate);
  }, []);

  const fetchTips = async () => {
    setLoadingTips(true);
    const result = await dataService.getAiTips();
    setTips(result);
    setLoadingTips(false);
  };

  const handleToggleHabit = (id) => {
    const updated = dataService.toggleHabit(id);
    setHabits([...updated]);
  };

  const handleQuickMoodChange = async (newMood) => {
    setTodayMood(newMood);
    await dataService.addLog({
      mood: newMood,
      energyLevel: 4,
      studyHours: logs[0]?.studyHours || 3,
      littleWin: logs[0]?.littleWin || 'Took a mindful moment to tune into my feelings 🌸',
      selfCare: logs[0]?.selfCare || { meal: true, stretch: true },
    });
    loadAllData();
  };

  // Streak Calculation
  const streak = (() => {
    let count = 0;
    let cursor = new Date();
    const logDates = new Set(logs.map((l) => new Date(l.date).toDateString()));
    while (logDates.has(cursor.toDateString())) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count > 0 ? count : 6;
  })();

  const completedCount = habits.filter((h) => h.completedToday).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // Chart data (past 7 logs)
  const chartData = [...logs]
    .slice(0, 7)
    .reverse()
    .map((l) => ({
      date: new Date(l.date).toLocaleDateString('en-US', { weekday: 'short' }),
      energy: l.energyLevel || 3,
      study: l.studyHours || 2,
    }));

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-7 animate-fade-in">
      {/* 1. Welcome Header Banner with 3D Clay Character */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cream-200 via-mint-100 to-sage-100 rounded-4xl border border-bloom-border/80 p-6 md:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-bloom-border text-xs font-semibold text-sage-800">
              <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse"></span>
              {todayDateString}
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold font-display text-bloom-dark tracking-tight">
              {getGreeting()}, {user.name || 'Student'}! 🌸
            </h1>
            <p className="text-sm md:text-base text-bloom-muted leading-relaxed">
              Your garden is growing gently today. You've completed{' '}
              <span className="font-bold text-sage-800">{completedCount} of {habits.length} habits</span> ({progressPercent}%). Remember to pause and drink water!
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCheckInOpen(true)}
                icon={Sparkles}
              >
                Today's Check-in
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/habits')}
              >
                View All Habits
              </Button>
            </div>
          </div>

          {/* 3D Clay Companion Character */}
          <div className="hidden sm:flex items-center justify-center flex-shrink-0 self-center md:self-auto">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden bg-cream-100/90 border border-bloom-border/60 shadow-soft flex items-center justify-center p-1.5 hover:scale-105 transition-transform duration-300">
              <img
                src={welcomeCharacter}
                alt="Bloomly 3D Companion"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Overview (4 Metric Pill Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <Card padding="p-4 sm:p-5" hover className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-butter-200 border border-butter-300 flex items-center justify-center text-butter-700 flex-shrink-0">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold font-display text-bloom-dark truncate">{streak} Days</p>
            <p className="text-[11px] sm:text-xs text-bloom-muted font-medium truncate">Consistent Streak</p>
          </div>
        </Card>

        {/* Today's Vibe */}
        <Card padding="p-4 sm:p-5" hover className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-peach-100 border border-peach-200 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
            {MOOD_CONFIG[todayMood]?.emoji || '🌸'}
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-bold font-display text-bloom-dark capitalize truncate">
              {todayMood}
            </p>
            <p className="text-[11px] sm:text-xs text-bloom-muted font-medium truncate">Today's Vibe</p>
          </div>
        </Card>

        {/* Habits Progress */}
        <Card padding="p-4 sm:p-5" hover className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center text-sage-700 flex-shrink-0">
            <Check className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold font-display text-bloom-dark truncate">
              {completedCount}/{habits.length}
            </p>
            <p className="text-[11px] sm:text-xs text-bloom-muted font-medium truncate">Habits Checked</p>
          </div>
        </Card>

        {/* Study & Focus */}
        <Card padding="p-4 sm:p-5" hover className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sage-100 border border-sage-200 flex items-center justify-center text-sage-800 flex-shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold font-display text-bloom-dark truncate">
              {logs[0]?.studyHours || 4.5} hrs
            </p>
            <p className="text-[11px] sm:text-xs text-bloom-muted font-medium truncate">Mindful Study</p>
          </div>
        </Card>
      </div>

      {/* 3. Main Dashboard Grid (2 Columns: Left 7 cols, Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Habits & Weekly Trends (7 cols) */}
        <div className="lg:col-span-7 space-y-7">
          {/* Daily Habit Checklist */}
          <Card padding="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold font-display text-bloom-dark flex items-center gap-2">
                  <span>Daily Habits</span>
                  <Badge variant="mint" size="xs">
                    {progressPercent}% Complete
                  </Badge>
                </h2>
                <p className="text-xs text-bloom-muted">Small mindful routines make steady growth</p>
              </div>
              <button
                onClick={() => setIsAddHabitOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-100 hover:bg-sage-200 text-sage-900 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Habit</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden mb-5">
              <div
                className="bg-sage-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Habit Items */}
            <div className="space-y-2.5">
              {habits.slice(0, 5).map((habit) => {
                const isDone = habit.completedToday;
                return (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isDone
                        ? 'bg-sage-50/80 border-sage-200 text-bloom-dark'
                        : 'bg-white border-bloom-border hover:border-sage-200'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-sage-400 text-white shadow-sm'
                            : 'bg-cream-100 border border-bloom-border text-transparent hover:border-sage-300'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isDone ? 'line-through text-bloom-muted' : 'text-bloom-dark'}`}>
                          {habit.title}
                        </p>
                        <p className="text-[11px] text-bloom-muted flex items-center gap-2">
                          <span>{habit.category}</span>
                          <span>•</span>
                          <span>{habit.target}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-butter-100 px-2 py-0.5 rounded-full border border-butter-200">
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span>{habit.streak}d</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-bloom-border/60 text-center">
              <button
                onClick={() => navigate('/habits')}
                className="text-xs font-semibold text-sage-800 hover:text-sage-900 transition"
              >
                Manage all habits & view history →
              </button>
            </div>
          </Card>

          {/* Weekly Consistency & Energy Chart */}
          <Card padding="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold font-display text-bloom-dark">Weekly Balance Trend</h2>
                <p className="text-xs text-bloom-muted">Energy levels & focused study rhythm</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-bloom-dark font-medium">
                  <span className="w-3 h-3 rounded-full bg-sage-400"></span> Energy (1-5)
                </span>
                <span className="flex items-center gap-1.5 text-bloom-dark font-medium">
                  <span className="w-3 h-3 rounded-full bg-peach-300"></span> Study (hrs)
                </span>
              </div>
            </div>

            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A8BE9B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#A8BE9B" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="peachGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C4AD" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F5C4AD" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: '#78857D', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#78857D', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #EFE8DC',
                      boxShadow: '0 8px 24px rgba(49, 90, 72, 0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    name="Energy Level"
                    stroke="#8EAA80"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sageGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="study"
                    name="Study Hours"
                    stroke="#E8A598"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#peachGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column: Mood check-in, AI encouragement, Little blooms (5 cols) */}
        <div className="lg:col-span-5 space-y-7">
          {/* Quick Mood Tune-in */}
          <Card padding="p-6">
            <h2 className="text-base font-bold font-display text-bloom-dark mb-1">
              Quick Mood Check-in
            </h2>
            <p className="text-xs text-bloom-muted mb-3.5">How are you feeling at this moment?</p>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(MOOD_CONFIG).map(([key, config]) => {
                const isSelected = todayMood === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleQuickMoodChange(key)}
                    title={config.label}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-sage-100 border-sage-300 ring-2 ring-sage-300 scale-105 shadow-soft'
                        : 'bg-cream-50 border-bloom-border hover:bg-white hover:border-sage-200'
                    }`}
                  >
                    <span className="text-2xl">{config.emoji}</span>
                    <span className="text-[10px] font-medium text-bloom-dark mt-1 capitalize">{key}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* AI Weekly Encouragement & Tips */}
          <Card padding="p-6" className="bg-gradient-to-br from-white to-cream-100 border-sage-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-peach-100 flex items-center justify-center text-sm">
                  🌷
                </span>
                <h2 className="text-base font-bold font-display text-bloom-dark">Bloomly's Gentle Note</h2>
              </div>
              <button
                onClick={fetchTips}
                disabled={loadingTips}
                title="Refresh tips"
                className="p-1.5 rounded-xl text-bloom-muted hover:text-sage-800 hover:bg-white transition"
              >
                <RefreshCw className={`w-4 h-4 ${loadingTips ? 'animate-spin text-sage-600' : ''}`} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-bloom-border/70 text-xs md:text-sm text-bloom-dark leading-relaxed whitespace-pre-line space-y-2">
              {tips || "Loading your personalized gentle guidance..."}
            </div>
            <p className="text-[10px] text-bloom-muted mt-2 text-right">Updated from your last 7 days of logs</p>
          </Card>

          {/* Memory Lane / Recent Little Blooms */}
          <Card padding="p-6">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-butter-100 flex items-center justify-center text-sm">
                  ✨
                </span>
                <h2 className="text-base font-bold font-display text-bloom-dark">Recent Little Blooms</h2>
              </div>
              <button
                onClick={() => navigate('/journal')}
                className="text-xs font-semibold text-sage-800 hover:underline"
              >
                Journal →
              </button>
            </div>

            <div className="space-y-2.5">
              {logs
                .filter((l) => l.littleWin)
                .slice(0, 3)
                .map((log) => (
                  <div
                    key={log._id}
                    className="p-3 rounded-2xl bg-cream-50 border border-bloom-border/70 text-xs text-bloom-dark flex items-start gap-2.5"
                  >
                    <span className="text-sm flex-shrink-0 mt-0.5">🌼</span>
                    <div className="min-w-0">
                      <p className="font-medium text-bloom-dark leading-snug">{log.littleWin}</p>
                      <p className="text-[10px] text-bloom-muted mt-1">
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSaved={loadAllData}
      />
      <AddHabitModal
        isOpen={isAddHabitOpen}
        onClose={() => setIsAddHabitOpen(false)}
        onAdded={(newHabits) => setHabits(newHabits)}
      />
    </div>
  );
}
