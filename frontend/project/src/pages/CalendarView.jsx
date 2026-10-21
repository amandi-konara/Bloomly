import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles, Clock, Check } from '../components/Icons';
import { Sprout } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import MoodBadge, { MOOD_CONFIG } from '../components/MoodBadge';
import DailyCheckInModal from '../components/DailyCheckInModal';
import { dataService } from '../services/dataService';

export default function CalendarView() {
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayLog, setSelectedDayLog] = useState(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const fetched = await dataService.getLogs();
    setLogs(fetched);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map logs to day of month
  const logsByDate = {};
  logs.forEach((log) => {
    const d = new Date(log.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      logsByDate[d.getDate()] = log;
    }
  });

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display text-bloom-dark">
            Wellness Calendar <CalendarIcon className="inline-block w-5 h-5 ml-1" aria-hidden="true" />
          </h1>
          <p className="text-sm text-bloom-muted">
            Visualize your monthly consistency and revisit past feelings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth} icon={ChevronLeft}>
            Prev
          </Button>
          <span className="font-bold text-sm text-bloom-dark px-3 py-1 bg-white rounded-xl border border-bloom-border">
            {monthName}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth} icon={ChevronRight}>
            Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Calendar Grid (8 cols) */}
        <Card padding="p-6" className="lg:col-span-8">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-bloom-muted mb-3">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-20 rounded-2xl bg-cream-50/40 border border-transparent" />;
              }

              const log = logsByDate[day];
              const isToday = isCurrentMonth && today.getDate() === day;
              const isSelected = selectedDayLog && new Date(selectedDayLog.date).getDate() === day;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => log ? setSelectedDayLog(log) : null}
                  className={`h-20 p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-sage-400 bg-white shadow-soft scale-102 border-sage-300'
                      : isToday
                      ? 'bg-sage-50/70 border-sage-300'
                      : 'bg-white border-bloom-border hover:border-sage-200 hover:bg-cream-50/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${isToday ? 'text-sage-800 underline' : 'text-bloom-dark'}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
                    )}
                  </div>

                  <div className="text-center">
                    {log ? (
                      <span className="flex items-center justify-center" title={log.mood}>
                        {MOOD_CONFIG[log.mood]?.icon && React.createElement(MOOD_CONFIG[log.mood].icon, { className: 'w-5 h-5' })}
                      </span>
                    ) : (
                      <span className="text-[10px] text-bloom-border">•</span>
                    )}
                  </div>

                  <div className="text-[10px] text-bloom-muted text-right font-medium">
                    {log ? `${log.studyHours}h` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Details Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card padding="p-6">
            <h2 className="text-base font-bold font-display text-bloom-dark mb-3">
              Daily Reflection Details
            </h2>

            {selectedDayLog ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-bloom-border">
                  <span className="text-xs font-bold text-bloom-dark">
                    {new Date(selectedDayLog.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <MoodBadge mood={selectedDayLog.mood} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-cream-50 border border-bloom-border text-center">
                    <span className="text-bloom-muted block text-[10px] uppercase font-bold">Energy</span>
                    <span className="text-base font-bold text-bloom-dark">{selectedDayLog.energyLevel} / 5</span>
                  </div>
                  <div className="p-3 rounded-xl bg-cream-50 border border-bloom-border text-center">
                    <span className="text-bloom-muted block text-[10px] uppercase font-bold">Study Focus</span>
                    <span className="text-base font-bold text-bloom-dark">{selectedDayLog.studyHours} hrs</span>
                  </div>
                </div>

                {selectedDayLog.littleWin && (
                  <div className="p-3 rounded-xl bg-peach-50 border border-peach-200 text-xs">
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">Little Bloom</span>
                    <p className="text-bloom-dark font-medium mt-0.5">{selectedDayLog.littleWin}</p>
                  </div>
                )}

                {selectedDayLog.notes && (
                  <div className="p-3 rounded-xl bg-cream-50 border border-bloom-border text-xs text-bloom-muted leading-relaxed">
                    "{selectedDayLog.notes}"
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="flex justify-center"><Sprout className="w-8 h-8 text-sage-400" /></div>
                <p className="text-xs text-bloom-muted">Click on any logged day in the calendar to review its memories and metrics.</p>
                <Button variant="secondary" size="sm" onClick={() => setIsCheckInOpen(true)}>
                  Log Today's Entry
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSaved={loadLogs}
      />
    </div>
  );
}
