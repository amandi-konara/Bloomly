import React, { useState, useEffect } from 'react';
import { Plus, Check, Flame, Sparkles, Trash2, Droplet, Sun, Moon, Activity, Book } from '../components/Icons';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import AddHabitModal from '../components/AddHabitModal';
import { dataService } from '../services/dataService';
import celebrationCharacter from '../assets/celebration-character.png';

const CATEGORIES = ['All', 'Mindfulness', 'Hydration', 'Movement', 'Rest', 'Nutrition', 'Focus'];

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    setHabits(dataService.getHabits());
  }, []);

  const handleToggle = (id) => {
    const updated = dataService.toggleHabit(id);
    setHabits([...updated]);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const updated = dataService.deleteHabit(id);
    setHabits([...updated]);
  };

  const filtered = activeCategory === 'All'
    ? habits
    : habits.filter((h) => h.category.toLowerCase().includes(activeCategory.toLowerCase()));

  const completedToday = habits.filter((h) => h.completedToday).length;
  const allCompleted = habits.length > 0 && completedToday === habits.length;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display text-bloom-dark">
            My Daily Habits 🌱
          </h1>
          <p className="text-sm text-bloom-muted">
            Gentle routines that keep your mind clear and your body nourished
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddOpen(true)}
          icon={Plus}
        >
          Add New Habit
        </Button>
      </div>

      {/* Milestone / Celebration Alert when all done */}
      {allCompleted && (
        <div className="flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-r from-butter-100 to-mint-100 border border-butter-200 shadow-soft">
          <img
            src={celebrationCharacter}
            alt="Celebrating"
            className="w-16 h-16 object-contain flex-shrink-0"
          />
          <div>
            <h3 className="text-sm font-bold text-bloom-dark flex items-center gap-1.5">
              <span>Amazing work! All daily habits completed!</span>
              <Sparkles className="w-4 h-4 text-amber-600" />
            </h3>
            <p className="text-xs text-bloom-muted">
              You gave your mind and body the care they needed today. Relax and celebrate this moment.
            </p>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-sage-700 text-white shadow-soft'
                : 'bg-white/80 border border-bloom-border text-bloom-muted hover:text-bloom-dark hover:bg-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((habit) => {
          const isDone = habit.completedToday;
          return (
            <Card
              key={habit.id}
              hover
              padding="p-5"
              className={`flex flex-col justify-between cursor-pointer border-2 transition-all ${
                isDone ? 'bg-sage-50/70 border-sage-300' : 'bg-white border-bloom-border'
              }`}
              onClick={() => handleToggle(habit.id)}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-sage-400 text-white shadow-sm'
                          : 'bg-cream-100 border border-bloom-border text-transparent'
                      }`}
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${isDone ? 'line-through text-bloom-muted' : 'text-bloom-dark'}`}>
                        {habit.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="sage" size="xs">
                          {habit.category}
                        </Badge>
                        <span className="text-[11px] text-bloom-muted">• {habit.target}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(habit.id, e)}
                    title="Delete habit"
                    className="p-1.5 rounded-xl text-bloom-muted hover:text-rose-500 hover:bg-peach-100/60 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom: Streak & 7-day mini tracker */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-bloom-border/60">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-butter-100 px-2.5 py-1 rounded-full border border-butter-200">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>{habit.streak} day streak</span>
                </div>

                {/* 7-day dots */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-bloom-muted mr-1">7d</span>
                  {(habit.history || [true, true, true, false, true, true, true]).slice(-7).map((d, i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${
                        d ? 'bg-sage-400' : 'bg-cream-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-3xl mb-2">🌱</p>
          <h3 className="text-base font-bold text-bloom-dark">No habits in this category yet</h3>
          <p className="text-xs text-bloom-muted mb-4">Plant your first habit to begin nurturing your routine</p>
          <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
            Plant a Habit
          </Button>
        </Card>
      )}

      <AddHabitModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={(updated) => setHabits(updated)}
      />
    </div>
  );
}
