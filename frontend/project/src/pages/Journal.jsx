import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Clock, Heart, Search } from '../components/Icons';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import MoodBadge, { MOOD_CONFIG } from '../components/MoodBadge';
import DailyCheckInModal from '../components/DailyCheckInModal';
import { dataService } from '../services/dataService';
import journalCharacter from '../assets/journal-character.png';

export default function Journal() {
  const [logs, setLogs] = useState(() => {
    const cached = localStorage.getItem('bloomly_logs');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      { _id: '1', date: new Date(Date.now() - 5 * 86400000).toISOString(), mood: 'sunny', energyLevel: 5, studyHours: 5, littleWin: 'Walked through campus park with Maya between labs 🌿', selfCare: { meal: true, stretch: true, screenBreak: true, friend: true }, notes: 'Great energy! Hit my study goal without feeling exhausted.' },
      { _id: '2', date: new Date(Date.now() - 4 * 86400000).toISOString(), mood: 'seedling', energyLevel: 3, studyHours: 3.5, littleWin: 'Watered all my windowsill plants and took a quiet pause 🪴', selfCare: { meal: true, stretch: false, screenBreak: true, friend: false }, notes: 'A bit sleepy in the afternoon, gave myself permission to take a 20-min power nap.' },
      { _id: '3', date: new Date(Date.now() - 3 * 86400000).toISOString(), mood: 'wilting', energyLevel: 2, studyHours: 2.0, littleWin: 'Baked cinnamon oats and rested when my body asked for it 🥣', selfCare: { meal: true, stretch: true, screenBreak: false, friend: true }, notes: 'Exams approaching, felt a little overwhelmed but stretching really helped.' },
      { _id: '4', date: new Date(Date.now() - 2 * 86400000).toISOString(), mood: 'seedling', energyLevel: 3, studyHours: 4.0, littleWin: 'Solved a tough algorithm question on first try! ✨', selfCare: { meal: true, stretch: true, screenBreak: true, friend: false }, notes: 'Regained confidence today. Momentum is building slowly and gently.' },
      { _id: '5', date: new Date(Date.now() - 1 * 86400000).toISOString(), mood: 'blooming', energyLevel: 4, studyHours: 4.5, littleWin: 'Cooked dinner with my roommate and laughed till our cheeks hurt 🍲', selfCare: { meal: true, stretch: true, screenBreak: true, friend: true }, notes: 'Connection is such medicine. Feeling deeply grateful tonight.' },
    ];
  });
  const [search, setSearch] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const fetched = await dataService.getLogs();
    setLogs(fetched);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.littleWin || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.notes || '').toLowerCase().includes(search.toLowerCase());
    const matchesMood = selectedMood === 'all' || log.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Hero with Cozy 3D Journal Character */}
      <div className="relative overflow-hidden bg-gradient-to-r from-peach-100 via-cream-200 to-sage-100 rounded-4xl border border-bloom-border p-6 md:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-lg space-y-2.5">
            <Badge variant="peach" size="xs">
              Mindful Reflections
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold font-display text-bloom-dark">
              Wellness Journal & Little Blooms 📖
            </h1>
            <p className="text-sm text-bloom-muted leading-relaxed">
              A private, gentle sanctuary to record small moments of gratitude, study progress, and emotional check-ins.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCheckInOpen(true)}
                icon={Sparkles}
              >
                Write Today's Reflection
              </Button>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-center flex-shrink-0">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden bg-cream-100/90 border border-bloom-border/60 shadow-soft flex items-center justify-center p-1.5 hover:scale-105 transition-transform duration-300">
              <img
                src={journalCharacter}
                alt="Cozy Journaling Companion"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search reflections & blooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-bloom-border bg-white text-xs text-bloom-dark focus:outline-none focus:ring-2 focus:ring-sage-300"
          />
          <Search className="w-4 h-4 text-bloom-muted absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedMood('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedMood === 'all'
                ? 'bg-sage-700 text-white'
                : 'bg-white border border-bloom-border text-bloom-muted hover:bg-cream-100'
            }`}
          >
            All Vibes
          </button>
          {Object.keys(MOOD_CONFIG).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
                selectedMood === m
                  ? 'bg-sage-700 text-white'
                  : 'bg-white border border-bloom-border text-bloom-muted hover:bg-cream-100'
              }`}
            >
              <span>{MOOD_CONFIG[m].emoji}</span>
              <span className="capitalize">{m}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Journal Entries Timeline */}
      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const logDate = new Date(log.date);
          const dateStr = logDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          });

          return (
            <Card key={log._id} hover padding="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-bloom-border/60">
                <div className="flex items-center gap-3">
                  <MoodBadge mood={log.mood} />
                  <span className="text-xs font-bold text-bloom-dark">{dateStr}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-bloom-muted">
                  <span className="bg-sage-100 text-sage-800 px-2.5 py-0.5 rounded-full font-medium">
                    Energy {log.energyLevel}/5
                  </span>
                  <span className="bg-peach-100 text-rose-900 px-2.5 py-0.5 rounded-full font-medium">
                    Study {log.studyHours}h
                  </span>
                </div>
              </div>

              {/* Little Bloom */}
              {log.littleWin && (
                <div className="mb-3.5 p-3.5 rounded-2xl bg-cream-50 border border-bloom-border/70 flex items-start gap-3">
                  <span className="text-base flex-shrink-0">🌼</span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sage-800 block">
                      Today's Little Bloom
                    </span>
                    <p className="text-sm font-medium text-bloom-dark mt-0.5">{log.littleWin}</p>
                  </div>
                </div>
              )}

              {/* Personal Notes */}
              {log.notes && (
                <p className="text-sm text-bloom-muted leading-relaxed pl-1 whitespace-pre-line mb-3">
                  "{log.notes}"
                </p>
              )}

              {/* Self-care tags */}
              {log.selfCare && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <span className="text-[11px] font-semibold text-bloom-muted mr-1">Self-care:</span>
                  {Object.entries(log.selfCare)
                    .filter(([, v]) => v)
                    .map(([k]) => (
                      <span
                        key={k}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-mint-50 border border-mint-200 text-sage-900 capitalize"
                      >
                        ✓ {k === 'screenBreak' ? 'screen curfew' : k}
                      </span>
                    ))}
                </div>
              )}
            </Card>
          );
        })}

        {filteredLogs.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-3xl mb-2">🌸</p>
            <h3 className="text-base font-bold text-bloom-dark">No entries matching your filter</h3>
            <p className="text-xs text-bloom-muted mb-4">Start your daily wellness reflection today</p>
            <Button variant="primary" size="sm" onClick={() => setIsCheckInOpen(true)}>
              Write Check-in
            </Button>
          </Card>
        )}
      </div>

      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSaved={loadLogs}
      />
    </div>
  );
}
