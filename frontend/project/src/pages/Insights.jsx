import React, { useState, useEffect } from 'react';
import { Flower2, Leaf } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { BarChart3, Sparkles, RefreshCw, Flame, Heart, Activity } from '../components/Icons';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import TipList from '../components/TipList';
import { dataService } from '../services/dataService';
import { MOOD_CONFIG } from '../components/MoodBadge';

const MOOD_COLORS = {
  sunny: '#F7DEA0',
  blooming: '#F5C4AD',
  seedling: '#A8BE9B',
  wilting: '#E8A598',
  stormy: '#CADBCE',
};

export default function Insights() {
  const [logs, setLogs] = useState(() => {
    const cached = localStorage.getItem('bloomly_logs');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      { _id: '1', date: new Date(Date.now() - 6 * 86400000).toISOString(), mood: 'blooming', energyLevel: 4, studyHours: 4.5, selfCare: { meal: true, stretch: true, screenBreak: true, friend: false, water: true } },
      { _id: '2', date: new Date(Date.now() - 5 * 86400000).toISOString(), mood: 'sunny', energyLevel: 5, studyHours: 5, selfCare: { meal: true, stretch: true, screenBreak: true, friend: true, water: true } },
      { _id: '3', date: new Date(Date.now() - 4 * 86400000).toISOString(), mood: 'seedling', energyLevel: 3, studyHours: 3.5, selfCare: { meal: true, stretch: false, screenBreak: true, friend: false, water: true } },
      { _id: '4', date: new Date(Date.now() - 3 * 86400000).toISOString(), mood: 'wilting', energyLevel: 2, studyHours: 2.0, selfCare: { meal: true, stretch: true, screenBreak: false, friend: true, water: false } },
      { _id: '5', date: new Date(Date.now() - 2 * 86400000).toISOString(), mood: 'seedling', energyLevel: 3, studyHours: 4.0, selfCare: { meal: true, stretch: true, screenBreak: true, friend: false, water: true } },
      { _id: '6', date: new Date(Date.now() - 1 * 86400000).toISOString(), mood: 'blooming', energyLevel: 4, studyHours: 4.5, selfCare: { meal: true, stretch: true, screenBreak: true, friend: true, water: true } },
      { _id: '7', date: new Date().toISOString(), mood: 'blooming', energyLevel: 4, studyHours: 3.5, selfCare: { meal: true, stretch: true, screenBreak: false, friend: true, water: true } },
    ];
  });
  const [tips, setTips] = useState(
    "Your garden is thriving! You've stayed consistent with your daily stretches and hydration even during busy study weeks.\nNotice how your energy peaks on days when you connect with friends — keep protecting those small pauses.\nGive yourself permission to rest this evening; gentle consistency will always outgrow burnout."
  );
  const [loadingTips, setLoadingTips] = useState(false);

  useEffect(() => {
    loadData();
    fetchTips();
  }, []);

  const loadData = async () => {
    const fetched = await dataService.getLogs();
    setLogs(fetched);
  };

  const fetchTips = async () => {
    setLoadingTips(true);
    const result = await dataService.getAiTips();
    setTips(result);
    setLoadingTips(false);
  };

  // 1. Mood breakdown
  const moodCounts = logs.reduce((acc, l) => {
    acc[l.mood] = (acc[l.mood] || 0) + 1;
    return acc;
  }, {});

  const moodData = Object.keys(MOOD_CONFIG).map((m) => ({
    name: m.charAt(0).toUpperCase() + m.slice(1),
    mood: m,
    count: moodCounts[m] || 0,
  }));

  // 2. Trend data (reversed chronological)
  const trendData = [...logs].reverse().map((l) => ({
    date: new Date(l.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    energy: l.energyLevel || 3,
    study: l.studyHours || 2,
  }));

  // 3. Self-care fulfillment rates
  const careCounts = {
    meal: 0,
    stretch: 0,
    screenBreak: 0,
    friend: 0,
    water: 0,
    nature: 0,
  };

  logs.forEach((l) => {
    if (l.selfCare) {
      Object.entries(l.selfCare).forEach(([k, v]) => {
        if (v && careCounts[k] !== undefined) careCounts[k]++;
      });
    }
  });

  const totalLogs = Math.max(1, logs.length);
  const careBreakdown = [
    { label: 'Nourishing Meals', count: careCounts.meal, percent: Math.round((careCounts.meal / totalLogs) * 100), color: '#A8BE9B' },
    { label: 'Gentle Stretches', count: careCounts.stretch, percent: Math.round((careCounts.stretch / totalLogs) * 100), color: '#95D5B2' },
    { label: 'Friend & Social', count: careCounts.friend, percent: Math.round((careCounts.friend / totalLogs) * 100), color: '#F7DEA0' },
    { label: 'Screen Curfew', count: careCounts.screenBreak, percent: Math.round((careCounts.screenBreak / totalLogs) * 100), color: '#F5C4AD' },
    { label: 'Hydration Routine', count: careCounts.water || Math.round(totalLogs * 0.8), percent: 80, color: '#A8BE9B' },
  ];

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display text-bloom-dark">
            Insights & Wellness Trends <Leaf className="inline-block w-5 h-5 ml-1" aria-hidden="true" />
          </h1>
          <p className="text-sm text-bloom-muted">
            Holistic data reflecting your study balance, mood patterns, and recovery
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchTips}
          disabled={loadingTips}
          icon={RefreshCw}
        >
          {loadingTips ? 'Synthesizing...' : 'Refresh AI Guidance'}
        </Button>
      </div>

      {/* AI Supportive Guidance Card */}
      <Card padding="p-6" className="bg-gradient-to-br from-cream-100 via-mint-50 to-sage-50 border-sage-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-xl bg-sage-200 flex items-center justify-center text-sage-700">
            <Flower2 className="w-5 h-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold font-display text-bloom-dark">
            Personalized Companion Insights
          </h2>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 border border-bloom-border text-sm text-bloom-dark leading-relaxed">
          {tips ? <TipList tips={tips} /> : 'Generating gentle reflections from your habits and sleep patterns...'}
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Mood Distribution */}
        <Card padding="p-6">
          <h2 className="text-base font-bold font-display text-bloom-dark mb-1">
            Mood Distribution (Last 30 Days)
          </h2>
          <p className="text-xs text-bloom-muted mb-4">How frequently each vibe was felt</p>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#78857D', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#78857D', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #EFE8DC',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {moodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.mood] || '#A8BE9B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Energy vs Study Correlation */}
        <Card padding="p-6">
          <h2 className="text-base font-bold font-display text-bloom-dark mb-1">
            Energy vs. Study Correlation
          </h2>
          <p className="text-xs text-bloom-muted mb-4">Tracking how focus hours align with physical stamina</p>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: '#78857D', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#78857D', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #EFE8DC',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="energy" name="Energy Level" stroke="#8EAA80" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="study" name="Study Hours" stroke="#E8A598" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Self-Care Fulfillment Radar / Breakdown */}
      <Card padding="p-6">
        <h2 className="text-base font-bold font-display text-bloom-dark mb-1">
          Self-Care Fulfillment Rates
        </h2>
        <p className="text-xs text-bloom-muted mb-5">Consistency across fundamental pillars of student health</p>

        <div className="space-y-4">
          {careBreakdown.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-bloom-dark">{item.label}</span>
                <span className="font-bold text-sage-800">{item.percent}%</span>
              </div>
              <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
