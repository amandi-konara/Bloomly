import React, { useState, useEffect } from 'react';
import { Target, Trophy, Sparkles, Plus, Check, Flame } from '../components/Icons';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { dataService } from '../services/dataService';
import celebrationCharacter from '../assets/celebration-character.png';

export default function Goals() {
  const [goals, setGoals] = useState(() => dataService.getGoals());
  const [activeTab, setActiveTab] = useState('in-progress');
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTarget, setNewTarget] = useState(7);
  const [newUnit, setNewUnit] = useState('days');
  const [newCategory, setNewCategory] = useState('Wellness');

  useEffect(() => {
    setGoals(dataService.getGoals());
  }, []);

  const handleIncrement = (id, amount) => {
    const updated = dataService.updateGoalProgress(id, amount);
    setGoals([...updated]);
  };

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const goal = {
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      target: Number(newTarget),
      unit: newUnit,
      deadline: 'This month',
      reward: 'Personal wellness achievement',
    };

    const updated = dataService.addGoal(goal);
    setGoals([...updated]);
    setNewTitle('');
    setNewDesc('');
    setShowNewGoalModal(false);
  };

  const activeGoals = goals.filter((g) => g.status === 'in-progress');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header with Celebration Character */}
      <div className="relative overflow-hidden bg-gradient-to-r from-butter-100 via-cream-200 to-mint-100 rounded-4xl border border-bloom-border p-6 md:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-lg space-y-2.5">
            <Badge variant="butter" size="xs">
              Milestones & Growth
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold font-display text-bloom-dark">
              Goals & Gentle Milestones 🎯
            </h1>
            <p className="text-sm text-bloom-muted leading-relaxed">
              Celebrate your progress without harsh pressure. Every small step is a seed planted toward long-term balance.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowNewGoalModal(true)}
                icon={Plus}
              >
                Set a Gentle Goal
              </Button>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-center flex-shrink-0">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden bg-cream-100/90 border border-bloom-border/60 shadow-soft flex items-center justify-center p-1.5 hover:scale-105 transition-transform duration-300">
              <img
                src={celebrationCharacter}
                alt="Cheering Companion"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-bloom-border/70 pb-3">
        <button
          onClick={() => setActiveTab('in-progress')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === 'in-progress'
              ? 'bg-sage-700 text-white shadow-soft'
              : 'text-bloom-muted hover:text-bloom-dark bg-white/70'
          }`}
        >
          Active Goals ({activeGoals.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === 'completed'
              ? 'bg-sage-700 text-white shadow-soft'
              : 'text-bloom-muted hover:text-bloom-dark bg-white/70'
          }`}
        >
          Completed Milestones ({completedGoals.length})
        </button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(activeTab === 'in-progress' ? activeGoals : completedGoals).map((goal) => {
          const isDone = goal.status === 'completed';
          return (
            <Card key={goal.id} hover padding="p-6" className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Badge variant={isDone ? 'sage' : 'mint'} size="xs">
                    {goal.category}
                  </Badge>
                  <span className="text-xs font-medium text-bloom-muted">{goal.deadline}</span>
                </div>

                <h3 className="text-lg font-bold font-display text-bloom-dark mt-1">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-bloom-muted mt-1 leading-relaxed">{goal.description}</p>
                )}
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-bloom-dark">
                    Progress: {goal.current} / {goal.target} {goal.unit}
                  </span>
                  <span className="font-bold text-sage-800">{goal.progress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone ? 'bg-sage-500' : 'bg-sage-400'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>

                {goal.reward && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-cream-50 border border-bloom-border text-[11px] text-bloom-dark">
                    <span>🏆</span>
                    <span className="font-medium">Reward: {goal.reward}</span>
                  </div>
                )}

                {!isDone && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleIncrement(goal.id, -1)}
                      className="px-3 py-1 rounded-xl bg-white border border-bloom-border text-xs font-semibold text-bloom-muted hover:bg-cream-100"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleIncrement(goal.id, 1)}
                      className="px-4 py-1 rounded-xl bg-sage-300 hover:bg-sage-400 text-xs font-semibold text-sage-900 shadow-sm"
                    >
                      +1 {goal.unit}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal for setting new goal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-dark/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-cream-50 w-full max-w-md rounded-4xl border border-bloom-border shadow-soft-lg p-6">
            <h2 className="text-lg font-bold font-display text-bloom-dark mb-4">Set a New Gentle Goal</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 days of fresh morning walks"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-bloom-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
                  Description & Motivation
                </label>
                <input
                  type="text"
                  placeholder="Why this matters for your wellbeing..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-bloom-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-bloom-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bloom-muted mb-1.5">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="days, walks, hours"
                    className="w-full p-3 rounded-2xl border border-bloom-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewGoalModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Save Goal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
